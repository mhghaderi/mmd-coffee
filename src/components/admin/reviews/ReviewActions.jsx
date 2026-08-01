"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiEdit3, FiLoader, FiX } from "react-icons/fi";

export default function ReviewActions({ review }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({
        status: review.status,
        isFeatured: Boolean(review.isFeatured),
        rejectionReason: review.rejectionReason || "",
        adminReply: review.adminReply?.message || "",
    });

    const save = async () => {
        setIsSaving(true);
        setMessage("");

        try {
            const response = await fetch(`/api/admin/reviews/${review._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || "ویرایش نظر انجام نشد");
            }

            setMessage(payload.message);
            router.refresh();

            window.setTimeout(() => setIsOpen(false), 600);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                aria-label="مدیریت نظر"
            >
                <FiEdit3 />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-coffee-950/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                        <header className="flex items-center justify-between border-b border-coffee-100 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-black text-coffee-950">
                                    مدیریت نظر
                                </h2>
                                <p className="mt-1 text-xs text-coffee-400">
                                    {review.product?.name || "محصول حذف‌شده"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex size-10 items-center justify-center rounded-xl text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-900"
                            >
                                <FiX />
                            </button>
                        </header>

                        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
                            <div className="rounded-2xl bg-cream-50 p-4">
                                <p className="text-sm font-black text-coffee-900">
                                    {review.title || "بدون عنوان"}
                                </p>
                                <p className="mt-2 text-xs leading-7 text-coffee-600">
                                    {review.content}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs font-bold text-coffee-600">وضعیت</span>
                                    <select
                                        value={form.status}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                status: event.target.value,
                                                isFeatured:
                                                    event.target.value === "approved"
                                                        ? current.isFeatured
                                                        : false,
                                            }))
                                        }
                                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-3 text-sm outline-none focus:border-caramel-400"
                                    >
                                        <option value="pending">در انتظار بررسی</option>
                                        <option value="approved">تأییدشده</option>
                                        <option value="rejected">ردشده</option>
                                        <option value="archived">بایگانی‌شده</option>
                                    </select>
                                </label>

                                <label className="flex items-center gap-3 rounded-xl border border-coffee-100 bg-cream-50 px-4">
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        disabled={form.status !== "approved"}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                isFeatured: event.target.checked,
                                            }))
                                        }
                                    />
                                    <span className="text-xs font-bold text-coffee-700">
                                        نمایش به‌عنوان نظر ویژه
                                    </span>
                                </label>
                            </div>

                            {form.status === "rejected" && (
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-coffee-600">دلیل رد</span>
                                    <textarea
                                        value={form.rejectionReason}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                rejectionReason: event.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-3 text-sm leading-7 outline-none focus:border-caramel-400"
                                    />
                                </label>
                            )}

                            <label className="block space-y-2">
                                <span className="text-xs font-bold text-coffee-600">
                                    پاسخ مدیر
                                </span>
                                <textarea
                                    value={form.adminReply}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            adminReply: event.target.value,
                                        }))
                                    }
                                    rows={4}
                                    placeholder="پاسخ عمومی مدیر به این نظر..."
                                    className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-3 text-sm leading-7 outline-none focus:border-caramel-400"
                                />
                            </label>

                            {message && (
                                <p className="rounded-xl bg-cream-100 px-4 py-3 text-xs font-bold text-coffee-700">
                                    {message}
                                </p>
                            )}
                        </div>

                        <footer className="flex justify-end gap-3 border-t border-coffee-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="h-11 rounded-xl border border-coffee-100 px-5 text-xs font-bold text-coffee-600"
                            >
                                انصراف
                            </button>

                            <button
                                type="button"
                                onClick={save}
                                disabled={isSaving}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-xs font-black text-white disabled:opacity-50"
                            >
                                {isSaving ? <FiLoader className="animate-spin" /> : <FiCheck />}
                                ذخیره تغییرات
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}
