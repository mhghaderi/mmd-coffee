"use client";

import { FiPrinter } from "react-icons/fi";

export default function OrderPrintButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 shadow-sm transition hover:bg-cream-100 hover:text-coffee-950 print:hidden"
        >
            <FiPrinter />
            چاپ سفارش
        </button>
    );
}
