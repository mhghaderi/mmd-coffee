import { FiBox, FiCheckCircle, FiFileText } from "react-icons/fi";

import ProductFilters from "@/components/admin/products/ProductFilters";
import ProductsPagination from "@/components/admin/products/ProductsPagination";
import ProductsTable from "@/components/admin/products/ProductsTable";

import getAdminProducts from "@/lib/admin/products/getAdminProducts";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "مدیریت محصولات",
};

function StatCard({ title, value, icon: Icon, className }) {
    return (
        <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${className}`}
            >
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

export default async function AdminProductsPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;

    const { products, categories, pagination, stats } =
        await getAdminProducts(resolvedSearchParams);

    const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

    const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="space-y-7">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">مدیریت فروشگاه</p>

                    <h1 className="mt-2 text-3xl font-black text-coffee-950">محصولات ممد کافی</h1>

                    <p className="mt-3 text-sm leading-7 text-coffee-500">
                        محصولات را ایجاد، ویرایش، منتشر یا بایگانی کن و وضعیت موجودی آن‌ها را مدیریت
                        کن.
                    </p>
                </div>

                <p className="text-xs font-bold text-coffee-400">
                    نمایش {startItem.toLocaleString("fa-IR")} تا {endItem.toLocaleString("fa-IR")}{" "}
                    از {pagination.total.toLocaleString("fa-IR")} نتیجه
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title="تمام محصولات"
                    value={stats.totalProducts}
                    icon={FiBox}
                    className="bg-coffee-100 text-coffee-700"
                />

                <StatCard
                    title="منتشرشده"
                    value={stats.publishedProducts}
                    icon={FiCheckCircle}
                    className="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                    title="پیش‌نویس"
                    value={stats.draftProducts}
                    icon={FiFileText}
                    className="bg-amber-50 text-amber-700"
                />

            </section>

            <ProductFilters categories={categories} />

            <ProductsTable products={products} />

            <ProductsPagination pagination={pagination} />
        </div>
    );
}
