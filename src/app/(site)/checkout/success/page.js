import Link from "next/link";

import { FiCheckCircle, FiCoffee, FiHome, FiShoppingBag } from "react-icons/fi";

export const metadata = {
    title: "سفارش ثبت شد",
};

export default async function CheckoutSuccessPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;

    const rawOrderNumber = Array.isArray(resolvedSearchParams.order)
        ? resolvedSearchParams.order[0]
        : resolvedSearchParams.order;

    const orderNumber =
        typeof rawOrderNumber === "string" && /^MMD-\d{6,}$/.test(rawOrderNumber.toUpperCase())
            ? rawOrderNumber.toUpperCase()
            : "";

    return (
        <main className="page-container flex min-h-[75vh] items-center justify-center py-16">
            <section className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-coffee-100 bg-white p-8 text-center shadow-[0_30px_90px_rgba(48,32,26,0.12)] sm:p-12">
                <div
                    aria-hidden="true"
                    className="absolute -right-28 -top-28 size-72 rounded-full bg-emerald-100/60 blur-3xl"
                />

                <div className="relative">
                    <span className="mx-auto flex size-24 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-700">
                        <FiCheckCircle size={42} />
                    </span>

                    <p className="mt-7 text-xs font-bold text-caramel-600">ممد کافی</p>

                    <h1 className="mt-2 text-3xl font-black text-coffee-950 sm:text-4xl">
                        سفارش با موفقیت ثبت شد
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-coffee-500">
                        سفارش برای بررسی به مدیریت ممد کافی ارسال شد. برای هماهنگی از اطلاعات تماس
                        ثبت‌شده استفاده می‌شود.
                    </p>

                    {orderNumber && (
                        <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-coffee-100 bg-cream-50 p-5">
                            <p className="text-xs font-bold text-coffee-400">شماره سفارش</p>

                            <p
                                dir="ltr"
                                className="mt-2 text-2xl font-black tracking-wider text-coffee-950"
                            >
                                {orderNumber}
                            </p>

                            <p className="mt-2 text-[10px] leading-5 text-coffee-400">
                                شماره سفارش را برای پیگیری نگه دار.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white transition hover:bg-coffee-800"
                        >
                            <FiHome className="text-current" />

                            <span className="text-current">صفحه اصلی</span>
                        </Link>

                        <Link
                            href="/menu"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-6 text-sm font-bold text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                        >
                            <FiCoffee />
                            ادامه مشاهده منو
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-coffee-400">
                        <FiShoppingBag />
                        هر فنجان، یک تجربه تازه
                    </div>
                </div>
            </section>
        </main>
    );
}
