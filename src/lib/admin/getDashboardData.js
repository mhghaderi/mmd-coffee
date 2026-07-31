import connectToDB from "@/lib/db/connectToDB";

import { getCurrentUser } from "@/lib/auth/session";

import Category from "@/models/Category";
import Product from "@/models/Product";
import User from "@/models/User";

export default async function getDashboardData() {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
        return null;
    }

    await connectToDB();

    const [
        totalProducts,
        publishedProducts,
        draftProducts,
        archivedProducts,
        availableProducts,
        featuredProducts,
        totalCategories,
        totalUsers,
        activeUsers,
        recentProducts,
    ] = await Promise.all([
        Product.countDocuments(),

        Product.countDocuments({
            status: "published",
        }),

        Product.countDocuments({
            status: "draft",
        }),

        Product.countDocuments({
            status: "archived",
        }),

        Product.countDocuments({
            isAvailable: true,
            status: {
                $ne: "archived",
            },
        }),

        Product.countDocuments({
            isFeatured: true,
            status: "published",
        }),

        Category.countDocuments(),

        User.countDocuments({
            role: "user",
        }),

        User.countDocuments({
            role: "user",
            isActive: true,
        }),

        Product.find()
            .select("name slug image price status isAvailable category createdAt")
            .populate({
                path: "category",
                select: "title slug",
            })
            .sort({
                createdAt: -1,
            })
            .limit(6)
            .lean(),
    ]);

    return {
        currentUser,

        stats: {
            totalProducts,
            publishedProducts,
            draftProducts,
            archivedProducts,
            availableProducts,
            featuredProducts,
            totalCategories,
            totalUsers,
            activeUsers,
        },

        recentProducts,
    };
}
