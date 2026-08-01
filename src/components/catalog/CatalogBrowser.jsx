"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiGrid,
    FiRefreshCw,
    FiSearch,
    FiSliders,
    FiX,
} from "react-icons/fi";

import ProductCard from "@/components/product/ProductCard";

const sortOptions = [
    { value: "popular", title: "محبوب‌ترین" },
    { value: "newest", title: "جدیدترین" },
    { value: "rating", title: "بالاترین امتیاز" },
    { value: "price-asc", title: "ارزان‌ترین" },
    { value: "price-desc", title: "گران‌ترین" },
    { value: "name", title: "نام محصول" },
];

function getVisiblePages(currentPage, totalPages) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
}

function GridModeIcon({ columns }) {
    return (
        <span
            aria-hidden="true"
            className={`grid size-4 gap-[2px] ${columns === 4 ? "grid-cols-4" : "grid-cols-3"}`}
        >
            {Array.from({ length: columns }).map((_, index) => (
                <span key={index} className="h-4 rounded-[2px] bg-current opacity-80" />
            ))}
        </span>
    );
}

function CatalogFilters({
    categories,
    filters,
    onUpdate,
    onReset,
    onClose,
    mobile = false,
}) {
    const [minPrice, setMinPrice] = useState(filters.minPrice ?? "");
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? "");

    useEffect(() => {
        setMinPrice(filters.minPrice ?? "");
        setMaxPrice(filters.maxPrice ?? "");
    }, [filters.maxPrice, filters.minPrice]);

    const applyPrice = () => {
        onUpdate({
            minPrice: minPrice === "" ? null : minPrice,
            maxPrice: maxPrice === "" ? null : maxPrice,
            page: 1,
        });
    };

    const totalProducts = categories.reduce(
        (sum, item) => sum + (Number(item.productCount) || 0),
        0,
    );

    return (
        <div className={mobile ? "flex h-full min-h-0 flex-col" : "flex flex-col"}>
            <div className="flex shrink-0 items-center justify-between border-b border-coffee-100 pb-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-coffee-900 text-white">
                        <FiSliders />
                    </span>
                    <div>
                        <h2 className="text-sm font-black text-coffee-950">فیلتر محصولات</h2>
                        <p className="mt-1 text-[10px] text-coffee-400">انتخاب سریع و دقیق‌تر</p>
                    </div>
                </div>

                {onClose && (
                    <button
                        type="button"
                        aria-label="بستن فیلترها"
                        onClick={onClose}
                        className="flex size-9 items-center justify-center rounded-full bg-cream-100 text-coffee-700 transition hover:bg-coffee-100"
                    >
                        <FiX />
                    </button>
                )}
            </div>

            <div
                className={
                    mobile
                        ? "min-h-0 flex-1 space-y-6 overflow-y-auto py-5 pl-1"
                        : "space-y-6 py-5"
                }
            >
                <section>
                    <p className="mb-2.5 text-xs font-black text-coffee-900">دسته‌بندی</p>
                    <div className="max-h-52 space-y-1 overflow-y-auto pl-1">
                        <button
                            type="button"
                            onClick={() => onUpdate({ category: null, page: 1 })}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                                !filters.category
                                    ? "bg-coffee-900 text-white"
                                    : "text-coffee-600 hover:bg-cream-100 hover:text-coffee-950"
                            }`}
                        >
                            <span>همه محصولات</span>
                            <span
                                className={`rounded-full px-2 py-1 text-[9px] ${
                                    !filters.category
                                        ? "bg-white/10 text-white"
                                        : "bg-cream-100 text-coffee-400"
                                }`}
                            >
                                {totalProducts.toLocaleString("fa-IR")}
                            </span>
                        </button>

                        {categories.map((category) => {
                            const isActive = filters.category === category.slug;
                            const productCount = Number(category.productCount) || 0;

                            return (
                                <button
                                    key={category._id || category.slug}
                                    type="button"
                                    disabled={productCount === 0}
                                    onClick={() => onUpdate({ category: category.slug, page: 1 })}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                                        isActive
                                            ? "bg-coffee-900 text-white"
                                            : "text-coffee-600 hover:bg-cream-100 hover:text-coffee-950"
                                    } disabled:cursor-not-allowed disabled:opacity-35`}
                                >
                                    <span className="truncate">{category.title}</span>
                                    <span
                                        className={`mr-2 rounded-full px-2 py-1 text-[9px] ${
                                            isActive
                                                ? "bg-white/10 text-white"
                                                : "bg-cream-100 text-coffee-400"
                                        }`}
                                    >
                                        {productCount.toLocaleString("fa-IR")}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="border-t border-coffee-100 pt-5">
                    <p className="text-xs font-black text-coffee-900">محدوده قیمت</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <label className="space-y-1.5">
                            <span className="text-[10px] font-bold text-coffee-400">از قیمت</span>
                            <input
                                type="number"
                                min="0"
                                step="10000"
                                value={minPrice}
                                onChange={(event) => setMinPrice(event.target.value)}
                                placeholder="۰"
                                className="h-10 w-full rounded-xl border border-coffee-100 bg-white px-3 text-[11px] font-bold text-coffee-900 outline-none transition focus:border-caramel-400"
                            />
                        </label>
                        <label className="space-y-1.5">
                            <span className="text-[10px] font-bold text-coffee-400">تا قیمت</span>
                            <input
                                type="number"
                                min="0"
                                step="10000"
                                value={maxPrice}
                                onChange={(event) => setMaxPrice(event.target.value)}
                                placeholder="بدون سقف"
                                className="h-10 w-full rounded-xl border border-coffee-100 bg-white px-3 text-[11px] font-bold text-coffee-900 outline-none transition focus:border-caramel-400"
                            />
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={applyPrice}
                        className="mt-2.5 flex h-9 w-full items-center justify-center rounded-xl bg-cream-100 text-[11px] font-black text-coffee-700 transition hover:bg-coffee-100"
                    >
                        اعمال محدوده قیمت
                    </button>
                </section>

                <section className="space-y-1 border-t border-coffee-100 pt-5">
                    {[
                        { key: "discounted", title: "تخفیف‌دار" },
                        { key: "new", title: "محصولات جدید" },
                        { key: "featured", title: "منتخب ممد کافی" },
                    ].map((item) => {
                        const isActive = Boolean(filters[item.key]);

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() =>
                                    onUpdate({
                                        [item.key]: isActive ? null : 1,
                                        page: 1,
                                    })
                                }
                                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-right transition hover:bg-cream-100"
                            >
                                <span className="text-xs font-bold text-coffee-800">{item.title}</span>
                                <span
                                    className={`flex size-5 items-center justify-center rounded-md border transition ${
                                        isActive
                                            ? "border-coffee-900 bg-coffee-900 text-white"
                                            : "border-coffee-200 bg-white text-transparent"
                                    }`}
                                >
                                    <FiCheck size={12} />
                                </span>
                            </button>
                        );
                    })}
                </section>
            </div>

            <button
                type="button"
                onClick={onReset}
                className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white text-xs font-bold text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
            >
                <FiRefreshCw />
                پاک‌کردن فیلترها
            </button>
        </div>
    );
}

export default function CatalogBrowser({
    products = [],
    categories = [],
    filters = {},
    pagination = {},
    basePath = "/menu",
    detailBasePath = "",
    emptyTitle = "محصولی پیدا نشد",
    emptyDescription = "فیلترها یا عبارت جست‌وجو را تغییر بده.",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(filters.q || "");
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [gridMode, setGridMode] = useState(3);

    useEffect(() => {
        setSearchValue(filters.q || "");
    }, [filters.q]);

    useEffect(() => {
        if (!isMobileFiltersOpen) return undefined;

        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileFiltersOpen]);

    const updateQuery = (updates, replace = false) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "" || value === false) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, String(value));
            }
        });

        const nextUrl = nextParams.toString()
            ? `${basePath}?${nextParams.toString()}`
            : basePath;

        startTransition(() => {
            if (replace) {
                router.replace(nextUrl, { scroll: false });
            } else {
                router.push(nextUrl, { scroll: false });
            }
        });
    };

    const resetFilters = () => {
        setSearchValue("");
        setIsMobileFiltersOpen(false);
        startTransition(() => {
            router.push(basePath, { scroll: false });
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();
        updateQuery({
            q: searchValue.trim() || null,
            page: 1,
        });
    };

    const selectedCategoryTitle = useMemo(
        () => categories.find((item) => item.slug === filters.category)?.title || "همه محصولات",
        [categories, filters.category],
    );

    const visiblePages = getVisiblePages(
        Number(pagination.page) || 1,
        Number(pagination.pages) || 0,
    );

    const activeFiltersCount = [
        filters.category,
        filters.discounted,
        filters.newOnly || filters.new,
        filters.featured,
        filters.minPrice !== null && filters.minPrice !== undefined,
        filters.maxPrice !== null && filters.maxPrice !== undefined,
        filters.q,
    ].filter(Boolean).length;

    const normalizedFilters = {
        ...filters,
        new: filters.newOnly ?? filters.new,
    };

    const productGridClass =
        gridMode === 4
            ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3";

    return (
        <div className="relative">
            {isPending && (
                <div className="pointer-events-none absolute inset-0 z-30 rounded-[2rem] bg-cream-50/55 backdrop-blur-[1px]" />
            )}

            <div className="mb-6 flex flex-col gap-3 rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <form onSubmit={handleSearch} className="relative w-full lg:max-w-xl">
                    <FiSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400" />
                    <input
                        type="search"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="جست‌وجو در محصولات..."
                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 pr-11 pl-24 text-sm font-medium text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white"
                    />
                    <button
                        type="submit"
                        className="absolute left-1.5 top-1.5 h-9 rounded-lg bg-coffee-900 px-4 text-xs font-black text-white transition hover:bg-coffee-800"
                    >
                        جست‌وجو
                    </button>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="relative flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-black text-coffee-700 lg:hidden"
                    >
                        <FiFilter />
                        فیلترها
                        {activeFiltersCount > 0 && (
                            <span className="rounded-full bg-caramel-500 px-2 py-0.5 text-[9px] text-white">
                                {activeFiltersCount.toLocaleString("fa-IR")}
                            </span>
                        )}
                    </button>

                    <label className="flex h-12 min-w-44 flex-1 items-center gap-2 rounded-xl border border-coffee-100 bg-white px-3 sm:flex-none">
                        <FiGrid className="text-coffee-400" />
                        <select
                            value={filters.sort || "popular"}
                            onChange={(event) =>
                                updateQuery({
                                    sort: event.target.value,
                                    page: 1,
                                })
                            }
                            className="h-full min-w-0 flex-1 bg-transparent text-xs font-black text-coffee-700 outline-none"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.title}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="hidden h-12 items-center rounded-xl border border-coffee-100 bg-cream-50 p-1 sm:flex">
                        {[3, 4].map((columns) => (
                            <button
                                key={columns}
                                type="button"
                                aria-label={`نمایش ${columns.toLocaleString("fa-IR")} محصول در هر ردیف`}
                                aria-pressed={gridMode === columns}
                                onClick={() => setGridMode(columns)}
                                className={`flex h-10 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 text-[10px] font-black transition ${
                                    gridMode === columns
                                        ? "bg-coffee-900 text-white shadow-sm"
                                        : "text-coffee-500 hover:bg-white hover:text-coffee-900"
                                }`}
                            >
                                <GridModeIcon columns={columns} />
                                <span>{columns.toLocaleString("fa-IR")}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="sticky top-24 hidden self-start rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-sm lg:block">
                    <CatalogFilters
                        categories={categories}
                        filters={normalizedFilters}
                        onUpdate={updateQuery}
                        onReset={resetFilters}
                    />
                </aside>

                <section className="min-w-0">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold text-caramel-600">{selectedCategoryTitle}</p>
                            <p className="mt-1 text-sm font-black text-coffee-950">
                                {(Number(pagination.total) || 0).toLocaleString("fa-IR")} محصول
                            </p>
                        </div>

                        {(filters.q || activeFiltersCount > 0) && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-2 rounded-xl bg-cream-100 px-4 py-2.5 text-xs font-black text-coffee-600 transition hover:bg-coffee-100"
                            >
                                <FiX />
                                حذف فیلترها
                            </button>
                        )}
                    </div>

                    {products.length > 0 ? (
                        <div className={productGridClass}>
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id || product.id || product.slug}
                                    product={product}
                                    detailBasePath={detailBasePath}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-coffee-200 bg-white px-6 py-16 text-center">
                            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-cream-100 text-coffee-500">
                                <FiSearch size={25} />
                            </span>
                            <h2 className="mt-5 text-xl font-black text-coffee-950">{emptyTitle}</h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-coffee-500">
                                {emptyDescription}
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-xs font-black text-white"
                            >
                                <FiRefreshCw />
                                نمایش همه محصولات
                            </button>
                        </div>
                    )}

                    {Number(pagination.pages) > 1 && (
                        <nav
                            aria-label="صفحه‌بندی محصولات"
                            className="mt-10 flex flex-wrap items-center justify-center gap-2"
                        >
                            <button
                                type="button"
                                disabled={!pagination.hasPreviousPage}
                                onClick={() => updateQuery({ page: Number(pagination.page) - 1 })}
                                className="flex size-11 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-700 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <FiChevronRight />
                            </button>

                            {visiblePages.map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => updateQuery({ page: pageNumber })}
                                    className={`flex size-11 items-center justify-center rounded-xl text-xs font-black transition ${
                                        Number(pagination.page) === pageNumber
                                            ? "bg-coffee-900 text-white"
                                            : "border border-coffee-100 bg-white text-coffee-700 hover:bg-cream-100"
                                    }`}
                                >
                                    {pageNumber.toLocaleString("fa-IR")}
                                </button>
                            ))}

                            <button
                                type="button"
                                disabled={!pagination.hasNextPage}
                                onClick={() => updateQuery({ page: Number(pagination.page) + 1 })}
                                className="flex size-11 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-700 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <FiChevronLeft />
                            </button>
                        </nav>
                    )}
                </section>
            </div>

            <div
                onClick={() => setIsMobileFiltersOpen(false)}
                className={`fixed inset-0 z-[70] bg-coffee-950/35 backdrop-blur-sm transition-opacity lg:hidden ${
                    isMobileFiltersOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                className={`fixed bottom-0 right-0 top-0 z-[80] w-[min(90%,360px)] bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
                    isMobileFiltersOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <CatalogFilters
                    categories={categories}
                    filters={normalizedFilters}
                    mobile
                    onUpdate={(updates) => {
                        updateQuery(updates);
                        setIsMobileFiltersOpen(false);
                    }}
                    onReset={resetFilters}
                    onClose={() => setIsMobileFiltersOpen(false)}
                />
            </aside>
        </div>
    );
}
