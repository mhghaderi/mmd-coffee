export const CATALOG_TYPE = {
    CAFE: "cafe",
    SHOP: "shop",
};

export const CAFE_CATEGORY_SLUGS = [
    "hot-drinks",
    "cold-drinks",
    "tea-and-infusions",
    "desserts",
    "bakery",
];

export const SHOP_CATEGORY_SLUGS = [
    "coffee-beans",
    "brewing-tools",
    "accessories",
    "gift-boxes",
];

export function normalizeCatalogType(value) {
    const normalized = String(value || "").trim().toLowerCase();

    if (normalized === CATALOG_TYPE.SHOP) {
        return CATALOG_TYPE.SHOP;
    }

    if (normalized === CATALOG_TYPE.CAFE) {
        return CATALOG_TYPE.CAFE;
    }

    return "";
}

export function inferCatalogTypeFromCategorySlug(slug) {
    const normalizedSlug = String(slug || "").trim().toLowerCase();

    if (SHOP_CATEGORY_SLUGS.includes(normalizedSlug)) {
        return CATALOG_TYPE.SHOP;
    }

    if (CAFE_CATEGORY_SLUGS.includes(normalizedSlug)) {
        return CATALOG_TYPE.CAFE;
    }

    return "";
}

export function isShopCategorySlug(slug) {
    return inferCatalogTypeFromCategorySlug(slug) === CATALOG_TYPE.SHOP;
}
