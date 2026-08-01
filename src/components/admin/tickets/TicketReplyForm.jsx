"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLoader, FiSend } from "react-icons/fi";

export default function TicketReplyForm({ ticketId, isClosed }) {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [closeAfterReply, setCloseAfterReply] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [isSending, setIsSending] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setIsSending(true);
        setFeedback("");

        try {
            const response = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, closeAfterReply }),
            });

            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ارسال پاسخ انجام نشد");

            setMessage("");
            setCloseAfterReply(false);
            setFeedback(payload.message);
            router.refresh();
        } catch (error) {
            setFeedback(error.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5">
            <div>
                <h2 className="text-base font-black text-coffee-950">پاسخ مدیر</h2>
                <p className="mt-1 text-xs text-coffee-400">پاسخ برای کاربر در گفتگو ثبت می‌شود.</p>
            </div>

            <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                disabled={isClosed}
                placeholder={isClosed ? "این تیکت بسته شده است" : "پاسخ خود را بنویس..."}
                className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-8 outline-none focus:border-caramel-400 disabled:opacity-50"
            />

            <label className="flex items-center gap-3 text-xs font-bold text-coffee-600">
                <input type="checkbox" checked={closeAfterReply} onChange={(event) => setCloseAfterReply(event.target.checked)} disabled={isClosed} />
                بعد از پاسخ، تیکت بسته شود
            </label>

            {feedback && <p className="rounded-xl bg-cream-100 px-4 py-3 text-xs font-bold text-coffee-700">{feedback}</p>}

            <button type="submit" disabled={isSending || isClosed || message.trim().length < 2} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white disabled:opacity-40">
                {isSending ? <FiLoader className="animate-spin" /> : <FiSend />}
                ارسال پاسخ
            </button>
        </form>
    );
}
