"use client";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";

import {
    FiAlertCircle,
    FiArrowLeft,
    FiCoffee,
    FiEye,
    FiEyeOff,
    FiLoader,
    FiLock,
    FiMail,
} from "react-icons/fi";

function getSafeRedirectPath(value, role) {
    const fallbackPath = role === "admin" ? "/admin" : "/";

    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return fallbackPath;
    }

    if (value.startsWith("/admin") && role !== "admin") {
        return "/";
    }

    return value;
}

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));

        if (errorMessage) {
            setErrorMessage("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "ورود به حساب انجام نشد");

                return;
            }

            const redirectPath = getSafeRedirectPath(searchParams.get("next"), result.data.role);

            router.replace(redirectPath);
            router.refresh();
        } catch (error) {
            console.error("LOGIN FORM ERROR:", error);

            setErrorMessage("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_35px_100px_rgba(48,32,26,0.16)] lg:grid-cols-[0.9fr_1.1fr]">
            {/* Brand panel */}

            <div className="relative hidden overflow-hidden bg-coffee-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                <div
                    aria-hidden="true"
                    className="absolute -right-28 -top-28 size-80 rounded-full bg-caramel-500/20 blur-3xl"
                />

                <div
                    aria-hidden="true"
                    className="absolute -bottom-32 -left-32 size-96 rounded-full bg-white/10 blur-3xl"
                />

                <div className="relative">
                    <div className="inline-flex items-center gap-3">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-caramel-300 backdrop-blur-md">
                            <FiCoffee size={23} />
                        </span>

                        <div>
                            <p className="text-lg font-black">ممد کافی</p>

                            <p className="mt-0.5 text-xs tracking-[0.2em] text-white/45">
                                MMD COFFEE
                            </p>
                        </div>
                    </div>

                    <h1 className="mt-16 max-w-sm text-4xl font-black leading-[1.5]">
                        مدیریت هوشمند،
                        <span className="block text-caramel-300">تجربه‌ای حرفه‌ای</span>
                    </h1>

                    <p className="mt-5 max-w-sm text-sm leading-8 text-white/55">
                        محصولات، دسته‌بندی‌ها، کاربران، سفارش‌ها و گزارش‌های ممد کافی را از یک پنل
                        یکپارچه مدیریت کنید.
                    </p>
                </div>

                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                    <p className="text-xs leading-7 text-white/55">
                        ورود به پنل مدیریت تنها برای حساب‌هایی که نقش ادمین دارند امکان‌پذیر است.
                    </p>
                </div>
            </div>

            {/* Login form */}

            <div className="p-6 sm:p-10 lg:p-14">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 text-xs font-bold text-coffee-500 transition hover:text-coffee-950"
                >
                    <FiArrowLeft className="rotate-180 transition-transform group-hover:translate-x-1" />
                    بازگشت به ممد کافی
                </Link>

                <div className="mt-10">
                    <span className="inline-flex items-center gap-2 rounded-full bg-caramel-50 px-3 py-1.5 text-xs font-bold text-caramel-700">
                        <FiLock />
                        ورود امن
                    </span>

                    <h2 className="mt-5 text-3xl font-black text-coffee-950 sm:text-4xl">
                        ورود به حساب
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-coffee-500">
                        ایمیل و رمز عبور حساب خود را وارد کنید.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-9 space-y-5" noValidate>
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-bold text-coffee-800"
                        >
                            ایمیل
                        </label>

                        <div className="relative">
                            <FiMail className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400" />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@mmdcoffee.ir"
                                className="h-14 w-full rounded-2xl border border-coffee-100 bg-cream-50 pr-12 pl-4 text-left text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-bold text-coffee-800"
                        >
                            رمز عبور
                        </label>

                        <div className="relative">
                            <FiLock className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400" />

                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="رمز عبور حساب"
                                className="h-14 w-full rounded-2xl border border-coffee-100 bg-cream-50 pr-12 pl-12 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                            />

                            <button
                                type="button"
                                aria-label={showPassword ? "مخفی‌کردن رمز عبور" : "نمایش رمز عبور"}
                                aria-pressed={showPassword}
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-800"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {errorMessage && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700"
                        >
                            <FiAlertCircle className="mt-0.5 shrink-0" />

                            <p className="leading-6">{errorMessage}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-coffee-900 px-6 text-sm font-black text-white shadow-[0_15px_35px_rgba(48,32,26,0.22)] transition hover:-translate-y-0.5 hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                        {isSubmitting ? (
                            <>
                                <FiLoader className="animate-spin" />
                                در حال بررسی اطلاعات
                            </>
                        ) : (
                            <>
                                ورود به حساب
                                <FiArrowLeft />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-7 text-center text-xs leading-6 text-coffee-400">
                    اطلاعات ورود از طریق ارتباط امن به سرور ارسال می‌شود و نشست حساب داخل Cookie امن
                    نگه‌داری می‌شود.
                </p>
            </div>
        </section>
    );
}
