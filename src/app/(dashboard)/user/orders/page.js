import Link from "next/link";
import { FiCoffee, FiShoppingBag } from "react-icons/fi";
import getUserOrders from "@/lib/user/getUserOrders";

const money = new Intl.NumberFormat("fa-IR");
const statusLabels = { pending: "در انتظار", confirmed: "تأیید شده", preparing: "در حال آماده‌سازی", ready: "آماده", "out-for-delivery": "در حال ارسال", completed: "تکمیل شده", cancelled: "لغو شده" };
const fulfillmentLabels = { dine_in: "مصرف داخل کافه", takeaway: "بیرون‌بر", delivery: "ارسال به آدرس", pickup: "تحویل حضوری" };

function buildQuery(filters, next) {
    const params = new URLSearchParams();
    const values = { ...filters, ...next };
    Object.entries(values).forEach(([key, value]) => value && value !== "all" && params.set(key, String(value)));
    const q = params.toString();
    return q ? `/user/orders?${q}` : "/user/orders";
}

export default async function UserOrdersPage({ searchParams }) {
    const resolved = await searchParams;
    const data = await getUserOrders(resolved);
    if (!data) return null;

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-xs font-bold text-caramel-600">سفارش‌ها</p><h1 className="mt-2 text-3xl font-black text-coffee-950">سفارش‌های من</h1><p className="mt-2 text-sm text-coffee-500">سفارش کافه و خرید فروشگاهی از هم جدا نمایش داده می‌شوند.</p></div>
                <div className="flex gap-2">{[["all","همه"],["cafe","کافه"],["shop","فروشگاه"]].map(([value,title]) => <Link key={value} href={buildQuery(data.filters,{type:value,page:1})} className={`rounded-xl px-4 py-2.5 text-xs font-black ${data.filters.type===value ? "bg-coffee-900 text-white" : "bg-white text-coffee-600 shadow-sm"}`}>{title}</Link>)}</div>
            </div>

            <div className="mt-6 space-y-3">
                {data.orders.length ? data.orders.map((order) => {
                    const isShop = order.context?.catalogType === "shop";
                    return <Link key={order._id} href={`/user/orders/${order._id}`} className="grid gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-cream-100 text-coffee-800">{isShop ? <FiShoppingBag /> : <FiCoffee />}</span>
                        <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-black text-coffee-950">{order.orderNumber}</h2><span className="rounded-full bg-cream-100 px-2.5 py-1 text-[9px] font-black text-coffee-500">{isShop ? "فروشگاه" : "کافه"}</span><span className="rounded-full bg-caramel-50 px-2.5 py-1 text-[9px] font-black text-caramel-700">{statusLabels[order.status] || order.status}</span></div><p className="mt-2 text-xs text-coffee-400">{fulfillmentLabels[order.context?.fulfillmentType] || (order.delivery?.method === "delivery" ? "ارسال" : "تحویل حضوری")} · {new Date(order.createdAt).toLocaleDateString("fa-IR")}</p></div>
                        <div className="sm:text-left"><p className="text-sm font-black text-coffee-950">{money.format(order.pricing?.total || 0)} تومان</p><p className="mt-1 text-[10px] text-coffee-400">{order.items?.reduce((sum,item)=>sum+Number(item.quantity||0),0).toLocaleString("fa-IR")} آیتم</p></div>
                    </Link>;
                }) : <div className="rounded-[1.75rem] border border-dashed border-coffee-200 bg-white py-16 text-center text-sm font-bold text-coffee-400">سفارشی با این فیلتر پیدا نشد.</div>}
            </div>

            {data.pagination.pages > 1 && <div className="mt-6 flex justify-center gap-2">{data.pagination.hasPreviousPage && <Link href={buildQuery(data.filters,{page:data.pagination.page-1})} className="rounded-xl bg-white px-4 py-2 text-xs font-black shadow-sm">قبلی</Link>}<span className="rounded-xl bg-coffee-900 px-4 py-2 text-xs font-black text-white">{data.pagination.page.toLocaleString("fa-IR")} / {data.pagination.pages.toLocaleString("fa-IR")}</span>{data.pagination.hasNextPage && <Link href={buildQuery(data.filters,{page:data.pagination.page+1})} className="rounded-xl bg-white px-4 py-2 text-xs font-black shadow-sm">بعدی</Link>}</div>}
        </div>
    );
}
