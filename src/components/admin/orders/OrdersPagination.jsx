"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function OrdersPagination({ pagination }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (pagination.pages <= 1) {
        return null;
    }

    const changePage = (page) => {
        const params = new URLSearchParams(searchParams.toString());

        if (page <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(page));
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <nav className="flex items-center justify-between rounded-[1.5rem] border border-coffee-100 bg-white p-4">
            <p className="text-xs font-bold text-coffee-400">
                صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                {pagination.pages.toLocaleString("fa-IR")}
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => changePage(pagination.page - 1)}
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 disabled:opacity-30"
                >
                    <FiChevronRight />
                </button>

                <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => changePage(pagination.page + 1)}
                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 disabled:opacity-30"
                >
                    <FiChevronLeft />
                </button>
            </div>
        </nav>
    );
}
