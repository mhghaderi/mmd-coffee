"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const types = [
    ["all", "همه"],
    ["products", "محصولات"],
    ["categories", "دسته‌ها"],
    ["articles", "مقالات"],
    ["reviews", "نظرات"],
];

export default function ArchiveFilters({ filters }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(filters.q || "");

    const setType = (type) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", type);
        router.push(`${pathname}?${params.toString()}`);
    };

    const submit = (event) => {
        event.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        query.trim() ? params.set("q", query.trim()) : params.delete("q");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                    {types.map(([value, title]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setType(value)}
                            className={`h-10 shrink-0 rounded-xl px-4 text-xs font-black transition ${
                                filters.type === value
                                    ? "bg-coffee-900 text-white"
                                    : "border border-coffee-100 bg-cream-50 text-coffee-500 hover:text-coffee-950"
                            }`}
                        >
                            {title}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="relative w-full lg:max-w-sm">
                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-300" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="جست‌وجو در آرشیو..."
                        className="h-11 w-full rounded-xl border border-coffee-100 bg-cream-50 pr-11 pl-4 text-xs text-coffee-900 outline-none focus:border-caramel-400 focus:bg-white"
                    />
                </form>
            </div>
        </section>
    );
}
