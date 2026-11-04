"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

const selectClassName =
    "h-12 rounded-xl border border-coffee-100 bg-cream-50 px-3 text-xs font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

export default function ReviewFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSearch = searchParams.get("q") || "";
    const [searchValue, setSearchValue] = useState(currentSearch);

    const updateFilters = (changes) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(changes).forEach(([key, value]) => {
            if (!value || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        params.delete("page");

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    useEffect(() => {
        setSearchValue(currentSearch);
    }, [currentSearch]);

    useEffect(() => {
        const normalized = searchValue.trim();

        if (normalized === currentSearch) {
            return;
        }

        const timer = window.setTimeout(() => {
            updateFilters({ q: normalized || null });
        }, 400);

        return () => window.clearTimeout(timer);
        
    }, [searchValue, currentSearch]);

    const activeCount = [
        currentSearch,
        searchParams.get("status"),
        searchParams.get("rating"),
        searchParams.get("verified"),
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
                        placeholder="جست‌وجو در نام، متن، ایمیل یا محصول..."
                        className="h-full w-full rounded-xl border border-coffee-100 bg-cream-50 pr-11 pl-11 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                    />

                    {searchValue && (
                        <button
                            type="button"
                            onClick={() => setSearchValue("")}
                            aria-label="پاک‌کردن جست‌وجو"
                            className="absolute left-3 flex size-8 items-center justify-center rounded-lg text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-900"
                        >
                            <FiX />
                        </button>
                    )}
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                    <select
                        value={searchParams.get("status") || "all"}
                        onChange={(event) => updateFilters({ status: event.target.value })}
                        className={`${selectClassName} xl:w-40`}
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="pending">در انتظار بررسی</option>
                        <option value="approved">تأییدشده</option>
                        <option value="rejected">ردشده</option>
                    </select>

                    <select
                        value={searchParams.get("rating") || "all"}
                        onChange={(event) => updateFilters({ rating: event.target.value })}
                        className={`${selectClassName} xl:w-32`}
                    >
                        <option value="all">همه امتیازها</option>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                                {rating} ستاره
                            </option>
                        ))}
                    </select>

                    <select
                        value={searchParams.get("verified") || "all"}
                        onChange={(event) => updateFilters({ verified: event.target.value })}
                        className={`${selectClassName} xl:w-40`}
                    >
                        <option value="all">همه خریدها</option>
                        <option value="yes">خرید تأییدشده</option>
                        <option value="no">بدون خرید تأییدشده</option>
                    </select>

                    <select
                        value={searchParams.get("sort") || "newest"}
                        onChange={(event) => updateFilters({ sort: event.target.value })}
                        className={`${selectClassName} xl:w-40`}
                    >
                        <option value="newest">جدیدترین</option>
                        <option value="oldest">قدیمی‌ترین</option>
                        <option value="ratingHigh">بیشترین امتیاز</option>
                        <option value="ratingLow">کمترین امتیاز</option>
                        <option value="helpful">مفیدترین</option>
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
                        <span className="flex size-5 items-center justify-center rounded-full bg-coffee-900 text-[10px] text-white">
                            {activeCount.toLocaleString("fa-IR")}
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
