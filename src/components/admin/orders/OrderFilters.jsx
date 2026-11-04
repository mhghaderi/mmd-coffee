"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";

import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

const selectClassName =
    "h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm font-bold text-coffee-700 outline-none focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100";

export default function OrderFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("q") || "";

    const [searchValue, setSearchValue] = useState(currentSearch);

    const updateFilters = (updates) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (!value || value === "all" || value === "newest") {
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
        const value = searchValue.trim();

        if (value === currentSearch) {
            return;
        }

        const timer = window.setTimeout(() => {
            updateFilters({
                q: value,
            });
        }, 400);

        return () => window.clearTimeout(timer);

    }, [searchValue, currentSearch]);

    const resetFilters = () => {
        setSearchValue("");
        router.replace(pathname);
    };

    return (
        <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-[0_14px_45px_rgba(48,32,26,0.06)]">
            <div className="flex flex-col gap-3 xl:flex-row">
                <label className="relative flex h-12 flex-1 items-center">
                    <FiSearch className="pointer-events-none absolute right-4 text-coffee-400" />

                    <input
                        type="search"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="شماره سفارش، نام یا شماره تماس..."
                        className="h-full w-full rounded-xl border border-coffee-100 bg-cream-50 pr-11 pl-11 text-sm outline-none focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100"
                    />

                    {searchValue && (
                        <button
                            type="button"
                            onClick={() => setSearchValue("")}
                            className="absolute left-3 flex size-8 items-center justify-center rounded-lg text-coffee-400 hover:bg-coffee-100"
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
                        className={selectClassName}
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="pending">در انتظار بررسی</option>
                        <option value="confirmed">تأییدشده</option>
                        <option value="preparing">در حال آماده‌سازی</option>
                        <option value="ready">آماده تحویل</option>
                        <option value="out-for-delivery">در حال ارسال</option>
                        <option value="completed">تکمیل‌شده</option>
                        <option value="cancelled">لغوشده</option>
                    </select>

                    <select
                        value={searchParams.get("paymentStatus") || "all"}
                        onChange={(event) =>
                            updateFilters({
                                paymentStatus: event.target.value,
                            })
                        }
                        className={selectClassName}
                    >
                        <option value="all">همه پرداخت‌ها</option>
                        <option value="unpaid">پرداخت‌نشده</option>
                        <option value="pending">در انتظار پرداخت</option>
                        <option value="paid">پرداخت‌شده</option>
                        <option value="failed">پرداخت ناموفق</option>
                        <option value="refunded">بازپرداخت‌شده</option>
                    </select>

                    <select
                        value={searchParams.get("deliveryMethod") || "all"}
                        onChange={(event) =>
                            updateFilters({
                                deliveryMethod: event.target.value,
                            })
                        }
                        className={selectClassName}
                    >
                        <option value="all">همه روش‌های تحویل</option>
                        <option value="pickup">دریافت حضوری</option>
                        <option value="delivery">ارسال</option>
                    </select>

                    <select
                        value={searchParams.get("sort") || "newest"}
                        onChange={(event) =>
                            updateFilters({
                                sort: event.target.value,
                            })
                        }
                        className={selectClassName}
                    >
                        <option value="newest">جدیدترین</option>
                        <option value="oldest">قدیمی‌ترین</option>
                        <option value="total-desc">بیشترین مبلغ</option>
                        <option value="total-asc">کمترین مبلغ</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 px-4 text-xs font-bold text-coffee-600 hover:bg-cream-100"
                >
                    <FiRefreshCw />
                    پاک‌کردن
                </button>
            </div>
        </section>
    );
}
