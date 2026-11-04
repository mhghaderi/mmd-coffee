"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

const selectClassName =
    "h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100";

export default function UserFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("q") || "";
    const [searchValue, setSearchValue] = useState(currentSearch);

    const updateFilters = (updates) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            const shouldRemove =
                value === undefined ||
                value === null ||
                value === "" ||
                value === "all" ||
                (key === "sort" && value === "newest");

            if (shouldRemove) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, value);
            }
        });

        nextParams.delete("page");

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

        return () => window.clearTimeout(timer);
        
    }, [searchValue, currentSearch]);

    const activeFiltersCount = [
        currentSearch,
        searchParams.get("role"),
        searchParams.get("status"),
        searchParams.get("verification"),
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
                        placeholder="جست‌وجوی نام، ایمیل یا شماره تماس..."
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
                        value={searchParams.get("role") || "all"}
                        onChange={(event) => updateFilters({ role: event.target.value })}
                        aria-label="فیلتر نقش کاربر"
                        className={`${selectClassName} xl:w-36`}
                    >
                        <option value="all">همه نقش‌ها</option>
                        <option value="user">کاربر عادی</option>
                        <option value="admin">مدیر</option>
                    </select>

                    <select
                        value={searchParams.get("status") || "all"}
                        onChange={(event) => updateFilters({ status: event.target.value })}
                        aria-label="فیلتر وضعیت حساب"
                        className={`${selectClassName} xl:w-36`}
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="active">فعال</option>
                        <option value="inactive">غیرفعال</option>
                    </select>

                    <select
                        value={searchParams.get("verification") || "all"}
                        onChange={(event) =>
                            updateFilters({ verification: event.target.value })
                        }
                        aria-label="فیلتر تأیید ایمیل"
                        className={`${selectClassName} xl:w-40`}
                    >
                        <option value="all">همه ایمیل‌ها</option>
                        <option value="verified">تأییدشده</option>
                        <option value="unverified">تأییدنشده</option>
                    </select>

                    <select
                        value={searchParams.get("sort") || "newest"}
                        onChange={(event) => updateFilters({ sort: event.target.value })}
                        aria-label="مرتب‌سازی کاربران"
                        className={`${selectClassName} xl:w-40`}
                    >
                        <option value="newest">جدیدترین</option>
                        <option value="oldest">قدیمی‌ترین</option>
                        <option value="name">نام کاربر</option>
                        <option value="orders">بیشترین سفارش</option>
                        <option value="spent">بیشترین خرید</option>
                        <option value="last-login">آخرین ورود</option>
                    </select>
                </div>

                {activeFiltersCount > 0 && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                    >
                        <FiRefreshCw />
                        پاک‌کردن
                        <span className="flex size-5 items-center justify-center rounded-full bg-coffee-900 text-[10px] text-white">
                            {activeFiltersCount.toLocaleString("fa-IR")}
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
