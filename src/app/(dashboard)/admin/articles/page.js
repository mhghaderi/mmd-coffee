import Link from "next/link";
import { redirect } from "next/navigation";
import {
    FiArchive,
    FiCheckCircle,
    FiEdit3,
    FiFileText,
    FiPlus,
    FiStar,
} from "react-icons/fi";

import ArticleFilters from "@/components/admin/articles/ArticleFilters";
import ArticlesTable from "@/components/admin/articles/ArticlesTable";
import AdminPagination from "@/components/admin/shared/AdminPagination";

import getAdminArticles from "@/lib/admin/articles/getAdminArticles";

export const dynamic = "force-dynamic";
export const metadata = { title: "مدیریت مقالات" };

function StatCard({ title, value, icon: Icon, className }) {
    return (
        <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4">
            <span className={`flex size-12 items-center justify-center rounded-2xl ${className}`}><Icon /></span>
            <div>
                <p className="text-[10px] font-bold text-coffee-400">{title}</p>
                <p className="mt-1 text-xl font-black text-coffee-950">{Number(value || 0).toLocaleString("fa-IR")}</p>
            </div>
        </article>
    );
}

export default async function AdminArticlesPage({ searchParams }) {
    const data = await getAdminArticles(await searchParams);

    if (!data) redirect("/login?next=/admin/articles");

    return (
        <div className="space-y-7">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">مدیریت محتوا</p>
                    <h1 className="mt-2 text-3xl font-black text-coffee-950">مقالات ممد کافی</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                        مقاله بساز، پیش‌نویس نگه دار، منتشر کن و محتوای وبلاگ را مدیریت کن.
                    </p>
                </div>

                <Link href="/admin/articles/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-sm font-black text-white">
                    <FiPlus />
                    مقاله جدید
                </Link>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <StatCard title="همه مقالات" value={data.stats.allCount} icon={FiFileText} className="bg-coffee-100 text-coffee-700" />
                <StatCard title="پیش‌نویس" value={data.stats.draftCount} icon={FiEdit3} className="bg-amber-50 text-amber-700" />
                <StatCard title="منتشرشده" value={data.stats.publishedCount} icon={FiCheckCircle} className="bg-emerald-50 text-emerald-700" />
                <StatCard title="بایگانی" value={data.stats.archivedCount} icon={FiArchive} className="bg-slate-50 text-slate-700" />
                <StatCard title="ویژه" value={data.stats.featuredCount} icon={FiStar} className="bg-violet-50 text-violet-700" />
                <StatCard title="این ماه" value={data.stats.monthCount} icon={FiPlus} className="bg-blue-50 text-blue-700" />
            </section>

            <ArticleFilters />

            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-coffee-950">فهرست مقالات</h2>
                <p className="text-xs font-bold text-coffee-400">{data.pagination.total.toLocaleString("fa-IR")} نتیجه</p>
            </div>

            <ArticlesTable articles={data.articles} />
            <AdminPagination pagination={data.pagination} label="مقالات" />
        </div>
    );
}
