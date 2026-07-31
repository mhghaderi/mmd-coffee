import connectToDB from "@/lib/db/connectToDB";

import Category from "@/models/Category";
import Product from "@/models/Product";

import {
    serializeCatalogCategory,
    serializeCatalogProduct,
} from "@/lib/catalog/serializeCatalogProduct";

const categoryPopulate = {
    path: "category",
    select: "title slug image imageAlt accentColor isActive archivedAt",
};

const publicProductSort = {
    isFeatured: -1,
    popularityScore: -1,
    salesCount: -1,
    ratingAverage: -1,
    createdAt: -1,
};

export default async function getHomePageData() {
    await connectToDB();

    const rawCategories = await Category.aggregate([
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
            $match: {
                productCount: {
                    $gt: 0,
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

    const activeCategoryIds = rawCategories.map((category) => category._id);

    if (activeCategoryIds.length === 0) {
        return {
            heroPool: [],
            categories: [],
            popularProducts: [],
            newestProducts: [],
            recommendationPool: [],
        };
    }

    const publicProductFilter = {
        status: "published",
        isAvailable: true,

        category: {
            $in: activeCategoryIds,
        },
    };

    const [rawPopularProducts, rawNewestProducts, rawRecommendationPool] = await Promise.all([
        Product.find(publicProductFilter)
            .populate(categoryPopulate)
            .sort(publicProductSort)
            .limit(12)
            .lean(),

        Product.find(publicProductFilter)
            .populate(categoryPopulate)
            .sort({
                isNew: -1,
                createdAt: -1,
            })
            .limit(12)
            .lean(),

        Product.find(publicProductFilter)
            .populate(categoryPopulate)
            .sort(publicProductSort)
            .limit(24)
            .lean(),
    ]);

    const popularProducts = rawPopularProducts.map(serializeCatalogProduct);

    const newestProducts = rawNewestProducts.map(serializeCatalogProduct);

    const recommendationPool = rawRecommendationPool.map(serializeCatalogProduct);

    const heroPool = recommendationPool
        .filter((product) => typeof product.image === "string" && product.image.trim())
        .slice(0, 12);

    return {
        heroPool,

        categories: rawCategories.slice(0, 8).map(serializeCatalogCategory),

        popularProducts,
        newestProducts,
        recommendationPool,
    };
}
