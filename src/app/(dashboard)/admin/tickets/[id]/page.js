import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
    FiArrowRight,
    FiCalendar,
    FiCheckCircle,
    FiMail,
    FiMessageSquare,
    FiPhone,
    FiUser,
} from "react-icons/fi";

import AdminTicketReplyCard from "@/components/admin/tickets/AdminTicketReplyCard";
import getAdminTicketDetails from "@/lib/admin/tickets/getAdminTicketDetails";

export const dynamic = "force-dynamic";
export const metadata = { title: "جزئیات و پاسخ به تیکت" };

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function InfoItem({ icon: Icon, label, value, dir }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-cream-50 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-coffee-600 shadow-sm">
                <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-coffee-400">{label}</p>
                <p dir={dir} className="mt-0.5 truncate text-xs font-black text-coffee-900">
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

export default async function AdminTicketDetailsPage({ params }) {
    const { id } = await params;
    const data = await getAdminTicketDetails(id);

    if (!data.authorized) redirect(`/login?next=/admin/tickets/${encodeURIComponent(id)}`);
    if (!data.ticket) notFound();

    const { ticket } = data;
    const userMessage = ticket.message || ticket.messages?.[0]?.message || "بدون متن";

    return (
        <div className="space-y-6">
            <Link
                href="/admin/tickets"
                className="inline-flex items-center gap-2 text-xs font-bold text-coffee-600 transition hover:text-coffee-950"
            >
                <FiArrowRight /> بازگشت به فهرست تیکت‌ها
            </Link>

            <section className="rounded-[2rem] border border-coffee-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-caramel-600" dir="ltr">
                                {ticket.ticketNumber}
                            </span>
                            <span className="rounded-full bg-cream-100 px-3 py-1 text-[10px] font-black text-coffee-700">
                                {ticket.status === "answered"
                                    ? "پاسخ داده‌شده"
                                    : ticket.status === "closed"
                                    ? "بسته‌شده"
                                    : "در انتظار پاسخ"}
                            </span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black text-coffee-950 sm:text-3xl">
                            {ticket.subject}
                        </h1>
                        <p className="mt-2 text-xs text-coffee-400">
                            ثبت شده در: {dateFormatter.format(new Date(ticket.createdAt))}
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                    
                    <div className="rounded-[1.75rem] border border-coffee-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-black text-coffee-700 border-b border-coffee-100 pb-3">
                            <FiMessageSquare /> پیام ثبت‌شده توسط کاربر:
                        </div>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-coffee-900">
                            {userMessage}
                        </p>
                    </div>

                    <AdminTicketReplyCard ticket={ticket} />
                </div>

                <aside className="space-y-6">
                    <section className="space-y-3 rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-black text-coffee-950">اطلاعات کاربر ارسال‌کننده</h2>
                        <InfoItem icon={FiUser} label="نام کاربر" value={ticket.user?.name} />
                        <InfoItem icon={FiMail} label="ایمیل" value={ticket.user?.email} dir="ltr" />
                        <InfoItem icon={FiPhone} label="تلفن" value={ticket.user?.phone} dir="ltr" />
                        <InfoItem icon={FiCalendar} label="تاریخ عضویت" value={ticket.user?.createdAt ? dateFormatter.format(new Date(ticket.user.createdAt)) : "—"} />
                    </section>
                </aside>
            </div>
        </div>
    );
}
