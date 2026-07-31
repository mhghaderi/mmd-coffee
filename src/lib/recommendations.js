function normalizeId(value) {
    if (!value) {
        return "";
    }

    return typeof value === "string" ? value : value.toString();
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

export function getRecommendedProducts({
    products = [],
    cartItems = [],
    wishlistItems = [],
    limit = 4,
}) {
    const cartProductIds = new Set(cartItems.map(getProductIdentity).filter(Boolean));

    const wishlistProductIds = new Set(wishlistItems.map(getProductIdentity).filter(Boolean));

    const preferredCategories = new Set(wishlistItems.map(getCategoryIdentity).filter(Boolean));

    return products
        .filter(
            (product) =>
                product &&
                product.isAvailable !== false &&
                product.status !== "draft" &&
                product.status !== "archived",
        )
        .map((product) => {
            const productId = getProductIdentity(product);

            const categoryId = getCategoryIdentity(product);

            let score = 0;

            score += Number(product.popularityScore) || 0;

            score += (Number(product.salesCount) || 0) * 0.25;

            score += (Number(product.ratingAverage ?? product.rating) || 0) * 10;

            score += Math.min(Number(product.reviewsCount) || 0, 100) * 0.1;

            if (product.isFeatured) {
                score += 20;
            }

            if (product.isNew) {
                score += 8;
            }

            if (Number(product.discountPercent) > 0) {
                score += 5;
            }

            if (wishlistProductIds.has(productId)) {
                score += 35;
            }

            if (categoryId && preferredCategories.has(categoryId)) {
                score += 25;
            }

            if (cartProductIds.has(productId)) {
                score -= 1000;
            }

            return {
                product,
                score,
            };
        })
        .sort((first, second) => {
            if (second.score !== first.score) {
                return second.score - first.score;
            }

            return (
                new Date(second.product.createdAt || 0).getTime() -
                new Date(first.product.createdAt || 0).getTime()
            );
        })
        .slice(0, limit)
        .map((item) => item.product);
}
export function hasRecommendationSignals({
  cartItems = [],
  wishlistItems = [],
}) {
  return (
    cartItems.length > 0 ||
    wishlistItems.length > 0
  );
}


export function getPersonalizedRecommendations({
  products = [],
  cartItems = [],
  wishlistItems = [],
  limit = 4,
}) {
  return getRecommendedProducts({
    products,
    cartItems,
    wishlistItems,
    limit,
  });
}