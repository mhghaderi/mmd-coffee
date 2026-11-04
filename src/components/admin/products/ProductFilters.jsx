"use client";

import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";

import { FiPlus, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

export default function ProductFilters({ categories }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("q") || "";

    const [searchValue, setSearchValue] = useState(currentSearch);

    const updateFilters = (updates) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            const shouldRemove =
                value === undefined || value === null || value === "" || value === "all";

            if (shouldRemove) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, value);
            }
        });

        if (!Object.hasOwn(updates, "page")) {
            nextParams.delete("page");
        }

        const queryString = nextParams.toString();

        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        });
    };

    useEffect(() => {
        setSearchValue(currentSearch);
    }, [currentSearch]);

    useEffect(() => {
        const normalizedSearch = searchValue.trim();

        if (normalizedSearch === currentSearch) {
            return;
        }

        const timer = window.setTimeout(() => {
            updateFilters({
                q: normalizedSearch || null,
            });
        }, 400);

        return () => {
            window.clearTimeout(timer);
        };

    }, [searchValue, currentSearch]);

    const activeFiltersCount = [
        currentSearch,
        searchParams.get("status"),
        searchParams.get("category"),
        searchParams.get("availability"),
        searchParams.get("sort"),
    ].filter(Boolean).length;

    const resetFilters = () => {
        setSearchValue("");
        router.replace(pathname, {
            scroll: false,
        });
    };

    return (
        <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-[0_14px_45px_rgba(48,32,26,0.06)] sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <label className="relative flex h-12 flex-1 items-center">
                    <FiSearch className="pointer-events-none absolute right-4 text-coffee-400" />

                    <input
                        type="search"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="جست‌وجوی نام، اسلاگ یا برچسب محصول..."
                        className="h-full w-full rounded-xl border border-coffee-100 bg-cream-50 pr-11 pl-11 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                    />

                    {searchValue && (
                        <button
                            type="button"
                            aria-label="پاک‌کردن جست‌وجو"
                            onClick={() => setSearchValue("")}
                            className="absolute left-3 flex size-8 items-center justify-center rounded-lg text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-900"
                        >
                            <FiX />
                        </button>
                    )}
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                    <select
                        value={searchParams.get("status") || "all"}
                        onChange={(event) =>
                            updateFilters({
                                status: event.target.value,
                            })
                        }
                        aria-label="فیلتر وضعیت محصول"
                        className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100 xl:w-40"
                    >
                        <option value="all">همه وضعیت‌ها</option>

                        <option value="published">منتشرشده</option>

                        <option value="draft">پیش‌نویس</option>

                    </select>

                    <select
                        value={searchParams.get("category") || "all"}
                        onChange={(event) =>
                            updateFilters({
                                category: event.target.value,
                            })
                        }
                        aria-label="فیلتر دسته‌بندی"
                        className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100 xl:w-44"
                    >
                        <option value="all">همه دسته‌بندی‌ها</option>

                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={searchParams.get("availability") || "all"}
                        onChange={(event) =>
                            updateFilters({
                                availability: event.target.value,
                            })
                        }
                        aria-label="فیلتر موجودی"
                        className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100 xl:w-36"
                    >
                        <option value="all">همه موجودی‌ها</option>

                        <option value="available">موجود</option>

                        <option value="unavailable">ناموجود</option>
                    </select>

                    <select
                        value={searchParams.get("sort") || "newest"}
                        onChange={(event) =>
                            updateFilters({
                                sort: event.target.value === "newest" ? null : event.target.value,
                            })
                        }
                        aria-label="مرتب‌سازی محصولات"
                        className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100 xl:w-40"
                    >
                        <option value="newest">جدیدترین</option>

                        <option value="oldest">قدیمی‌ترین</option>

                        <option value="popular">محبوب‌ترین</option>

                        <option value="price-asc">ارزان‌ترین</option>

                        <option value="price-desc">گران‌ترین</option>

                        <option value="stock-asc">کمترین موجودی</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    {activeFiltersCount > 0 && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="relative flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 transition hover:border-coffee-200 hover:bg-cream-100 hover:text-coffee-950"
                        >
                            <FiRefreshCw />
                            پاک‌کردن
                            <span className="flex size-5 items-center justify-center rounded-full bg-coffee-900 text-[10px] text-white">
                                {activeFiltersCount.toLocaleString("fa-IR")}
                            </span>
                        </button>
                    )}

                    <Link
                        href="/admin/products/new"
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-coffee-800 xl:flex-none"
                    >
                        <FiPlus />
                        افزودن محصول
                    </Link>
                </div>
            </div>
        </section>
    );
}
