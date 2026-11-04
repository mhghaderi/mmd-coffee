"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiEdit3, FiLoader, FiTrash2, FiX } from "react-icons/fi";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

export default function ReviewActions({ review }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState(review.status || "approved");
    const [adminReply, setAdminReply] = useState(
        typeof review.adminReply === "string"
            ? review.adminReply
            : review.adminReply?.message || ""
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/reviews/${review._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    adminReply,
                }),
            });

            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ویرایش نظر انجام نشد");

            notifySuccess("نظر با موفقیت به‌روزرسانی شد");
            router.refresh();
            setIsOpen(false);
        } catch (error) {
            notifyError("خطا", error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("آیا از حذف این نظر اطمینان دارید؟")) return;
        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/reviews/${review._id}`, {
                method: "DELETE",
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "حذف نظر انجام نشد");

            notifySuccess("نظر با موفقیت حذف شد");
            router.refresh();
            setIsOpen(false);
        } catch (error) {
            notifyError("خطا", error.message);
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
                    <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                        <header className="flex items-center justify-between border-b border-coffee-100 px-6 py-4">
                            <div>
                                <h2 className="text-base font-black text-coffee-950">
                                    مدیریت و پاسخ به نظر
                                </h2>
                                <p className="mt-0.5 text-xs text-coffee-400">
                                    {review.product?.name || "محصول"} - ثبت شده توسط {review.author?.name || "کاربر"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex size-9 items-center justify-center rounded-xl text-coffee-400 transition hover:bg-coffee-100 hover:text-coffee-900"
                            >
                                <FiX />
                            </button>
                        </header>

                        <div className="space-y-4 p-6">
                            
                            <div className="rounded-2xl border border-coffee-100 bg-cream-50 p-4">
                                <div className="flex items-center justify-between text-xs font-bold text-coffee-600">
                                    <span>{review.title || "نظر کاربر"}</span>
                                    <span>امتیاز: {review.rating} از ۵</span>
                                </div>
                                <p className="mt-2 text-xs leading-7 text-coffee-800 whitespace-pre-wrap">
                                    {review.content}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-coffee-700 mb-2">
                                    وضعیت انتشار نظر:
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatus("approved")}
                                        className={`flex-1 h-10 rounded-xl text-xs font-bold transition ${
                                            status === "approved"
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "border border-coffee-100 bg-cream-50 text-coffee-600 hover:bg-cream-100"
                                        }`}
                                    >
                                        تأییدشده (نمایش در سایت)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus("rejected")}
                                        className={`flex-1 h-10 rounded-xl text-xs font-bold transition ${
                                            status === "rejected"
                                                ? "bg-red-600 text-white shadow-sm"
                                                : "border border-coffee-100 bg-cream-50 text-coffee-600 hover:bg-cream-100"
                                        }`}
                                    >
                                        ردشده (عدم نمایش)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus("pending")}
                                        className={`flex-1 h-10 rounded-xl text-xs font-bold transition ${
                                            status === "pending"
                                                ? "bg-amber-600 text-white shadow-sm"
                                                : "border border-coffee-100 bg-cream-50 text-coffee-600 hover:bg-cream-100"
                                        }`}
                                    >
                                        در انتظار بررسی
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-coffee-700 mb-2">
                                    پاسخ ممد کافی به نظر (اختیاری):
                                </label>
                                <textarea
                                    value={adminReply}
                                    onChange={(e) => setAdminReply(e.target.value)}
                                    rows={4}
                                    placeholder="در صورت تمایل، پاسخ رسمی کافه به این نظر را اینجا بنویسید..."
                                    className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 p-3 text-xs leading-6 text-coffee-900 outline-none transition focus:border-caramel-400 focus:bg-white"
                                />
                            </div>
                        </div>

                        <footer className="flex items-center justify-between border-t border-coffee-100 px-6 py-4 bg-cream-50/50">
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 h-10 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                                <FiTrash2 /> حذف نظر
                            </button>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="h-10 rounded-xl border border-coffee-100 px-4 text-xs font-bold text-coffee-600 hover:bg-cream-100"
                                >
                                    انصراف
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-xs font-black text-white hover:bg-coffee-800 disabled:opacity-50"
                                >
                                    {isSaving ? <FiLoader className="animate-spin" /> : <FiCheck />}
                                    ذخیره تغییرات
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}
