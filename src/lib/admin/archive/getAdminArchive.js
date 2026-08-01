import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Article from "@/models/Article";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Review from "@/models/Review";

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getAdminArchive(searchParams = {}) {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
        return null;
    }

    await connectToDB();

    const type = ["all", "products", "categories", "articles", "reviews"].includes(searchParams.type)
        ? searchParams.type
        : "all";
    const query = typeof searchParams.q === "string" ? searchParams.q.trim().slice(0, 100) : "";
    const regex = query ? new RegExp(escapeRegExp(query), "i") : null;

    const [productCount, categoryCount, articleCount, reviewCount] = await Promise.all([
        Product.countDocuments({ status: "archived" }),
        Category.countDocuments({ archivedAt: { $type: "date" } }),
        Article.countDocuments({ status: "archived" }),
        Review.countDocuments({ status: "archived" }),
    ]);

    const tasks = [];

    if (type === "all" || type === "products") {
        tasks.push(
            Product.find({
                status: "archived",
                ...(regex ? { $or: [{ name: regex }, { slug: regex }] } : {}),
            })
                .select("name slug image price archivedAt updatedAt category")
                .populate({ path: "category", select: "title" })
                .sort({ archivedAt: -1, updatedAt: -1 })
                .limit(type === "all" ? 25 : 100)
                .lean()
                .then((items) =>
                    items.map((item) => ({
                        type: "products",
                        _id: item._id,
                        title: item.name,
                        subtitle: item.category?.title || item.slug,
                        image: item.image,
                        archivedAt: item.archivedAt || item.updatedAt,
                        meta: `${Number(item.price || 0).toLocaleString("fa-IR")} تومان`,
                    })),
                ),
        );
    }

    if (type === "all" || type === "categories") {
        tasks.push(
            Category.find({
                archivedAt: { $type: "date" },
                ...(regex ? { $or: [{ title: regex }, { slug: regex }] } : {}),
            })
                .select("title slug image archivedAt updatedAt")
                .sort({ archivedAt: -1 })
                .limit(type === "all" ? 25 : 100)
                .lean()
                .then((items) =>
                    items.map((item) => ({
                        type: "categories",
                        _id: item._id,
                        title: item.title,
                        subtitle: item.slug,
                        image: item.image,
                        archivedAt: item.archivedAt || item.updatedAt,
                        meta: "دسته‌بندی",
                    })),
                ),
        );
    }

    if (type === "all" || type === "articles") {
        tasks.push(
            Article.find({
                status: "archived",
                ...(regex ? { $or: [{ title: regex }, { slug: regex }, { excerpt: regex }] } : {}),
            })
                .select("title slug coverImage archivedAt updatedAt author")
                .populate({ path: "author", select: "name" })
                .sort({ archivedAt: -1, updatedAt: -1 })
                .limit(type === "all" ? 25 : 100)
                .lean()
                .then((items) =>
                    items.map((item) => ({
                        type: "articles",
                        _id: item._id,
                        title: item.title,
                        subtitle: item.author?.name || item.slug,
                        image: item.coverImage,
                        archivedAt: item.archivedAt || item.updatedAt,
                        meta: "مقاله",
                    })),
                ),
        );
    }

    if (type === "all" || type === "reviews") {
        tasks.push(
            Review.find({
                status: "archived",
                ...(regex
                    ? {
                          $or: [
                              { title: regex },
                              { content: regex },
                              { "author.name": regex },
                              { "author.email": regex },
                          ],
                      }
                    : {}),
            })
                .select("title content rating author archivedAt moderatedAt updatedAt product")
                .populate({ path: "product", select: "name image" })
                .sort({ moderatedAt: -1, updatedAt: -1 })
                .limit(type === "all" ? 25 : 100)
                .lean()
                .then((items) =>
                    items.map((item) => ({
                        type: "reviews",
                        _id: item._id,
                        title: item.title || `نظر ${item.author?.name || "کاربر"}`,
                        subtitle: item.product?.name || item.author?.email || "نظر محصول",
                        image: item.product?.image || "",
                        archivedAt: item.moderatedAt || item.updatedAt,
                        meta: `${Number(item.rating || 0).toLocaleString("fa-IR")} از ۵`,
                    })),
                ),
        );
    }

    const results = (await Promise.all(tasks)).flat().sort((first, second) => {
        return new Date(second.archivedAt || 0) - new Date(first.archivedAt || 0);
    });

    return serialize({
        currentUser,
        filters: { type, q: query },
        stats: {
            total: productCount + categoryCount + articleCount + reviewCount,
            products: productCount,
            categories: categoryCount,
            articles: articleCount,
            reviews: reviewCount,
        },
        items: results.slice(0, type === "all" ? 100 : 150),
    });
}
