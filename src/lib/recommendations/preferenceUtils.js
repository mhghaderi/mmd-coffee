export function stringifyId(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value?.toString === "function") return value.toString();
    return "";
}

export function getCurrentUserId(user) {
    return stringifyId(user?.id || user?._id);
}

export function serializePreferenceProduct(product) {
    if (!product) return null;

    const raw = typeof product.toObject === "function" ? product.toObject() : product;
    const category = raw.category && typeof raw.category === "object" ? raw.category : null;
    const id = stringifyId(raw._id || raw.id);
    const categoryId = stringifyId(category?._id || raw.categoryId || raw.category);
    const price = Number(raw.price) || 0;
    const discountPercent = Math.min(Math.max(Number(raw.discountPercent) || 0, 0), 100);
    const finalPrice = Math.round(price * (1 - discountPercent / 100));
    const catalogType =
        category?.catalogType === "shop" || raw.catalogType === "shop" ? "shop" : "cafe";

    return {
        _id: id,
        id,
        name: raw.name || raw.title || "محصول",
        slug: raw.slug || "",
        englishName: raw.englishName || "",
        description: raw.description || "",
        shortDescription: raw.shortDescription || "",
        image: raw.image || "",
        imageAlt: raw.imageAlt || "",
        price,
        discountPercent,
        finalPrice,
        isAvailable: raw.isAvailable !== false,
        isFeatured: Boolean(raw.isFeatured),
        isNew: Boolean(raw.isNew),
        popularityScore: Number(raw.popularityScore) || 0,
        salesCount: Number(raw.salesCount) || 0,
        ratingAverage: Number(raw.ratingAverage ?? raw.rating) || 0,
        reviewsCount: Number(raw.reviewsCount) || 0,
        categoryId,
        categorySlug: category?.slug || raw.categorySlug || "",
        categoryTitle: category?.title || raw.categoryTitle || "",
        catalogType,
        detailBasePath: catalogType === "shop" ? "/shop" : "/menu",
    };
}

export function bumpCategoryScore(preference, categoryId, amount = 1) {
    const normalizedId = stringifyId(categoryId);
    if (!normalizedId) return;

    const existing = preference.categoryScores.find(
        (entry) => stringifyId(entry.category) === normalizedId,
    );

    if (existing) {
        existing.score = Math.max(-1000, Math.min(1000, Number(existing.score || 0) + amount));
        existing.updatedAt = new Date();
        return;
    }

    preference.categoryScores.push({
        category: normalizedId,
        score: amount,
        updatedAt: new Date(),
    });
}

export function bumpProductSignal(preference, productId, event, amount = 1) {
    const normalizedId = stringifyId(productId);
    if (!normalizedId) return;

    let signal = preference.productSignals.find(
        (entry) => stringifyId(entry.product) === normalizedId,
    );

    if (!signal) {
        preference.productSignals.push({
            product: normalizedId,
            viewCount: 0,
            cartCount: 0,
            wishlistCount: 0,
            purchaseCount: 0,
            lastInteractionAt: new Date(),
        });
        signal = preference.productSignals[preference.productSignals.length - 1];
    }

    const fieldByEvent = {
        view: "viewCount",
        cart: "cartCount",
        wishlist: "wishlistCount",
        purchase: "purchaseCount",
    };

    const field = fieldByEvent[event];
    if (field) signal[field] = Math.max(0, Number(signal[field] || 0) + amount);
    signal.lastInteractionAt = new Date();

    // برای پروژه فروشگاهی کوچک، آخرین ۲۰۰ سیگنال کافی است و از رشد بی‌نهایت سند جلوگیری می‌کند.
    if (preference.productSignals.length > 200) {
        preference.productSignals.sort(
            (a, b) => new Date(b.lastInteractionAt || 0) - new Date(a.lastInteractionAt || 0),
        );
        preference.productSignals = preference.productSignals.slice(0, 200);
    }
}
