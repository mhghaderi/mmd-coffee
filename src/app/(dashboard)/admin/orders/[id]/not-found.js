import Link from "next/link";

import { FiArrowRight, FiSearch } from "react-icons/fi";

export default function OrderNotFound() {
    return (
        <section className="flex min-h-[calc(100vh-160px)] items-center justify-center">
            <div className="w-full max-w-xl rounded-[2rem] border border-coffee-100 bg-white p-8 text-center shadow-[0_20px_65px_rgba(48,32,26,0.08)] sm:p-12">
                <span className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-coffee-900 text-caramel-300">
                    <FiSearch size={29} />
                </span>

                <h1 className="mt-6 text-3xl font-black text-coffee-950">سفارش پیدا نشد</h1>

                <p className="mt-4 text-sm leading-8 text-coffee-500">
                    سفارش موردنظر وجود ندارد یا شناسه واردشده معتبر نیست.
                </p>

                <Link
                    href="/admin/orders"
                    className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white transition hover:bg-coffee-800"
                >
                    <FiArrowRight className="text-current" />

                    <span className="text-current">بازگشت به سفارش‌ها</span>
                </Link>
            </div>
        </section>
    );
}
