import connectToDB from "@/lib/db/connectToDB";

import Category from "@/models/Category";
import Product from "@/models/Product";

import {
    CAFE_CATEGORY_SLUGS,
    CATALOG_TYPE,
    SHOP_CATEGORY_SLUGS,
    inferCatalogTypeFromCategorySlug,
    normalizeCatalogType,
} from "@/constants/catalog";

import {
    serializeCatalogCategory,
    serializeCatalogProduct,
} from "@/lib/catalog/serializeCatalogProduct";

const SORT_OPTIONS = {
    popular: {
        popularityScore: -1,
        salesCount: -1,
        ratingAverage: -1,
        isFeatured: -1,
        createdAt: -1,
        _id: -1,
    },
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    rating: { ratingAverage: -1, reviewsCount: -1, createdAt: -1 },
    "price-asc": { finalPrice: 1, createdAt: -1 },
    "price-desc": { finalPrice: -1, createdAt: -1 },
    name: { displayOrder: 1, name: 1 },
};

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function normalizeText(value) {
    return firstValue(value)?.toString().trim() || "";
}

function normalizeBoolean(value) {
    return ["true", "1", "yes", "on"].includes(normalizeText(value).toLowerCase());
}

function normalizePage(value) {
    const parsed = Number.parseInt(normalizeText(value) || "1", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeLimit(value) {
    const parsed = Number.parseInt(normalizeText(value) || "12", 10);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 4), 48) : 12;
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

function createCatalogTypeMatch(catalogType) {
    const normalizedType = normalizeCatalogType(catalogType);

    if (!normalizedType) {
        return null;
    }

    const fallbackSlugs =
        normalizedType === CATALOG_TYPE.SHOP
            ? SHOP_CATEGORY_SLUGS
            : CAFE_CATEGORY_SLUGS;

    return {
        $or: [
            { catalogType: normalizedType },
            {
                $and: [
                    {
                        $or: [
                            { catalogType: { $exists: false } },
                            { catalogType: null },
                            { catalogType: "" },
                        ],
                    },
                    { slug: { $in: fallbackSlugs } },
                ],
            },
        ],
    };
}

async function getActiveCategories(options = {}) {
    const categoryMatch = {
        archivedAt: null,
        $and: [
            {
                $or: [
                    { isActive: true },
                    { isActive: { $exists: false } },
                ],
            },
        ],
    };

    const catalogTypeMatch = createCatalogTypeMatch(options.catalogType);

    if (catalogTypeMatch) {
        categoryMatch.$and.push(catalogTypeMatch);
    }

    if (Array.isArray(options.allowedCategorySlugs) && options.allowedCategorySlugs.length > 0) {
        categoryMatch.$and.push({ slug: { $in: options.allowedCategorySlugs } });
    }

    if (Array.isArray(options.excludedCategorySlugs) && options.excludedCategorySlugs.length > 0) {
        categoryMatch.$and.push({ slug: { $nin: options.excludedCategorySlugs } });
    }

    const categories = await Category.aggregate([
        { $match: categoryMatch },
        {
            $lookup: {
                from: Product.collection.name,
                let: { categoryId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$category", "$$categoryId"] },
                                    { $eq: ["$status", "published"] },
                                    { $eq: ["$isAvailable", true] },
                                ],
                            },
                        },
                    },
                    { $count: "value" },
                ],
                as: "productCountResult",
            },
        },
        {
            $addFields: {
                productCount: {
                    $ifNull: [{ $arrayElemAt: ["$productCountResult.value", 0] }, 0],
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
                catalogType: 1,
            },
        },
        { $sort: { displayOrder: 1, title: 1 } },
    ]);

    return categories.map((category) => ({
        ...category,
        catalogType:
            normalizeCatalogType(category.catalogType) ||
            inferCatalogTypeFromCategorySlug(category.slug) ||
            CATALOG_TYPE.CAFE,
    }));
}

function createFinalPriceExpression() {
    return {
        $round: [
            {
                $multiply: [
                    { $ifNull: ["$price", 0] },
                    {
                        $subtract: [
                            1,
                            {
                                $divide: [
                                    { $ifNull: ["$discountPercent", 0] },
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

function decorateCategory(category) {
    const serialized = serializeCatalogCategory(category);
    const catalogType =
        normalizeCatalogType(category.catalogType) ||
        inferCatalogTypeFromCategorySlug(category.slug) ||
        CATALOG_TYPE.CAFE;

    return { ...serialized, catalogType };
}

function decorateProduct(product) {
    const serialized = serializeCatalogProduct(product);
    const categorySlug = product.category?.slug || serialized.categorySlug || "";
    const catalogType =
        normalizeCatalogType(product.category?.catalogType) ||
        inferCatalogTypeFromCategorySlug(categorySlug) ||
        CATALOG_TYPE.CAFE;

    return {
        ...serialized,
        catalogType,
        detailBasePath: catalogType === CATALOG_TYPE.SHOP ? "/shop" : "/menu",
    };
}

export default async function getPublicCatalog(rawSearchParams = {}, options = {}) {
    await connectToDB();

    const rawCategories = await getActiveCategories(options);
    const categories = rawCategories.map(decorateCategory);
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
        archivedAt: null,
        category: { $in: activeCategoryIds },
    };

    if (filters.category) {
        const selectedCategory = rawCategories.find(
            (category) =>
                category.slug?.toLowerCase() === filters.category ||
                category._id.toString() === filters.category,
        );

        productMatch.category = selectedCategory
            ? selectedCategory._id
            : { $in: [] };
    }

    if (filters.q) {
        const searchRegex = new RegExp(escapeRegExp(filters.q), "i");

        productMatch.$or = [
            { name: searchRegex },
            { englishName: searchRegex },
            { slug: searchRegex },
            { shortDescription: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
            { ingredients: searchRegex },
        ];
    }

    if (filters.discounted) {
        productMatch.discountPercent = { $gt: 0 };
    }

    if (filters.featured) {
        productMatch.isFeatured = true;
    }

    if (filters.newOnly) {
        productMatch.isNew = true;
    }

    const sharedPipeline = [
        { $match: productMatch },
        { $addFields: { finalPrice: createFinalPriceExpression() } },
    ];

    const finalPriceFilter = {};

    if (filters.minPrice !== null) finalPriceFilter.$gte = filters.minPrice;
    if (filters.maxPrice !== null) finalPriceFilter.$lte = filters.maxPrice;

    if (Object.keys(finalPriceFilter).length > 0) {
        sharedPipeline.push({ $match: { finalPrice: finalPriceFilter } });
    }

    const totalResult = await Product.aggregate([...sharedPipeline, { $count: "value" }]);
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
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: false } },
        { $sort: SORT_OPTIONS[filters.sort] },
        { $skip: (filters.page - 1) * filters.limit },
        { $limit: filters.limit },
    ]);

    return {
        products: products.map(decorateProduct),
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
