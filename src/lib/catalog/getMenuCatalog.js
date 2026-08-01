import getPublicCatalog from "@/lib/catalog/getPublicCatalog";

export default function getMenuCatalog(searchParams = {}) {
    return getPublicCatalog(searchParams, { catalogType: "cafe" });
}
