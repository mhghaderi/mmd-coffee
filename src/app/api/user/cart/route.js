import mongoose from "mongoose";
import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Product from "@/models/Product";
import UserPreference from "@/models/UserPreference";
import {
    getCurrentUserId,
    serializePreferenceProduct,
    stringifyId,
} from "@/lib/recommendations/preferenceUtils";

function unauthorized() {
    return Response.json(
        { success: false, authenticated: false, message: "برای ذخیره سبد وارد حساب شو" },
        { status: 401 },
    );
}

function normalizeSubId(value) {
    return stringifyId(value);
}

function createKey(productId, variantId = "", addOnIds = []) {
    return [productId, variantId || "default", [...addOnIds].sort().join(",") || "no-addons"].join(
        "::",
    );
}

function cleanIncomingItems(items = []) {
    const map = new Map();

    for (const raw of Array.isArray(items) ? items : []) {
        const productId = String(raw?.productId || raw?._id || raw?.id || "").trim();
        if (!mongoose.isValidObjectId(productId)) continue;

        const variantId = String(raw?.variantId || raw?.variant?.id || "").trim();
        const addOnIds = [
            ...new Set(
                (Array.isArray(raw?.addOnIds) ? raw.addOnIds : raw?.addOns?.map((item) => item?.id))
                    .map((item) => String(item || "").trim())
                    .filter(Boolean),
            ),
        ].sort();
        const quantity = Math.max(1, Math.min(99, Number.parseInt(raw?.quantity || 1, 10) || 1));
        const key = createKey(productId, variantId, addOnIds);

        if (map.has(key)) {
            map.get(key).quantity = Math.min(99, map.get(key).quantity + quantity);
        } else {
            map.set(key, {
                product: productId,
                quantity,
                variantId,
                addOnIds,
                addedAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    return [...map.values()];
}

async function getPreference(userId) {
    return UserPreference.findOneAndUpdate(
        { user: userId },
        { $setOnInsert: { user: userId } },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );
}

async function loadCart(preference) {
    const entries = Array.isArray(preference?.cart) ? preference.cart : [];
    const productIds = [
        ...new Set(entries.map((entry) => stringifyId(entry.product)).filter(Boolean)),
    ];
    if (!productIds.length) return [];

    const products = await Product.find({
        _id: { $in: productIds },
        status: "published",
        archivedAt: null,
    })
        .populate("category", "title slug catalogType accentColor")
        .lean();

    const productMap = new Map(products.map((product) => [stringifyId(product._id), product]));

    return entries
        .map((entry) => {
            const productId = stringifyId(entry.product);
            const product = productMap.get(productId);
            if (!product) return null;

            const base = serializePreferenceProduct(product);
            const variantId = String(entry.variantId || "");
            const addOnIds = (entry.addOnIds || []).map(String);

            const variant = (product.variants || []).find(
                (item) => normalizeSubId(item._id || item.id) === variantId,
            );
            const selectedAddOns = (product.addOns || []).filter((item) =>
                addOnIds.includes(normalizeSubId(item._id || item.id)),
            );

            return {
                ...base,
                productId,
                key: createKey(productId, variantId, addOnIds),
                quantity: Math.max(1, Number(entry.quantity) || 1),
                variant: variant
                    ? {
                          id: normalizeSubId(variant._id || variant.id),
                          title: variant.title || "",
                          priceAdjustment: Number(variant.priceAdjustment) || 0,
                      }
                    : null,
                addOns: selectedAddOns.map((item) => ({
                    id: normalizeSubId(item._id || item.id),
                    title: item.title || "",
                    price: Number(item.price) || 0,
                })),
            };
        })
        .filter(Boolean);
}

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        const userId = getCurrentUserId(currentUser);
        if (!userId) return unauthorized();

        await connectToDB();
        const preference = await getPreference(userId);

        return Response.json({
            success: true,
            authenticated: true,
            data: { cart: await loadCart(preference) },
        });
    } catch (error) {
        console.error("GET DATABASE CART ERROR:", error);
        return Response.json(
            { success: false, message: "دریافت سبد خرید انجام نشد" },
            { status: 500 },
        );
    }
}

export async function PUT(request) {
    try {
        const currentUser = await getCurrentUser();
        const userId = getCurrentUserId(currentUser);
        if (!userId) return unauthorized();

        await connectToDB();
        const body = await request.json().catch(() => ({}));
        const mode = body.mode === "merge" ? "merge" : "replace";
        const incoming = cleanIncomingItems(body.items);
        const preference = await getPreference(userId);

        const productIds = [...new Set(incoming.map((item) => stringifyId(item.product)))];
        const validProducts = productIds.length
            ? await Product.find({
                  _id: { $in: productIds },
                  status: "published",
                  archivedAt: null,
              })
                  .select("_id")
                  .lean()
            : [];
        const validIdSet = new Set(validProducts.map((item) => stringifyId(item._id)));
        const validIncoming = incoming.filter((item) => validIdSet.has(stringifyId(item.product)));

        if (mode === "merge") {
            const merged = new Map();
            for (const item of preference.cart || []) {
                const productId = stringifyId(item.product);
                const key = createKey(productId, item.variantId, item.addOnIds || []);
                merged.set(key, {
                    product: productId,
                    quantity: Math.max(1, Number(item.quantity) || 1),
                    variantId: item.variantId || "",
                    addOnIds: [...(item.addOnIds || [])].map(String).sort(),
                    addedAt: item.addedAt || new Date(),
                    updatedAt: new Date(),
                });
            }
            for (const item of validIncoming) {
                const productId = stringifyId(item.product);
                const key = createKey(productId, item.variantId, item.addOnIds || []);
                const existing = merged.get(key);
                if (existing) {
                    existing.quantity = Math.min(99, existing.quantity + item.quantity);
                    existing.updatedAt = new Date();
                } else {
                    merged.set(key, item);
                }
            }
            preference.cart = [...merged.values()];
        } else {
            preference.cart = validIncoming;
        }

        await preference.save();

        return Response.json({
            success: true,
            authenticated: true,
            data: { cart: await loadCart(preference) },
        });
    } catch (error) {
        console.error("SAVE DATABASE CART ERROR:", error);
        return Response.json(
            { success: false, message: "ذخیره سبد خرید انجام نشد" },
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
        await UserPreference.updateOne({ user: userId }, { $set: { cart: [] } }, { upsert: true });

        return Response.json({ success: true, data: { cart: [] } });
    } catch (error) {
        console.error("CLEAR DATABASE CART ERROR:", error);
        return Response.json(
            { success: false, message: "پاک‌کردن سبد خرید انجام نشد" },
            { status: 500 },
        );
    }
}
