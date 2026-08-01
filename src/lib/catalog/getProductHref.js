import {
    CATALOG_TYPE,
    inferCatalogTypeFromCategorySlug,
    normalizeCatalogType,
} from "@/constants/catalog";

export default function getProductHref(product, fallbackBasePath = "/menu") {
    const slug = String(product?.slug || "").trim();

    if (!slug) {
        return fallbackBasePath;
    }

    const explicitBasePath = String(product?.detailBasePath || "").trim();

    if (explicitBasePath === "/shop" || explicitBasePath === "/menu") {
        return `${explicitBasePath}/${slug}`;
    }

    const categorySlug = product?.categorySlug || product?.category?.slug || "";
    const catalogType =
        normalizeCatalogType(product?.catalogType) ||
        normalizeCatalogType(product?.category?.catalogType) ||
        inferCatalogTypeFromCategorySlug(categorySlug);

    const basePath = catalogType === CATALOG_TYPE.SHOP ? "/shop" : fallbackBasePath;

    return `${basePath}/${slug}`;
}
