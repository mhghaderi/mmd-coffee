"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

function extractUser(payload) {
    return payload?.user || payload?.data?.user || payload?.data || null;
}

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ loading: false, error: "" });

    const submit = async (event) => {
        event.preventDefault();
        setStatus({ loading: true, error: "" });

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload?.message || "ورود انجام نشد");

            let user = extractUser(payload);
            if (!user?.role) {
                try {
                    const meResponse = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
                    if (meResponse.ok) user = extractUser(await meResponse.json());
                } catch {}
            }

            const requestedNext = searchParams.get("next");
            const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
                ? requestedNext
                : "";
            const isAdmin = user?.role === "admin";
            const roleSafeNext = isAdmin
                ? (safeNext.startsWith("/admin") ? safeNext : "")
                : (safeNext && !safeNext.startsWith("/admin") ? safeNext : "");
            const destination = roleSafeNext || (isAdmin ? "/admin" : "/user");

            await notifySuccess("با موفقیت وارد شدی", isAdmin ? "در حال انتقال به پنل مدیریت" : "در حال انتقال به حساب کاربری");
            window.dispatchEvent(new Event("mmd-auth-changed"));
            router.replace(destination);
            router.refresh();
        } catch (error) {
            const message = error.message || "ورود انجام نشد";
            setStatus({ loading: false, error: message });
            notifyError("ورود ناموفق بود", message);
        }
    };

    return (
        <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-coffee-100 bg-white p-6 shadow-[0_20px_70px_rgba(48,32,26,0.10)] sm:p-8">
            <p className="text-xs font-black text-caramel-600">ورود به ممد کافی</p>
            <h1 className="mt-2 text-3xl font-black text-coffee-950">خوش اومدی</h1>
            <p className="mt-3 text-sm leading-7 text-coffee-500">بعد از ورود، مدیر مستقیم به پنل مدیریت و مشتری به حساب کاربری منتقل می‌شود.</p>

            <div className="mt-6 space-y-4">
                <label className="block"><span className="mb-2 block text-xs font-black text-coffee-600">ایمیل</span><input required type="email" dir="ltr" autoComplete="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400 focus:bg-white" /></label>
                <label className="block"><span className="mb-2 block text-xs font-black text-coffee-600">رمز عبور</span><div className="relative"><input required type={showPassword ? "text" : "password"} dir="ltr" autoComplete="current-password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 pl-12 text-sm outline-none focus:border-caramel-400 focus:bg-white" /><button type="button" onClick={()=>setShowPassword((v)=>!v)} className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-coffee-400">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></label>
            </div>

            {status.error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-danger">{status.error}</p>}
            <button type="submit" disabled={status.loading} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-coffee-900 text-sm font-black text-white disabled:opacity-50"><FiLogIn />{status.loading ? "در حال ورود..." : "ورود"}</button>
            <p className="mt-5 text-center text-xs text-coffee-500">حساب نداری؟ <Link href="/signup" className="font-black text-caramel-600">ثبت‌نام</Link></p>
        </form>
    );
}
