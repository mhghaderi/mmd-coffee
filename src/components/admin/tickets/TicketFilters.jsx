"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";

const selectClass =
    "h-12 rounded-xl border border-coffee-100 bg-cream-50 px-3 text-xs font-bold text-coffee-700 outline-none transition focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

export default function TicketFilters() {
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

        const timer = window.setTimeout(() => updateFilters({ q: normalized || null }), 400);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue, currentSearch]);

    return (
        <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-[0_14px_45px_rgba(48,32,26,0.06)] sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <label className="relative flex h-12 flex-1 items-center">
                    <FiSearch className="pointer-events-none absolute right-4 text-coffee-400" />
                    <input
                        type="search"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="شماره تیکت، موضوع، نام یا ایمیل کاربر..."
                        className="h-full w-full rounded-xl border border-coffee-100 bg-cream-50 pr-11 pl-11 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                    />
                    {searchValue && (
                        <button type="button" onClick={() => setSearchValue("")} className="absolute left-3 flex size-8 items-center justify-center rounded-lg text-coffee-400 hover:bg-coffee-100">
                            <FiX />
                        </button>
                    )}
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                    <select value={searchParams.get("status") || "all"} onChange={(event) => updateFilters({ status: event.target.value })} className={`${selectClass} xl:w-40`}>
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="open">باز</option>
                        <option value="answered">پاسخ داده‌شده</option>
                        <option value="customer-reply">پاسخ جدید مشتری</option>
                        <option value="closed">بسته‌شده</option>
                    </select>

                    <select value={searchParams.get("priority") || "all"} onChange={(event) => updateFilters({ priority: event.target.value })} className={`${selectClass} xl:w-32`}>
                        <option value="all">همه اولویت‌ها</option>
                        <option value="low">کم</option>
                        <option value="normal">عادی</option>
                        <option value="high">زیاد</option>
                        <option value="urgent">فوری</option>
                    </select>

                    <select value={searchParams.get("category") || "all"} onChange={(event) => updateFilters({ category: event.target.value })} className={`${selectClass} xl:w-36`}>
                        <option value="all">همه دسته‌ها</option>
                        <option value="order">سفارش</option>
                        <option value="payment">پرداخت</option>
                        <option value="product">محصول</option>
                        <option value="account">حساب کاربری</option>
                        <option value="technical">مشکل فنی</option>
                        <option value="suggestion">پیشنهاد</option>
                        <option value="other">سایر</option>
                    </select>

                    <select value={searchParams.get("assignment") || "all"} onChange={(event) => updateFilters({ assignment: event.target.value })} className={`${selectClass} xl:w-36`}>
                        <option value="all">همه ارجاع‌ها</option>
                        <option value="mine">ارجاع‌شده به من</option>
                        <option value="assigned">ارجاع‌شده</option>
                        <option value="unassigned">بدون مسئول</option>
                    </select>

                    <select value={searchParams.get("sort") || "activity"} onChange={(event) => updateFilters({ sort: event.target.value })} className={`${selectClass} xl:w-36`}>
                        <option value="activity">آخرین فعالیت</option>
                        <option value="newest">جدیدترین</option>
                        <option value="oldest">قدیمی‌ترین</option>
                        <option value="priority">اولویت</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSearchValue("");
                        router.replace(pathname, { scroll: false });
                    }}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 transition hover:bg-cream-100"
                >
                    <FiRefreshCw />
                    پاک‌کردن
                </button>
            </div>
        </section>
    );
}
