import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight, FiCheckCircle, FiClock, FiMessageCircle, FiUser } from "react-icons/fi";
import getUserTicketDetails from "@/lib/user/getUserTicketDetails";

const ticketStatusBadges = {
    open: { label: "در انتظار پاسخ", className: "bg-amber-50 text-amber-700" },
    answered: { label: "پاسخ داده‌شده", className: "bg-emerald-50 text-emerald-700" },
    closed: { label: "بسته‌شده", className: "bg-slate-100 text-slate-600" },
};

function formatDate(date) {
    if (!date) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export default async function UserTicketDetailsPage({ params }) {
    const { id } = await params;
    const ticket = await getUserTicketDetails(id);

    if (!ticket) notFound();

    const statusBadge = ticketStatusBadges[ticket.status] || ticketStatusBadges.open;

    return (
        <div className="space-y-6">
            <Link
                href="/user/tickets"
                className="inline-flex items-center gap-2 text-xs font-bold text-coffee-600 transition hover:text-coffee-950"
            >
                <FiArrowRight /> بازگشت به فهرست تیکت‌ها
            </Link>

            <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-coffee-100 pb-5">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-caramel-600" dir="ltr">
                                {ticket.ticketNumber}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusBadge.className}`}>
                                {statusBadge.label}
                            </span>
                        </div>
                        <h1 className="mt-2 text-xl font-black text-coffee-950 sm:text-2xl">
                            {ticket.subject}
                        </h1>
                        <p className="mt-2 text-xs text-coffee-400">
                            ثبت شده در: {formatDate(ticket.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                    
                    <div className="rounded-2xl border border-coffee-100 bg-cream-50/70 p-5">
                        <div className="flex items-center gap-2 text-xs font-black text-coffee-700">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-white text-coffee-600 shadow-sm">
                                <FiUser size={14} />
                            </span>
                            پیام شما (درخواست / اطلاع‌رسانی)
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-coffee-800">
                            {ticket.message || ticket.messages?.[0]?.message || "بدون متن"}
                        </p>
                    </div>

                    {ticket.adminReply || ticket.messages?.find((m) => m.senderRole === "admin")?.message ? (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                                    <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                                        <FiCheckCircle size={14} />
                                    </span>
                                    پاسخ رسمی پشتیبانی ممد کافی
                                </div>
                                <span className="text-[10px] text-emerald-700/60">
                                    {formatDate(ticket.repliedAt || ticket.updatedAt)}
                                </span>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-coffee-900">
                                {ticket.adminReply || ticket.messages?.find((m) => m.senderRole === "admin")?.message}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-5 text-amber-800">
                            <FiClock className="size-5 shrink-0 text-amber-600" />
                            <div className="text-xs leading-6">
                                <p className="font-bold">در انتظار پاسخ پشتیبانی</p>
                                <p className="text-[11px] text-amber-700/80">
                                    تیکت شما ثبت شده است. به محض بررسی کارشناسان، پاسخ در این قسمت نمایش داده خواهد شد.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
