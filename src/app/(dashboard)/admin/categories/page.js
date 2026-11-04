import { redirect } from "next/navigation";

import { FiCheckCircle, FiFolder, FiPackage, FiSlash } from "react-icons/fi";

import CategoriesManager from "@/components/admin/categories/CategoriesManager";

import getAdminCategories from "@/lib/admin/categories/getAdminCategories";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "مدیریت دسته‌بندی‌ها",
};

function StatCard({ title, value, icon: Icon, className }) {
    return (
        <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <span className={`flex size-12 items-center justify-center rounded-2xl ${className}`}>
                <Icon size={20} />
            </span>

            <div>
                <p className="text-[11px] font-bold text-coffee-400">{title}</p>

                <p className="mt-1 text-2xl font-black text-coffee-950">
                    {value.toLocaleString("fa-IR")}
                </p>
            </div>
        </article>
    );
}

export default async function AdminCategoriesPage() {
    const data = await getAdminCategories();

    if (!data) {
        redirect("/login?next=/admin/categories");
    }

    return (
        <div className="space-y-7">
            <section>
                <p className="text-xs font-bold text-caramel-600">مدیریت فروشگاه</p>

                <h1 className="mt-2 text-3xl font-black text-coffee-950">دسته‌بندی‌های ممد کافی</h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                    دسته‌بندی‌های فروشگاه را ایجاد، ویرایش، مرتب یا حذف کن.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="تمام دسته‌بندی‌ها"
                    value={data.stats.total}
                    icon={FiFolder}
                    className="bg-coffee-100 text-coffee-700"
                />

                <StatCard
                    title="فعال"
                    value={data.stats.active}
                    icon={FiCheckCircle}
                    className="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                    title="غیرفعال"
                    value={data.stats.inactive}
                    icon={FiSlash}
                    className="bg-amber-50 text-amber-700"
                />

                <StatCard
                    title="محصولات متصل"
                    value={data.stats.assignedProducts}
                    icon={FiPackage}
                    className="bg-caramel-50 text-caramel-700"
                />
            </section>

            <CategoriesManager initialCategories={data.categories} />
        </div>
    );
}
