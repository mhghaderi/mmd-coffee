"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiLoader, FiSend } from "react-icons/fi";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export default function AdminTicketReplyCard({ ticket }) {
    const router = useRouter();
    const [replyText, setReplyText] = useState(
        ticket.adminReply ||
        ticket.messages?.find((m) => m.senderRole === "admin")?.message ||
        ""
    );
    const [status, setStatus] = useState(ticket.status || "open");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            const nextStatus = replyText.trim() ? (status === "closed" ? "closed" : "answered") : status;

            const response = await fetch(`/api/admin/tickets/${ticket._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminReply: replyText,
                    status: nextStatus,
                }),
            });

            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ذخیره پاسخ انجام نشد");

            notifySuccess("پاسخ تیکت با موفقیت ثبت شد");
            router.refresh();
        } catch (error) {
            notifyError("خطا در ثبت پاسخ", error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5 sm:p-6 shadow-sm">
            <div>
                <h2 className="text-base font-black text-coffee-950">پاسخ مدیر / کارشناس</h2>
                <p className="mt-1 text-xs text-coffee-400">
                    پاسخ یکتا برای این درخواست ثبت می‌شود و مستقیماً به کاربر نمایش داده خواهد شد.
                </p>
            </div>

            <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                required
                placeholder="متن پاسخ رسمی به کاربر را اینجا بنویسید..."
                className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-8 text-coffee-900 outline-none transition focus:border-caramel-400 focus:bg-white"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-coffee-600">وضعیت تیکت:</span>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-10 rounded-xl border border-coffee-100 bg-cream-50 px-3 text-xs font-bold text-coffee-700 outline-none"
                    >
                        <option value="open">باز / در انتظار</option>
                        <option value="answered">پاسخ داده‌شده</option>
                        <option value="closed">بسته‌شده</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-xs font-black text-white transition hover:bg-coffee-800 disabled:opacity-50"
                >
                    {isSaving ? <FiLoader className="animate-spin" /> : <FiSend />}
                    {ticket.adminReply ? "ویرایش پاسخ" : "ثبت و ارسال پاسخ"}
                </button>
            </div>
        </form>
    );
}
