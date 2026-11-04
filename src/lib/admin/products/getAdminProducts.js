import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";

import Category from "@/models/Category";
import Product from "@/models/Product";

const allowedStatuses = ["all", "published", "draft"];

const allowedAvailability = ["all", "available", "unavailable"];

const sortOptions = {
    newest: {
        createdAt: -1,
    },

    oldest: {
        createdAt: 1,
    },

    popular: {
        popularityScore: -1,
        createdAt: -1,
    },

    "price-asc": {
        price: 1,
    },

    "price-desc": {
        price: -1,
    },

    "stock-asc": {
        stock: 1,
        createdAt: -1,
    },
};

function getFirstQueryValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
}

function normalizePage(value) {
    const page = Number.parseInt(value || "1", 10);

    return Number.isFinite(page) && page > 0 ? page : 1;
}

function normalizeLimit(value) {
    const limit = Number.parseInt(value || "10", 10);

    if (!Number.isFinite(limit)) {
        return 10;
    }

    return Math.min(Math.max(limit, 5), 50);
}

function serializeProduct(product) {
    return {
        ...product,

        _id: product._id.toString(),

        category: product.category
            ? {
                  ...product.category,
                  _id: product.category._id.toString(),
              }
            : null,

        createdAt: product.createdAt?.toISOString() || null,
        updatedAt: product.updatedAt?.toISOString() || null,
        archivedAt: product.archivedAt?.toISOString() || null,
    };
}

export default async function getAdminProducts(rawSearchParams = {}) {
    await connectToDB();

    const query = {
        q: getFirstQueryValue(rawSearchParams.q)?.toString().trim() || "",

        status: getFirstQueryValue(rawSearchParams.status)?.toString().trim() || "all",

        category: getFirstQueryValue(rawSearchParams.category)?.toString().trim() || "all",

        availability: getFirstQueryValue(rawSearchParams.availability)?.toString().trim() || "all",

        sort: getFirstQueryValue(rawSearchParams.sort)?.toString().trim() || "newest",

        page: normalizePage(getFirstQueryValue(rawSearchParams.page)),

        limit: normalizeLimit(getFirstQueryValue(rawSearchParams.limit)),
    };

    if (!allowedStatuses.includes(query.status)) {
        query.status = "all";
    }

    if (!allowedAvailability.includes(query.availability)) {
        query.availability = "all";
    }

    if (!sortOptions[query.sort]) {
        query.sort = "newest";
    }

    const filter = {};

    if (query.q) {
        const safeSearch = escapeRegExp(query.q);
        const searchRegex = new RegExp(safeSearch, "i");

        filter.$or = [
            {
                name: searchRegex,
            },
            {
                englishName: searchRegex,
            },
            {
                slug: searchRegex,
            },
            {
                shortDescription: searchRegex,
            },
            {
                tags: searchRegex,
            },
        ];
    }

    if (query.status !== "all") {
        filter.status = query.status;
    }

    if (query.category !== "all" && mongoose.isValidObjectId(query.category)) {
        filter.category = query.category;
    }

    if (query.availability === "available") {
        filter.isAvailable = true;
    }

    if (query.availability === "unavailable") {
        filter.isAvailable = false;
    }

    const [total, categories, totalProducts, publishedProducts, draftProducts] =
        await Promise.all([
            Product.countDocuments(filter),

            Category.find()
                .select("title slug isActive")
                .sort({
                    displayOrder: 1,
                    createdAt: -1,
                })
                .lean(),

            Product.countDocuments(),

            Product.countDocuments({
                status: "published",
            }),

            Product.countDocuments({
                status: "draft",
            }),
        ]);

    const pages = total === 0 ? 0 : Math.ceil(total / query.limit);

    const safePage = pages > 0 ? Math.min(query.page, pages) : 1;

    const products = await Product.find(filter)
        .select(
            "name englishName slug image price discountPercent category status isAvailable trackStock stock isFeatured isNew popularityScore salesCount createdAt updatedAt archivedAt",
        )
        .populate({
            path: "category",
            select: "title slug",
        })
        .sort(sortOptions[query.sort])
        .skip((safePage - 1) * query.limit)
        .limit(query.limit)
        .lean();

    return {
        products: products.map(serializeProduct),

        categories: categories.map((category) => ({
            ...category,
            _id: category._id.toString(),
        })),

        filters: {
            ...query,
            page: safePage,
        },

        pagination: {
            page: safePage,
            limit: query.limit,
            total,
            pages,
            hasNextPage: safePage < pages,
            hasPreviousPage: safePage > 1,
        },

        stats: {
            totalProducts,
            publishedProducts,
            draftProducts,
                    },
    };
}
