import { redirect } from "next/navigation";
import {
    FiCheckCircle,
    FiClock,
    FiMessageSquare,
    FiShield,
    FiXCircle,
} from "react-icons/fi";

import AdminPagination from "@/components/admin/shared/AdminPagination";
import ReviewFilters from "@/components/admin/reviews/ReviewFilters";
import ReviewsTable from "@/components/admin/reviews/ReviewsTable";

import getAdminReviews from "@/lib/admin/reviews/getAdminReviews";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "مدیریت نظرات",
};

function StatCard({ title, value, icon: Icon, className }) {
    return (
        <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${className}`}>
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

export default async function AdminReviewsPage({ searchParams }) {
    const data = await getAdminReviews(await searchParams);

    if (!data) {
        redirect("/login?next=/admin/reviews");
    }

    return (
        <div className="space-y-7">
            <section>
                <p className="text-xs font-bold text-caramel-600">بازخورد مشتری‌ها</p>
                <h1 className="mt-2 text-3xl font-black text-coffee-950">مدیریت نظرات</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                    نظرهای ثبت‌شده را بررسی، تأیید، رد، ویژه یا پاسخ‌دهی کن. امتیاز محصول بعد از هر تغییر خودکار محاسبه می‌شود.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard title="همه نظرات" value={data.stats.total} icon={FiMessageSquare} className="bg-coffee-100 text-coffee-700" />
                <StatCard title="در انتظار" value={data.stats.pendingCount} icon={FiClock} className="bg-amber-50 text-amber-700" />
                <StatCard title="تأییدشده" value={data.stats.approvedCount} icon={FiCheckCircle} className="bg-emerald-50 text-emerald-700" />
                <StatCard title="ردشده" value={data.stats.rejectedCount} icon={FiXCircle} className="bg-red-50 text-red-700" />
                                <StatCard title="خرید تأییدشده" value={data.stats.verifiedCount} icon={FiShield} className="bg-blue-50 text-blue-700" />
            </section>

            <ReviewFilters />

            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-coffee-950">فهرست نظرات</h2>
                <p className="text-xs font-bold text-coffee-400">
                    {data.pagination.total.toLocaleString("fa-IR")} نتیجه
                </p>
            </div>

            <ReviewsTable reviews={data.reviews} />
            <AdminPagination pagination={data.pagination} label="نظرات" />
        </div>
    );
}
