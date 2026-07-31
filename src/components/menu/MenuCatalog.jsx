"use client";
// import ProductCard from "@/components/products/ProductCard";

import { useCallback, useEffect, useMemo, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FiCheck, FiFilter, FiGrid, FiRefreshCw, FiSearch, FiSliders, FiX } from "react-icons/fi";

import ProductCard from "@/components/product/ProductCard";

import { productCategories, products } from "@/data/products";

const priceFormatter = new Intl.NumberFormat("fa-IR");

const PRICE_STEP = 5000;

const MAX_PRODUCT_PRICE =
    Math.ceil(Math.max(...products.map((product) => product.price)) / 10000) * 10000;

const sortOptions = [
    {
        value: "popular",
        title: "محبوب‌ترین",
    },
    {
        value: "rating",
        title: "بالاترین امتیاز",
    },
    {
        value: "newest",
        title: "جدیدترین",
    },
    {
        value: "price-asc",
        title: "ارزان‌ترین",
    },
    {
        value: "price-desc",
        title: "گران‌ترین",
    },
];

function getFinalPrice(product) {
    const discountPercent = product.discountPercent || 0;

    if (discountPercent <= 0) {
        return product.price;
    }

    return Math.round(product.price * (1 - discountPercent / 100));
}

function clampNumber(value, minimum, maximum) {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
        return minimum;
    }

    return Math.min(Math.max(parsedValue, minimum), maximum);
}

function FiltersPanel({
    category,
    minPrice,
    maxPrice,
    onlyAvailable,
    onlyDiscounted,
    onCategoryChange,
    onMinPriceChange,
    onMaxPriceChange,
    onAvailableChange,
    onDiscountedChange,
    onReset,
    onClose,
}) {
    const categoriesWithCount = productCategories.map((categoryItem) => ({
        ...categoryItem,

        count:
            categoryItem.id === "all"
                ? products.length
                : products.filter((product) => product.category === categoryItem.id).length,
    }));

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-coffee-100 pb-5">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-coffee-900 text-white">
                        <FiSliders />
                    </span>

                    <div>
                        <h2 className="text-base font-black text-coffee-950">فیلتر محصولات</h2>

                        <p className="mt-1 text-xs text-coffee-400">نتایج را دقیق‌تر کن</p>
                    </div>
                </div>

                {onClose && (
                    <button
                        type="button"
                        aria-label="بستن فیلترها"
                        onClick={onClose}
                        className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-coffee-700 transition hover:bg-coffee-100"
                    >
                        <FiX />
                    </button>
                )}
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto py-6">
                {/* Categories */}

                <div>
                    <p className="mb-3 text-sm font-black text-coffee-900">دسته‌بندی</p>

                    <div className="space-y-1.5">
                        {categoriesWithCount.map((categoryItem) => {
                            const isActive = category === categoryItem.id;

                            const isEmpty = categoryItem.id !== "all" && categoryItem.count === 0;

                            return (
                                <button
                                    key={categoryItem.id}
                                    type="button"
                                    disabled={isEmpty}
                                    onClick={() => onCategoryChange(categoryItem.id)}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition ${
                                        isActive
                                            ? "bg-coffee-900 text-white"
                                            : "text-coffee-600 hover:bg-cream-100 hover:text-coffee-950"
                                    } disabled:cursor-not-allowed disabled:opacity-35`}
                                >
                                    <span>{categoryItem.title}</span>

                                    <span
                                        className={`flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-[10px] ${
                                            isActive
                                                ? "bg-white/10 text-white"
                                                : "bg-cream-100 text-coffee-400"
                                        }`}
                                    >
                                        {categoryItem.count.toLocaleString("fa-IR")}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price */}

                <div className="border-t border-coffee-100 pt-7">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-coffee-900">محدوده قیمت</p>

                        <span className="text-[11px] font-bold text-coffee-400">تومان</span>
                    </div>

                    <div className="mt-5 space-y-5">
                        <div>
                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="text-coffee-500">حداقل قیمت</span>

                                <span className="font-black text-coffee-900">
                                    {priceFormatter.format(minPrice)}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max={MAX_PRODUCT_PRICE}
                                step={PRICE_STEP}
                                value={minPrice}
                                onChange={(event) =>
                                    onMinPriceChange(
                                        Math.min(Number(event.target.value), maxPrice - PRICE_STEP),
                                    )
                                }
                                className="w-full accent-coffee-900"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="text-coffee-500">حداکثر قیمت</span>

                                <span className="font-black text-coffee-900">
                                    {priceFormatter.format(maxPrice)}
                                </span>
                            </div>

                            <input
                                type="range"
                                min={PRICE_STEP}
                                max={MAX_PRODUCT_PRICE}
                                step={PRICE_STEP}
                                value={maxPrice}
                                onChange={(event) =>
                                    onMaxPriceChange(
                                        Math.max(Number(event.target.value), minPrice + PRICE_STEP),
                                    )
                                }
                                className="w-full accent-coffee-900"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-cream-100 px-3 py-3 text-xs">
                        <span className="font-bold text-coffee-500">
                            از {priceFormatter.format(minPrice)}
                        </span>

                        <span className="text-coffee-300">—</span>

                        <span className="font-bold text-coffee-500">
                            تا {priceFormatter.format(maxPrice)}
                        </span>
                    </div>
                </div>

                {/* Availability */}

                <div className="space-y-2 border-t border-coffee-100 pt-7">
                    <button
                        type="button"
                        onClick={() => onAvailableChange(!onlyAvailable)}
                        className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-right transition hover:bg-cream-100"
                    >
                        <div>
                            <p className="text-sm font-bold text-coffee-800">فقط محصولات موجود</p>

                            <p className="mt-1 text-xs text-coffee-400">
                                محصولات ناموجود پنهان شوند
                            </p>
                        </div>

                        <span
                            className={`flex size-6 items-center justify-center rounded-lg border transition ${
                                onlyAvailable
                                    ? "border-coffee-900 bg-coffee-900 text-white"
                                    : "border-coffee-200 bg-white text-transparent"
                            }`}
                        >
                            <FiCheck size={14} />
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onDiscountedChange(!onlyDiscounted)}
                        className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-right transition hover:bg-cream-100"
                    >
                        <div>
                            <p className="text-sm font-bold text-coffee-800">
                                فقط محصولات تخفیف‌دار
                            </p>

                            <p className="mt-1 text-xs text-coffee-400">
                                پیشنهادهای ویژه نمایش داده شوند
                            </p>
                        </div>

                        <span
                            className={`flex size-6 items-center justify-center rounded-lg border transition ${
                                onlyDiscounted
                                    ? "border-caramel-600 bg-caramel-600 text-white"
                                    : "border-coffee-200 bg-white text-transparent"
                            }`}
                        >
                            <FiCheck size={14} />
                        </span>
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={onReset}
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white text-sm font-bold text-coffee-600 transition hover:border-coffee-200 hover:bg-cream-100 hover:text-coffee-950"
            >
                <FiRefreshCw />
                پاک‌کردن تمام فیلترها
            </button>
        </div>
    );
}

export default function MenuCatalog() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentQuery = searchParams.get("q") || "";

    const requestedCategory = searchParams.get("category") || "all";

    const category = productCategories.some((categoryItem) => categoryItem.id === requestedCategory)
        ? requestedCategory
        : "all";

    const sort = sortOptions.some((sortOption) => sortOption.value === searchParams.get("sort"))
        ? searchParams.get("sort")
        : "popular";

    const minPrice = clampNumber(searchParams.get("min") || 0, 0, MAX_PRODUCT_PRICE - PRICE_STEP);

    const maxPrice = clampNumber(
        searchParams.get("max") || MAX_PRODUCT_PRICE,
        PRICE_STEP,
        MAX_PRODUCT_PRICE,
    );

    const onlyAvailable = searchParams.get("available") === "1";

    const onlyDiscounted = searchParams.get("discounted") === "1";

    const [searchValue, setSearchValue] = useState(currentQuery);

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const [gridDensity, setGridDensity] = useState("comfortable");

    const updateSearchParams = useCallback(
        (updates) => {
            const nextParams = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                const shouldDelete =
                    value === null || value === undefined || value === "" || value === "all";

                if (shouldDelete) {
                    nextParams.delete(key);
                } else {
                    nextParams.set(key, String(value));
                }
            });

            const queryString = nextParams.toString();

            router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
                scroll: false,
            });
        },
        [pathname, router, searchParams],
    );

    useEffect(() => {
        setSearchValue(currentQuery);
    }, [currentQuery]);

    useEffect(() => {
        const normalizedSearch = searchValue.trim();

        if (normalizedSearch === currentQuery) {
            return;
        }

        const timer = window.setTimeout(() => {
            updateSearchParams({
                q: normalizedSearch || null,
            });
        }, 350);

        return () => {
            window.clearTimeout(timer);
        };
    }, [currentQuery, searchValue, updateSearchParams]);

    useEffect(() => {
        if (!isMobileFiltersOpen) {
            return;
        }

        const closeWithEscape = (event) => {
            if (event.key === "Escape") {
                setIsMobileFiltersOpen(false);
            }
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", closeWithEscape);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", closeWithEscape);
        };
    }, [isMobileFiltersOpen]);

    const filteredProducts = useMemo(() => {
        const normalizedSearch = currentQuery.trim().toLowerCase();

        const filtered = products.filter((product) => {
            const finalPrice = getFinalPrice(product);

            const matchesSearch =
                !normalizedSearch ||
                product.name.toLowerCase().includes(normalizedSearch) ||
                product.englishName.toLowerCase().includes(normalizedSearch) ||
                product.description.toLowerCase().includes(normalizedSearch);

            const matchesCategory = category === "all" || product.category === category;

            const matchesPrice = finalPrice >= minPrice && finalPrice <= maxPrice;

            const matchesAvailability = !onlyAvailable || product.isAvailable;

            const matchesDiscount = !onlyDiscounted || product.discountPercent > 0;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesPrice &&
                matchesAvailability &&
                matchesDiscount
            );
        });

        return filtered.sort((firstProduct, secondProduct) => {
            switch (sort) {
                case "rating":
                    return secondProduct.rating - firstProduct.rating;

                case "newest":
                    return (
                        Number(secondProduct.isNew) - Number(firstProduct.isNew) ||
                        secondProduct.popularityScore - firstProduct.popularityScore
                    );

                case "price-asc":
                    return getFinalPrice(firstProduct) - getFinalPrice(secondProduct);

                case "price-desc":
                    return getFinalPrice(secondProduct) - getFinalPrice(firstProduct);

                case "popular":
                default:
                    return secondProduct.popularityScore - firstProduct.popularityScore;
            }
        });
    }, [category, currentQuery, maxPrice, minPrice, onlyAvailable, onlyDiscounted, sort]);

    const activeCategoryTitle =
        productCategories.find((categoryItem) => categoryItem.id === category)?.title ||
        "همه محصولات";

    const hasActiveFilters =
        currentQuery ||
        category !== "all" ||
        minPrice > 0 ||
        maxPrice < MAX_PRODUCT_PRICE ||
        onlyAvailable ||
        onlyDiscounted;

    const resetFilters = () => {
        setSearchValue("");
        router.replace(pathname, {
            scroll: false,
        });
    };

    return (
        <section className="bg-cream-50 py-10 sm:py-14">
            <div className="page-container">
                {/* Search and toolbar */}

                <div className="rounded-[2rem] border border-coffee-100 bg-white p-4 shadow-[0_18px_60px_rgba(48,32,26,0.07)] sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <label className="relative flex h-13 flex-1 items-center">
                            <FiSearch className="pointer-events-none absolute right-4 text-coffee-400" />

                            <input
                                type="search"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="جست‌وجوی محصول، نوشیدنی یا دسر..."
                                className="h-full w-full rounded-2xl border border-coffee-100 bg-cream-50 pr-11 pl-11 text-sm font-medium text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                            />

                            {searchValue && (
                                <button
                                    type="button"
                                    aria-label="پاک‌کردن جست‌وجو"
                                    onClick={() => setSearchValue("")}
                                    className="absolute left-3 flex size-8 items-center justify-center rounded-full text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-900"
                                >
                                    <FiX />
                                </button>
                            )}
                        </label>

                        <div className="flex gap-2">
                            <select
                                value={sort}
                                onChange={(event) =>
                                    updateSearchParams({
                                        sort:
                                            event.target.value === "popular"
                                                ? null
                                                : event.target.value,
                                    })
                                }
                                aria-label="مرتب‌سازی محصولات"
                                className="h-13 min-w-40 flex-1 rounded-2xl border border-coffee-100 bg-cream-50 px-4 text-sm font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100 lg:flex-none"
                            >
                                {sortOptions.map((sortOption) => (
                                    <option key={sortOption.value} value={sortOption.value}>
                                        {sortOption.title}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="relative flex size-13 shrink-0 items-center justify-center rounded-2xl bg-coffee-900 text-white shadow-sm lg:hidden"
                                aria-label="باز کردن فیلترها"
                            >
                                <FiFilter />

                                {hasActiveFilters && (
                                    <span className="absolute left-2 top-2 size-2 rounded-full bg-caramel-400" />
                                )}
                            </button>

                            <div className="hidden items-center rounded-2xl border border-coffee-100 bg-cream-50 p-1 sm:flex">
                                <button
                                    type="button"
                                    aria-label="نمایش فشرده"
                                    onClick={() => setGridDensity("compact")}
                                    className={`flex size-11 items-center justify-center rounded-xl transition ${
                                        gridDensity === "compact"
                                            ? "bg-white text-coffee-950 shadow-sm"
                                            : "text-coffee-400 hover:text-coffee-800"
                                    }`}
                                >
                                    <FiGrid size={18} />
                                </button>

                                <button
                                    type="button"
                                    aria-label="نمایش بزرگ"
                                    onClick={() => setGridDensity("comfortable")}
                                    className={`flex size-11 items-center justify-center rounded-xl transition ${
                                        gridDensity === "comfortable"
                                            ? "bg-white text-coffee-950 shadow-sm"
                                            : "text-coffee-400 hover:text-coffee-800"
                                    }`}
                                >
                                    <span className="grid grid-cols-2 gap-0.5">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <span
                                                key={index}
                                                className="size-1.5 rounded-[2px] bg-current"
                                            />
                                        ))}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active filters */}

                    {hasActiveFilters && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-coffee-100 pt-4">
                            <span className="ml-1 text-xs font-bold text-coffee-400">
                                فیلترهای فعال:
                            </span>

                            {currentQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchValue("")}
                                    className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-2 text-xs font-bold text-coffee-600 transition hover:bg-coffee-100"
                                >
                                    جست‌وجو: {currentQuery}
                                    <FiX />
                                </button>
                            )}

                            {category !== "all" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateSearchParams({
                                            category: null,
                                        })
                                    }
                                    className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-2 text-xs font-bold text-coffee-600 transition hover:bg-coffee-100"
                                >
                                    {activeCategoryTitle}
                                    <FiX />
                                </button>
                            )}

                            {(minPrice > 0 || maxPrice < MAX_PRODUCT_PRICE) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateSearchParams({
                                            min: null,
                                            max: null,
                                        })
                                    }
                                    className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-2 text-xs font-bold text-coffee-600 transition hover:bg-coffee-100"
                                >
                                    محدوده قیمت
                                    <FiX />
                                </button>
                            )}

                            {onlyAvailable && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateSearchParams({
                                            available: null,
                                        })
                                    }
                                    className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-2 text-xs font-bold text-success"
                                >
                                    فقط موجود
                                    <FiX />
                                </button>
                            )}

                            {onlyDiscounted && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateSearchParams({
                                            discounted: null,
                                        })
                                    }
                                    className="inline-flex items-center gap-2 rounded-full bg-caramel-100 px-3 py-2 text-xs font-bold text-caramel-700"
                                >
                                    تخفیف‌دار
                                    <FiX />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mr-auto text-xs font-bold text-danger transition hover:opacity-70"
                            >
                                حذف همه
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}

                <div className="mt-8 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="sticky top-24 hidden rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-[0_16px_50px_rgba(48,32,26,0.06)] lg:block">
                        <FiltersPanel
                            category={category}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onlyAvailable={onlyAvailable}
                            onlyDiscounted={onlyDiscounted}
                            onCategoryChange={(value) =>
                                updateSearchParams({
                                    category: value === "all" ? null : value,
                                })
                            }
                            onMinPriceChange={(value) =>
                                updateSearchParams({
                                    min: value > 0 ? value : null,
                                })
                            }
                            onMaxPriceChange={(value) =>
                                updateSearchParams({
                                    max: value < MAX_PRODUCT_PRICE ? value : null,
                                })
                            }
                            onAvailableChange={(value) =>
                                updateSearchParams({
                                    available: value ? "1" : null,
                                })
                            }
                            onDiscountedChange={(value) =>
                                updateSearchParams({
                                    discounted: value ? "1" : null,
                                })
                            }
                            onReset={resetFilters}
                        />
                    </aside>

                    <div className="min-w-0">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-caramel-600">
                                    {activeCategoryTitle}
                                </p>

                                <h2 className="mt-1 text-2xl font-black text-coffee-950">
                                    محصولات ممد کافی
                                </h2>
                            </div>

                            <p
                                className="shrink-0 text-xs font-bold text-coffee-400"
                                aria-live="polite"
                            >
                                {filteredProducts.length.toLocaleString("fa-IR")} نتیجه
                            </p>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div
                                className={`mt-6 grid gap-5 sm:grid-cols-2 ${
                                    gridDensity === "compact" ? "xl:grid-cols-4" : "xl:grid-cols-3"
                                }`}
                            >
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-coffee-200 bg-white px-6 text-center">
                                <span className="flex size-20 items-center justify-center rounded-full bg-cream-100 text-coffee-600">
                                    <FiSearch size={30} />
                                </span>

                                <h3 className="mt-6 text-xl font-black text-coffee-950">
                                    محصولی پیدا نشد
                                </h3>

                                <p className="mt-3 max-w-sm text-sm leading-7 text-coffee-500">
                                    عبارت جست‌وجو یا فیلترها را تغییر بده تا محصولات بیشتری نمایش
                                    داده شوند.
                                </p>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-bold text-white transition hover:bg-coffee-800"
                                >
                                    <FiRefreshCw />
                                    نمایش همه محصولات
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter overlay */}

            <div
                onClick={() => setIsMobileFiltersOpen(false)}
                className={`fixed inset-0 z-[80] bg-coffee-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
                    isMobileFiltersOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            {/* Mobile filters drawer */}

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="فیلتر محصولات"
                className={`fixed bottom-0 right-0 top-0 z-[90] w-[min(92%,390px)] bg-cream-50 p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
                    isMobileFiltersOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <FiltersPanel
                    category={category}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onlyAvailable={onlyAvailable}
                    onlyDiscounted={onlyDiscounted}
                    onCategoryChange={(value) =>
                        updateSearchParams({
                            category: value === "all" ? null : value,
                        })
                    }
                    onMinPriceChange={(value) =>
                        updateSearchParams({
                            min: value > 0 ? value : null,
                        })
                    }
                    onMaxPriceChange={(value) =>
                        updateSearchParams({
                            max: value < MAX_PRODUCT_PRICE ? value : null,
                        })
                    }
                    onAvailableChange={(value) =>
                        updateSearchParams({
                            available: value ? "1" : null,
                        })
                    }
                    onDiscountedChange={(value) =>
                        updateSearchParams({
                            discounted: value ? "1" : null,
                        })
                    }
                    onReset={resetFilters}
                    onClose={() => setIsMobileFiltersOpen(false)}
                />
            </aside>
        </section>
    );
}
