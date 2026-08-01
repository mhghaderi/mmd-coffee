"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/ui/notify";

export default function SignupForm() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ loading: false, error: "" });

    const updateField = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };

    const submit = async (event) => {
        event.preventDefault();

        if (form.password !== form.confirmPassword) {
            const message = "رمز عبور و تکرار آن یکسان نیستند";
            setStatus({ loading: false, error: message });
            notifyWarning(message);
            return;
        }

        setStatus({ loading: true, error: "" });

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.trim(),
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const validationMessage = Array.isArray(payload?.errors)
                    ? payload.errors[0]
                    : "";
                throw new Error(
                    payload?.message || validationMessage || "ثبت‌نام انجام نشد",
                );
            }

            await notifySuccess(
                "حساب با موفقیت ساخته شد",
                payload?.sessionCreated === false
                    ? "حساب آماده است؛ حالا وارد شو"
                    : "خوش اومدی به ممد کافی",
            );

            window.dispatchEvent(new Event("mmd-auth-changed"));

            if (payload?.sessionCreated === false) {
                router.replace("/login?registered=1");
                router.refresh();
                return;
            }

            const meResponse = await fetch("/api/auth/me", {
                cache: "no-store",
                credentials: "include",
            });

            router.replace(meResponse.ok ? "/user" : "/login?registered=1");
            router.refresh();
        } catch (error) {
            const message = error?.message || "ثبت‌نام انجام نشد";
            setStatus({ loading: false, error: message });
            notifyError("ساخت حساب انجام نشد", message);
        }
    };

    return (
        <form
            onSubmit={submit}
            className="w-full max-w-md rounded-[2rem] border border-coffee-100 bg-white p-6 shadow-[0_20px_70px_rgba(48,32,26,0.10)] sm:p-8"
        >
            <p className="text-xs font-black text-caramel-600">ساخت حساب مشتری</p>
            <h1 className="mt-2 text-3xl font-black text-coffee-950">ثبت‌نام</h1>
            <p className="mt-3 text-sm leading-7 text-coffee-500">
                برای پیگیری سفارش‌های کافه، خریدهای فروشگاهی و تیکت‌ها یک حساب بساز.
            </p>

            <div className="mt-6 space-y-4">
                <label className="block">
                    <span className="mb-2 block text-xs font-black text-coffee-600">
                        نام و نام خانوادگی
                    </span>
                    <input
                        required
                        minLength={2}
                        maxLength={80}
                        autoComplete="name"
                        value={form.name}
                        onChange={updateField("name")}
                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400 focus:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-black text-coffee-600">ایمیل</span>
                    <input
                        required
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        value={form.email}
                        onChange={updateField("email")}
                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400 focus:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-black text-coffee-600">
                        شماره تماس
                    </span>
                    <input
                        type="tel"
                        dir="ltr"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={updateField("phone")}
                        placeholder="09123456789"
                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400 focus:bg-white"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-black text-coffee-600">رمز عبور</span>
                    <div className="relative">
                        <input
                            required
                            minLength={8}
                            type={showPassword ? "text" : "password"}
                            dir="ltr"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={updateField("password")}
                            className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 pl-12 text-sm outline-none focus:border-caramel-400 focus:bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-coffee-400"
                            aria-label={showPassword ? "مخفی‌کردن رمز" : "نمایش رمز"}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    <p className="mt-1 text-[10px] leading-5 text-coffee-400">
                        حداقل ۸ کاراکتر و شامل حرف و عدد باشد.
                    </p>
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-black text-coffee-600">
                        تکرار رمز عبور
                    </span>
                    <input
                        required
                        minLength={8}
                        type={showPassword ? "text" : "password"}
                        dir="ltr"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={updateField("confirmPassword")}
                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400 focus:bg-white"
                    />
                </label>
            </div>

            {status.error && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-danger">
                    {status.error}
                </p>
            )}

            <button
                type="submit"
                disabled={status.loading}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-coffee-900 text-sm font-black text-white disabled:opacity-50"
            >
                <FiUserPlus />
                {status.loading ? "در حال ساخت حساب..." : "ساخت حساب"}
            </button>

            <p className="mt-5 text-center text-xs text-coffee-500">
                قبلاً ثبت‌نام کردی؟{" "}
                <Link href="/login" className="font-black text-caramel-600">
                    ورود
                </Link>
            </p>
        </form>
    );
}
