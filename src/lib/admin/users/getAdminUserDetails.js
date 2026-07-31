import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Order from "@/models/Order";
import User from "@/models/User";

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeOrderPage(value) {
    const parsed = Number.parseInt(firstValue(value)?.toString() || "1", 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function getAdminUserDetails(identifier, rawSearchParams = {}) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return {
            authorized: false,
            currentUser: null,
            user: null,
        };
    }

    if (!mongoose.isValidObjectId(identifier)) {
        return {
            authorized: true,
            currentUser,
            user: null,
        };
    }

    await connectToDB();

    const user = await User.findById(identifier)
        .select(
            "name email role phone avatar isActive emailVerified lastLoginAt createdAt updatedAt",
        )
        .lean();

    if (!user) {
        return {
            authorized: true,
            currentUser,
            user: null,
        };
    }

    const orderLimit = 8;
    let orderPage = normalizeOrderPage(rawSearchParams.orderPage);

    const [summaryResult, topProducts, orderTotal] = await Promise.all([
        Order.aggregate([
            {
                $match: {
                    user: user._id,
                },
            },
            {
                $addFields: {
                    itemQuantity: {
                        $sum: "$items.quantity",
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    orderCount: {
                        $sum: 1,
                    },
                    completedOrderCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                        },
                    },
                    cancelledOrderCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
                        },
                    },
                    activeOrderCount: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        "$status",
                                        [
                                            "pending",
                                            "confirmed",
                                            "preparing",
                                            "ready",
                                            "out-for-delivery",
                                        ],
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    paidOrderCount: {
                        $sum: {
                            $cond: [{ $eq: ["$payment.status", "paid"] }, 1, 0],
                        },
                    },
                    totalSpent: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "completed"] },
                                        { $eq: ["$payment.status", "paid"] },
                                    ],
                                },
                                "$pricing.total",
                                0,
                            ],
                        },
                    },
                    purchasedItems: {
                        $sum: "$itemQuantity",
                    },
                    firstOrderAt: {
                        $min: "$createdAt",
                    },
                    lastOrderAt: {
                        $max: "$createdAt",
                    },
                },
            },
        ]),

        Order.aggregate([
            {
                $match: {
                    user: user._id,
                    status: {
                        $ne: "cancelled",
                    },
                },
            },
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: {
                        product: "$items.product",
                        name: "$items.name",
                        slug: "$items.slug",
                        image: "$items.image",
                    },
                    quantity: {
                        $sum: "$items.quantity",
                    },
                    orderLines: {
                        $sum: 1,
                    },
                    revenue: {
                        $sum: "$items.lineTotal",
                    },
                },
            },
            {
                $sort: {
                    quantity: -1,
                    revenue: -1,
                },
            },
            {
                $limit: 5,
            },
            {
                $project: {
                    _id: 0,
                    productId: "$_id.product",
                    name: "$_id.name",
                    slug: "$_id.slug",
                    image: "$_id.image",
                    quantity: 1,
                    orderLines: 1,
                    revenue: 1,
                },
            },
        ]),

        Order.countDocuments({
            user: user._id,
        }),
    ]);

    const orderPages = orderTotal === 0 ? 0 : Math.ceil(orderTotal / orderLimit);

    orderPage = orderPages > 0 ? Math.min(orderPage, orderPages) : 1;

    const orders = await Order.find({
        user: user._id,
    })
        .select(
            "orderNumber customer items delivery pricing payment status createdAt updatedAt",
        )
        .sort({
            createdAt: -1,
            _id: -1,
        })
        .skip((orderPage - 1) * orderLimit)
        .limit(orderLimit)
        .lean();

    const rawSummary = summaryResult[0] || {};
    const completedOrderCount = Number(rawSummary.completedOrderCount || 0);
    const totalSpent = Number(rawSummary.totalSpent || 0);

    const summary = {
        orderCount: Number(rawSummary.orderCount || 0),
        completedOrderCount,
        cancelledOrderCount: Number(rawSummary.cancelledOrderCount || 0),
        activeOrderCount: Number(rawSummary.activeOrderCount || 0),
        paidOrderCount: Number(rawSummary.paidOrderCount || 0),
        totalSpent,
        averageCompletedOrder:
            completedOrderCount > 0 ? Math.round(totalSpent / completedOrderCount) : 0,
        purchasedItems: Number(rawSummary.purchasedItems || 0),
        firstOrderAt: rawSummary.firstOrderAt || null,
        lastOrderAt: rawSummary.lastOrderAt || null,
    };

    return {
        authorized: true,
        currentUser,
        user: serialize(user),
        summary: serialize(summary),
        topProducts: topProducts.map(serialize),
        orders: orders.map(serialize),
        orderPagination: {
            page: orderPage,
            limit: orderLimit,
            total: orderTotal,
            pages: orderPages,
            hasPreviousPage: orderPage > 1,
            hasNextPage: orderPage < orderPages,
        },
    };
}
