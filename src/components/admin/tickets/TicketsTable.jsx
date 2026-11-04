import Link from "next/link";
import { FiEye, FiMessageSquare } from "react-icons/fi";

import {
    ticketCategoryLabels,
    ticketPriorityClasses,
    ticketPriorityLabels,
    ticketStatusClasses,
    ticketStatusLabels,
} from "@/constants/ticket";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default function TicketsTable({ tickets }) {
    if (!tickets.length) {
        return (
            <div className="rounded-[1.75rem] border border-dashed border-coffee-200 bg-white px-6 py-16 text-center">
                <FiMessageSquare className="mx-auto text-4xl text-coffee-300" />
                <h3 className="mt-4 text-lg font-black text-coffee-950">تیکتی پیدا نشد</h3>
                <p className="mt-2 text-sm text-coffee-400">فیلترها را تغییر بده یا منتظر درخواست جدید باش.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)]">
            <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full text-right">
                    <thead className="bg-cream-50 text-[10px] font-bold text-coffee-400">
                        <tr>
                            <th className="px-5 py-4">شماره</th>
                            <th className="px-4 py-4">کاربر</th>
                            <th className="px-4 py-4">موضوع</th>
                            <th className="px-4 py-4">دسته</th>
                            <th className="px-4 py-4">اولویت</th>
                            <th className="px-4 py-4">وضعیت</th>
                                                        <th className="px-4 py-4">آخرین فعالیت</th>
                            <th className="px-5 py-4">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket._id} className="border-b border-coffee-100 last:border-0 hover:bg-cream-50/60">
                                <td className="px-5 py-4">
                                    <p dir="ltr" className="text-xs font-black text-coffee-950">{ticket.ticketNumber}</p>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="text-xs font-black text-coffee-900">{ticket.user?.name || "کاربر حذف‌شده"}</p>
                                    <p dir="ltr" className="mt-1 text-right text-[10px] text-coffee-400">{ticket.user?.email || "—"}</p>
                                </td>
                                <td className="px-4 py-4">
                                    <p className="max-w-64 truncate text-xs font-black text-coffee-900">{ticket.subject}</p>
                                    <p className="mt-1 text-[10px] text-coffee-400">{ticket.adminReply ? "پاسخ داده شده" : "در انتظار پاسخ"}</p>
                                </td>
                                <td className="px-4 py-4 text-xs font-bold text-coffee-600">{ticketCategoryLabels[ticket.category]}</td>
                                <td className="px-4 py-4">
                                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${ticketPriorityClasses[ticket.priority]}`}>
                                        {ticketPriorityLabels[ticket.priority]}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${ticketStatusClasses[ticket.status]}`}>
                                        {ticketStatusLabels[ticket.status]}
                                    </span>
                                </td>
                                                                <td className="px-4 py-4 whitespace-nowrap text-[10px] text-coffee-500">{dateFormatter.format(new Date(ticket.repliedAt || ticket.createdAt))}</td>
                                <td className="px-5 py-4">
                                    <Link href={`/admin/tickets/${ticket._id}`} className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100">
                                        <FiEye />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
