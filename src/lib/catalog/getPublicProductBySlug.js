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
import { serializeCatalogProduct } from "@/lib/catalog/serializeCatalogProduct";

function createCatalogTypeCategoryMatch(catalogType) {
    const normalized = normalizeCatalogType(catalogType);

    if (!normalized) return null;

    const fallbackSlugs =
        normalized === CATALOG_TYPE.SHOP ? SHOP_CATEGORY_SLUGS : CAFE_CATEGORY_SLUGS;

    return {
        $or: [
            { "category.catalogType": normalized },
            {
                $and: [
                    {
                        $or: [
                            { "category.catalogType": { $exists: false } },
                            { "category.catalogType": null },
                            { "category.catalogType": "" },
                        ],
                    },
                    { "category.slug": { $in: fallbackSlugs } },
                ],
            },
        ],
    };
}

export default async function getPublicProductBySlug(slug, options = {}) {
    const normalizedSlug = String(slug || "").trim().toLowerCase();

    if (!normalizedSlug) return null;

    await connectToDB();

    const pipeline = [
        {
            $match: {
                slug: normalizedSlug,
                status: "published",
                isAvailable: true,
                archivedAt: null,
            },
        },
        {
            $lookup: {
                from: Category.collection.name,
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },
        { $unwind: "$category" },
        {
            $match: {
                "category.archivedAt": null,
                $or: [
                    { "category.isActive": true },
                    { "category.isActive": { $exists: false } },
                ],
            },
        },
    ];

    const catalogMatch = createCatalogTypeCategoryMatch(options.catalogType);

    if (catalogMatch) pipeline.push({ $match: catalogMatch });

    if (Array.isArray(options.allowedCategorySlugs) && options.allowedCategorySlugs.length > 0) {
        pipeline.push({ $match: { "category.slug": { $in: options.allowedCategorySlugs } } });
    }

    if (Array.isArray(options.excludedCategorySlugs) && options.excludedCategorySlugs.length > 0) {
        pipeline.push({ $match: { "category.slug": { $nin: options.excludedCategorySlugs } } });
    }

    pipeline.push({ $limit: 1 });

    const [product] = await Product.aggregate(pipeline);

    if (!product) return null;

    const catalogType =
        normalizeCatalogType(product.category?.catalogType) ||
        inferCatalogTypeFromCategorySlug(product.category?.slug) ||
        CATALOG_TYPE.CAFE;

    return {
        ...serializeCatalogProduct(product),
        catalogType,
        detailBasePath: catalogType === CATALOG_TYPE.SHOP ? "/shop" : "/menu",
    };
}
