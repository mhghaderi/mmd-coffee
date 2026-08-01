import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";

export default async function CheckoutSuccessPage({ searchParams }) {
    const params = await searchParams;
    const number = params.number || "";
    const type = params.type === "shop" ? "shop" : "cafe";
    const total = Number(params.total || 0);
    return <main className="page-container py-16"><div className="mx-auto max-w-xl rounded-[2.25rem] border border-coffee-100 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-green-50 text-success"><FiCheckCircle size={28} /></span><h1 className="mt-5 text-2xl font-black text-coffee-950">سفارشت ثبت شد</h1><p className="mt-3 text-sm leading-7 text-coffee-500">{type === "cafe" ? "سفارش برای آماده‌سازی کافه ارسال شد." : "خرید فروشگاهی با موفقیت ثبت شد."}</p>{number && <p className="mt-4 text-sm font-black text-caramel-600">شماره سفارش: {number}</p>}{total > 0 && <p className="mt-2 text-xs text-coffee-400">مبلغ: {total.toLocaleString("fa-IR")} تومان</p>}<div className="mt-6 flex justify-center gap-2"><Link href="/user/orders" className="rounded-xl bg-coffee-900 px-5 py-3 text-xs font-black text-white">سفارش‌های من</Link><Link href={type === "shop" ? "/shop" : "/menu"} className="rounded-xl bg-cream-100 px-5 py-3 text-xs font-black text-coffee-700">ادامه خرید</Link></div></div></main>;
}
