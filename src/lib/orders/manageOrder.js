import mongoose from "mongoose";

import {
    ORDER_STATUS,
    ORDER_STATUS_VALUES,
    PAYMENT_STATUS,
    PAYMENT_STATUS_VALUES,
} from "@/constants/order";

import connectToDB from "@/lib/db/connectToDB";

import { canChangeOrderStatus, canChangePaymentStatus } from "@/lib/orders/orderTransitions";

import Order from "@/models/Order";
import Product from "@/models/Product";

export class OrderManagementError extends Error {
    constructor(message, status = 400, code = "ORDER_MANAGEMENT_ERROR") {
        super(message);

        this.name = "OrderManagementError";
        this.status = status;
        this.code = code;
    }
}

function cleanText(value, maximumLength = 500) {
    return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function createOrderFilter(identifier) {
    if (mongoose.isValidObjectId(identifier)) {
        return {
            _id: identifier,
        };
    }

    return {
        orderNumber: identifier.trim().toUpperCase(),
    };
}

function aggregateOrderProducts(items) {
    const quantities = new Map();

    for (const item of items) {
        const productId = item.product?.toString();

        if (!productId) {
            continue;
        }

        const previousQuantity = quantities.get(productId) || 0;

        quantities.set(productId, previousQuantity + Number(item.quantity || 0));
    }

    return [...quantities.entries()].map(([productId, quantity]) => ({
        productId,
        quantity,
    }));
}

async function restoreInventory({ order, session, appliedOperations }) {
    if (order.inventoryRestored) {
        return;
    }

    const productQuantities = aggregateOrderProducts(order.items);

    for (const item of productQuantities) {
        const options = session
            ? {
                  session,
              }
            : {};

        const result = await Product.updateOne(
            {
                _id: item.productId,
                trackStock: true,
            },
            {
                $inc: {
                    stock: item.quantity,
                },

                $set: {
                    isAvailable: true,
                },
            },
            options,
        );

        if (result.modifiedCount === 1) {
            appliedOperations.push({
                type: "inventory-restored",
                productId: item.productId,
                quantity: item.quantity,
            });
        }
    }

    order.inventoryRestored = true;
}

async function applySales({ order, session, appliedOperations }) {
    if (order.salesApplied) {
        return;
    }

    const productQuantities = aggregateOrderProducts(order.items);

    for (const item of productQuantities) {
        const options = session
            ? {
                  session,
              }
            : {};

        const result = await Product.updateOne(
            {
                _id: item.productId,
            },
            {
                $inc: {
                    salesCount: item.quantity,
                },
            },
            options,
        );

        if (result.modifiedCount === 1) {
            appliedOperations.push({
                type: "sales-applied",
                productId: item.productId,
                quantity: item.quantity,
            });
        }
    }

    order.salesApplied = true;
}

async function rollbackOperations(operations) {
    for (const operation of [...operations].reverse()) {
        try {
            if (operation.type === "inventory-restored") {
                await Product.updateOne(
                    {
                        _id: operation.productId,
                        trackStock: true,
                    },
                    [
                        {
                            $set: {
                                stock: {
                                    $max: [
                                        0,
                                        {
                                            $subtract: ["$stock", operation.quantity],
                                        },
                                    ],
                                },

                                isAvailable: {
                                    $and: [
                                        {
                                            $eq: ["$status", "published"],
                                        },
                                        {
                                            $gt: [
                                                {
                                                    $subtract: ["$stock", operation.quantity],
                                                },
                                                0,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                );
            }

            if (operation.type === "sales-applied") {
                await Product.updateOne(
                    {
                        _id: operation.productId,
                    },
                    [
                        {
                            $set: {
                                salesCount: {
                                    $max: [
                                        0,
                                        {
                                            $subtract: ["$salesCount", operation.quantity],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                );
            }
        } catch (error) {
            console.error("ORDER OPERATION ROLLBACK ERROR:", {
                operation,
                error,
            });
        }
    }
}

async function updateStatusDocument({
    identifier,
    nextStatus,
    adminUser,
    note,
    cancellationReason,
    session,
}) {
    let query = Order.findOne(createOrderFilter(identifier));

    if (session) {
        query = query.session(session);
    }

    const order = await query;

    if (!order) {
        throw new OrderManagementError("سفارش پیدا نشد", 404, "ORDER_NOT_FOUND");
    }

    if (order.status === nextStatus) {
        return order;
    }

    if (
        !canChangeOrderStatus({
            currentStatus: order.status,
            nextStatus,
            deliveryMethod: order.delivery.method,
        })
    ) {
        throw new OrderManagementError(
            "تغییر وضعیت انتخاب‌شده برای این سفارش مجاز نیست",
            409,
            "INVALID_STATUS_TRANSITION",
        );
    }

    if (nextStatus === ORDER_STATUS.CANCELLED && cancellationReason.length < 3) {
        throw new OrderManagementError("دلیل لغو سفارش الزامی است");
    }

    const appliedOperations = [];

    try {
        if (nextStatus === ORDER_STATUS.CANCELLED) {
            await restoreInventory({
                order,
                session,
                appliedOperations,
            });

            order.cancelledAt = new Date();
            order.cancellationReason = cancellationReason;
        }

        if (nextStatus === ORDER_STATUS.CONFIRMED && !order.confirmedAt) {
            order.confirmedAt = new Date();
        }

        if (nextStatus === ORDER_STATUS.COMPLETED) {
            await applySales({
                order,
                session,
                appliedOperations,
            });

            order.completedAt = new Date();
        }

        order.status = nextStatus;

        order.statusHistory.push({
            status: nextStatus,
            note,
            changedBy: adminUser.id,
            changedAt: new Date(),
        });

        await order.save(
            session
                ? {
                      session,
                  }
                : undefined,
        );

        return order;
    } catch (error) {
        if (!session) {
            await rollbackOperations(appliedOperations);
        }

        if (error.name === "VersionError") {
            throw new OrderManagementError(
                "این سفارش هم‌زمان توسط درخواست دیگری تغییر کرده است؛ صفحه را تازه‌سازی کن",
                409,
                "ORDER_CONFLICT",
            );
        }

        throw error;
    }
}

export async function updateOrderStatus({
    identifier,
    nextStatus,
    adminUser,
    note = "",
    cancellationReason = "",
}) {
    if (!ORDER_STATUS_VALUES.includes(nextStatus)) {
        throw new OrderManagementError("وضعیت سفارش معتبر نیست");
    }

    await connectToDB();

    const payload = {
        identifier,
        nextStatus,
        adminUser,
        note: cleanText(note),
        cancellationReason: cleanText(cancellationReason),
    };

    const useTransactions = process.env.MONGO_USE_TRANSACTIONS === "true";

    if (!useTransactions) {
        return updateStatusDocument({
            ...payload,
            session: null,
        });
    }

    const session = await mongoose.startSession();

    let updatedOrder = null;

    try {
        await session.withTransaction(async () => {
            updatedOrder = await updateStatusDocument({
                ...payload,
                session,
            });
        });

        return updatedOrder;
    } finally {
        await session.endSession();
    }
}

export async function updateOrderPayment({
    identifier,
    nextStatus,
    adminUser,
    note = "",
    transactionId = "",
}) {
    if (!PAYMENT_STATUS_VALUES.includes(nextStatus)) {
        throw new OrderManagementError("وضعیت پرداخت معتبر نیست");
    }

    await connectToDB();

    const order = await Order.findOne(createOrderFilter(identifier));

    if (!order) {
        throw new OrderManagementError("سفارش پیدا نشد", 404, "ORDER_NOT_FOUND");
    }

    if (order.payment.status === nextStatus) {
        return order;
    }

    if (
        !canChangePaymentStatus({
            currentStatus: order.payment.status,
            nextStatus,
        })
    ) {
        throw new OrderManagementError(
            "تغییر وضعیت پرداخت انتخاب‌شده مجاز نیست",
            409,
            "INVALID_PAYMENT_TRANSITION",
        );
    }

    order.payment.status = nextStatus;

    if (transactionId) {
        order.payment.transactionId = cleanText(transactionId, 150);
    }

    if (nextStatus === PAYMENT_STATUS.PAID) {
        order.payment.paidAt = new Date();
    }

    if (nextStatus === PAYMENT_STATUS.REFUNDED) {
        order.payment.paidAt = order.payment.paidAt || new Date();
    }

    order.paymentHistory.push({
        status: nextStatus,
        note: cleanText(note),
        changedBy: adminUser.id,
        changedAt: new Date(),
    });

    try {
        await order.save();

        return order;
    } catch (error) {
        if (error.name === "VersionError") {
            throw new OrderManagementError(
                "وضعیت سفارش هم‌زمان تغییر کرده است؛ صفحه را تازه‌سازی کن",
                409,
                "ORDER_CONFLICT",
            );
        }

        throw error;
    }
}
