import { redirect } from "next/navigation";
import {
    FiActivity,
    FiBarChart2,
    FiCheckCircle,
    FiDollarSign,
    FiShoppingBag,
    FiTrendingUp,
    FiUserPlus,
} from "react-icons/fi";

import BreakdownBars from "@/components/admin/reports/BreakdownBars";
import ReportExportButton from "@/components/admin/reports/ReportExportButton";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import RevenueChart from "@/components/admin/reports/RevenueChart";

import getAdminReports from "@/lib/admin/reports/getAdminReports";
import { orderStatusConfig, paymentMethodLabels } from "@/constants/order-ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "گزارش‌ها" };

const priceFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

const statusLabels = Object.fromEntries(
    Object.entries(orderStatusConfig).map(([key, value]) => [key, value.title]),
);

const statusClasses = {
    pending: "bg-amber-500",
    confirmed: "bg-blue-500",
    preparing: "bg-violet-500",
    ready: "bg-cyan-500",
    "out-for-delivery": "bg-indigo-500",
    completed: "bg-emerald-500",
    cancelled: "bg-red-500",
};

const paymentClasses = {
    cash: "bg-emerald-500",
    card: "bg-blue-500",
    online: "bg-violet-500",
};

function ChangeBadge({ value }) {
    const positive = value >= 0;

    return (
        <span
            className={`inline-flex rounded-full px-2 py-1 text-[9px] font-black ${
                positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
        >
            {positive ? "+" : ""}
            {Number(value || 0).toLocaleString("fa-IR")}٪
        </span>
    );
}

function StatCard({ title, value, suffix, icon: Icon, iconClassName, change, description }) {
    return (
        <article className="rounded-[1.5rem] border border-coffee-100 bg-white p-5 shadow-[0_12px_40px_rgba(48,32,26,0.06)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-coffee-400">{title}</p>
                    <p className="mt-3 text-2xl font-black text-coffee-950">
                        {priceFormatter.format(value || 0)}
                        {suffix && <span className="mr-1 text-[10px] font-bold text-coffee-400">{suffix}</span>}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <ChangeBadge value={change} />
                        <span className="text-[9px] text-coffee-400">{description}</span>
                    </div>
                </div>
                <span className={`flex size-12 items-center justify-center rounded-2xl ${iconClassName}`}>
                    <Icon size={20} />
                </span>
            </div>
        </article>
    );
}

export default async function AdminReportsPage({ searchParams }) {
    const data = await getAdminReports(await searchParams);

    if (!data) {
        redirect("/login?next=/admin/reports");
    }

    return (
        <div className="space-y-7">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">تحلیل عملکرد فروشگاه</p>
                    <h1 className="mt-2 text-3xl font-black text-coffee-950">گزارش‌های مدیریتی</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                        فروش، سفارش‌ها، مشتریان و عملکرد محصولات را با داده‌های مستقیم MongoDB بررسی کن.
                    </p>
                </div>
                <ReportExportButton />
            </section>

            <ReportFilters range={data.range} />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="درآمد پرداخت‌شده"
                    value={data.summary.revenue}
                    suffix="تومان"
                    icon={FiDollarSign}
                    iconClassName="bg-emerald-50 text-emerald-700"
                    change={data.summary.changes.revenue}
                    description="نسبت به بازه قبل"
                />
                <StatCard
                    title="تمام سفارش‌ها"
                    value={data.summary.totalOrders}
                    icon={FiShoppingBag}
                    iconClassName="bg-blue-50 text-blue-700"
                    change={data.summary.changes.orders}
                    description="نسبت به بازه قبل"
                />
                <StatCard
                    title="سفارش‌های تکمیل‌شده"
                    value={data.summary.completedOrders}
                    icon={FiCheckCircle}
                    iconClassName="bg-violet-50 text-violet-700"
                    change={data.summary.changes.completed}
                    description={`${data.summary.conversionRate.toLocaleString("fa-IR")}٪ نرخ تکمیل`}
                />
                <StatCard
                    title="کاربران جدید"
                    value={data.summary.newUsers}
                    icon={FiUserPlus}
                    iconClassName="bg-caramel-50 text-caramel-700"
                    change={data.summary.changes.users}
                    description="نسبت به بازه قبل"
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
                <article className="rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-[0_14px_50px_rgba(48,32,26,0.06)] sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-coffee-950">روند درآمد و سفارش</h2>
                            <p className="mt-1 text-xs text-coffee-400">
                                {dateFormatter.format(new Date(data.range.from))} تا {dateFormatter.format(new Date(data.range.to))}
                            </p>
                        </div>
                        <FiBarChart2 className="text-2xl text-caramel-500" />
                    </div>
                    <RevenueChart items={data.trend} />
                </article>

                <div className="space-y-6">
                    <article className="rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
                        <h2 className="text-lg font-black text-coffee-950">خلاصه فروش</h2>
                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between rounded-xl bg-cream-50 p-3">
                                <span className="text-xs font-bold text-coffee-500">میانگین سفارش</span>
                                <span className="text-sm font-black text-coffee-950">
                                    {priceFormatter.format(data.summary.averageOrderValue)} تومان
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-cream-50 p-3">
                                <span className="text-xs font-bold text-coffee-500">سفارش پرداخت‌شده</span>
                                <span className="text-sm font-black text-coffee-950">
                                    {data.summary.paidOrders.toLocaleString("fa-IR")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-cream-50 p-3">
                                <span className="text-xs font-bold text-coffee-500">سفارش لغوشده</span>
                                <span className="text-sm font-black text-red-600">
                                    {data.summary.cancelledOrders.toLocaleString("fa-IR")}
                                </span>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-[2rem] bg-coffee-950 p-5 text-white shadow-[0_20px_55px_rgba(48,32,26,0.18)]">
                        <FiTrendingUp className="text-2xl text-caramel-300" />
                        <h2 className="mt-4 text-lg font-black">نرخ تکمیل سفارش</h2>
                        <p className="mt-3 text-4xl font-black text-caramel-300">
                            {data.summary.conversionRate.toLocaleString("fa-IR")}٪
                        </p>
                        <p className="mt-2 text-xs leading-6 text-white/45">
                            نسبت سفارش‌های تکمیل‌شده به تمام سفارش‌های ثبت‌شده در این بازه.
                        </p>
                    </article>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-[2rem] border border-coffee-100 bg-white p-6">
                    <h2 className="text-lg font-black text-coffee-950">وضعیت سفارش‌ها</h2>
                    <div className="mt-6">
                        <BreakdownBars items={data.orderStatuses} labels={statusLabels} classes={statusClasses} />
                    </div>
                </article>

                <article className="rounded-[2rem] border border-coffee-100 bg-white p-6">
                    <h2 className="text-lg font-black text-coffee-950">روش‌های پرداخت</h2>
                    <div className="mt-6">
                        <BreakdownBars items={data.paymentMethods} labels={paymentMethodLabels} classes={paymentClasses} />
                    </div>
                </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <article className="overflow-hidden rounded-[2rem] border border-coffee-100 bg-white">
                    <div className="border-b border-coffee-100 p-5">
                        <h2 className="text-lg font-black text-coffee-950">محصولات پرفروش</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-right">
                            <thead className="bg-cream-50 text-[10px] text-coffee-400">
                                <tr>
                                    <th className="px-5 py-4">محصول</th>
                                    <th className="px-4 py-4">تعداد</th>
                                    <th className="px-4 py-4">سفارش</th>
                                    <th className="px-5 py-4">درآمد</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topProducts.map((item) => (
                                    <tr key={item._id || item.name} className="border-t border-coffee-100 text-xs">
                                        <td className="px-5 py-4 font-black text-coffee-900">{item.name}</td>
                                        <td className="px-4 py-4 text-coffee-600">{item.quantity.toLocaleString("fa-IR")}</td>
                                        <td className="px-4 py-4 text-coffee-600">{item.orderCount.toLocaleString("fa-IR")}</td>
                                        <td className="px-5 py-4 font-black text-emerald-700">
                                            {priceFormatter.format(item.revenue)} تومان
                                        </td>
                                    </tr>
                                ))}
                                {!data.topProducts.length && (
                                    <tr><td colSpan="4" className="px-5 py-12 text-center text-xs text-coffee-400">داده‌ای ثبت نشده است</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>

                <article className="overflow-hidden rounded-[2rem] border border-coffee-100 bg-white">
                    <div className="border-b border-coffee-100 p-5">
                        <h2 className="text-lg font-black text-coffee-950">مشتریان برتر</h2>
                    </div>
                    <div className="divide-y divide-coffee-100">
                        {data.topCustomers.map((customer, index) => (
                            <div key={customer._id} className="flex items-center gap-4 p-5">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coffee-100 text-sm font-black text-coffee-700">
                                    {(index + 1).toLocaleString("fa-IR")}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-black text-coffee-950">{customer.name}</p>
                                    <p dir="ltr" className="mt-1 truncate text-right text-[10px] text-coffee-400">{customer.email}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-emerald-700">{priceFormatter.format(customer.spent)} تومان</p>
                                    <p className="mt-1 text-[10px] text-coffee-400">{customer.orders.toLocaleString("fa-IR")} سفارش</p>
                                </div>
                            </div>
                        ))}
                        {!data.topCustomers.length && <p className="p-12 text-center text-xs text-coffee-400">داده‌ای ثبت نشده است</p>}
                    </div>
                </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-[2rem] border border-coffee-100 bg-white p-6">
                    <h2 className="text-lg font-black text-coffee-950">فروش براساس دسته‌بندی</h2>
                    <div className="mt-5 space-y-3">
                        {data.topCategories.map((category) => (
                            <div key={category._id || category.title} className="flex items-center justify-between rounded-xl bg-cream-50 p-4">
                                <div>
                                    <p className="text-sm font-black text-coffee-900">{category.title}</p>
                                    <p className="mt-1 text-[10px] text-coffee-400">{category.quantity.toLocaleString("fa-IR")} آیتم فروخته‌شده</p>
                                </div>
                                <p className="text-sm font-black text-emerald-700">{priceFormatter.format(category.revenue)} تومان</p>
                            </div>
                        ))}
                        {!data.topCategories.length && <p className="py-10 text-center text-xs text-coffee-400">داده‌ای ثبت نشده است</p>}
                    </div>
                </article>

                <article className="rounded-[2rem] border border-coffee-100 bg-white p-6">
                    <div className="flex items-center gap-2">
                        <FiActivity className="text-red-500" />
                        <h2 className="text-lg font-black text-coffee-950">هشدار موجودی کم</h2>
                    </div>
                    <div className="mt-5 space-y-3">
                        {data.lowStockProducts.map((product) => (
                            <div key={product._id} className="flex items-center justify-between rounded-xl bg-red-50 p-4">
                                <div>
                                    <p className="text-sm font-black text-red-800">{product.name}</p>
                                    <p dir="ltr" className="mt-1 text-right text-[10px] text-red-400">{product.slug}</p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-red-700">
                                    {Number(product.stock || 0).toLocaleString("fa-IR")} عدد
                                </span>
                            </div>
                        ))}
                        {!data.lowStockProducts.length && (
                            <div className="rounded-xl bg-emerald-50 p-5 text-center text-xs font-bold text-emerald-700">
                                هیچ محصولی با موجودی بحرانی وجود ندارد
                            </div>
                        )}
                    </div>
                </article>
            </section>
        </div>
    );
}
