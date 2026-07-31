import Link from "next/link";
import {
    FiCoffee,
    FiEye,
    FiPackage,
    FiShoppingBag,
} from "react-icons/fi";

import UserOrdersPagination from "@/components/admin/users/UserOrdersPagination";

import {
    deliveryMethodLabels,
    orderStatusConfig,
    paymentStatusConfig,
} from "@/constants/order-ui";

const priceFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function getItemsCount(items = []) {
    return items.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

export default function UserOrdersTable({ orders = [], pagination }) {
    if (!orders.length) {
        return (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-coffee-200 bg-cream-50 px-5 text-center">
                <FiShoppingBag size={30} className="text-coffee-300" />

                <h3 className="mt-4 text-lg font-black text-coffee-950">
                    هنوز سفارشی ثبت نشده است
                </h3>

                <p className="mt-2 text-xs leading-6 text-coffee-400">
                    سفارش‌های متصل به حساب کاربر در این قسمت نمایش داده می‌شوند.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[860px] text-right">
                    <thead className="border-b border-coffee-100 bg-cream-50 text-[10px] font-bold text-coffee-400">
                        <tr>
                            <th className="px-4 py-4">شماره سفارش</th>
                            <th className="px-4 py-4">تعداد محصول</th>
                            <th className="px-4 py-4">مبلغ</th>
                            <th className="px-4 py-4">وضعیت سفارش</th>
                            <th className="px-4 py-4">پرداخت</th>
                            <th className="px-4 py-4">تحویل</th>
                            <th className="px-4 py-4">تاریخ</th>
                            <th className="px-4 py-4">مشاهده</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order) => {
                            const orderStatus = orderStatusConfig[order.status] || {
                                title: order.status,
                                className: "bg-slate-100 text-slate-600",
                            };

                            const paymentStatus = paymentStatusConfig[order.payment?.status] || {
                                title: order.payment?.status || "نامشخص",
                                className: "bg-slate-100 text-slate-600",
                            };

                            return (
                                <tr
                                    key={order._id}
                                    className="border-b border-coffee-100 last:border-0 hover:bg-cream-50/60"
                                >
                                    <td className="px-4 py-4">
                                        <p
                                            dir="ltr"
                                            className="text-right text-xs font-black text-coffee-950"
                                        >
                                            {order.orderNumber}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                        {getItemsCount(order.items).toLocaleString("fa-IR")}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-xs font-black text-coffee-900">
                                        {priceFormatter.format(Number(order.pricing?.total || 0))}
                                        <span className="mr-1 text-[9px] font-medium text-coffee-400">
                                            تومان
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${orderStatus.className}`}
                                        >
                                            {orderStatus.title}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${paymentStatus.className}`}
                                        >
                                            {paymentStatus.title}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                        {deliveryMethodLabels[order.delivery?.method] || "—"}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-[10px] text-coffee-500">
                                        {dateFormatter.format(new Date(order.createdAt))}
                                    </td>

                                    <td className="px-4 py-4">
                                        <Link
                                            href={`/admin/orders/${order._id}`}
                                            aria-label={`مشاهده سفارش ${order.orderNumber}`}
                                            className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                                        >
                                            <FiEye />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="grid gap-4 lg:hidden">
                {orders.map((order) => {
                    const orderStatus = orderStatusConfig[order.status] || {
                        title: order.status,
                        className: "bg-slate-100 text-slate-600",
                    };

                    const paymentStatus = paymentStatusConfig[order.payment?.status] || {
                        title: order.payment?.status || "نامشخص",
                        className: "bg-slate-100 text-slate-600",
                    };

                    return (
                        <article
                            key={order._id}
                            className="rounded-2xl border border-coffee-100 bg-cream-50 p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p
                                        dir="ltr"
                                        className="text-right text-xs font-black text-coffee-950"
                                    >
                                        {order.orderNumber}
                                    </p>

                                    <p className="mt-2 text-[10px] text-coffee-400">
                                        {dateFormatter.format(new Date(order.createdAt))}
                                    </p>
                                </div>

                                <Link
                                    href={`/admin/orders/${order._id}`}
                                    aria-label={`مشاهده سفارش ${order.orderNumber}`}
                                    className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600"
                                >
                                    <FiEye />
                                </Link>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${orderStatus.className}`}
                                >
                                    {orderStatus.title}
                                </span>

                                <span
                                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${paymentStatus.className}`}
                                >
                                    {paymentStatus.title}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-white p-3">
                                    <p className="flex items-center gap-2 text-[10px] text-coffee-400">
                                        <FiPackage />
                                        تعداد محصول
                                    </p>

                                    <p className="mt-1 text-sm font-black text-coffee-950">
                                        {getItemsCount(order.items).toLocaleString("fa-IR")}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white p-3">
                                    <p className="flex items-center gap-2 text-[10px] text-coffee-400">
                                        <FiCoffee />
                                        مبلغ
                                    </p>

                                    <p className="mt-1 text-xs font-black text-coffee-950">
                                        {priceFormatter.format(Number(order.pricing?.total || 0))}{" "}
                                        تومان
                                    </p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <UserOrdersPagination pagination={pagination} />
        </>
    );
}
