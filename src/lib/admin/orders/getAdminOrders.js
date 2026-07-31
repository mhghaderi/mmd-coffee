import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import {
    DELIVERY_METHOD_VALUES,
    ORDER_STATUS_VALUES,
    PAYMENT_STATUS_VALUES,
} from "@/constants/order";

import Order from "@/models/Order";

const sortOptions = {
    newest: {
        createdAt: -1,
    },

    oldest: {
        createdAt: 1,
    },

    "total-desc": {
        "pricing.total": -1,
    },

    "total-asc": {
        "pricing.total": 1,
    },
};

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeOrder(order) {
    return JSON.parse(JSON.stringify(order));
}

export default async function getAdminOrders(rawSearchParams = {}) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return null;
    }

    await connectToDB();

    const filters = {
        q: firstValue(rawSearchParams.q)?.toString().trim() || "",

        status: firstValue(rawSearchParams.status)?.toString() || "all",

        paymentStatus: firstValue(rawSearchParams.paymentStatus)?.toString() || "all",

        deliveryMethod: firstValue(rawSearchParams.deliveryMethod)?.toString() || "all",

        sort: firstValue(rawSearchParams.sort)?.toString() || "newest",

        page: Math.max(Number.parseInt(firstValue(rawSearchParams.page) || "1", 10), 1),

        limit: 10,
    };

    if (!sortOptions[filters.sort]) {
        filters.sort = "newest";
    }

    const query = {};

    if (filters.q) {
        const regex = new RegExp(escapeRegExp(filters.q), "i");

        query.$or = [
            {
                orderNumber: regex,
            },
            {
                "customer.fullName": regex,
            },
            {
                "customer.phone": regex,
            },
            {
                "customer.email": regex,
            },
        ];
    }

    if (ORDER_STATUS_VALUES.includes(filters.status)) {
        query.status = filters.status;
    }

    if (PAYMENT_STATUS_VALUES.includes(filters.paymentStatus)) {
        query["payment.status"] = filters.paymentStatus;
    }

    if (DELIVERY_METHOD_VALUES.includes(filters.deliveryMethod)) {
        query["delivery.method"] = filters.deliveryMethod;
    }

    const [total, pendingCount, activeCount, completedCount, cancelledCount, paidRevenueResult] =
        await Promise.all([
            Order.countDocuments(query),

            Order.countDocuments({
                status: "pending",
            }),

            Order.countDocuments({
                status: {
                    $in: ["confirmed", "preparing", "ready", "out-for-delivery"],
                },
            }),

            Order.countDocuments({
                status: "completed",
            }),

            Order.countDocuments({
                status: "cancelled",
            }),

            Order.aggregate([
                {
                    $match: {
                        status: "completed",
                        "payment.status": "paid",
                    },
                },

                {
                    $group: {
                        _id: null,

                        total: {
                            $sum: "$pricing.total",
                        },
                    },
                },
            ]),
        ]);

    const pages = total === 0 ? 0 : Math.ceil(total / filters.limit);

    filters.page = pages > 0 ? Math.min(filters.page, pages) : 1;

    const orders = await Order.find(query)
        .select(
            "orderNumber user customer items delivery pricing payment status inventoryRestored salesApplied createdAt updatedAt",
        )
        .populate({
            path: "user",
            select: "name email",
        })
        .sort(sortOptions[filters.sort])
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .lean();

    return {
        orders: orders.map(serializeOrder),

        filters,

        pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            pages,
            hasPreviousPage: filters.page > 1,
            hasNextPage: filters.page < pages,
        },

        stats: {
            totalOrders: await Order.countDocuments(),

            pendingCount,
            activeCount,
            completedCount,
            cancelledCount,

            paidRevenue: paidRevenueResult[0]?.total || 0,
        },
    };
}
