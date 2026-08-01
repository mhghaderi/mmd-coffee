"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheckCircle, FiSave } from "react-icons/fi";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export default function UserProfileForm({ user }) {
    const router = useRouter();
    const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
    const [status, setStatus] = useState({ loading: false, type: "idle", message: "" });

    const submit = async (event) => {
        event.preventDefault();
        setStatus({ loading: true, type: "idle", message: "" });
        try {
            const response = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ذخیره تغییرات انجام نشد");
            setStatus({ loading: false, type: "success", message: "تغییرات ذخیره شد." });
            notifySuccess("پروفایل ذخیره شد");
            router.refresh();
        } catch (error) {
            const message = error.message || "ذخیره تغییرات انجام نشد";
            setStatus({ loading: false, type: "error", message });
            notifyError("ذخیره پروفایل انجام نشد", message);
        }
    };

    return (
        <form onSubmit={submit} className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <label><span className="mb-2 block text-xs font-black text-coffee-600">نام و نام خانوادگی</span><input required minLength={2} maxLength={80} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400" /></label>
                <label><span className="mb-2 block text-xs font-black text-coffee-600">شماره تماس</span><input dir="ltr" maxLength={20} value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400" /></label>
                <label className="sm:col-span-2"><span className="mb-2 block text-xs font-black text-coffee-600">ایمیل</span><input disabled value={user?.email || ""} dir="ltr" className="h-12 w-full cursor-not-allowed rounded-xl border border-coffee-100 bg-coffee-50 px-4 text-sm text-coffee-400" /><span className="mt-2 block text-[10px] text-coffee-400">برای امنیت حساب، ایمیل از این فرم قابل تغییر نیست.</span></label>
            </div>
            {status.message && <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${status.type === "success" ? "bg-green-50 text-success" : "bg-red-50 text-danger"}`}>{status.type === "success" && <FiCheckCircle />}{status.message}</div>}
            <button type="submit" disabled={status.loading} className="mt-5 flex h-12 items-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white disabled:opacity-50"><FiSave />{status.loading ? "در حال ذخیره..." : "ذخیره تغییرات"}</button>
        </form>
    );
}
