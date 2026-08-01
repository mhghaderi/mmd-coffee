"use client";

import CatalogBrowser from "@/components/catalog/CatalogBrowser";

export default function ShopCatalog(props) {
    return (
        <CatalogBrowser
            {...props}
            basePath="/shop"
            detailBasePath="/shop"
            emptyTitle="محصول فروشگاهی پیدا نشد"
            emptyDescription="دانه قهوه، ابزار دم‌آوری و اکسسوری‌های فروشگاه اینجا نمایش داده می‌شوند."
        />
    );
}
