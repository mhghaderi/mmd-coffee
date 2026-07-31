"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCheck, FiLoader, FiSettings, FiShield, FiX } from "react-icons/fi";

const fieldClassName =
    "h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none transition focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100 disabled:cursor-not-allowed disabled:opacity-55";

export default function UserActions({ user, currentAdminId }) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [form, setForm] = useState({
        name: user.name || "",
        phone: user.phone || "",
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
    });

    const isCurrentAdmin = user._id === currentAdminId || user.id === currentAdminId;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape" && !isSubmitting) {
                setIsOpen(false);
            }
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isSubmitting]);

    const openModal = () => {
        setForm({
            name: user.name || "",
            phone: user.phone || "",
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
        });
        setErrorMessage("");
        setIsOpen(true);
    };

    const updateField = (name, value) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const submitChanges = async () => {
        if (isSubmitting) {
            return;
        }

        if (form.name.trim().length < 2) {
            setErrorMessage("نام کاربر باید حداقل ۲ کاراکتر باشد");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await fetch(`/api/admin/users/${user._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    phone: form.phone.trim(),
                    role: form.role,
                    isActive: form.isActive,
                    emailVerified: form.emailVerified,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "به‌روزرسانی کاربر انجام نشد");
            }

            setIsOpen(false);
            router.refresh();
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                aria-label={`مدیریت کاربر ${user.name}`}
                className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
            >
                <FiSettings />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="بستن پنجره مدیریت کاربر"
                        onClick={() => !isSubmitting && setIsOpen(false)}
                        className="absolute inset-0 bg-coffee-950/45 backdrop-blur-sm"
                    />

                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`user-dialog-${user._id}`}
                        className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-7"
                    >
                        <button
                            type="button"
                            aria-label="بستن"
                            disabled={isSubmitting}
                            onClick={() => setIsOpen(false)}
                            className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-xl bg-cream-100 text-coffee-600 disabled:opacity-50"
                        >
                            <FiX />
                        </button>

                        <p className="text-xs font-bold text-caramel-600">مدیریت حساب کاربری</p>

                        <h2
                            id={`user-dialog-${user._id}`}
                            className="mt-2 text-2xl font-black text-coffee-950"
                        >
                            {user.name}
                        </h2>

                        <p dir="ltr" className="mt-2 text-right text-xs text-coffee-400">
                            {user.email}
                        </p>

                        {isCurrentAdmin && (
                            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-xs leading-6 text-blue-700">
                                <FiShield className="mt-1 shrink-0" />
                                این حساب مدیریتی فعلی توست؛ تغییر نقش و غیرفعال‌کردن آن مسدود است.
                            </div>
                        )}

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    نام کاربر
                                </label>

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) => updateField("name", event.target.value)}
                                    className={fieldClassName}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    شماره تماس
                                </label>

                                <input
                                    type="tel"
                                    dir="ltr"
                                    value={form.phone}
                                    onChange={(event) => updateField("phone", event.target.value)}
                                    placeholder="09121234567"
                                    className={`${fieldClassName} text-left`}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    نقش حساب
                                </label>

                                <select
                                    value={form.role}
                                    disabled={isCurrentAdmin}
                                    onChange={(event) => updateField("role", event.target.value)}
                                    className={fieldClassName}
                                >
                                    <option value="user">کاربر عادی</option>
                                    <option value="admin">مدیر</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                disabled={isCurrentAdmin}
                                aria-pressed={form.isActive}
                                onClick={() => updateField("isActive", !form.isActive)}
                                className={`rounded-2xl border p-4 text-right transition disabled:cursor-not-allowed disabled:opacity-55 ${
                                    form.isActive
                                        ? "border-emerald-200 bg-emerald-50"
                                        : "border-red-200 bg-red-50"
                                }`}
                            >
                                <span
                                    className={`block text-sm font-black ${
                                        form.isActive ? "text-emerald-700" : "text-red-700"
                                    }`}
                                >
                                    {form.isActive ? "حساب فعال" : "حساب غیرفعال"}
                                </span>

                                <span className="mt-1 block text-[10px] leading-5 text-coffee-400">
                                    حساب غیرفعال امکان ورود به سامانه را ندارد.
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-pressed={form.emailVerified}
                                onClick={() =>
                                    updateField("emailVerified", !form.emailVerified)
                                }
                                className={`rounded-2xl border p-4 text-right transition ${
                                    form.emailVerified
                                        ? "border-blue-200 bg-blue-50"
                                        : "border-coffee-100 bg-cream-50"
                                }`}
                            >
                                <span
                                    className={`block text-sm font-black ${
                                        form.emailVerified ? "text-blue-700" : "text-coffee-700"
                                    }`}
                                >
                                    {form.emailVerified ? "ایمیل تأییدشده" : "ایمیل تأییدنشده"}
                                </span>

                                <span className="mt-1 block text-[10px] leading-5 text-coffee-400">
                                    وضعیت اعتبارسنجی ایمیل حساب را مشخص می‌کند.
                                </span>
                            </button>
                        </div>

                        {errorMessage && (
                            <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={submitChanges}
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-coffee-900 text-sm font-black text-white transition hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <FiLoader className="animate-spin text-current" />
                            ) : (
                                <FiCheck className="text-current" />
                            )}

                            <span className="text-current">
                                {isSubmitting ? "در حال ذخیره" : "ذخیره تغییرات"}
                            </span>
                        </button>
                    </section>
                </div>
            )}
        </>
    );
}
