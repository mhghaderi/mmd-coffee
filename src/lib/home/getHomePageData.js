import connectToDB from "@/lib/db/connectToDB";
import Article from "@/models/Article";
import Category from "@/models/Category";
import Product from "@/models/Product";
import {
    CATALOG_TYPE,
    inferCatalogTypeFromCategorySlug,
    normalizeCatalogType,
} from "@/constants/catalog";
import { serializeCatalogProduct } from "@/lib/catalog/serializeCatalogProduct";

function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
}

function getCategoryType(category) {
    return (
        normalizeCatalogType(category?.catalogType) ||
        inferCatalogTypeFromCategorySlug(category?.slug) ||
        CATALOG_TYPE.CAFE
    );
}

function decorateProduct(product) {
    const catalogType = getCategoryType(product.category);
    return {
        ...serializeCatalogProduct(product),
        catalogType,
        detailBasePath: catalogType === CATALOG_TYPE.SHOP ? "/shop" : "/menu",
    };
}

function serializeArticle(article) {
    return JSON.parse(JSON.stringify(article));
}

export default async function getHomePageData() {
    await connectToDB();

    const categories = await Category.find({
        archivedAt: null,
        $or: [{ isActive: true }, { isActive: { $exists: false } }],
    })
        .select("_id title slug catalogType")
        .lean();

    const cafeCategoryIds = [];
    const shopCategoryIds = [];

    for (const category of categories) {
        if (getCategoryType(category) === CATALOG_TYPE.SHOP) {
            shopCategoryIds.push(category._id);
        } else {
            cafeCategoryIds.push(category._id);
        }
    }

    const publicBaseFilter = {
        status: "published",
        isAvailable: true,
        archivedAt: null,
    };

    const popularSort = {
        popularityScore: -1,
        salesCount: -1,
        ratingAverage: -1,
        reviewsCount: -1,
        isFeatured: -1,
        createdAt: -1,
    };

    const [
        cafeRaw,
        shopRaw,
        recommendationRaw,
        heroRaw,
        latestArticlesRaw,
    ] = await Promise.all([
        Product.find({ ...publicBaseFilter, category: { $in: cafeCategoryIds } })
            .populate("category", "title slug catalogType accentColor")
            .sort(popularSort)
            .limit(8)
            .lean(),
        Product.find({ ...publicBaseFilter, category: { $in: shopCategoryIds } })
            .populate("category", "title slug catalogType accentColor")
            .sort(popularSort)
            .limit(8)
            .lean(),
        Product.find({ ...publicBaseFilter, category: { $in: [...cafeCategoryIds, ...shopCategoryIds] } })
            .populate("category", "title slug catalogType accentColor")
            .sort(popularSort)
            .limit(30)
            .lean(),
        Product.find({
            ...publicBaseFilter,
            category: { $in: [...cafeCategoryIds, ...shopCategoryIds] },
            image: { $nin: [null, ""] },
        })
            .populate("category", "title slug catalogType accentColor")
            .sort(popularSort)
            .limit(12)
            .lean(),
        Article.find({
            status: "published",
            publishedAt: { $lte: new Date() },
        })
            .select("title slug excerpt coverImage coverImageAlt publishedAt readingTime tags isFeatured")
            .sort({ publishedAt: -1, isFeatured: -1, _id: -1 })
            .limit(3)
            .lean()
            .catch(() => []),
    ]);

    const popularCafeProducts = cafeRaw.map(decorateProduct);
    const popularShopProducts = shopRaw.map(decorateProduct);
    const recommendationPool = recommendationRaw.map(decorateProduct);
    const heroPool = shuffle(heroRaw.map(decorateProduct));

    return {
        heroPool,
        popularCafeProducts,
        popularShopProducts,
        recommendationPool,
        latestArticles: latestArticlesRaw.map(serializeArticle),
    };
}
