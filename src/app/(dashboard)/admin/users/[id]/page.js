import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
    FiActivity,
    FiArrowRight,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiDollarSign,
    FiHeart,
    FiMail,
    FiPackage,
    FiPhone,
    FiShield,
    FiShoppingBag,
    FiUser,
    FiUserCheck,
    FiUserX,
} from "react-icons/fi";

import UserActions from "@/components/admin/users/UserActions";
import UserOrdersTable from "@/components/admin/users/UserOrdersTable";

import getAdminUserDetails from "@/lib/admin/users/getAdminUserDetails";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "جزئیات کاربر",
};

const priceFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function formatDate(value, withTime = false) {
    if (!value) {
        return "ثبت نشده";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "ثبت نشده";
    }

    return withTime ? dateTimeFormatter.format(date) : dateFormatter.format(date);
}

function Avatar({ user }) {
    if (user.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.name}
                className="size-24 rounded-[1.75rem] object-cover shadow-sm"
            />
        );
    }

    return (
        <span className="flex size-24 items-center justify-center rounded-[1.75rem] bg-coffee-900 text-3xl font-black text-white shadow-sm">
            {user.name?.trim()?.charAt(0) || "ک"}
        </span>
    );
}

function StatCard({ title, value, suffix, icon: Icon, className }) {
    return (
        <article className="flex min-w-0 items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${className}`}
            >
                <Icon size={20} />
            </span>

            <div className="min-w-0">
                <p className="text-[10px] font-bold text-coffee-400">{title}</p>

                <p className="mt-1 truncate text-xl font-black text-coffee-950">
                    {priceFormatter.format(Number(value || 0))}

                    {suffix && (
                        <span className="mr-1 text-[9px] font-medium text-coffee-400">
                            {suffix}
                        </span>
                    )}
                </p>
            </div>
        </article>
    );
}

function SectionCard({ title, description, icon: Icon, children }) {
    return (
        <section className="overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)]">
            <header className="flex items-start gap-3 border-b border-coffee-100 px-5 py-5 sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-coffee-100 text-coffee-700">
                    <Icon size={19} />
                </span>

                <div>
                    <h2 className="text-base font-black text-coffee-950">{title}</h2>

                    {description && (
                        <p className="mt-1 text-xs leading-6 text-coffee-400">
                            {description}
                        </p>
                    )}
                </div>
            </header>

            <div className="p-5 sm:p-6">{children}</div>
        </section>
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

export default async function AdminUserDetailsPage({ params, searchParams }) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;

    const data = await getAdminUserDetails(id, resolvedSearchParams);

    if (!data.authorized) {
        redirect(`/login?next=/admin/users/${encodeURIComponent(id)}`);
    }

    if (!data.user) {
        notFound();
    }

    const { user, summary, topProducts, orders, orderPagination, currentUser } = data;
    const isCurrentAdmin = user._id === currentUser.id;

    return (
        <div className="space-y-7">
            <section>
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-xs font-bold text-coffee-500 transition hover:text-coffee-950"
                >
                    <FiArrowRight />
                    بازگشت به کاربران
                </Link>

                <div className="mt-5 flex flex-col gap-5 rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-[0_16px_55px_rgba(48,32,26,0.06)] sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <Avatar user={user} />

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-black text-coffee-950 sm:text-3xl">
                                    {user.name}
                                </h1>

                                {isCurrentAdmin && (
                                    <span className="rounded-full bg-caramel-50 px-3 py-1 text-[10px] font-bold text-caramel-700">
                                        حساب فعلی شما
                                    </span>
                                )}
                            </div>

                            <p
                                dir="ltr"
                                className="mt-2 break-all text-right text-xs text-coffee-400"
                            >
                                {user.email}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                        user.role === "admin"
                                            ? "bg-caramel-50 text-caramel-700"
                                            : "bg-coffee-100 text-coffee-600"
                                    }`}
                                >
                                    {user.role === "admin" ? <FiShield /> : <FiUser />}
                                    {user.role === "admin" ? "مدیر" : "کاربر"}
                                </span>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                        user.isActive
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    {user.isActive ? <FiUserCheck /> : <FiUserX />}
                                    {user.isActive ? "حساب فعال" : "حساب غیرفعال"}
                                </span>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                        user.emailVerified
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                    <FiMail />
                                    {user.emailVerified ? "ایمیل تأییدشده" : "ایمیل تأییدنشده"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <UserActions user={user} currentAdminId={currentUser.id} />
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <StatCard
                    title="تمام سفارش‌ها"
                    value={summary.orderCount}
                    icon={FiShoppingBag}
                    className="bg-coffee-100 text-coffee-700"
                />

                <StatCard
                    title="سفارش تکمیل‌شده"
                    value={summary.completedOrderCount}
                    icon={FiCheckCircle}
                    className="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                    title="سفارش در جریان"
                    value={summary.activeOrderCount}
                    icon={FiActivity}
                    className="bg-blue-50 text-blue-700"
                />

                <StatCard
                    title="محصول خریداری‌شده"
                    value={summary.purchasedItems}
                    icon={FiPackage}
                    className="bg-violet-50 text-violet-700"
                />

                <StatCard
                    title="مجموع خرید موفق"
                    value={summary.totalSpent}
                    suffix="تومان"
                    icon={FiDollarSign}
                    className="bg-caramel-50 text-caramel-700"
                />

                <StatCard
                    title="میانگین سفارش موفق"
                    value={summary.averageCompletedOrder}
                    suffix="تومان"
                    icon={FiCreditCard}
                    className="bg-amber-50 text-amber-700"
                />
            </section>

            <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-7">
                    <SectionCard
                        title="سفارش‌های کاربر"
                        description={`${orderPagination.total.toLocaleString("fa-IR")} سفارش متصل به این حساب`}
                        icon={FiShoppingBag}
                    >
                        <UserOrdersTable orders={orders} pagination={orderPagination} />
                    </SectionCard>

                    <SectionCard
                        title="محصولات پرتکرار"
                        description="محصولاتی که این کاربر بیشتر از بقیه سفارش داده است"
                        icon={FiHeart}
                    >
                        {topProducts.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {topProducts.map((product, index) => (
                                    <article
                                        key={`${product.productId || product.slug}-${index}`}
                                        className="flex items-center gap-4 rounded-2xl border border-coffee-100 bg-cream-50 p-4"
                                    >
                                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="size-full object-contain p-2"
                                                />
                                            ) : (
                                                <FiPackage className="text-coffee-300" size={23} />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-black text-coffee-950">
                                                {product.name}
                                            </p>

                                            <p className="mt-2 text-[10px] font-bold text-coffee-400">
                                                {Number(product.quantity || 0).toLocaleString("fa-IR")}{" "}
                                                عدد سفارش داده شده
                                            </p>

                                            <p className="mt-1 text-xs font-black text-caramel-700">
                                                {priceFormatter.format(Number(product.revenue || 0))}{" "}
                                                تومان
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-coffee-200 bg-cream-50 px-5 py-10 text-center">
                                <FiPackage className="mx-auto text-2xl text-coffee-300" />
                                <p className="mt-3 text-sm font-bold text-coffee-500">
                                    هنوز محصول پرتکراری وجود ندارد
                                </p>
                            </div>
                        )}
                    </SectionCard>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-28">
                    <SectionCard title="اطلاعات حساب" icon={FiUser}>
                        <div className="space-y-3">
                            <InformationRow icon={FiUser} title="نام" value={user.name} />
                            <InformationRow
                                icon={FiMail}
                                title="ایمیل"
                                value={user.email}
                                dir="ltr"
                            />
                            <InformationRow
                                icon={FiPhone}
                                title="شماره تماس"
                                value={user.phone || "ثبت نشده"}
                                dir="ltr"
                            />
                            <InformationRow
                                icon={FiShield}
                                title="نقش حساب"
                                value={user.role === "admin" ? "مدیر" : "کاربر عادی"}
                            />
                        </div>
                    </SectionCard>

                    <SectionCard title="فعالیت حساب" icon={FiClock}>
                        <div className="space-y-3">
                            <InformationRow
                                icon={FiCalendar}
                                title="تاریخ عضویت"
                                value={formatDate(user.createdAt)}
                            />
                            <InformationRow
                                icon={FiClock}
                                title="آخرین ورود"
                                value={formatDate(user.lastLoginAt, true)}
                            />
                            <InformationRow
                                icon={FiShoppingBag}
                                title="اولین سفارش"
                                value={formatDate(summary.firstOrderAt, true)}
                            />
                            <InformationRow
                                icon={FiActivity}
                                title="آخرین سفارش"
                                value={formatDate(summary.lastOrderAt, true)}
                            />
                        </div>
                    </SectionCard>

                    {summary.cancelledOrderCount > 0 && (
                        <section className="rounded-[1.75rem] border border-red-100 bg-red-50 p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-xl bg-white text-red-600">
                                    <FiUserX />
                                </span>

                                <div>
                                    <p className="text-sm font-black text-red-700">
                                        سفارش‌های لغوشده
                                    </p>

                                    <p className="mt-1 text-xs text-red-500">
                                        {summary.cancelledOrderCount.toLocaleString("fa-IR")} سفارش
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}
