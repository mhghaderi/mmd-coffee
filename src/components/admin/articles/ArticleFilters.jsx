"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

const selectClass =
    "h-12 rounded-xl border border-coffee-100 bg-cream-50 px-3 text-xs font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

export default function ArticleFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSearch = searchParams.get("q") || "";
    const [searchValue, setSearchValue] = useState(currentSearch);

    const updateFilters = (changes) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(changes).forEach(([key, value]) => {
            if (!value || value === "all") params.delete(key);
            else params.set(key, value);
        });

        params.delete("page");
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    useEffect(() => setSearchValue(currentSearch), [currentSearch]);

    useEffect(() => {
        const normalized = searchValue.trim();
        if (normalized === currentSearch) return;

        const timer = window.setTimeout(
            () => updateFilters({ q: normalized || null }),
            400,
        );

        return () => window.clearTimeout(timer);
        
    }, [searchValue, currentSearch]);

    const activeCount = [
        currentSearch,
        searchParams.get("status"),
        searchParams.get("featured"),
        searchParams.get("sort"),
    ].filter(Boolean).length;

    return (
        <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-[0_14px_45px_rgba(48,32,26,0.06)] sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <label className="relative flex h-12 flex-1 items-center">
                    <FiSearch className="pointer-events-none absolute right-4 text-coffee-400" />
                    <input
                        type="search"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="جست‌وجو در عنوان، اسلاگ، خلاصه یا برچسب..."
                        className="h-full w-full rounded-xl border border-coffee-100 bg-cream-50 pr-11 pl-11 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                    />
                    {searchValue && (
                        <button
                            type="button"
                            onClick={() => setSearchValue("")}
                            className="absolute left-3 flex size-8 items-center justify-center rounded-lg text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-900"
                            aria-label="پاک‌کردن جست‌وجو"
                        >
                            <FiX />
                        </button>
                    )}
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                    <select
                        value={searchParams.get("status") || "all"}
                        onChange={(event) => updateFilters({ status: event.target.value })}
                        className={`${selectClass} xl:w-40`}
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="draft">پیش‌نویس</option>
                        <option value="published">منتشرشده</option>
                        
                    </select>

                    <select
                        value={searchParams.get("featured") || "all"}
                        onChange={(event) => updateFilters({ featured: event.target.value })}
                        className={`${selectClass} xl:w-36`}
                    >
                        <option value="all">همه مقالات</option>
                        <option value="yes">فقط ویژه‌ها</option>
                        <option value="no">غیر ویژه</option>
                    </select>

                    <select
                        value={searchParams.get("sort") || "newest"}
                        onChange={(event) => updateFilters({ sort: event.target.value })}
                        className={`${selectClass} xl:w-40`}
                    >
                        <option value="newest">جدیدترین</option>
                        <option value="oldest">قدیمی‌ترین</option>
                        <option value="published">تاریخ انتشار</option>
                        <option value="viewed">پربازدیدترین</option>
                        <option value="title">عنوان</option>
                    </select>
                </div>

                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchValue("");
                            router.replace(pathname, { scroll: false });
                        }}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                    >
                        <FiRefreshCw />
                        پاک‌کردن
                    </button>
                )}
            </div>
        </section>
    );
}
