"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiCalendar, FiFilter } from "react-icons/fi";

const presets = [
    { value: "7", title: "۷ روز" },
    { value: "30", title: "۳۰ روز" },
    { value: "90", title: "۹۰ روز" },
    { value: "365", title: "یک سال" },
    { value: "custom", title: "بازه دلخواه" },
];

export default function ReportFilters({ range }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedRange, setSelectedRange] = useState(range.preset);
    const [from, setFrom] = useState(range.fromInput);
    const [to, setTo] = useState(range.toInput);

    const apply = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", selectedRange);

        if (selectedRange === "custom") {
            params.set("from", from);
            params.set("to", to);
        } else {
            params.delete("from");
            params.delete("to");
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-black text-coffee-950">
                        <FiCalendar className="text-caramel-600" />
                        بازه گزارش
                    </div>
                    <p className="mt-1 text-[10px] leading-5 text-coffee-400">
                        تمام آمار و نمودارها براساس بازه انتخاب‌شده محاسبه می‌شوند.
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                        {presets.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => setSelectedRange(preset.value)}
                                className={`h-10 shrink-0 rounded-xl px-4 text-xs font-black transition ${
                                    selectedRange === preset.value
                                        ? "bg-coffee-900 text-white"
                                        : "border border-coffee-100 bg-cream-50 text-coffee-500 hover:text-coffee-950"
                                }`}
                            >
                                {preset.title}
                            </button>
                        ))}
                    </div>

                    {selectedRange === "custom" && (
                        <div className="flex gap-2">
                            <label>
                                <span className="mb-1 block text-[10px] text-coffee-400">از</span>
                                <input
                                    type="date"
                                    value={from}
                                    onChange={(event) => setFrom(event.target.value)}
                                    className="h-10 rounded-xl border border-coffee-100 bg-cream-50 px-3 text-xs text-coffee-800 outline-none focus:border-caramel-400"
                                />
                            </label>
                            <label>
                                <span className="mb-1 block text-[10px] text-coffee-400">تا</span>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={(event) => setTo(event.target.value)}
                                    className="h-10 rounded-xl border border-coffee-100 bg-cream-50 px-3 text-xs text-coffee-800 outline-none focus:border-caramel-400"
                                />
                            </label>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={apply}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-caramel-500 px-5 text-xs font-black text-white transition hover:bg-caramel-600"
                    >
                        <FiFilter />
                        اعمال فیلتر
                    </button>
                </div>
            </div>
        </section>
    );
}
