import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import TicketReplyForm from "@/components/user/TicketReplyForm";
import getUserTicketDetails from "@/lib/user/getUserTicketDetails";

const ticketStatusLabels = { open: "باز", answered: "پاسخ داده‌شده", "customer-reply": "پاسخ جدید شما", closed: "بسته‌شده" };

export default async function UserTicketDetailsPage({ params }) {
    const { id } = await params;
    const ticket = await getUserTicketDetails(id);
    if (!ticket) notFound();
    return <div><Link href="/user/tickets" className="inline-flex items-center gap-2 text-xs font-black text-coffee-500"><FiArrowRight /> بازگشت به تیکت‌ها</Link><section className="mt-5 rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold text-caramel-600">{ticket.ticketNumber}</p><h1 className="mt-2 text-2xl font-black text-coffee-950">{ticket.subject}</h1></div><span className="rounded-full bg-cream-100 px-3 py-1.5 text-[10px] font-black text-coffee-600">{ticketStatusLabels[ticket.status] || ticket.status}</span></div><div className="mt-6 space-y-3">{ticket.messages?.map((message,index) => { const admin = message.senderRole === "admin"; return <div key={message._id || index} className={`flex ${admin ? "justify-start" : "justify-end"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${admin ? "bg-coffee-900 text-white" : "bg-cream-100 text-coffee-900"}`}><p className="text-[10px] font-black opacity-60">{admin ? "پشتیبانی ممد کافی" : "شما"}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{message.message}</p><p className="mt-2 text-[9px] opacity-45">{new Date(message.createdAt || ticket.createdAt).toLocaleString("fa-IR")}</p></div></div>; })}</div><TicketReplyForm ticketId={ticket._id} disabled={["closed","resolved"].includes(ticket.status)} /></section></div>;
}
