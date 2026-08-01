"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiLoader, FiRotateCcw, FiTrash2, FiX } from "react-icons/fi";

export default function ArchiveItemActions({ item }) {
    const router = useRouter();
    const [action, setAction] = useState("");
    const [showDelete, setShowDelete] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const execute = async (method) => {
        setAction(method);
        setErrorMessage("");

        try {
            const response = await fetch(`/api/admin/archive/${item.type}/${item._id}`, { method });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "عملیات انجام نشد");
            }

            setShowDelete(false);
            router.refresh();
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setAction("");
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={Boolean(action)}
                    onClick={() => execute("PATCH")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 text-[10px] font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                >
                    {action === "PATCH" ? <FiLoader className="animate-spin" /> : <FiRotateCcw />}
                    بازیابی
                </button>
                <button
                    type="button"
                    disabled={Boolean(action)}
                    onClick={() => setShowDelete(true)}
                    className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    aria-label="حذف دائمی"
                >
                    <FiTrash2 />
                </button>
            </div>

            {showDelete && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="بستن"
                        onClick={() => !action && setShowDelete(false)}
                        className="absolute inset-0 bg-coffee-950/45 backdrop-blur-sm"
                    />
                    <section className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowDelete(false)}
                            className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-xl bg-cream-100 text-coffee-600"
                        >
                            <FiX />
                        </button>
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <FiTrash2 size={22} />
                        </span>
                        <h2 className="mt-5 text-xl font-black text-coffee-950">حذف دائمی «{item.title}»؟</h2>
                        <p className="mt-3 text-xs leading-7 text-coffee-500">
                            این عملیات قابل بازگشت نیست. موارد دارای وابستگی مهم، مانند محصول استفاده‌شده در سفارش، حذف نخواهند شد.
                        </p>
                        {errorMessage && (
                            <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{errorMessage}</p>
                        )}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={Boolean(action)}
                                onClick={() => setShowDelete(false)}
                                className="h-11 rounded-xl border border-coffee-100 text-xs font-black text-coffee-600"
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                disabled={Boolean(action)}
                                onClick={() => execute("DELETE")}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-black text-white disabled:opacity-50"
                            >
                                {action === "DELETE" ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                                حذف دائمی
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
