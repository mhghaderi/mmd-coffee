"use client";

import { useSearchParams } from "next/navigation";
import { FiDownload } from "react-icons/fi";

export default function ReportExportButton() {
    const searchParams = useSearchParams();

    return (
        <a
            href={`/api/admin/reports/export?${searchParams.toString()}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-5 text-sm font-black text-coffee-700 transition hover:bg-coffee-900 hover:text-white"
        >
            <FiDownload className="text-current" />
            <span className="text-current">خروجی CSV</span>
        </a>
    );
}
