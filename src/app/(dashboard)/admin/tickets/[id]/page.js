import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
    FiArrowRight,
    FiCalendar,
    FiCreditCard,
    FiMail,
    FiPackage,
    FiPhone,
    FiUser,
} from "react-icons/fi";

import {
    ticketCategoryLabels,
    ticketPriorityClasses,
    ticketPriorityLabels,
    ticketStatusClasses,
    ticketStatusLabels,
} from "@/constants/ticket";

import TicketControls from "@/components/admin/tickets/TicketControls";
import TicketConversation from "@/components/admin/tickets/TicketConversation";
import TicketReplyForm from "@/components/admin/tickets/TicketReplyForm";

import getAdminTicketDetails from "@/lib/admin/tickets/getAdminTicketDetails";

export const dynamic = "force-dynamic";
export const metadata = { title: "جزئیات تیکت" };

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function InfoRow({ icon: Icon, title, value, dir }) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-cream-50 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-coffee-600"><Icon /></span>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-coffee-400">{title}</p>
                <p dir={dir} className="mt-1 break-words text-xs font-black text-coffee-900">{value || "—"}</p>
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

    return (
        <div className="space-y-7">
            <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-xs font-bold text-coffee-500 hover:text-coffee-950">
                <FiArrowRight />
                بازگشت به تیکت‌ها
            </Link>

            <section className="rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-[0_16px_55px_rgba(48,32,26,0.06)] sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p dir="ltr" className="text-xs font-black text-caramel-600">{ticket.ticketNumber}</p>
                        <h1 className="mt-2 text-2xl font-black text-coffee-950 sm:text-3xl">{ticket.subject}</h1>
                        <p className="mt-3 text-xs text-coffee-400">{dateFormatter.format(new Date(ticket.createdAt))}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-2 text-[10px] font-bold ${ticketStatusClasses[ticket.status]}`}>{ticketStatusLabels[ticket.status]}</span>
                        <span className={`rounded-full px-3 py-2 text-[10px] font-bold ${ticketPriorityClasses[ticket.priority]}`}>{ticketPriorityLabels[ticket.priority]}</span>
                        <span className="rounded-full bg-violet-50 px-3 py-2 text-[10px] font-bold text-violet-700">{ticketCategoryLabels[ticket.category]}</span>
                    </div>
                </div>
            </section>

            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-7">
                    <TicketConversation messages={ticket.messages} />
                    <TicketReplyForm ticketId={ticket._id} isClosed={ticket.status === "closed"} />
                </div>

                <aside className="space-y-7">
                    <TicketControls ticket={ticket} admins={data.admins} />

                    <section className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5">
                        <h2 className="text-base font-black text-coffee-950">اطلاعات کاربر</h2>
                        <InfoRow icon={FiUser} title="نام" value={ticket.user?.name} />
                        <InfoRow icon={FiMail} title="ایمیل" value={ticket.user?.email} dir="ltr" />
                        <InfoRow icon={FiPhone} title="تلفن" value={ticket.user?.phone} dir="ltr" />
                        <InfoRow icon={FiCalendar} title="عضویت" value={ticket.user?.createdAt ? dateFormatter.format(new Date(ticket.user.createdAt)) : "—"} />
                    </section>

                    {ticket.order && (
                        <section className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5">
                            <h2 className="text-base font-black text-coffee-950">سفارش مرتبط</h2>
                            <InfoRow icon={FiPackage} title="شماره سفارش" value={ticket.order.orderNumber} dir="ltr" />
                            <InfoRow icon={FiCreditCard} title="مبلغ" value={`${Number(ticket.order.pricing?.total || 0).toLocaleString("fa-IR")} تومان`} />
                            <Link href={`/admin/orders/${ticket.order._id}`} className="flex h-11 items-center justify-center rounded-xl bg-coffee-900 text-xs font-black text-white">مشاهده سفارش</Link>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}
