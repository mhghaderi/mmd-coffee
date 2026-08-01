"use client";

import CatalogBrowser from "@/components/catalog/CatalogBrowser";

export default function MenuCatalog(props) {
    return (
        <CatalogBrowser
            {...props}
            basePath="/menu"
            detailBasePath="/menu"
            emptyTitle="محصولی در منو پیدا نشد"
            emptyDescription="عبارت جست‌وجو یا فیلترهای منو را تغییر بده."
        />
    );
}
