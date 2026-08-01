import Link from "next/link";
import { redirect } from "next/navigation";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiBarChart2,
    FiBox,
    FiCheckCircle,
    FiDollarSign,
    FiFileText,
    FiMessageSquare,
    FiSettings,
    FiShoppingBag,
    FiStar,
    FiUsers,
} from "react-icons/fi";

import getDashboardData from "@/lib/admin/getDashboardData";
import { orderStatusConfig, paymentStatusConfig } from "@/constants/order-ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "داشبورد" };

const priceFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function StatCard({ title, value, suffix, description, icon: Icon, iconClassName, href }) {
    const content = (
        <article className="h-full rounded-[1.5rem] border border-coffee-100 bg-white p-5 shadow-[0_12px_40px_rgba(48,32,26,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(48,32,26,0.10)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-coffee-400">{title}</p>
                    <p className="mt-3 text-2xl font-black text-coffee-950">
                        {priceFormatter.format(value || 0)}
                        {suffix && <span className="mr-1 text-[10px] font-bold text-coffee-400">{suffix}</span>}
                    </p>
                    <p className="mt-2 text-[10px] leading-5 text-coffee-400">{description}</p>
                </div>
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}>
                    <Icon size={20} />
                </span>
            </div>
        </article>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
    const data = await getDashboardData();

    if (!data) {
        redirect("/login?next=/admin");
    }

    const { currentUser, stats, recentOrders, topProducts } = data;

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] bg-coffee-950 p-6 text-white shadow-[0_25px_70px_rgba(48,32,26,0.22)] sm:p-8">
                <div className="absolute -right-24 -top-32 size-80 rounded-full bg-caramel-500/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-xs font-bold text-caramel-300">مرکز مدیریت ممد کافی</p>
                        <h1 className="mt-3 text-3xl font-black sm:text-4xl">سلام {currentUser.name}</h1>
                        <p className="mt-4 max-w-2xl text-sm leading-8 text-white/55">
                            وضعیت فروش، سفارش‌ها، محصولات، کاربران، محتوا و پشتیبانی را از این داشبورد دنبال کن.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href="/admin/reports" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-black text-coffee-950">
                            <FiBarChart2 /> مشاهده گزارش‌ها
                        </Link>
                        <Link href="/admin/settings" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-black text-white hover:bg-white/10">
                            <FiSettings /> تنظیمات فروشگاه
                        </Link>
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-5">
                    <p className="text-xs font-bold text-caramel-600">نمای کلی</p>
                    <h2 className="mt-1 text-2xl font-black text-coffee-950">آمار زنده سامانه</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="درآمد این ماه" value={stats.monthRevenue} suffix="تومان" description="فقط پرداخت‌های موفق" icon={FiDollarSign} iconClassName="bg-emerald-50 text-emerald-700" href="/admin/reports" />
                    <StatCard title="سفارش‌های در جریان" value={stats.pendingOrders} description={`${stats.todayOrders.toLocaleString("fa-IR")} سفارش امروز`} icon={FiShoppingBag} iconClassName="bg-blue-50 text-blue-700" href="/admin/orders" />
                    <StatCard title="محصولات منتشرشده" value={stats.publishedProducts} description={`${stats.availableProducts.toLocaleString("fa-IR")} محصول قابل سفارش`} icon={FiBox} iconClassName="bg-violet-50 text-violet-700" href="/admin/products" />
                    <StatCard title="کاربران فعال" value={stats.activeUsers} description={`از ${stats.totalUsers.toLocaleString("fa-IR")} کاربر`} icon={FiUsers} iconClassName="bg-caramel-50 text-caramel-700" href="/admin/users" />
                    <StatCard title="نظرات منتظر بررسی" value={stats.pendingReviews} description="نیازمند تأیید یا رد" icon={FiStar} iconClassName="bg-amber-50 text-amber-700" href="/admin/reviews?status=pending" />
                    <StatCard title="تیکت‌های فعال" value={stats.openTickets} description="در انتظار پیگیری مدیر" icon={FiMessageSquare} iconClassName="bg-cyan-50 text-cyan-700" href="/admin/tickets" />
                    <StatCard title="مقالات منتشرشده" value={stats.publishedArticles} description="محتوای فعال وبلاگ" icon={FiFileText} iconClassName="bg-indigo-50 text-indigo-700" href="/admin/articles" />
                    <StatCard title="هشدار موجودی" value={stats.lowStockProducts} description="محصول با موجودی ۵ یا کمتر" icon={FiAlertCircle} iconClassName="bg-red-50 text-red-700" href="/admin/reports" />
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
                <article className="overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
                    <div className="flex items-center justify-between border-b border-coffee-100 p-5 sm:p-6">
                        <div>
                            <h2 className="text-lg font-black text-coffee-950">سفارش‌های اخیر</h2>
                            <p className="mt-1 text-xs text-coffee-400">آخرین سفارش‌های ثبت‌شده در سامانه</p>
                        </div>
                        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold text-coffee-600 hover:text-caramel-600">
                            مشاهده همه <FiArrowLeft />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-right">
                            <thead className="bg-cream-50 text-[10px] text-coffee-400">
                                <tr>
                                    <th className="px-5 py-4">سفارش</th>
                                    <th className="px-4 py-4">مشتری</th>
                                    <th className="px-4 py-4">مبلغ</th>
                                    <th className="px-4 py-4">وضعیت</th>
                                    <th className="px-4 py-4">پرداخت</th>
                                    <th className="px-5 py-4">تاریخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => {
                                    const orderStatus = orderStatusConfig[order.status] || orderStatusConfig.pending;
                                    const paymentStatus = paymentStatusConfig[order.payment?.status] || paymentStatusConfig.unpaid;
                                    return (
                                        <tr key={order._id} className="border-t border-coffee-100 text-xs hover:bg-cream-50/60">
                                            <td className="px-5 py-4"><Link href={`/admin/orders/${order._id}`} className="font-black text-coffee-950">{order.orderNumber}</Link></td>
                                            <td className="px-4 py-4 text-coffee-600">{order.customer?.fullName}</td>
                                            <td className="px-4 py-4 font-black text-coffee-900">{priceFormatter.format(order.pricing?.total || 0)} تومان</td>
                                            <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${orderStatus.className}`}>{orderStatus.title}</span></td>
                                            <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${paymentStatus.className}`}>{paymentStatus.title}</span></td>
                                            <td className="px-5 py-4 text-coffee-400">{dateFormatter.format(new Date(order.createdAt))}</td>
                                        </tr>
                                    );
                                })}
                                {!recentOrders.length && <tr><td colSpan="6" className="px-5 py-14 text-center text-xs text-coffee-400">هنوز سفارشی ثبت نشده است</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </article>

                <aside className="space-y-6">
                    <article className="rounded-[2rem] border border-coffee-100 bg-white p-6 shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
                        <h2 className="text-lg font-black text-coffee-950">محصولات پرفروش</h2>
                        <div className="mt-5 space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={product._id || product.name} className="flex items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-coffee-100 text-xs font-black text-coffee-700">{(index + 1).toLocaleString("fa-IR")}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-black text-coffee-900">{product.name}</p>
                                        <p className="mt-1 text-[9px] text-coffee-400">{product.quantity.toLocaleString("fa-IR")} فروش</p>
                                    </div>
                                    <p className="text-[10px] font-black text-emerald-700">{priceFormatter.format(product.revenue)} تومان</p>
                                </div>
                            ))}
                            {!topProducts.length && <p className="py-10 text-center text-xs text-coffee-400">داده‌ای وجود ندارد</p>}
                        </div>
                    </article>

                    <article className="rounded-[2rem] bg-coffee-900 p-6 text-white shadow-[0_20px_55px_rgba(48,32,26,0.18)]">
                        <FiCheckCircle className="text-2xl text-caramel-300" />
                        <h2 className="mt-4 text-lg font-black">پنل مدیریت کامل شد</h2>
                        <p className="mt-3 text-xs leading-7 text-white/50">
                            محصولات، دسته‌ها، سفارش‌ها، کاربران، نظرات، مقالات، تیکت‌ها، گزارش‌ها، آرشیو و تنظیمات همگی در دسترس هستند.
                        </p>
                        <p className="mt-5 text-2xl font-black text-caramel-300">{priceFormatter.format(stats.allRevenue)} تومان</p>
                        <p className="mt-1 text-[10px] text-white/35">کل درآمد پرداخت‌شده سامانه</p>
                    </article>
                </aside>
            </section>
        </div>
    );
}
