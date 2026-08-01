import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import UserPreference from "@/models/UserPreference";
import {
    getCurrentUserId,
    serializePreferenceProduct,
    stringifyId,
} from "@/lib/recommendations/preferenceUtils";

const RESPONSE_HEADERS = {
    "Cache-Control": "no-store, max-age=0",
};

function recencyBoost(date) {
    const time = new Date(date || 0).getTime();
    if (!time) return 0;
    const days = (Date.now() - time) / 86_400_000;
    if (days <= 3) return 12;
    if (days <= 7) return 8;
    if (days <= 30) return 4;
    return 0;
}

function getSignalScore(signal) {
    return (
        Number(signal?.viewCount || 0) * 1 +
        Number(signal?.cartCount || 0) * 3 +
        Number(signal?.wishlistCount || 0) * 5 +
        Number(signal?.purchaseCount || 0) * 12 +
        recencyBoost(signal?.lastInteractionAt)
    );
}

function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
}

export async function GET() {
    try {
        await connectToDB();

        const currentUser = await getCurrentUser();
        const userId = getCurrentUserId(currentUser);

        const activeCategories = await Category.find({
            archivedAt: null,
            $or: [{ isActive: true }, { isActive: { $exists: false } }],
        })
            .select("_id title slug catalogType accentColor")
            .lean();

        const activeCategoryIds = activeCategories.map((item) => item._id);

        const products = await Product.find({
            category: { $in: activeCategoryIds },
            status: "published",
            isAvailable: true,
            archivedAt: null,
        })
            .populate("category", "title slug catalogType accentColor")
            .sort({
                popularityScore: -1,
                salesCount: -1,
                ratingAverage: -1,
                reviewsCount: -1,
                createdAt: -1,
            })
            .limit(100)
            .lean();

        if (!products.length) {
            return Response.json(
                {
                    success: true,
                    personalized: false,
                    data: { products: [] },
                },
                { headers: RESPONSE_HEADERS },
            );
        }

        let preference = null;
        let orders = [];

        if (userId) {
            [preference, orders] = await Promise.all([
                UserPreference.findOne({ user: userId }).lean(),
                Order.find({ user: userId, status: { $ne: "cancelled" } })
                    .select("items.product items.quantity createdAt")
                    .sort({ createdAt: -1 })
                    .limit(60)
                    .lean()
                    .catch(() => []),
            ]);
        }

        const wishlistIds = new Set(
            (preference?.wishlist || [])
                .map((item) => stringifyId(item.product))
                .filter(Boolean),
        );

        const cartMap = new Map(
            (preference?.cart || []).map((item) => [
                stringifyId(item.product),
                Math.max(1, Number(item.quantity) || 1),
            ]),
        );

        const categoryScoreMap = new Map(
            (preference?.categoryScores || []).map((item) => [
                stringifyId(item.category),
                Number(item.score) || 0,
            ]),
        );

        const signalMap = new Map(
            (preference?.productSignals || []).map((item) => [
                stringifyId(item.product),
                item,
            ]),
        );

        const purchaseMap = new Map();
        for (const order of orders || []) {
            for (const item of order.items || []) {
                const productId = stringifyId(item.product);
                if (!productId) continue;
                purchaseMap.set(
                    productId,
                    (purchaseMap.get(productId) || 0) +
                        Math.max(1, Number(item.quantity) || 1),
                );
            }
        }

        const categoryIdsByCart = new Map();
        for (const product of products) {
            const productId = stringifyId(product._id);
            if (!cartMap.has(productId)) continue;

            const categoryId = stringifyId(product.category?._id || product.category);
            categoryIdsByCart.set(
                categoryId,
                (categoryIdsByCart.get(categoryId) || 0) + cartMap.get(productId),
            );
        }

        const hasSignals = Boolean(
            userId &&
                (wishlistIds.size ||
                    cartMap.size ||
                    categoryScoreMap.size ||
                    signalMap.size ||
                    purchaseMap.size),
        );

        const ranked = products
            .map((product) => {
                const productId = stringifyId(product._id);
                const categoryId = stringifyId(product.category?._id || product.category);
                const signal = signalMap.get(productId);
                const purchases = purchaseMap.get(productId) || 0;
                const cartQuantity = cartMap.get(productId) || 0;

                let score = 0;
                score += Number(product.popularityScore || 0) * 1.2;
                score += Math.min(Number(product.salesCount || 0), 500) * 0.7;
                score += Number(product.ratingAverage || 0) * 12;
                score += Math.min(Number(product.reviewsCount || 0), 100) * 0.25;
                if (product.isFeatured) score += 18;
                if (product.isNew) score += 6;
                if (Number(product.discountPercent || 0) > 0) score += 3;

                if (hasSignals) {
                    score += (categoryScoreMap.get(categoryId) || 0) * 2.4;
                    score += (categoryIdsByCart.get(categoryId) || 0) * 9;
                    score += getSignalScore(signal) * 2;
                    score += purchases * 11;
                    score += cartQuantity * 28;

                    if (wishlistIds.has(productId)) score += 34;
                    if (purchases > 0) score -= Math.min(purchases * 2, 12);
                    if (cartQuantity > 0) score -= 22;
                }

                let reason = "محبوب بین مشتری‌ها";
                if (wishlistIds.has(productId)) reason = "از علاقه‌مندی‌های تو";
                else if (cartQuantity > 0) reason = "در سبد خرید تو";
                else if ((categoryIdsByCart.get(categoryId) || 0) > 0)
                    reason = "مشابه انتخاب‌های سبد تو";
                else if ((categoryScoreMap.get(categoryId) || 0) >= 5)
                    reason = "هماهنگ با سلیقه تو";
                else if (purchases > 0) reason = "براساس خریدهای قبلی تو";
                else if (product.isFeatured) reason = "انتخاب ویژه ممد کافی";

                return { product, score, reason };
            })
            .sort((first, second) => second.score - first.score)
            .slice(0, 18);

        // دو انتخاب اول پایدار می‌مانند و چهار مورد بعدی از بین پیشنهادهای قوی‌تر
        // جابه‌جا می‌شوند تا با refresh حس تازه بودن داشته باشد.
        const selected = [
            ...ranked.slice(0, 2),
            ...shuffle(ranked.slice(2, 12)),
        ].slice(0, 6);

        if (userId) {
            UserPreference.updateOne(
                { user: userId },
                { $set: { lastPersonalizedAt: new Date() } },
                { upsert: true },
            ).catch(() => {});
        }

        return Response.json(
            {
                success: true,
                personalized: hasSignals,
                data: {
                    products: selected.map((item) => ({
                        ...serializePreferenceProduct(item.product),
                        recommendationReason: item.reason,
                    })),
                },
            },
            { headers: RESPONSE_HEADERS },
        );
    } catch (error) {
        console.error("GET DATABASE RECOMMENDATIONS ERROR:", error);
        return Response.json(
            {
                success: false,
                message: "دریافت پیشنهادهای شخصی انجام نشد",
            },
            {
                status: 500,
                headers: RESPONSE_HEADERS,
            },
        );
    }
}
