import Link from "next/link";
import { FiArrowLeft, FiCoffee, FiMessageSquare, FiPackage, FiShoppingBag } from "react-icons/fi";
import getUserDashboardData from "@/lib/user/getUserDashboardData";

const price = new Intl.NumberFormat("fa-IR");
const statusLabels = { pending: "در انتظار", confirmed: "تأیید شده", preparing: "در حال آماده‌سازی", ready: "آماده", "out-for-delivery": "در حال ارسال", completed: "تکمیل شده", cancelled: "لغو شده" };
const ticketStatusLabels = { open: "باز", answered: "پاسخ داده‌شده", "customer-reply": "پاسخ جدید شما", closed: "بسته‌شده" };

export default async function UserDashboardPage() {
    const data = await getUserDashboardData();
    if (!data) return null;

    return (
        <div>
            <section className="rounded-[2rem] bg-coffee-950 px-6 py-8 text-white sm:px-8">
                <p className="text-xs font-bold text-caramel-300">سلام {data.currentUser.name || "دوست ممد کافی"}</p>
                <h1 className="mt-3 text-3xl font-black">حساب کاربری من</h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">سفارش‌های داخل کافه، خریدهای فروشگاهی و پیام‌های پشتیبانی را از همین‌جا مدیریت کن.</p>
            </section>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    ["کل سفارش‌ها", data.stats.orderCount, FiPackage],
                    ["سفارش فعال", data.stats.activeOrderCount, FiCoffee],
                    ["کل تیکت‌ها", data.stats.ticketCount, FiMessageSquare],
                    ["تیکت باز", data.stats.openTicketCount, FiMessageSquare],
                ].map(([title, value, Icon]) => <div key={title} className="rounded-2xl border border-coffee-100 bg-white p-5 shadow-sm"><Icon className="text-xl text-caramel-600" /><p className="mt-4 text-2xl font-black text-coffee-950">{Number(value).toLocaleString("fa-IR")}</p><p className="mt-1 text-xs font-bold text-coffee-400">{title}</p></div>)}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><h2 className="text-lg font-black text-coffee-950">سفارش‌های اخیر</h2><Link href="/user/orders" className="flex items-center gap-1 text-xs font-black text-caramel-600">همه <FiArrowLeft /></Link></div>
                    <div className="mt-4 space-y-2">
                        {data.recentOrders.length ? data.recentOrders.map((order) => {
                            const isShop = order.context?.catalogType === "shop";
                            return <Link key={order._id} href={`/user/orders/${order._id}`} className="flex items-center justify-between gap-3 rounded-xl bg-cream-50 px-4 py-3 transition hover:bg-cream-100"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-white text-coffee-700">{isShop ? <FiShoppingBag /> : <FiCoffee />}</span><div><p className="text-xs font-black text-coffee-900">{order.orderNumber}</p><p className="mt-1 text-[10px] text-coffee-400">{isShop ? "خرید فروشگاهی" : "سفارش کافه"} · {statusLabels[order.status] || order.status}</p></div></div><span className="text-xs font-black text-coffee-800">{price.format(order.pricing?.total || 0)} تومان</span></Link>;
                        }) : <p className="py-8 text-center text-xs font-bold text-coffee-400">هنوز سفارشی ثبت نکردی.</p>}
                    </div>
                </section>

                <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><h2 className="text-lg font-black text-coffee-950">تیکت‌های اخیر</h2><Link href="/user/tickets" className="flex items-center gap-1 text-xs font-black text-caramel-600">همه <FiArrowLeft /></Link></div>
                    <div className="mt-4 space-y-2">{data.recentTickets.length ? data.recentTickets.map((ticket) => <Link key={ticket._id} href={`/user/tickets/${ticket._id}`} className="block rounded-xl bg-cream-50 px-4 py-3 transition hover:bg-cream-100"><div className="flex items-center justify-between gap-3"><p className="line-clamp-1 text-xs font-black text-coffee-900">{ticket.subject}</p><span className="text-[10px] font-bold text-caramel-600">{ticket.ticketNumber}</span></div><p className="mt-1 text-[10px] text-coffee-400">وضعیت: {ticketStatusLabels[ticket.status] || ticket.status}</p></Link>) : <p className="py-8 text-center text-xs font-bold text-coffee-400">تیکتی ثبت نشده است.</p>}</div>
                </section>
            </div>
        </div>
    );
}
