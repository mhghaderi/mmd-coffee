import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}

function parseDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function resolveReportRange(searchParams = {}) {
    const today = new Date();
    const preset = ["7", "30", "90", "365", "custom"].includes(searchParams.range)
        ? searchParams.range
        : "30";

    let from;
    let to = endOfDay(today);

    if (preset === "custom") {
        const customFrom = parseDate(searchParams.from);
        const customTo = parseDate(searchParams.to);

        from = customFrom ? startOfDay(customFrom) : startOfDay(new Date(today.getTime() - 29 * DAY_IN_MS));
        to = customTo ? endOfDay(customTo) : endOfDay(today);
    } else {
        const days = Number(preset);
        from = startOfDay(new Date(today.getTime() - (days - 1) * DAY_IN_MS));
    }

    if (from > to) {
        [from, to] = [startOfDay(to), endOfDay(from)];
    }

    const durationMs = Math.max(to.getTime() - from.getTime() + 1, DAY_IN_MS);
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - durationMs + 1);
    const days = Math.max(1, Math.ceil(durationMs / DAY_IN_MS));

    return {
        preset,
        from,
        to,
        previousFrom,
        previousTo,
        days,
        fromInput: from.toISOString().slice(0, 10),
        toInput: to.toISOString().slice(0, 10),
    };
}

function percentageChange(current, previous) {
    if (previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return Math.round(((current - previous) / previous) * 1000) / 10;
}

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

async function getPeriodSummary(from, to) {
    const [result] = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: from, $lte: to },
            },
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                completedOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                cancelledOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                },
                paidOrders: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$payment.status", "paid"] },
                                    { $ne: ["$status", "cancelled"] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                revenue: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$payment.status", "paid"] },
                                    { $ne: ["$status", "cancelled"] },
                                ],
                            },
                            "$pricing.total",
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    const newUsers = await User.countDocuments({ createdAt: { $gte: from, $lte: to } });

    return {
        totalOrders: result?.totalOrders || 0,
        completedOrders: result?.completedOrders || 0,
        cancelledOrders: result?.cancelledOrders || 0,
        paidOrders: result?.paidOrders || 0,
        revenue: result?.revenue || 0,
        newUsers,
    };
}

export default async function getAdminReports(searchParams = {}) {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
        return null;
    }

    await connectToDB();

    const range = resolveReportRange(searchParams);
    const dateMatch = { createdAt: { $gte: range.from, $lte: range.to } };
    const paidMatch = {
        ...dateMatch,
        "payment.status": "paid",
        status: { $ne: "cancelled" },
    };

    const bucketFormat = range.days > 120 ? "%Y-%m" : "%Y-%m-%d";

    const [
        currentSummary,
        previousSummary,
        trend,
        orderStatuses,
        paymentMethods,
        topProducts,
        topCategories,
        topCustomers,
        lowStockProducts,
    ] = await Promise.all([
        getPeriodSummary(range.from, range.to),
        getPeriodSummary(range.previousFrom, range.previousTo),

        Order.aggregate([
            { $match: dateMatch },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: bucketFormat,
                            date: "$createdAt",
                            timezone: "Asia/Tehran",
                        },
                    },
                    orders: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$payment.status", "paid"] },
                                        { $ne: ["$status", "cancelled"] },
                                    ],
                                },
                                "$pricing.total",
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        Order.aggregate([
            { $match: dateMatch },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        Order.aggregate([
            { $match: dateMatch },
            { $group: { _id: "$payment.method", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        Order.aggregate([
            { $match: paidMatch },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    image: { $first: "$items.image" },
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.lineTotal" },
                    orders: { $addToSet: "$_id" },
                },
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    quantity: 1,
                    revenue: 1,
                    orderCount: { $size: "$orders" },
                },
            },
            { $sort: { revenue: -1, quantity: -1 } },
            { $limit: 8 },
        ]),

        Order.aggregate([
            { $match: paidMatch },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: Product.collection.name,
                    localField: "items.product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ["$category._id", null] },
                    title: { $first: { $ifNull: ["$category.title", "بدون دسته‌بندی"] } },
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.lineTotal" },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 6 },
        ]),

        Order.aggregate([
            {
                $match: {
                    ...paidMatch,
                    user: { $ne: null },
                },
            },
            {
                $group: {
                    _id: "$user",
                    orders: { $sum: 1 },
                    spent: { $sum: "$pricing.total" },
                    lastOrderAt: { $max: "$createdAt" },
                },
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    name: "$user.name",
                    email: "$user.email",
                    orders: 1,
                    spent: 1,
                    lastOrderAt: 1,
                },
            },
            { $sort: { spent: -1 } },
            { $limit: 6 },
        ]),

        Product.find({
            trackStock: true,
            status: { $ne: "archived" },
            stock: { $lte: 5 },
        })
            .select("name slug stock isAvailable")
            .sort({ stock: 1, name: 1 })
            .limit(8)
            .lean(),
    ]);

    const averageOrderValue =
        currentSummary.paidOrders > 0
            ? Math.round(currentSummary.revenue / currentSummary.paidOrders)
            : 0;

    const conversionRate =
        currentSummary.totalOrders > 0
            ? Math.round((currentSummary.completedOrders / currentSummary.totalOrders) * 1000) / 10
            : 0;

    return serialize({
        currentUser,
        range: {
            preset: range.preset,
            from: range.from,
            to: range.to,
            fromInput: range.fromInput,
            toInput: range.toInput,
            days: range.days,
        },
        summary: {
            ...currentSummary,
            averageOrderValue,
            conversionRate,
            changes: {
                revenue: percentageChange(currentSummary.revenue, previousSummary.revenue),
                orders: percentageChange(currentSummary.totalOrders, previousSummary.totalOrders),
                users: percentageChange(currentSummary.newUsers, previousSummary.newUsers),
                completed: percentageChange(
                    currentSummary.completedOrders,
                    previousSummary.completedOrders,
                ),
            },
        },
        trend,
        orderStatuses,
        paymentMethods,
        topProducts,
        topCategories,
        topCustomers,
        lowStockProducts,
    });
}
