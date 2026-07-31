import { redirect } from "next/navigation";

import {
    FiActivity,
    FiCheckCircle,
    FiClock,
    FiDollarSign,
    FiShoppingBag,
    FiXCircle,
} from "react-icons/fi";

import OrderFilters from "@/components/admin/orders/OrderFilters";
import OrdersPagination from "@/components/admin/orders/OrdersPagination";
import OrdersTable from "@/components/admin/orders/OrdersTable";

import getAdminOrders from "@/lib/admin/orders/getAdminOrders";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "مدیریت سفارش‌ها",
};

const priceFormatter = new Intl.NumberFormat("fa-IR");

function StatCard({ title, value, icon: Icon, className, suffix }) {
    return (
        <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${className}`}
            >
                <Icon size={20} />
            </span>

            <div>
                <p className="text-[11px] font-bold text-coffee-400">{title}</p>

                <p className="mt-1 text-xl font-black text-coffee-950">
                    {priceFormatter.format(value)}

                    {suffix && (
                        <span className="mr-1 text-[10px] font-medium text-coffee-400">
                            {suffix}
                        </span>
                    )}
                </p>
            </div>
        </article>
    );
}

export default async function AdminOrdersPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;

    const data = await getAdminOrders(resolvedSearchParams);

    if (!data) {
        redirect("/login?next=/admin/orders");
    }

    return (
        <div className="space-y-7">
            <section>
                <p className="text-xs font-bold text-caramel-600">مدیریت فروش</p>

                <h1 className="mt-2 text-3xl font-black text-coffee-950">سفارش‌های ممد کافی</h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                    سفارش‌ها، وضعیت آماده‌سازی، تحویل، پرداخت و لغو را از این قسمت مدیریت کن.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <StatCard
                    title="تمام سفارش‌ها"
                    value={data.stats.totalOrders}
                    icon={FiShoppingBag}
                    className="bg-coffee-100 text-coffee-700"
                />

                <StatCard
                    title="در انتظار بررسی"
                    value={data.stats.pendingCount}
                    icon={FiClock}
                    className="bg-amber-50 text-amber-700"
                />

                <StatCard
                    title="در حال انجام"
                    value={data.stats.activeCount}
                    icon={FiActivity}
                    className="bg-blue-50 text-blue-700"
                />

                <StatCard
                    title="تکمیل‌شده"
                    value={data.stats.completedCount}
                    icon={FiCheckCircle}
                    className="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                    title="لغوشده"
                    value={data.stats.cancelledCount}
                    icon={FiXCircle}
                    className="bg-red-50 text-red-700"
                />

                <StatCard
                    title="فروش پرداخت‌شده"
                    value={data.stats.paidRevenue}
                    suffix="تومان"
                    icon={FiDollarSign}
                    className="bg-caramel-50 text-caramel-700"
                />
            </section>

            <OrderFilters />

            <div className="flex items-center justify-between">
                <p className="text-sm font-black text-coffee-950">فهرست سفارش‌ها</p>

                <p className="text-xs font-bold text-coffee-400">
                    {data.pagination.total.toLocaleString("fa-IR")} نتیجه
                </p>
            </div>

            <OrdersTable orders={data.orders} />

            <OrdersPagination pagination={data.pagination} />
        </div>
    );
}
