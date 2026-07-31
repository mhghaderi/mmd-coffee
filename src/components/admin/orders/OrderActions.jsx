"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FiCheck, FiLoader, FiSettings, FiX } from "react-icons/fi";

import { getAllowedOrderStatuses, getAllowedPaymentStatuses } from "@/lib/orders/orderTransitions";

import { orderStatusConfig, paymentStatusConfig } from "@/constants/order-ui";

export default function OrderActions({ order }) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);

    const [status, setStatus] = useState(order.status);

    const [paymentStatus, setPaymentStatus] = useState(order.payment.status);

    const [transactionId, setTransactionId] = useState(order.payment.transactionId || "");

    const [note, setNote] = useState("");

    const [cancellationReason, setCancellationReason] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const allowedStatuses = getAllowedOrderStatuses({
        currentStatus: order.status,

        deliveryMethod: order.delivery.method,
    });

    const allowedPaymentStatuses = getAllowedPaymentStatuses(order.payment.status);

    const submitChanges = async () => {
        if (isSubmitting) {
            return;
        }

        const statusChanged = status !== order.status;

        const paymentChanged = paymentStatus !== order.payment.status;

        if (!statusChanged && !paymentChanged) {
            setIsOpen(false);
            return;
        }

        if (status === "cancelled" && cancellationReason.trim().length < 3) {
            setErrorMessage("دلیل لغو سفارش را وارد کن");

            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            if (statusChanged) {
                const response = await fetch(`/api/orders/${order._id}/status`, {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        status,
                        note,
                        cancellationReason,
                    }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "تغییر وضعیت انجام نشد");
                }
            }

            if (paymentChanged) {
                const response = await fetch(`/api/orders/${order._id}/payment`, {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        status: paymentStatus,
                        note,
                        transactionId: transactionId.trim(),
                    }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "تغییر پرداخت انجام نشد");
                }
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
                onClick={() => setIsOpen(true)}
                className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 text-coffee-600 hover:bg-cream-100"
                aria-label={`مدیریت سفارش ${order.orderNumber}`}
            >
                <FiSettings />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => !isSubmitting && setIsOpen(false)}
                        className="absolute inset-0 bg-coffee-950/45 backdrop-blur-sm"
                    />

                    <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-xl bg-cream-100 text-coffee-600"
                        >
                            <FiX />
                        </button>

                        <p className="text-xs font-bold text-caramel-600">{order.orderNumber}</p>

                        <h2 className="mt-2 text-2xl font-black text-coffee-950">مدیریت سفارش</h2>

                        <div className="mt-6">
                            <label className="mb-2 block text-sm font-bold text-coffee-800">
                                وضعیت سفارش
                            </label>

                            <select
                                value={status}
                                disabled={allowedStatuses.length === 0}
                                onChange={(event) => setStatus(event.target.value)}
                                className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none"
                            >
                                <option value={order.status}>
                                    {orderStatusConfig[order.status].title}
                                </option>

                                {allowedStatuses.map((nextStatus) => (
                                    <option key={nextStatus} value={nextStatus}>
                                        {orderStatusConfig[nextStatus].title}
                                    </option>
                                ))}
                            </select>
                            {paymentStatus === "paid" && (
                                <div className="mt-5">
                                    <label className="mb-2 block text-sm font-bold text-coffee-800">
                                        شناسه تراکنش
                                    </label>

                                    <input
                                        type="text"
                                        dir="ltr"
                                        value={transactionId}
                                        onChange={(event) => setTransactionId(event.target.value)}
                                        placeholder="شناسه یا شماره پیگیری پرداخت"
                                        className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-left text-sm text-coffee-950 outline-none transition focus:border-caramel-400 focus:ring-4 focus:ring-caramel-100"
                                    />
                                </div>
                            )}
                        </div>

                        {status === "cancelled" && (
                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    دلیل لغو
                                </label>

                                <textarea
                                    rows={3}
                                    value={cancellationReason}
                                    onChange={(event) => setCancellationReason(event.target.value)}
                                    className="w-full rounded-xl border border-red-100 bg-red-50 p-4 text-sm outline-none"
                                />
                            </div>
                        )}

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-bold text-coffee-800">
                                وضعیت پرداخت
                            </label>

                            <select
                                value={paymentStatus}
                                disabled={allowedPaymentStatuses.length === 0}
                                onChange={(event) => setPaymentStatus(event.target.value)}
                                className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none"
                            >
                                <option value={order.payment.status}>
                                    {paymentStatusConfig[order.payment.status].title}
                                </option>

                                {allowedPaymentStatuses.map((nextStatus) => (
                                    <option key={nextStatus} value={nextStatus}>
                                        {paymentStatusConfig[nextStatus].title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-bold text-coffee-800">
                                یادداشت مدیریت
                            </label>

                            <textarea
                                rows={3}
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="توضیح اختیاری درباره این تغییر..."
                                className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm outline-none"
                            />
                        </div>

                        {errorMessage && (
                            <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={submitChanges}
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-coffee-900 text-sm font-black text-white disabled:opacity-50"
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
                    </div>
                </div>
            )}
        </>
    );
}
