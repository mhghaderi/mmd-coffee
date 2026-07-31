import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";

import Category from "@/models/Category";
import Product from "@/models/Product";

import {
    serializeCatalogCategory,
    serializeCatalogProduct,
} from "@/lib/catalog/serializeCatalogProduct";

const SORT_OPTIONS = {
    popular: {
        isFeatured: -1,
        popularityScore: -1,
        salesCount: -1,
        createdAt: -1,
        _id: -1,
    },

    newest: {
        createdAt: -1,
        _id: -1,
    },

    oldest: {
        createdAt: 1,
        _id: 1,
    },

    rating: {
        ratingAverage: -1,
        reviewsCount: -1,
        createdAt: -1,
    },

    "price-asc": {
        finalPrice: 1,
        createdAt: -1,
    },

    "price-desc": {
        finalPrice: -1,
        createdAt: -1,
    },

    name: {
        displayOrder: 1,
        name: 1,
    },
};

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function normalizeText(value) {
    return firstValue(value)?.toString().trim() || "";
}

function normalizeBoolean(value) {
    const normalized = normalizeText(value).toLowerCase();

    return ["true", "1", "yes", "on"].includes(normalized);
}

function normalizePage(value) {
    const parsed = Number.parseInt(normalizeText(value) || "1", 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeLimit(value) {
    const parsed = Number.parseInt(normalizeText(value) || "12", 10);

    if (!Number.isFinite(parsed)) {
        return 12;
    }

    return Math.min(Math.max(parsed, 4), 48);
}

function normalizePrice(value) {
    const normalized = normalizeText(value).replaceAll(",", "");

    if (!normalized) {
        return null;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getActiveCategories() {
    /*
    archivedAt: null اسناد قدیمی که این فیلد
    را ندارند نیز پوشش می‌دهد.
  */

    const categories = await Category.aggregate([
        {
            $match: {
                archivedAt: null,

                $or: [
                    {
                        isActive: true,
                    },
                    {
                        isActive: {
                            $exists: false,
                        },
                    },
                ],
            },
        },

        {
            $lookup: {
                from: Product.collection.name,

                let: {
                    categoryId: "$_id",
                },

                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$category", "$$categoryId"],
                                    },
                                    {
                                        $eq: ["$status", "published"],
                                    },
                                    {
                                        $eq: ["$isAvailable", true],
                                    },
                                ],
                            },
                        },
                    },

                    {
                        $count: "value",
                    },
                ],

                as: "productCountResult",
            },
        },

        {
            $addFields: {
                productCount: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$productCountResult.value", 0],
                        },
                        0,
                    ],
                },
            },
        },

        {
            $project: {
                title: 1,
                slug: 1,
                description: 1,
                image: 1,
                imageAlt: 1,
                accentColor: 1,
                displayOrder: 1,
                productCount: 1,
            },
        },

        {
            $sort: {
                displayOrder: 1,
                title: 1,
            },
        },
    ]);

    return categories;
}

function createFinalPriceExpression() {
    return {
        $round: [
            {
                $multiply: [
                    {
                        $ifNull: ["$price", 0],
                    },

                    {
                        $subtract: [
                            1,

                            {
                                $divide: [
                                    {
                                        $ifNull: ["$discountPercent", 0],
                                    },
                                    100,
                                ],
                            },
                        ],
                    },
                ],
            },

            0,
        ],
    };
}

export default async function getPublicCatalog(rawSearchParams = {}) {
    await connectToDB();

    const rawCategories = await getActiveCategories();

    const categories = rawCategories.map(serializeCatalogCategory);

    const activeCategoryIds = rawCategories.map((category) => category._id);

    const filters = {
        q: normalizeText(rawSearchParams.q),

        category: normalizeText(rawSearchParams.category).toLowerCase(),

        sort: normalizeText(rawSearchParams.sort) || "popular",

        discounted: normalizeBoolean(rawSearchParams.discounted),

        featured: normalizeBoolean(rawSearchParams.featured),

        newOnly: normalizeBoolean(rawSearchParams.new),

        minPrice: normalizePrice(rawSearchParams.minPrice),

        maxPrice: normalizePrice(rawSearchParams.maxPrice),

        page: normalizePage(rawSearchParams.page),

        limit: normalizeLimit(rawSearchParams.limit),
    };

    if (!SORT_OPTIONS[filters.sort]) {
        filters.sort = "popular";
    }

    if (
        filters.minPrice !== null &&
        filters.maxPrice !== null &&
        filters.maxPrice < filters.minPrice
    ) {
        [filters.minPrice, filters.maxPrice] = [filters.maxPrice, filters.minPrice];
    }

    const productMatch = {
        status: "published",
        isAvailable: true,

        category: {
            $in: activeCategoryIds,
        },
    };

    if (filters.category) {
        const selectedCategory = rawCategories.find(
            (category) =>
                category.slug?.toLowerCase() === filters.category ||
                category._id.toString() === filters.category,
        );

        if (selectedCategory) {
            productMatch.category = selectedCategory._id;
        } else {
            /*
        یک دسته نامعتبر باید نتیجه خالی بدهد،
        نه تمام محصولات را.
      */

            productMatch._id = {
                $exists: false,
            };
        }
    }

    if (filters.q) {
        const searchRegex = new RegExp(escapeRegExp(filters.q), "i");

        productMatch.$or = [
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
            {
                ingredients: searchRegex,
            },
        ];
    }

    if (filters.discounted) {
        productMatch.discountPercent = {
            $gt: 0,
        };
    }

    if (filters.featured) {
        productMatch.isFeatured = true;
    }

    if (filters.newOnly) {
        productMatch.isNew = true;
    }

    const sharedPipeline = [
        {
            $match: productMatch,
        },

        {
            $addFields: {
                finalPrice: createFinalPriceExpression(),
            },
        },
    ];

    const finalPriceFilter = {};

    if (filters.minPrice !== null) {
        finalPriceFilter.$gte = filters.minPrice;
    }

    if (filters.maxPrice !== null) {
        finalPriceFilter.$lte = filters.maxPrice;
    }

    if (Object.keys(finalPriceFilter).length > 0) {
        sharedPipeline.push({
            $match: {
                finalPrice: finalPriceFilter,
            },
        });
    }

    const totalResult = await Product.aggregate([
        ...sharedPipeline,

        {
            $count: "value",
        },
    ]);

    const total = totalResult[0]?.value || 0;

    const pages = total === 0 ? 0 : Math.ceil(total / filters.limit);

    filters.page = pages > 0 ? Math.min(filters.page, pages) : 1;

    const products = await Product.aggregate([
        ...sharedPipeline,

        {
            $lookup: {
                from: Category.collection.name,

                localField: "category",
                foreignField: "_id",

                as: "category",
            },
        },

        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: false,
            },
        },

        {
            $sort: SORT_OPTIONS[filters.sort],
        },

        {
            $skip: (filters.page - 1) * filters.limit,
        },

        {
            $limit: filters.limit,
        },
    ]);

    return {
        products: products.map(serializeCatalogProduct),

        categories,

        filters,

        pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            pages,

            hasPreviousPage: filters.page > 1,

            hasNextPage: filters.page < pages,
        },
    };
}
