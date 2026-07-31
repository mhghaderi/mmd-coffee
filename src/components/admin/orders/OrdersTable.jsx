import Link from "next/link";
import { FiEye, FiShoppingBag } from "react-icons/fi";
import OrderActions from "@/components/admin/orders/OrderActions";

import { deliveryMethodLabels, orderStatusConfig, paymentStatusConfig } from "@/constants/order-ui";

const priceFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default function OrdersTable({ orders }) {
    if (orders.length === 0) {
        return (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[2rem] border border-dashed border-coffee-200 bg-white text-center">
                <FiShoppingBag size={32} className="text-coffee-300" />

                <h2 className="mt-5 text-xl font-black text-coffee-950">سفارشی پیدا نشد</h2>

                <p className="mt-2 text-sm text-coffee-400">جست‌وجو یا فیلترها را تغییر بده.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-right">
                    <thead className="border-b border-coffee-100 bg-cream-50 text-[11px] text-coffee-400">
                        <tr>
                            <th className="px-5 py-4">سفارش</th>

                            <th className="px-4 py-4">مشتری</th>

                            <th className="px-4 py-4">محصولات</th>

                            <th className="px-4 py-4">مبلغ</th>

                            <th className="px-4 py-4">وضعیت</th>

                            <th className="px-4 py-4">پرداخت</th>

                            <th className="px-4 py-4">تحویل</th>

                            <th className="px-4 py-4">تاریخ</th>

                            <th className="px-5 py-4">عملیات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order) => {
                            const itemsCount = order.items.reduce(
                                (total, item) => total + item.quantity,
                                0,
                            );

                            const orderStatus = orderStatusConfig[order.status];

                            const paymentStatus = paymentStatusConfig[order.payment.status];

                            return (
                                <tr
                                    key={order._id}
                                    className="border-b border-coffee-100 last:border-0 hover:bg-cream-50/60"
                                >
                                    <td className="px-5 py-4">
                                        <p dir="ltr" className="text-xs font-black text-coffee-950">
                                            {order.orderNumber}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-xs font-black text-coffee-900">
                                            {order.customer.fullName}
                                        </p>

                                        <p dir="ltr" className="mt-1 text-[10px] text-coffee-400">
                                            {order.customer.phone}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                        {itemsCount.toLocaleString("fa-IR")} محصول
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-coffee-900">
                                        {priceFormatter.format(order.pricing.total)}
                                        <span className="mr-1 text-[9px] font-medium text-coffee-400">
                                            تومان
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${orderStatus.className}`}
                                        >
                                            {orderStatus.title}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${paymentStatus.className}`}
                                        >
                                            {paymentStatus.title}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                        {deliveryMethodLabels[order.delivery.method]}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-[10px] text-coffee-500">
                                        {dateFormatter.format(new Date(order.createdAt))}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                aria-label={`مشاهده سفارش ${order.orderNumber}`}
                                                className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                                            >
                                                <FiEye />
                                            </Link>

                                            <OrderActions order={order} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
