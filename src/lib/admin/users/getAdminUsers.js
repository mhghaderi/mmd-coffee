import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Order from "@/models/Order";
import User from "@/models/User";

const sortOptions = {
    newest: {
        createdAt: -1,
        _id: -1,
    },

    oldest: {
        createdAt: 1,
        _id: 1,
    },

    name: {
        name: 1,
        _id: 1,
    },

    orders: {
        orderCount: -1,
        createdAt: -1,
    },

    spent: {
        totalSpent: -1,
        createdAt: -1,
    },

    "last-login": {
        lastLoginAt: -1,
        createdAt: -1,
    },
};

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
}

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getAdminUsers(rawSearchParams = {}) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return null;
    }

    await connectToDB();

    const filters = {
        q: firstValue(rawSearchParams.q)?.toString().trim() || "",
        role: firstValue(rawSearchParams.role)?.toString() || "all",
        status: firstValue(rawSearchParams.status)?.toString() || "all",
        verification: firstValue(rawSearchParams.verification)?.toString() || "all",
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
                name: regex,
            },
            {
                email: regex,
            },
            {
                phone: regex,
            },
        ];
    }

    if (["user", "admin"].includes(filters.role)) {
        query.role = filters.role;
    }

    if (filters.status === "active") {
        query.isActive = true;
    }

    if (filters.status === "inactive") {
        query.isActive = false;
    }

    if (filters.verification === "verified") {
        query.emailVerified = true;
    }

    if (filters.verification === "unverified") {
        query.emailVerified = false;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
        total,
        totalAccounts,
        customerCount,
        adminCount,
        activeCount,
        inactiveCount,
        verifiedCount,
        newThisMonth,
    ] = await Promise.all([
        User.countDocuments(query),
        User.countDocuments(),
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ emailVerified: true }),
        User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    const pages = total === 0 ? 0 : Math.ceil(total / filters.limit);

    filters.page = pages > 0 ? Math.min(filters.page, pages) : 1;

    const users = await User.aggregate([
        {
            $match: query,
        },
        {
            $lookup: {
                from: Order.collection.name,
                let: {
                    userId: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$user", "$$userId"],
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
                            lastOrderAt: {
                                $max: "$createdAt",
                            },
                        },
                    },
                ],
                as: "orderStats",
            },
        },
        {
            $addFields: {
                orderCount: {
                    $ifNull: [{ $arrayElemAt: ["$orderStats.orderCount", 0] }, 0],
                },
                completedOrderCount: {
                    $ifNull: [{ $arrayElemAt: ["$orderStats.completedOrderCount", 0] }, 0],
                },
                totalSpent: {
                    $ifNull: [{ $arrayElemAt: ["$orderStats.totalSpent", 0] }, 0],
                },
                lastOrderAt: {
                    $arrayElemAt: ["$orderStats.lastOrderAt", 0],
                },
            },
        },
        {
            $project: {
                password: 0,
                tokenVersion: 0,
                orderStats: 0,
            },
        },
        {
            $sort: sortOptions[filters.sort],
        },
        {
            $skip: (filters.page - 1) * filters.limit,
        },
        {
            $limit: filters.limit,
        },
    ]);

    return {
        currentUser,
        users: users.map(serialize),
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
            totalAccounts,
            customerCount,
            adminCount,
            activeCount,
            inactiveCount,
            verifiedCount,
            newThisMonth,
        },
    };
}
