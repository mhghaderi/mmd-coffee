"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiLoader } from "react-icons/fi";

const selectClass = "h-11 w-full rounded-xl border border-coffee-100 bg-cream-50 px-3 text-xs font-bold text-coffee-700 outline-none focus:border-caramel-400";

export default function TicketControls({ ticket, admins }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({
        status: ticket.status,
        priority: ticket.priority,
        
    });

    const save = async () => {
        setIsSaving(true);
        setMessage("");

        try {
            const response = await fetch(`/api/admin/tickets/${ticket._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ویرایش تیکت انجام نشد");

            setMessage(payload.message);
            router.refresh();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5">
            <h2 className="text-base font-black text-coffee-950">مدیریت تیکت</h2>

            <label className="block space-y-2">
                <span className="text-xs font-bold text-coffee-600">وضعیت</span>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className={selectClass}>
                    <option value="open">باز</option>
                    <option value="answered">پاسخ داده‌شده</option>
                    <option value="customer-reply">پاسخ جدید مشتری</option>
                    <option value="closed">بسته‌شده</option>
                </select>
            </label>

            <label className="block space-y-2">
                <span className="text-xs font-bold text-coffee-600">اولویت</span>
                <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className={selectClass}>
                    <option value="low">کم</option>
                    <option value="normal">عادی</option>
                    <option value="high">زیاد</option>
                    <option value="urgent">فوری</option>
                </select>
            </label>

            

            {message && <p className="rounded-xl bg-cream-100 px-3 py-2 text-xs font-bold text-coffee-700">{message}</p>}

            <button type="button" onClick={save} disabled={isSaving} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-coffee-900 text-xs font-black text-white disabled:opacity-50">
                {isSaving ? <FiLoader className="animate-spin" /> : <FiCheck />}
                ذخیره
            </button>
        </section>
    );
}
