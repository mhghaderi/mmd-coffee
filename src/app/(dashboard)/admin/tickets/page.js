import { redirect } from "next/navigation";
import {
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiInbox,
    FiMessageCircle,
    FiXCircle,
} from "react-icons/fi";

import AdminPagination from "@/components/admin/shared/AdminPagination";
import TicketFilters from "@/components/admin/tickets/TicketFilters";
import TicketsTable from "@/components/admin/tickets/TicketsTable";

import getAdminTickets from "@/lib/admin/tickets/getAdminTickets";

export const dynamic = "force-dynamic";
export const metadata = { title: "مدیریت تیکت‌ها" };

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

export default async function AdminTicketsPage({ searchParams }) {
    const data = await getAdminTickets(await searchParams);

    if (!data) redirect("/login?next=/admin/tickets");

    return (
        <div className="space-y-7">
            <section>
                <p className="text-xs font-bold text-caramel-600">پشتیبانی مشتریان</p>
                <h1 className="mt-2 text-3xl font-black text-coffee-950">مدیریت تیکت‌ها</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                    درخواست‌های کاربران را اولویت‌بندی، ارجاع، پاسخ و پیگیری کن.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <StatCard title="همه تیکت‌ها" value={data.stats.allCount} icon={FiInbox} className="bg-coffee-100 text-coffee-700" />
                <StatCard title="باز" value={data.stats.openCount} icon={FiClock} className="bg-blue-50 text-blue-700" />
                <StatCard title="پاسخ داده‌شده" value={data.stats.answeredCount} icon={FiCheckCircle} className="bg-emerald-50 text-emerald-700" />
                <StatCard title="پاسخ جدید مشتری" value={data.stats.customerReplyCount} icon={FiMessageCircle} className="bg-amber-50 text-amber-700" />
                <StatCard title="بسته‌شده" value={data.stats.closedCount} icon={FiXCircle} className="bg-slate-50 text-slate-700" />
                <StatCard title="فوری باز" value={data.stats.urgentCount} icon={FiAlertTriangle} className="bg-red-50 text-red-700" />
            </section>

            <TicketFilters />
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-coffee-950">فهرست تیکت‌ها</h2>
                <p className="text-xs font-bold text-coffee-400">{data.pagination.total.toLocaleString("fa-IR")} نتیجه</p>
            </div>
            <TicketsTable tickets={data.tickets} />
            <AdminPagination pagination={data.pagination} label="تیکت‌ها" />
        </div>
    );
}
