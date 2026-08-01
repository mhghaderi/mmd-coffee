import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight, FiCoffee, FiMapPin, FiShoppingBag } from "react-icons/fi";
import getUserOrderDetails from "@/lib/user/getUserOrderDetails";

const money = new Intl.NumberFormat("fa-IR");
const statusLabels = { pending: "در انتظار", confirmed: "تأیید شده", preparing: "در حال آماده‌سازی", ready: "آماده", "out-for-delivery": "در حال ارسال", completed: "تکمیل شده", cancelled: "لغو شده" };
const fulfillmentLabels = { dine_in: "مصرف داخل کافه", takeaway: "بیرون‌بر", delivery: "ارسال به آدرس", pickup: "تحویل حضوری" };

export default async function UserOrderDetailsPage({ params }) {
    const { id } = await params;
    const data = await getUserOrderDetails(id);
    if (!data.order) notFound();
    const order = data.order;
    const isShop = order.context?.catalogType === "shop";

    return (
        <div>
            <Link href="/user/orders" className="inline-flex items-center gap-2 text-xs font-black text-coffee-500"><FiArrowRight /> بازگشت به سفارش‌ها</Link>
            <div className="mt-5 rounded-[2rem] bg-coffee-950 px-6 py-7 text-white sm:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-xl bg-white/10 text-caramel-300">{isShop ? <FiShoppingBag /> : <FiCoffee />}</span><div><p className="text-[10px] font-bold text-white/40">{isShop ? "خرید فروشگاهی" : "سفارش کافه"}</p><h1 className="mt-1 text-2xl font-black">{order.orderNumber}</h1></div></div><span className="w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-black text-caramel-300">{statusLabels[order.status] || order.status}</span></div></div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]">
                <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-coffee-950">آیتم‌های سفارش</h2><div className="mt-4 space-y-3">{order.items?.map((item,index) => <div key={`${item.product || item.slug}-${index}`} className="flex gap-3 rounded-xl bg-cream-50 p-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white"><Image src={item.image || "/images/shop/product-placeholder.svg"} alt={item.name} fill sizes="64px" className="object-contain p-1" /></div><div className="min-w-0 flex-1"><p className="text-sm font-black text-coffee-950">{item.name}</p><p className="mt-1 text-[10px] text-coffee-400">{item.variant?.title || item.englishName || "MMD Coffee"} · تعداد {Number(item.quantity || 0).toLocaleString("fa-IR")}</p></div><p className="text-xs font-black text-coffee-900">{money.format(item.lineTotal || 0)} تومان</p></div>)}</div></section>

                <div className="space-y-4"><section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm"><h2 className="text-sm font-black text-coffee-950">روش دریافت</h2><p className="mt-3 text-sm font-black text-caramel-600">{fulfillmentLabels[order.context?.fulfillmentType] || "تحویل حضوری"}</p>{order.context?.fulfillmentType === "dine_in" && <p className="mt-2 text-xs text-coffee-500">شماره میز: <strong>{order.context.tableNumber || "ثبت نشده"}</strong></p>}{order.context?.fulfillmentType === "delivery" && <div className="mt-3 flex gap-2 text-xs leading-6 text-coffee-500"><FiMapPin className="mt-1 shrink-0" /><span>{order.delivery?.city}، {order.delivery?.addressLine}</span></div>}</section><section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm"><h2 className="text-sm font-black text-coffee-950">مبلغ سفارش</h2><div className="mt-4 space-y-2 text-xs"><div className="flex justify-between text-coffee-500"><span>جمع محصولات</span><span>{money.format(order.pricing?.subtotal || 0)} تومان</span></div><div className="flex justify-between text-coffee-500"><span>هزینه ارسال</span><span>{money.format(order.pricing?.deliveryFee || 0)} تومان</span></div><div className="flex justify-between border-t border-coffee-100 pt-3 text-sm font-black text-coffee-950"><span>مبلغ نهایی</span><span>{money.format(order.pricing?.total || 0)} تومان</span></div></div></section></div>
            </div>
        </div>
    );
}
