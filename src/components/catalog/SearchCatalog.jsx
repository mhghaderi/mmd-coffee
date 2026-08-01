"use client";

import CatalogBrowser from "@/components/catalog/CatalogBrowser";

export default function SearchCatalog(props) {
    return (
        <CatalogBrowser
            {...props}
            basePath="/search"
            detailBasePath=""
            emptyTitle="نتیجه‌ای پیدا نشد"
            emptyDescription="عبارت جست‌وجو یا فیلترها را تغییر بده."
        />
    );
}
