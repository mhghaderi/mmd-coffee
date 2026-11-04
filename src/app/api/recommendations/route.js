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

        const products = await Product.find({
            status: "published",
            isAvailable: true,
        })
            .populate("category", "title slug catalogType accentColor")
            .sort({
                isFeatured: -1,
                ratingAverage: -1,
                salesCount: -1,
                createdAt: -1,
            })
            .limit(50)
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

        let userCategoryIds = new Set();
        let userPurchasedProductIds = new Set();
        let wishlistProductIds = new Set();
        let isPersonalized = false;

        if (userId) {
            const [orders, preference] = await Promise.all([
                Order.find({ user: userId, status: { $ne: "cancelled" } })
                    .select("items.product")
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean()
                    .catch(() => []),
                UserPreference.findOne({ user: userId })
                    .select("wishlist.product")
                    .lean()
                    .catch(() => null),
            ]);

            for (const order of orders || []) {
                for (const item of order.items || []) {
                    const pid = stringifyId(item.product);
                    if (pid) userPurchasedProductIds.add(pid);
                }
            }

            for (const item of preference?.wishlist || []) {
                const pid = stringifyId(item.product);
                if (pid) wishlistProductIds.add(pid);
            }

            const interestedProductIds = [
                ...userPurchasedProductIds,
                ...wishlistProductIds,
            ];

            if (interestedProductIds.length > 0) {
                isPersonalized = true;
                const interestedProducts = products.filter((p) =>
                    interestedProductIds.includes(stringifyId(p._id)),
                );
                for (const p of interestedProducts) {
                    const catId = stringifyId(p.category?._id || p.category);
                    if (catId) userCategoryIds.add(catId);
                }
            }
        }

        const scoredProducts = products.map((product) => {
            const pid = stringifyId(product._id);
            const catId = stringifyId(product.category?._id || product.category);

            let score = 0;
            let reason = "محبوب بین مشتری‌ها";

            if (product.isFeatured) score += 15;
            score += Number(product.ratingAverage || 0) * 10;
            score += Math.min(Number(product.salesCount || 0), 200) * 0.2;

            if (isPersonalized) {
                if (wishlistProductIds.has(pid)) {
                    score += 50;
                    reason = "از علاقه‌مندی‌های شما";
                } else if (userCategoryIds.has(catId)) {
                    score += 35;
                    reason = userPurchasedProductIds.has(pid)
                        ? "بر اساس خریدهای قبلی شما"
                        : "هماهنگ با سلیقه شما";
                } else if (product.isFeatured) {
                    reason = "پیشنهاد ویژه ممد کافی";
                }
            } else if (product.isFeatured) {
                reason = "پیشنهاد ویژه ممد کافی";
            }

            return {
                product,
                score,
                reason,
            };
        });

        scoredProducts.sort((a, b) => b.score - a.score);

        const topPool = scoredProducts.slice(0, 12);
        const finalSelection = [
            ...topPool.slice(0, 2),
            ...shuffle(topPool.slice(2, 12)),
        ].slice(0, 6);

        return Response.json(
            {
                success: true,
                personalized: isPersonalized,
                data: {
                    products: finalSelection.map((item) => ({
                        ...serializePreferenceProduct(item.product),
                        recommendationReason: item.reason,
                    })),
                },
            },
            { headers: RESPONSE_HEADERS },
        );
    } catch (error) {
        console.error("RECOMMENDATION API ERROR:", error);
        return Response.json(
            {
                success: false,
                message: "دریافت پیشنهادها انجام نشد",
            },
            {
                status: 500,
                headers: RESPONSE_HEADERS,
            },
        );
    }
}
