function normalizeId(value) {
    if (!value) return "";
    return typeof value === "string" ? value : value.toString?.() || "";
}

function getProductIdentity(product) {
    return normalizeId(product?.productId || product?._id || product?.id) || product?.slug || "";
}

function getCategoryIdentity(product) {
    return (
        normalizeId(product?.categoryId || product?.category?._id) ||
        product?.categorySlug ||
        product?.category?.slug ||
        ""
    );
}

export function hasRecommendationSignals(input = {}) {
    const cartItems = input.cartItems || input.cart || [];
    const wishlistItems = input.wishlistItems || input.wishlist || [];
    return cartItems.length > 0 || wishlistItems.length > 0;
}

export function getRecommendedProducts({
    products = [],
    cartItems = [],
    wishlistItems = [],
    limit = 4,
} = {}) {
    const cartIds = new Set(cartItems.map(getProductIdentity).filter(Boolean));
    const wishlistIds = new Set(wishlistItems.map(getProductIdentity).filter(Boolean));
    const preferredCategories = new Set(
        [...cartItems, ...wishlistItems].map(getCategoryIdentity).filter(Boolean),
    );

    return products
        .filter((product) => product && product.isAvailable !== false)
        .map((product) => {
            const id = getProductIdentity(product);
            const category = getCategoryIdentity(product);
            let score = Number(product.popularityScore) || 0;
            score += (Number(product.salesCount) || 0) * 0.25;
            score += (Number(product.ratingAverage || product.rating) || 0) * 10;
            if (product.isFeatured) score += 20;
            if (product.isNew) score += 8;
            if (Number(product.discountPercent) > 0) score += 5;
            if (wishlistIds.has(id)) score += 35;
            if (category && preferredCategories.has(category)) score += 25;
            if (cartIds.has(id)) score -= 1000;
            return { product, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.product);
}

export function getPersonalizedRecommendations(input = {}) {
    return getRecommendedProducts({
        products: input.products || [],
        cartItems: input.cartItems || input.cart || [],
        wishlistItems: input.wishlistItems || input.wishlist || [],
        limit: input.limit || 4,
    });
}
