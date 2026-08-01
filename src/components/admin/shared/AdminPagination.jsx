"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function visiblePages(current, total) {
    if (total <= 5) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    return [...new Set([1, total, current - 1, current, current + 1])]
        .filter((page) => page >= 1 && page <= total)
        .sort((first, second) => first - second);
}

export default function AdminPagination({ pagination, label = "موارد" }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (!pagination || pagination.pages <= 1) {
        return null;
    }

    const changePage = (page) => {
        const params = new URLSearchParams(searchParams.toString());

        if (page <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    const pages = visiblePages(pagination.page, pagination.pages);

    return (
        <nav
            aria-label={`صفحه‌بندی ${label}`}
            className="flex flex-col gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-xs font-bold text-coffee-400">
                صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                {pagination.pages.toLocaleString("fa-IR")}
            </p>

            <div className="flex items-center justify-center gap-1.5">
                <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => changePage(pagination.page - 1)}
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 text-coffee-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="صفحه قبلی"
                >
                    <FiChevronRight />
                </button>

                {pages.map((page, index) => {
                    const previous = pages[index - 1];
                    const separated = previous && page - previous > 1;

                    return (
                        <div key={page} className="flex items-center gap-1.5">
                            {separated && <span className="px-1 text-coffee-300">...</span>}

                            <button
                                type="button"
                                onClick={() => changePage(page)}
                                aria-current={page === pagination.page ? "page" : undefined}
                                className={`flex size-10 items-center justify-center rounded-xl text-xs font-black transition ${
                                    page === pagination.page
                                        ? "bg-coffee-900 text-white"
                                        : "border border-coffee-100 bg-white text-coffee-600 hover:bg-cream-100"
                                }`}
                            >
                                {page.toLocaleString("fa-IR")}
                            </button>
                        </div>
                    );
                })}

                <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => changePage(pagination.page + 1)}
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 text-coffee-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="صفحه بعدی"
                >
                    <FiChevronLeft />
                </button>
            </div>
        </nav>
    );
}
