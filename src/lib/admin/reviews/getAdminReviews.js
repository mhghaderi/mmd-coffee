import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Product from "@/models/Product";
import Review from "@/models/Review";
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
    ratingHigh: {
        rating: -1,
        createdAt: -1,
    },
    ratingLow: {
        rating: 1,
        createdAt: -1,
    },
    helpful: {
        helpfulCount: -1,
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

export default async function getAdminReviews(rawSearchParams = {}) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return null;
    }

    await connectToDB();

    const filters = {
        q: firstValue(rawSearchParams.q)?.toString().trim() || "",
        status: firstValue(rawSearchParams.status)?.toString() || "all",
        rating: firstValue(rawSearchParams.rating)?.toString() || "all",
        verified: firstValue(rawSearchParams.verified)?.toString() || "all",
        sort: firstValue(rawSearchParams.sort)?.toString() || "newest",
        page: Math.max(Number.parseInt(firstValue(rawSearchParams.page) || "1", 10), 1),
        limit: 10,
    };

    if (!sortOptions[filters.sort]) {
        filters.sort = "newest";
    }

    const query = {};

    if (["pending", "approved", "rejected"].includes(filters.status)) {
        query.status = filters.status;
    }

    const rating = Number.parseInt(filters.rating, 10);

    if (rating >= 1 && rating <= 5) {
        query.rating = rating;
    }

    if (filters.verified === "yes") {
        query.isVerifiedPurchase = true;
    }

    if (filters.verified === "no") {
        query.isVerifiedPurchase = false;
    }

    if (filters.q) {
        const regex = new RegExp(escapeRegExp(filters.q), "i");

        const matchingProducts = await Product.find({
            $or: [
                {
                    name: regex,
                },
                {
                    englishName: regex,
                },
                {
                    slug: regex,
                },
            ],
        })
            .select("_id")
            .limit(100)
            .lean();

        query.$or = [
            {
                title: regex,
            },
            {
                content: regex,
            },
            {
                "author.name": regex,
            },
            {
                "author.email": regex,
            },
            {
                product: {
                    $in: matchingProducts.map((product) => product._id),
                },
            },
        ];
    }

    const [total, pendingCount, approvedCount, rejectedCount, verifiedCount] =
        await Promise.all([
            Review.countDocuments(query),
            Review.countDocuments({ status: "pending" }),
            Review.countDocuments({ status: "approved" }),
            Review.countDocuments({ status: "rejected" }),
                        Review.countDocuments({ isVerifiedPurchase: true }),
        ]);

    const pages = total === 0 ? 0 : Math.ceil(total / filters.limit);

    filters.page = pages > 0 ? Math.min(filters.page, pages) : 1;

    const reviews = await Review.find(query)
        .populate({
            path: "product",
            select: "name slug image status",
        })
        .populate({
            path: "user",
            select: "name email avatar",
        })
        
        .sort(sortOptions[filters.sort])
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .lean();

    return {
        currentUser,
        reviews: reviews.map(serialize),
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
            total: pendingCount + approvedCount + rejectedCount,
            pendingCount,
            approvedCount,
            rejectedCount,
            verifiedCount,
        },
    };
}
