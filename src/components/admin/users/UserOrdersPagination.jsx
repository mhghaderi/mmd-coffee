"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function UserOrdersPagination({ pagination }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (pagination.pages <= 1) {
        return null;
    }

    const changePage = (page) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        if (page <= 1) {
            nextParams.delete("orderPage");
        } else {
            nextParams.set("orderPage", String(page));
        }

        const queryString = nextParams.toString();

        router.push(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false,
        });
    };

    return (
        <nav
            aria-label="صفحه‌بندی سفارش‌های کاربر"
            className="mt-5 flex items-center justify-between border-t border-coffee-100 pt-5"
        >
            <p className="text-[10px] font-bold text-coffee-400">
                صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                {pagination.pages.toLocaleString("fa-IR")}
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => changePage(pagination.page - 1)}
                    aria-label="صفحه قبلی سفارش‌ها"
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <FiChevronRight />
                </button>

                <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => changePage(pagination.page + 1)}
                    aria-label="صفحه بعدی سفارش‌ها"
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <FiChevronLeft />
                </button>
            </div>
        </nav>
    );
}
