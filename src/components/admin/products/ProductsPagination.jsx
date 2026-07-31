"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function createVisiblePages(currentPage, totalPages) {
    if (totalPages <= 5) {
        return Array.from(
            {
                length: totalPages,
            },
            (_, index) => index + 1,
        );
    }

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

    return [...pages]
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((first, second) => first - second);
}

export default function ProductsPagination({ pagination }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (pagination.pages <= 1) {
        return null;
    }

    const changePage = (page) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        if (page <= 1) {
            nextParams.delete("page");
        } else {
            nextParams.set("page", String(page));
        }

        const queryString = nextParams.toString();

        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

    const visiblePages = createVisiblePages(pagination.page, pagination.pages);

    return (
        <nav
            aria-label="صفحه‌بندی محصولات"
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
                    aria-label="صفحه قبلی"
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 text-coffee-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <FiChevronRight />
                </button>

                {visiblePages.map((page, index) => {
                    const previousPage = visiblePages[index - 1];

                    const shouldShowSeparator = previousPage && page - previousPage > 1;

                    return (
                        <div key={page} className="flex items-center gap-1.5">
                            {shouldShowSeparator && (
                                <span className="px-1 text-coffee-300">...</span>
                            )}

                            <button
                                type="button"
                                aria-current={page === pagination.page ? "page" : undefined}
                                onClick={() => changePage(page)}
                                className={`flex size-10 items-center justify-center rounded-xl text-xs font-black transition ${
                                    page === pagination.page
                                        ? "bg-coffee-900 text-white shadow-sm"
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
                    aria-label="صفحه بعدی"
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 text-coffee-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <FiChevronLeft />
                </button>
            </div>
        </nav>
    );
}
