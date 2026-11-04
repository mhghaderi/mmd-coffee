import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import {
    FiArrowRight,
    FiBox,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiHash,
    FiHome,
    FiMail,
    FiMapPin,
    FiPackage,
    FiPhone,
    FiShoppingBag,
    FiTruck,
    FiUser,
    FiXCircle,
} from "react-icons/fi";

import OrderActions from "@/components/admin/orders/OrderActions";
import OrderHistory from "@/components/admin/orders/OrderHistory";
import OrderPrintButton from "@/components/admin/orders/OrderPrintButton";

import {
    deliveryMethodLabels,
    orderStatusConfig,
    paymentMethodLabels,
    paymentStatusConfig,
} from "@/constants/order-ui";

import getAdminOrderDetails from "@/lib/admin/orders/getAdminOrderDetails";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "جزئیات سفارش",
};

const priceFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function Price({ value, className = "" }) {
    return (
        <span className={className}>
            {priceFormatter.format(Number(value) || 0)}

            <span className="mr-1 text-[10px] font-medium text-coffee-400">تومان</span>
        </span>
    );
}

function InformationRow({ icon: Icon, title, value, dir }) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-cream-50 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-coffee-600 shadow-sm">
                <Icon />
            </span>

            <div className="min-w-0">
                <p className="text-[10px] font-bold text-coffee-400">{title}</p>

                <p
                    dir={dir}
                    className="mt-1 break-words text-xs font-black leading-6 text-coffee-900"
                >
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

function SectionCard({ title, description, icon: Icon, children, className = "" }) {
    return (
        <section
            className={`overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)] ${className}`}
        >
            <header className="flex items-start gap-3 border-b border-coffee-100 px-5 py-5 sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-coffee-100 text-coffee-700">
                    <Icon size={19} />
                </span>

                <div>
                    <h2 className="text-base font-black text-coffee-950">{title}</h2>

                    {description && (
                        <p className="mt-1 text-xs leading-6 text-coffee-400">{description}</p>
                    )}
                </div>
            </header>

            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

export default async function AdminOrderDetailsPage({ params }) {
    const { id } = await params;

    const result = await getAdminOrderDetails(id);

    if (!result.authorized) {
        redirect(`/login?next=/admin/orders/${encodeURIComponent(id)}`);
    }

    if (!result.order) {
        notFound();
    }

    const order = result.order;

    const orderStatus = orderStatusConfig[order.status] || {
        title: order.status,
        className: "bg-slate-100 text-slate-600",
    };

    const paymentStatus = paymentStatusConfig[order.payment.status] || {
        title: order.payment.status,
        className: "bg-slate-100 text-slate-600",
    };

    const itemsQuantity = order.items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
    );

    const fullAddress = [
        order.delivery.province,
        order.delivery.city,
        order.delivery.addressLine,
        order.delivery.plaque ? `پلاک ${order.delivery.plaque}` : "",
        order.delivery.unit ? `واحد ${order.delivery.unit}` : "",
    ]
        .filter(Boolean)
        .join("، ");

    return (
        <div className="space-y-7">

            <section className="flex flex-col gap-5 print:hidden sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 text-xs font-bold text-coffee-500 transition hover:text-coffee-950"
                    >
                        <FiArrowRight />
                        بازگشت به سفارش‌ها
                    </Link>

                    <p className="mt-5 text-xs font-bold text-caramel-600">جزئیات سفارش</p>

                    <h1 dir="ltr" className="mt-2 text-right text-3xl font-black text-coffee-950">
                        {order.orderNumber}
                    </h1>

                    <p className="mt-3 text-sm text-coffee-500">
                        ثبت‌شده در {dateFormatter.format(new Date(order.createdAt))}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${orderStatus.className}`}
                    >
                        {orderStatus.title}
                    </span>

                    <OrderPrintButton />

                    <OrderActions order={order} />
                </div>
            </section>

            <section className="hidden border-b border-coffee-200 pb-5 print:block">
                <p className="text-sm font-black">ممد کافی | MMD Coffee</p>

                <h1 dir="ltr" className="mt-3 text-right text-2xl font-black">
                    {order.orderNumber}
                </h1>

                <p className="mt-2 text-xs">{dateFormatter.format(new Date(order.createdAt))}</p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-coffee-100 text-coffee-700">
                        <FiShoppingBag size={20} />
                    </span>

                    <div>
                        <p className="text-[10px] font-bold text-coffee-400">تعداد محصولات</p>

                        <p className="mt-1 text-xl font-black text-coffee-950">
                            {itemsQuantity.toLocaleString("fa-IR")}
                        </p>
                    </div>
                </article>

                <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-caramel-50 text-caramel-700">
                        <FiCreditCard size={20} />
                    </span>

                    <div>
                        <p className="text-[10px] font-bold text-coffee-400">مبلغ نهایی</p>

                        <Price
                            value={order.pricing.total}
                            className="mt-1 block text-xl font-black text-coffee-950"
                        />
                    </div>
                </article>

                <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <FiTruck size={20} />
                    </span>

                    <div>
                        <p className="text-[10px] font-bold text-coffee-400">روش تحویل</p>

                        <p className="mt-1 text-sm font-black text-coffee-950">
                            {deliveryMethodLabels[order.delivery.method] || order.delivery.method}
                        </p>
                    </div>
                </article>

                <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4">
                    <span
                        className={`flex size-12 items-center justify-center rounded-2xl ${paymentStatus.className}`}
                    >
                        <FiCheckCircle size={20} />
                    </span>

                    <div>
                        <p className="text-[10px] font-bold text-coffee-400">وضعیت پرداخت</p>

                        <p className="mt-1 text-sm font-black text-coffee-950">
                            {paymentStatus.title}
                        </p>
                    </div>
                </article>
            </section>

            <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">

                <div className="space-y-7">

                    <SectionCard
                        title="محصولات سفارش"
                        description="قیمت‌ها هنگام ثبت سفارش از دیتابیس ذخیره شده‌اند"
                        icon={FiPackage}
                    >
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <article
                                    key={item._id || `${item.product}-${index}`}
                                    className="rounded-2xl border border-coffee-100 bg-cream-50 p-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="size-full object-contain p-2"
                                                />
                                            ) : (
                                                <FiBox size={25} className="text-coffee-300" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-black text-coffee-950">
                                                        {item.name}
                                                    </p>

                                                    {item.englishName && (
                                                        <p
                                                            dir="ltr"
                                                            className="mt-1 text-right text-[10px] text-coffee-400"
                                                        >
                                                            {item.englishName}
                                                        </p>
                                                    )}
                                                </div>

                                                <Price
                                                    value={item.lineTotal}
                                                    className="text-sm font-black text-coffee-950"
                                                />
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-coffee-600">
                                                    تعداد: {item.quantity.toLocaleString("fa-IR")}
                                                </span>

                                                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-coffee-600">
                                                    قیمت واحد:{" "}
                                                    {priceFormatter.format(item.unitPrice)} تومان
                                                </span>

                                                {item.discountPercent > 0 && (
                                                    <span className="rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-600">
                                                        ٪
                                                        {item.discountPercent.toLocaleString(
                                                            "fa-IR",
                                                        )}{" "}
                                                        تخفیف
                                                    </span>
                                                )}
                                            </div>

                                            {item.variant?.title && (
                                                <div className="mt-4 rounded-xl bg-white p-3">
                                                    <p className="text-[10px] text-coffee-400">
                                                        مدل انتخاب‌شده
                                                    </p>

                                                    <p className="mt-1 text-xs font-black text-coffee-800">
                                                        {item.variant.title}

                                                        {item.variant.priceAdjustment > 0 && (
                                                            <span className="mr-2 font-medium text-coffee-400">
                                                                +
                                                                {priceFormatter.format(
                                                                    item.variant.priceAdjustment,
                                                                )}{" "}
                                                                تومان
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {item.addOns?.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-coffee-400">
                                                        افزودنی‌ها
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {item.addOns.map((addOn, addOnIndex) => (
                                                            <span
                                                                key={
                                                                    addOn.originalId ||
                                                                    `${addOn.title}-${addOnIndex}`
                                                                }
                                                                className="rounded-full bg-caramel-50 px-3 py-1.5 text-[10px] font-bold text-caramel-700"
                                                            >
                                                                {addOn.title} +
                                                                {priceFormatter.format(addOn.price)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="صورتحساب"
                        description="خلاصه مالی سفارش"
                        icon={FiCreditCard}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-coffee-500">جمع محصولات</span>

                                <Price
                                    value={order.pricing.subtotal}
                                    className="font-black text-coffee-900"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-coffee-500">هزینه ارسال</span>

                                {order.pricing.deliveryFee > 0 ? (
                                    <Price
                                        value={order.pricing.deliveryFee}
                                        className="font-black text-coffee-900"
                                    />
                                ) : (
                                    <span className="font-black text-emerald-700">رایگان</span>
                                )}
                            </div>

                            {order.pricing.discountAmount > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-coffee-500">تخفیف سفارش</span>

                                    <span className="font-black text-red-600">
                                        -{priceFormatter.format(order.pricing.discountAmount)} تومان
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-coffee-100 pt-5">
                                <span className="text-sm font-black text-coffee-950">
                                    مبلغ قابل پرداخت
                                </span>

                                <Price
                                    value={order.pricing.total}
                                    className="text-xl font-black text-coffee-950"
                                />
                            </div>
                        </div>
                    </SectionCard>

                    <div className="grid gap-7 lg:grid-cols-2">
                        <SectionCard title="تاریخچه سفارش" icon={FiClock}>
                            <OrderHistory history={order.statusHistory} type="order" />
                        </SectionCard>

                        <SectionCard title="تاریخچه پرداخت" icon={FiCreditCard}>
                            <OrderHistory
                                history={order.paymentHistory}
                                type="payment"
                                emptyMessage="هنوز تغییر پرداختی ثبت نشده است"
                            />
                        </SectionCard>
                    </div>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-28">
                    <SectionCard title="اطلاعات مشتری" icon={FiUser}>
                        <div className="space-y-3">
                            <InformationRow
                                icon={FiUser}
                                title="نام مشتری"
                                value={order.customer.fullName}
                            />

                            <InformationRow
                                icon={FiPhone}
                                title="شماره تماس"
                                value={order.customer.phone}
                                dir="ltr"
                            />

                            <InformationRow
                                icon={FiMail}
                                title="ایمیل"
                                value={order.customer.email}
                                dir="ltr"
                            />

                            <InformationRow
                                icon={FiHome}
                                title="نوع حساب"
                                value={order.user ? "کاربر عضو" : "مهمان"}
                            />

                            {order.user && (
                                <InformationRow
                                    icon={FiCalendar}
                                    title="عضویت کاربر"
                                    value={
                                        order.user.createdAt
                                            ? dateFormatter.format(new Date(order.user.createdAt))
                                            : "—"
                                    }
                                />
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard title="اطلاعات تحویل" icon={FiTruck}>
                        <div className="space-y-3">
                            <InformationRow
                                icon={FiTruck}
                                title="روش تحویل"
                                value={
                                    deliveryMethodLabels[order.delivery.method] ||
                                    order.delivery.method
                                }
                            />

                            {order.delivery.method === "delivery" && (
                                <>
                                    <InformationRow
                                        icon={FiMapPin}
                                        title="آدرس کامل"
                                        value={fullAddress}
                                    />

                                    <InformationRow
                                        icon={FiHash}
                                        title="کد پستی"
                                        value={order.delivery.postalCode}
                                        dir="ltr"
                                    />
                                </>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard title="اطلاعات پرداخت" icon={FiCreditCard}>
                        <div className="space-y-3">
                            <InformationRow
                                icon={FiCreditCard}
                                title="روش پرداخت"
                                value={
                                    paymentMethodLabels[order.payment.method] ||
                                    order.payment.method
                                }
                            />

                            <div className="rounded-xl bg-cream-50 p-4">
                                <p className="text-[10px] font-bold text-coffee-400">وضعیت</p>

                                <span
                                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${paymentStatus.className}`}
                                >
                                    {paymentStatus.title}
                                </span>
                            </div>

                            {order.payment.transactionId && (
                                <InformationRow
                                    icon={FiHash}
                                    title="شناسه تراکنش"
                                    value={order.payment.transactionId}
                                    dir="ltr"
                                />
                            )}

                            {order.payment.paidAt && (
                                <InformationRow
                                    icon={FiCalendar}
                                    title="زمان پرداخت"
                                    value={dateFormatter.format(new Date(order.payment.paidAt))}
                                />
                            )}
                        </div>
                    </SectionCard>

                    {(order.customerNote || order.adminNote) && (
                        <SectionCard title="یادداشت‌ها" icon={FiClock}>
                            <div className="space-y-4">
                                {order.customerNote && (
                                    <div className="rounded-xl bg-cream-50 p-4">
                                        <p className="text-[10px] font-bold text-coffee-400">
                                            یادداشت مشتری
                                        </p>

                                        <p className="mt-2 text-xs leading-7 text-coffee-700">
                                            {order.customerNote}
                                        </p>
                                    </div>
                                )}

                                {order.adminNote && (
                                    <div className="rounded-xl bg-caramel-50 p-4">
                                        <p className="text-[10px] font-bold text-caramel-700">
                                            یادداشت مدیریت
                                        </p>

                                        <p className="mt-2 text-xs leading-7 text-coffee-700">
                                            {order.adminNote}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {order.status === "cancelled" && (
                        <section className="rounded-[1.75rem] border border-red-100 bg-red-50 p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-xl bg-white text-red-600">
                                    <FiXCircle />
                                </span>

                                <div>
                                    <p className="text-sm font-black text-red-700">
                                        سفارش لغو شده است
                                    </p>

                                    {order.cancelledAt && (
                                        <p className="mt-1 text-[10px] text-red-500">
                                            {dateFormatter.format(new Date(order.cancelledAt))}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <p className="mt-4 text-xs leading-7 text-red-700">
                                {order.cancellationReason || "دلیلی ثبت نشده است"}
                            </p>

                            {order.inventoryRestored && (
                                <p className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-700">
                                    <FiCheckCircle />
                                    موجودی محصولات بازگردانده شده است
                                </p>
                            )}
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}
