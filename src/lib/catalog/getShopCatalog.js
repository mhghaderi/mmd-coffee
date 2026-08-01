import getPublicCatalog from "@/lib/catalog/getPublicCatalog";

export default function getShopCatalog(searchParams = {}) {
    return getPublicCatalog(searchParams, { catalogType: "shop" });
}
