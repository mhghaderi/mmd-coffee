import { redirect } from "next/navigation";
import {
    FiArchive,
    FiBox,
    FiFileText,
    FiGrid,
    FiMessageSquare,
} from "react-icons/fi";

import ArchiveFilters from "@/components/admin/archive/ArchiveFilters";
import ArchiveItemActions from "@/components/admin/archive/ArchiveItemActions";
import getAdminArchive from "@/lib/admin/archive/getAdminArchive";

export const dynamic = "force-dynamic";
export const metadata = { title: "آرشیو" };

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

const typeLabels = {
    products: "محصول",
    categories: "دسته‌بندی",
    articles: "مقاله",
    reviews: "نظر",
};

const typeClasses = {
    products: "bg-blue-50 text-blue-700",
    categories: "bg-violet-50 text-violet-700",
    articles: "bg-amber-50 text-amber-700",
    reviews: "bg-emerald-50 text-emerald-700",
};

function StatCard({ title, value, icon: Icon, className }) {
    return (
        <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <span className={`flex size-12 items-center justify-center rounded-2xl ${className}`}>
                <Icon size={20} />
            </span>
            <div>
                <p className="text-[10px] font-bold text-coffee-400">{title}</p>
                <p className="mt-1 text-xl font-black text-coffee-950">
                    {Number(value || 0).toLocaleString("fa-IR")}
                </p>
            </div>
        </article>
    );
}

export default async function AdminArchivePage({ searchParams }) {
    const data = await getAdminArchive(await searchParams);

    if (!data) {
        redirect("/login?next=/admin/archive");
    }

    return (
        <div className="space-y-7">
            <section>
                <p className="text-xs font-bold text-caramel-600">مدیریت موارد حذف‌شده</p>
                <h1 className="mt-2 text-3xl font-black text-coffee-950">آرشیو سامانه</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                    محصولات، دسته‌بندی‌ها، مقالات و نظرات بایگانی‌شده را بازیابی یا با رعایت وابستگی‌ها حذف دائمی کن.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard title="تمام موارد" value={data.stats.total} icon={FiArchive} className="bg-coffee-100 text-coffee-700" />
                <StatCard title="محصولات" value={data.stats.products} icon={FiBox} className="bg-blue-50 text-blue-700" />
                <StatCard title="دسته‌ها" value={data.stats.categories} icon={FiGrid} className="bg-violet-50 text-violet-700" />
                <StatCard title="مقالات" value={data.stats.articles} icon={FiFileText} className="bg-amber-50 text-amber-700" />
                <StatCard title="نظرات" value={data.stats.reviews} icon={FiMessageSquare} className="bg-emerald-50 text-emerald-700" />
            </section>

            <ArchiveFilters filters={data.filters} />

            <section className="overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
                <div className="flex items-center justify-between border-b border-coffee-100 p-5">
                    <h2 className="text-lg font-black text-coffee-950">موارد بایگانی‌شده</h2>
                    <p className="text-xs font-bold text-coffee-400">
                        {data.items.length.toLocaleString("fa-IR")} مورد نمایش داده شده
                    </p>
                </div>

                {data.items.length > 0 ? (
                    <div className="divide-y divide-coffee-100">
                        {data.items.map((item) => (
                            <article key={`${item.type}-${item._id}`} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                                <div className="flex min-w-0 flex-1 items-center gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cream-100 text-coffee-400">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="size-full object-cover" />
                                        ) : (
                                            <FiArchive size={20} />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-black text-coffee-950">{item.title}</p>
                                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${typeClasses[item.type]}`}>
                                                {typeLabels[item.type]}
                                            </span>
                                        </div>
                                        <p className="mt-1 truncate text-[10px] text-coffee-400">{item.subtitle}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] font-bold text-coffee-400">
                                            <span>{item.meta}</span>
                                            <span>بایگانی: {dateFormatter.format(new Date(item.archivedAt))}</span>
                                        </div>
                                    </div>
                                </div>

                                <ArchiveItemActions item={item} />
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                        <span className="flex size-16 items-center justify-center rounded-full bg-cream-100 text-coffee-400">
                            <FiArchive size={25} />
                        </span>
                        <h3 className="mt-4 text-lg font-black text-coffee-950">آرشیو خالی است</h3>
                        <p className="mt-2 text-xs leading-6 text-coffee-400">
                            موردی مطابق فیلتر یا عبارت جست‌وجوی فعلی پیدا نشد.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
