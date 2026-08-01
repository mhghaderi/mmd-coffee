"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export default function TicketReplyForm({ ticketId, disabled = false }) {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        if (!message.trim()) return;
        setLoading(true); setError("");
        try {
            const response = await fetch(`/api/tickets/${ticketId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ارسال پاسخ انجام نشد");
            setMessage("");
            notifySuccess("پاسخ ارسال شد");
            router.refresh();
        } catch (error) {
            const messageText = error.message || "ارسال پاسخ انجام نشد";
            setError(messageText);
            notifyError("ارسال پاسخ انجام نشد", messageText);
        }
        finally { setLoading(false); }
    };

    if (disabled) return <div className="rounded-xl bg-cream-100 px-4 py-4 text-center text-xs font-bold text-coffee-500">این تیکت بسته شده است.</div>;
    return <form onSubmit={submit} className="mt-4"><textarea required rows={4} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="پاسخت را بنویس..." className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-7 outline-none focus:border-caramel-400" />{error && <p className="mt-2 text-xs font-bold text-danger">{error}</p>}<button disabled={loading} className="mt-3 flex h-11 items-center gap-2 rounded-xl bg-coffee-900 px-5 text-xs font-black text-white disabled:opacity-50"><FiSend />{loading ? "در حال ارسال..." : "ارسال پاسخ"}</button></form>;
}
