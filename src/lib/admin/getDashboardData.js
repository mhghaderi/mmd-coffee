import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Article from "@/models/Article";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getDashboardData() {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
        return null;
    }

    await connectToDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const [
        totalProducts,
        publishedProducts,
        availableProducts,
        lowStockProducts,
        totalCategories,
        totalUsers,
        activeUsers,
        totalOrders,
        pendingOrders,
        todayOrders,
        pendingReviews,
        openTickets,
        publishedArticles,
        monthRevenueResult,
        allRevenueResult,
        recentOrders,
        topProducts,
    ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ status: "published" }),
        Product.countDocuments({ status: "published", isAvailable: true }),
        Product.countDocuments({ trackStock: true, stock: { $lte: 5 } }),
        Category.countDocuments(),
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "user", isActive: true }),
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing", "ready", "out-for-delivery"] } }),
        Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        Review.countDocuments({ status: "pending" }),
        Ticket.countDocuments({ status: { $ne: "closed" } }),
        Article.countDocuments({ status: "published" }),
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    "payment.status": "paid",
                    status: { $ne: "cancelled" },
                },
            },
            { $group: { _id: null, total: { $sum: "$pricing.total" } } },
        ]),
        Order.aggregate([
            {
                $match: {
                    "payment.status": "paid",
                    status: { $ne: "cancelled" },
                },
            },
            { $group: { _id: null, total: { $sum: "$pricing.total" } } },
        ]),
        Order.find()
            .select("orderNumber customer pricing payment status createdAt")
            .sort({ createdAt: -1 })
            .limit(7)
            .lean(),
        Order.aggregate([
            {
                $match: {
                    "payment.status": "paid",
                    status: { $ne: "cancelled" },
                },
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    image: { $first: "$items.image" },
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.lineTotal" },
                },
            },
            { $sort: { quantity: -1, revenue: -1 } },
            { $limit: 5 },
        ]),
    ]);

    return serialize({
        currentUser,
        stats: {
            totalProducts,
            publishedProducts,
            availableProducts,
            lowStockProducts,
            totalCategories,
            totalUsers,
            activeUsers,
            totalOrders,
            pendingOrders,
            todayOrders,
            pendingReviews,
            openTickets,
            publishedArticles,
            monthRevenue: monthRevenueResult[0]?.total || 0,
            allRevenue: allRevenueResult[0]?.total || 0,
        },
        recentOrders,
        topProducts,
    });
}
