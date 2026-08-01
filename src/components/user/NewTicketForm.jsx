"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export default function NewTicketForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ subject: "", category: "other", priority: "normal", message: "" });
    const [status, setStatus] = useState({ loading: false, error: "" });

    const submit = async (event) => {
        event.preventDefault();
        setStatus({ loading: true, error: "" });
        try {
            const response = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ثبت تیکت انجام نشد");
            setForm({ subject: "", category: "other", priority: "normal", message: "" });
            setOpen(false);
            notifySuccess("تیکت با موفقیت ثبت شد", payload.data?.ticketNumber || "");
            router.push(`/user/tickets/${payload.data?._id || payload.data?.ticketNumber}`);
            router.refresh();
        } catch (error) {
            const message = error.message || "ثبت تیکت انجام نشد";
            setStatus({ loading: false, error: message });
            notifyError("ثبت تیکت انجام نشد", message);
        }
    };

    if (!open) return <button type="button" onClick={() => setOpen(true)} className="h-11 rounded-xl bg-coffee-900 px-5 text-xs font-black text-white">ثبت تیکت جدید</button>;

    return (
        <form onSubmit={submit} className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-lg font-black text-coffee-950">تیکت جدید</h2><button type="button" onClick={() => setOpen(false)} className="text-xs font-black text-coffee-400">بستن</button></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className="mb-2 block text-xs font-black text-coffee-600">موضوع</span><input required minLength={3} value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} className="h-11 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400" /></label>
                <label><span className="mb-2 block text-xs font-black text-coffee-600">دسته‌بندی</span><select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="h-11 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm"><option value="order">سفارش</option><option value="payment">پرداخت</option><option value="product">محصول</option><option value="account">حساب کاربری</option><option value="suggestion">پیشنهاد و انتقاد</option><option value="other">سایر</option></select></label>
                <label><span className="mb-2 block text-xs font-black text-coffee-600">اولویت</span><select value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})} className="h-11 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm"><option value="low">کم</option><option value="normal">عادی</option><option value="high">زیاد</option></select></label>
                <label className="sm:col-span-2"><span className="mb-2 block text-xs font-black text-coffee-600">پیام</span><textarea required minLength={2} rows={5} value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-7 outline-none focus:border-caramel-400" /></label>
            </div>
            {status.error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-danger">{status.error}</p>}
            <button type="submit" disabled={status.loading} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-xs font-black text-white disabled:opacity-50"><FiSend />{status.loading ? "در حال ثبت..." : "ارسال تیکت"}</button>
        </form>
    );
}
