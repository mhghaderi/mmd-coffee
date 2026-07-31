"use client";

import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export default function MenuError({ reset }) {
    return (
        <main className="page-container flex min-h-[70vh] items-center justify-center py-16">
            <section className="w-full max-w-xl rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-[0_20px_65px_rgba(48,32,26,0.08)]">
                <span className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-red-50 text-red-600">
                    <FiAlertCircle size={30} />
                </span>

                <h1 className="mt-6 text-2xl font-black text-coffee-950">دریافت منو انجام نشد</h1>

                <p className="mt-4 text-sm leading-8 text-coffee-500">
                    ارتباط با دیتابیس یا دریافت محصولات با مشکل مواجه شده است.
                </p>

                <button
                    type="button"
                    onClick={reset}
                    className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white"
                >
                    <FiRefreshCw className="text-current" />

                    <span className="text-current">تلاش دوباره</span>
                </button>
            </section>
        </main>
    );
}
