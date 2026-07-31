import Link from "next/link";

import { redirect } from "next/navigation";

import {
    FiArchive,
    FiArrowLeft,
    FiBox,
    FiCheckCircle,
    FiClock,
    FiEdit3,
    FiFileText,
    FiGrid,
    FiPlus,
    FiStar,
    FiUsers,
} from "react-icons/fi";

import getDashboardData from "@/lib/admin/getDashboardData";

export const metadata = {
    title: "داشبورد",
};

const priceFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

const productStatusConfig = {
    published: {
        title: "منتشرشده",
        className: "bg-emerald-50 text-emerald-700",
    },

    draft: {
        title: "پیش‌نویس",
        className: "bg-amber-50 text-amber-700",
    },

    archived: {
        title: "بایگانی‌شده",
        className: "bg-slate-100 text-slate-600",
    },
};

function StatCard({ title, value, description, icon: Icon, iconClassName }) {
    return (
        <article className="relative overflow-hidden rounded-[1.5rem] border border-coffee-100 bg-white p-5 shadow-[0_12px_40px_rgba(48,32,26,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(48,32,26,0.10)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-coffee-400">{title}</p>

                    <p className="mt-3 text-3xl font-black text-coffee-950">
                        {value.toLocaleString("fa-IR")}
                    </p>

                    <p className="mt-2 text-xs leading-6 text-coffee-500">{description}</p>
                </div>

                <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
                >
                    <Icon size={21} />
                </span>
            </div>
        </article>
    );
}

export default async function AdminDashboardPage() {
    const dashboardData = await getDashboardData();

    if (!dashboardData) {
        redirect("/login?next=/admin");
    }

    const { currentUser, stats, recentProducts } = dashboardData;

    const publicationPercent =
        stats.totalProducts > 0
            ? Math.round((stats.publishedProducts / stats.totalProducts) * 100)
            : 0;

    return (
        <div className="space-y-8">
            {/* Welcome */}

            <section className="relative overflow-hidden rounded-[2rem] bg-coffee-950 p-6 text-white shadow-[0_25px_70px_rgba(48,32,26,0.22)] sm:p-8">
                <div
                    aria-hidden="true"
                    className="absolute -right-24 -top-32 size-80 rounded-full bg-caramel-500/20 blur-3xl"
                />

                <div
                    aria-hidden="true"
                    className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/10 blur-3xl"
                />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-xs font-bold text-caramel-300">داشبورد مدیریت</p>

                        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                            سلام {currentUser.name}
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-8 text-white/55">
                            وضعیت محصولات، کاربران و محتوای ممد کافی را از این قسمت مدیریت کنید.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/admin/products"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-black text-coffee-950 transition hover:-translate-y-0.5"
                        >
                            <FiPlus />
                            مدیریت محصولات
                        </Link>

                        <Link
                            href="/admin/categories"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-black text-white transition hover:bg-white/10"
                        >
                            <FiGrid />
                            دسته‌بندی‌ها
                        </Link>
                    </div>
                </div>
            </section>

            {/* Statistics */}

            <section>
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <p className="text-xs font-bold text-caramel-600">نمای کلی</p>

                        <h2 className="mt-1 text-2xl font-black text-coffee-950">آمار سامانه</h2>
                    </div>

                    <p className="hidden text-xs text-coffee-400 sm:block">
                        اطلاعات مستقیم از MongoDB
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="تمام محصولات"
                        value={stats.totalProducts}
                        description="مجموع محصولات ثبت‌شده"
                        icon={FiBox}
                        iconClassName="bg-coffee-100 text-coffee-700"
                    />

                    <StatCard
                        title="محصولات منتشرشده"
                        value={stats.publishedProducts}
                        description="قابل مشاهده در سایت"
                        icon={FiCheckCircle}
                        iconClassName="bg-emerald-50 text-emerald-700"
                    />

                    <StatCard
                        title="پیش‌نویس‌ها"
                        value={stats.draftProducts}
                        description="در انتظار تکمیل و انتشار"
                        icon={FiFileText}
                        iconClassName="bg-amber-50 text-amber-700"
                    />

                    <StatCard
                        title="کاربران فعال"
                        value={stats.activeUsers}
                        description={`از ${stats.totalUsers.toLocaleString("fa-IR")} کاربر ثبت‌شده`}
                        icon={FiUsers}
                        iconClassName="bg-blue-50 text-blue-700"
                    />

                    <StatCard
                        title="دسته‌بندی‌ها"
                        value={stats.totalCategories}
                        description="ساختار منوی فروشگاه"
                        icon={FiGrid}
                        iconClassName="bg-violet-50 text-violet-700"
                    />

                    <StatCard
                        title="محصولات موجود"
                        value={stats.availableProducts}
                        description="آماده ثبت سفارش"
                        icon={FiClock}
                        iconClassName="bg-cyan-50 text-cyan-700"
                    />

                    <StatCard
                        title="محصولات ویژه"
                        value={stats.featuredProducts}
                        description="انتخاب‌شده برای نمایش ویژه"
                        icon={FiStar}
                        iconClassName="bg-caramel-50 text-caramel-700"
                    />

                    <StatCard
                        title="آرشیوشده‌ها"
                        value={stats.archivedProducts}
                        description="محصولات بایگانی‌شده"
                        icon={FiArchive}
                        iconClassName="bg-slate-100 text-slate-600"
                    />
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                {/* Recent products */}

                <div className="overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
                    <div className="flex items-center justify-between border-b border-coffee-100 p-5 sm:p-6">
                        <div>
                            <h2 className="text-lg font-black text-coffee-950">محصولات اخیر</h2>

                            <p className="mt-1 text-xs text-coffee-400">آخرین محصولات ثبت‌شده</p>
                        </div>

                        <Link
                            href="/admin/products"
                            className="group inline-flex items-center gap-2 text-xs font-bold text-coffee-600 transition hover:text-caramel-600"
                        >
                            مشاهده همه
                            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                        </Link>
                    </div>

                    {recentProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-right">
                                <thead>
                                    <tr className="border-b border-coffee-100 bg-cream-50 text-[11px] text-coffee-400">
                                        <th className="px-6 py-4 font-bold">محصول</th>

                                        <th className="px-4 py-4 font-bold">دسته‌بندی</th>

                                        <th className="px-4 py-4 font-bold">قیمت</th>

                                        <th className="px-4 py-4 font-bold">وضعیت</th>

                                        <th className="px-6 py-4 font-bold">تاریخ ثبت</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentProducts.map((product) => {
                                        const status =
                                            productStatusConfig[product.status] ||
                                            productStatusConfig.draft;

                                        return (
                                            <tr
                                                key={product._id.toString()}
                                                className="border-b border-coffee-100 last:border-b-0 hover:bg-cream-50/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-black text-coffee-950">
                                                            {product.name}
                                                        </p>

                                                        <p
                                                            className="mt-1 text-[10px] text-coffee-400"
                                                            dir="ltr"
                                                        >
                                                            {product.slug}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                                    {product.category?.title || "بدون دسته‌بندی"}
                                                </td>

                                                <td className="px-4 py-4 text-xs font-black text-coffee-900">
                                                    {priceFormatter.format(product.price)}
                                                    <span className="mr-1 text-[10px] font-medium text-coffee-400">
                                                        تومان
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                                                    >
                                                        {status.title}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-xs text-coffee-500">
                                                    {dateFormatter.format(
                                                        new Date(product.createdAt),
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                            <span className="flex size-16 items-center justify-center rounded-full bg-cream-100 text-coffee-600">
                                <FiBox size={25} />
                            </span>

                            <p className="mt-4 text-sm font-black text-coffee-950">
                                هنوز محصولی ثبت نشده است
                            </p>

                            <Link
                                href="/admin/products"
                                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-caramel-600"
                            >
                                مدیریت محصولات
                                <FiArrowLeft />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Summary */}

                <aside className="space-y-5">
                    <div className="rounded-[2rem] border border-coffee-100 bg-white p-6 shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
                        <h2 className="text-lg font-black text-coffee-950">وضعیت انتشار</h2>

                        <p className="mt-2 text-xs leading-6 text-coffee-400">
                            درصد محصولات منتشرشده نسبت به کل محصولات
                        </p>

                        <div className="mt-6 flex items-end justify-between">
                            <p className="text-4xl font-black text-coffee-950">
                                ٪{publicationPercent.toLocaleString("fa-IR")}
                            </p>

                            <span className="text-xs font-bold text-coffee-400">
                                {stats.publishedProducts.toLocaleString("fa-IR")} از{" "}
                                {stats.totalProducts.toLocaleString("fa-IR")}
                            </span>
                        </div>

                        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-coffee-100">
                            <div
                                className="h-full rounded-full bg-caramel-500 transition-all"
                                style={{
                                    width: `${publicationPercent}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="rounded-[2rem] bg-coffee-900 p-6 text-white shadow-[0_20px_55px_rgba(48,32,26,0.18)]">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-caramel-300">
                            <FiEdit3 size={21} />
                        </div>

                        <h2 className="mt-5 text-lg font-black">مرحله بعدی پنل</h2>

                        <p className="mt-3 text-xs leading-7 text-white/50">
                            فرم ثبت، ویرایش، بایگانی و مدیریت کامل محصولات را روی همین داشبورد پیاده
                            می‌کنیم.
                        </p>

                        <Link
                            href="/admin/products"
                            className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-caramel-300"
                        >
                            ورود به محصولات
                            <FiArrowLeft />
                        </Link>
                    </div>
                </aside>
            </section>
        </div>
    );
}
