import mongoose from "mongoose";
import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Product from "@/models/Product";
import UserPreference from "@/models/UserPreference";
import {
    bumpCategoryScore,
    bumpProductSignal,
    getCurrentUserId,
    serializePreferenceProduct,
    stringifyId,
} from "@/lib/recommendations/preferenceUtils";

function unauthorized() {
    return Response.json(
        { success: false, authenticated: false, message: "برای ذخیره سلیقه وارد حساب شو" },
        { status: 401 },
    );
}

async function getPreference(userId) {
    return UserPreference.findOneAndUpdate(
        { user: userId },
        { $setOnInsert: { user: userId } },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );
}

async function loadWishlist(preference) {
    const ids = preference.wishlist.map((item) => item.product).filter(Boolean);
    if (!ids.length) return [];

    const products = await Product.find({
        _id: { $in: ids },
        status: "published",
        archivedAt: null,
    })
        .populate("category", "title slug catalogType accentColor")
        .lean();

    const productMap = new Map(products.map((item) => [stringifyId(item._id), item]));

    return preference.wishlist
        .map((entry) => serializePreferenceProduct(productMap.get(stringifyId(entry.product))))
        .filter(Boolean);
}

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        const userId = getCurrentUserId(currentUser);

        if (!userId) {
            return Response.json({
                success: true,
                authenticated: false,
                data: { wishlist: [], categoryScores: [], productSignals: [] },
            });
        }

        await connectToDB();
        const preference = await getPreference(userId);
        const wishlist = await loadWishlist(preference);

        return Response.json({
            success: true,
            authenticated: true,
            data: {
                wishlist,
                categoryScores: JSON.parse(JSON.stringify(preference.categoryScores || [])),
                productSignals: JSON.parse(JSON.stringify(preference.productSignals || [])),
            },
        });
    } catch (error) {
        console.error("GET USER PREFERENCES ERROR:", error);
        return Response.json(
            { success: false, message: "دریافت علاقه‌مندی‌ها انجام نشد" },
            { status: 500 },
        );
    }
}

export async function POST(request) {
    try {
        const currentUser = await getCurrentUser();
        const userId = getCurrentUserId(currentUser);
        if (!userId) return unauthorized();

        await connectToDB();
        const body = await request.json().catch(() => ({}));
        const action = String(body.action || "");
        const preference = await getPreference(userId);

        if (action === "sync_wishlist") {
            const rawIds = Array.isArray(body.productIds) ? body.productIds : [];
            const validIds = [...new Set(rawIds.map(String))].filter((id) =>
                mongoose.isValidObjectId(id),
            );

            if (validIds.length) {
                const products = await Product.find({ _id: { $in: validIds } })
                    .select("_id category")
                    .lean();
                const existing = new Set(
                    preference.wishlist.map((item) => stringifyId(item.product)),
                );
                const newlyAddedIds = [];

                for (const product of products) {
                    const id = stringifyId(product._id);
                    if (!existing.has(id)) {
                        preference.wishlist.push({ product: product._id, addedAt: new Date() });
                        newlyAddedIds.push(product._id);
                        bumpCategoryScore(preference, product.category, 5);
                        bumpProductSignal(preference, product._id, "wishlist", 1);
                    }
                }

                await preference.save();

                if (newlyAddedIds.length) {
                    await Product.updateMany(
                        { _id: { $in: newlyAddedIds } },
                        { $inc: { wishlistCount: 1, popularityScore: 2 } },
                    );
                }
            }

            return Response.json({
                success: true,
                data: { wishlist: await loadWishlist(preference) },
            });
        }

        const productId = String(body.productId || "");
        if (!mongoose.isValidObjectId(productId)) {
            return Response.json(
                { success: false, message: "شناسه محصول معتبر نیست" },
                { status: 400 },
            );
        }

        const product = await Product.findById(productId)
            .select("_id category status archivedAt")
            .lean();
        if (!product || product.archivedAt || product.status === "archived") {
            return Response.json({ success: false, message: "محصول پیدا نشد" }, { status: 404 });
        }

        if (action === "toggle_wishlist") {
            const index = preference.wishlist.findIndex(
                (item) => stringifyId(item.product) === productId,
            );
            let added;

            if (index >= 0) {
                preference.wishlist.splice(index, 1);
                bumpCategoryScore(preference, product.category, -2);
                added = false;
            } else {
                preference.wishlist.unshift({ product: product._id, addedAt: new Date() });
                bumpCategoryScore(preference, product.category, 5);
                bumpProductSignal(preference, product._id, "wishlist", 1);
                added = true;
            }

            await preference.save();

            if (added) {
                await Product.updateOne(
                    { _id: product._id },
                    { $inc: { wishlistCount: 1, popularityScore: 2 } },
                );
            } else {
                await Product.updateOne({ _id: product._id }, [
                    {
                        $set: {
                            wishlistCount: {
                                $max: [0, { $subtract: [{ $ifNull: ["$wishlistCount", 0] }, 1] }],
                            },
                            popularityScore: {
                                $max: [0, { $subtract: [{ $ifNull: ["$popularityScore", 0] }, 1] }],
                            },
                        },
                    },
                ]);
            }

            return Response.json({
                success: true,
                data: {
                    added,
                    wishlist: await loadWishlist(preference),
                },
            });
        }

        if (action === "record") {
            const event = ["view", "cart", "wishlist", "purchase"].includes(body.event)
                ? body.event
                : "view";
            const weights = { view: 1, cart: 3, wishlist: 5, purchase: 12 };

            bumpProductSignal(preference, product._id, event, 1);
            bumpCategoryScore(preference, product.category, weights[event]);
            await preference.save();

            if (event === "view") {
                await Product.updateOne(
                    { _id: product._id },
                    { $inc: { viewsCount: 1, popularityScore: 0.1 } },
                );
            } else if (event === "cart") {
                await Product.updateOne({ _id: product._id }, { $inc: { popularityScore: 0.5 } });
            }

            return Response.json({ success: true });
        }

        return Response.json(
            { success: false, message: "عملیات علاقه‌مندی معتبر نیست" },
            { status: 400 },
        );
    } catch (error) {
        console.error("UPDATE USER PREFERENCES ERROR:", error);
        return Response.json(
            { success: false, message: "ذخیره سلیقه کاربر انجام نشد" },
            { status: 500 },
        );
    }
}

export async function DELETE() {
    try {
        const currentUser = await getCurrentUser();
        const userId = getCurrentUserId(currentUser);
        if (!userId) return unauthorized();

        await connectToDB();
        const preference = await UserPreference.findOne({ user: userId }).lean();
        const productIds = (preference?.wishlist || []).map((item) => item.product).filter(Boolean);

        await UserPreference.updateOne(
            { user: userId },
            { $set: { wishlist: [] } },
            { upsert: true },
        );

        if (productIds.length) {
            await Product.updateMany({ _id: { $in: productIds } }, [
                {
                    $set: {
                        wishlistCount: {
                            $max: [0, { $subtract: [{ $ifNull: ["$wishlistCount", 0] }, 1] }],
                        },
                        popularityScore: {
                            $max: [0, { $subtract: [{ $ifNull: ["$popularityScore", 0] }, 1] }],
                        },
                    },
                },
            ]);
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("CLEAR USER WISHLIST ERROR:", error);
        return Response.json(
            { success: false, message: "پاک‌کردن علاقه‌مندی‌ها انجام نشد" },
            { status: 500 },
        );
    }
}
