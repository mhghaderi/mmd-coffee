import Link from "next/link";
import NewTicketForm from "@/components/user/NewTicketForm";
import getUserTickets from "@/lib/user/getUserTickets";

const statusLabels = { open: "باز", answered: "پاسخ داده‌شده", "customer-reply": "پاسخ جدید شما", closed: "بسته‌شده" };

export default async function UserTicketsPage({ searchParams }) {
    const data = await getUserTickets(await searchParams);
    if (!data) return null;
    return (
        <div>
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold text-caramel-600">پشتیبانی</p><h1 className="mt-2 text-3xl font-black text-coffee-950">تیکت‌های من</h1><p className="mt-2 text-sm text-coffee-500">پیام‌های تماس با ما و پشتیبانی از اینجا قابل پیگیری هستند.</p></div><NewTicketForm /></div>
            <div className="mt-6 space-y-3">{data.tickets.length ? data.tickets.map((ticket) => <Link key={ticket._id} href={`/user/tickets/${ticket._id}`} className="block rounded-[1.5rem] border border-coffee-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="text-sm font-black text-coffee-950">{ticket.subject}</h2><span className="rounded-full bg-cream-100 px-2.5 py-1 text-[9px] font-black text-coffee-500">{statusLabels[ticket.status] || ticket.status}</span></div><p className="mt-2 text-xs text-coffee-400">{ticket.ticketNumber} · {new Date(ticket.lastMessageAt || ticket.createdAt).toLocaleDateString("fa-IR")}</p></div><span className="text-xs font-black text-caramel-600">مشاهده گفتگو</span></div></Link>) : <div className="rounded-[1.75rem] border border-dashed border-coffee-200 bg-white py-16 text-center text-sm font-bold text-coffee-400">هنوز تیکتی نداری.</div>}</div>
            {data.pagination.pages > 1 && <div className="mt-6 flex justify-center gap-2">{data.pagination.hasPreviousPage && <Link href={`/user/tickets?page=${data.pagination.page-1}`} className="rounded-xl bg-white px-4 py-2 text-xs font-black shadow-sm">قبلی</Link>}<span className="rounded-xl bg-coffee-900 px-4 py-2 text-xs font-black text-white">{data.pagination.page.toLocaleString("fa-IR")} / {data.pagination.pages.toLocaleString("fa-IR")}</span>{data.pagination.hasNextPage && <Link href={`/user/tickets?page=${data.pagination.page+1}`} className="rounded-xl bg-white px-4 py-2 text-xs font-black shadow-sm">بعدی</Link>}</div>}
        </div>
    );
}
