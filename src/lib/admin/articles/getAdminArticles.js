import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Article from "@/models/Article";
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
    published: {
        publishedAt: -1,
        createdAt: -1,
    },
    viewed: {
        viewsCount: -1,
        createdAt: -1,
    },
    title: {
        title: 1,
        _id: 1,
    },
};

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getAdminArticles(rawSearchParams = {}) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return null;
    }

    await connectToDB();

    const filters = {
        q: firstValue(rawSearchParams.q)?.toString().trim() || "",
        status: firstValue(rawSearchParams.status)?.toString() || "all",
        featured: firstValue(rawSearchParams.featured)?.toString() || "all",
        sort: firstValue(rawSearchParams.sort)?.toString() || "newest",
        page: Math.max(Number.parseInt(firstValue(rawSearchParams.page) || "1", 10), 1),
        limit: 10,
    };

    if (!sortOptions[filters.sort]) {
        filters.sort = "newest";
    }

    const query = {};

    if (["draft", "published", "archived"].includes(filters.status)) {
        query.status = filters.status;
    }

    if (filters.featured === "yes") {
        query.isFeatured = true;
    }

    if (filters.featured === "no") {
        query.isFeatured = false;
    }

    if (filters.q) {
        const regex = new RegExp(escapeRegExp(filters.q), "i");

        query.$or = [
            {
                title: regex,
            },
            {
                slug: regex,
            },
            {
                excerpt: regex,
            },
            {
                tags: regex,
            },
        ];
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [total, allCount, draftCount, publishedCount, archivedCount, featuredCount, monthCount] =
        await Promise.all([
            Article.countDocuments(query),
            Article.countDocuments(),
            Article.countDocuments({ status: "draft" }),
            Article.countDocuments({ status: "published" }),
            Article.countDocuments({ status: "archived" }),
            Article.countDocuments({ isFeatured: true, status: "published" }),
            Article.countDocuments({ createdAt: { $gte: startOfMonth } }),
        ]);

    const pages = total === 0 ? 0 : Math.ceil(total / filters.limit);

    filters.page = pages > 0 ? Math.min(filters.page, pages) : 1;

    const articles = await Article.find(query)
        .populate({
            path: "author",
            select: "name email avatar",
        })
        .sort(sortOptions[filters.sort])
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .lean();

    return {
        currentUser,
        articles: articles.map(serialize),
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
            allCount,
            draftCount,
            publishedCount,
            archivedCount,
            featuredCount,
            monthCount,
        },
    };
}
