"use client";

import Link from "next/link";
import { useState } from "react";
import { FiCheckCircle, FiSend } from "react-icons/fi";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/ui/notify";

export default function ContactForm() {
    const [form, setForm] = useState({
        subject: "",
        category: "other",
        message: "",
    });
    const [status, setStatus] = useState({ type: "idle", message: "" });
    const [ticketNumber, setTicketNumber] = useState("");

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus({ type: "loading", message: "" });

        try {
            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    priority: "normal",
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    const message = "برای ثبت و پیگیری پیام، ابتدا وارد حساب کاربری شو.";
                    setStatus({ type: "auth", message });
                    notifyWarning("ابتدا وارد حساب شو", message);
                    return;
                }

                throw new Error(payload.message || "ارسال پیام انجام نشد");
            }

            setTicketNumber(payload.data?.ticketNumber || "");
            setForm({ subject: "", category: "other", message: "" });
            setStatus({ type: "success", message: "پیام با موفقیت ثبت شد." });
            notifySuccess("پیام با موفقیت ثبت شد", payload.data?.ticketNumber || "");
        } catch (error) {
            const message = error.message || "ارسال پیام انجام نشد";
            setStatus({ type: "error", message });
            notifyError("ارسال پیام انجام نشد", message);
        }
    };

    if (status.type === "success") {
        return (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[2rem] border border-success/20 bg-white p-8 text-center shadow-sm">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-green-50 text-success">
                    <FiCheckCircle size={28} />
                </span>
                <h2 className="mt-5 text-xl font-black text-coffee-950">پیامت ثبت شد</h2>
                <p className="mt-3 text-sm leading-7 text-coffee-500">
                    شماره پیگیری: <strong className="text-coffee-900">{ticketNumber}</strong>
                </p>
                <Link
                    href="/user/tickets"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-coffee-900 px-5 text-xs font-black text-white"
                >
                    مشاهده تیکت‌ها
                </Link>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="self-start rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-sm sm:p-7"
        >
            <p className="text-xs font-bold text-caramel-600">ارسال پیام</p>
            <h2 className="mt-2 text-2xl font-black text-coffee-950">چطور کمکت کنیم؟</h2>
            <p className="mt-3 text-sm leading-7 text-coffee-500">
                پیام در سیستم تیکت ثبت می‌شود تا پاسخ آن را از حساب کاربری پیگیری کنی.
            </p>

            <div className="mt-6 space-y-4">
                <label className="block">
                    <span className="mb-2 block text-xs font-bold text-coffee-600">موضوع</span>
                    <input
                        required
                        minLength={3}
                        maxLength={160}
                        value={form.subject}
                        onChange={(event) => updateField("subject", event.target.value)}
                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none focus:border-caramel-400 focus:bg-white"
                        placeholder="مثلاً پیگیری سفارش یا سؤال درباره محصول"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-bold text-coffee-600">دسته‌بندی</span>
                    <select
                        value={form.category}
                        onChange={(event) => updateField("category", event.target.value)}
                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none focus:border-caramel-400 focus:bg-white"
                    >
                        <option value="order">سفارش</option>
                        <option value="payment">پرداخت</option>
                        <option value="product">محصول</option>
                        <option value="account">حساب کاربری</option>
                        <option value="suggestion">پیشنهاد و انتقاد</option>
                        <option value="other">سایر موارد</option>
                    </select>
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-bold text-coffee-600">متن پیام</span>
                    <textarea
                        required
                        minLength={2}
                        maxLength={5000}
                        rows={7}
                        value={form.message}
                        onChange={(event) => updateField("message", event.target.value)}
                        className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-7 text-coffee-950 outline-none focus:border-caramel-400 focus:bg-white"
                        placeholder="جزئیات درخواستت را بنویس..."
                    />
                </label>
            </div>

            {status.message && (
                <div className={`mt-4 rounded-xl px-4 py-3 text-xs font-bold ${
                    status.type === "auth"
                        ? "bg-caramel-50 text-caramel-700"
                        : "bg-red-50 text-danger"
                }`}>
                    {status.message}
                    {status.type === "auth" && (
                        <Link href="/login?next=/contact" className="mr-2 underline">
                            ورود به حساب
                        </Link>
                    )}
                </div>
            )}

            <button
                type="submit"
                disabled={status.type === "loading"}
                className="mt-5 flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-sm font-black text-white transition hover:bg-coffee-800 disabled:cursor-wait disabled:opacity-60"
            >
                <FiSend />
                {status.type === "loading" ? "در حال ارسال..." : "ثبت و ارسال پیام"}
            </button>
        </form>
    );
}
