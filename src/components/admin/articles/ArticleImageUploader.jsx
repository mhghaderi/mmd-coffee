"use client";

import { useRef, useState } from "react";
import { FiImage, FiLoader, FiTrash2, FiUploadCloud } from "react-icons/fi";

export default function ArticleImageUploader({ value, onChange }) {
    const inputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState("");

    const upload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setIsUploading(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/uploads/articles", {
                method: "POST",
                body: formData,
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || "آپلود تصویر انجام نشد");
            }

            onChange(payload.data.url);
            setMessage("تصویر با موفقیت آپلود شد");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            {value ? (
                <div className="relative overflow-hidden rounded-[1.5rem] border border-coffee-100 bg-cream-50">
                    <img src={value} alt="" className="h-64 w-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute left-3 top-3 flex size-10 items-center justify-center rounded-xl bg-white/90 text-red-600 shadow-lg"
                        aria-label="حذف تصویر"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex h-56 w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-coffee-200 bg-cream-50 text-coffee-400 transition hover:border-caramel-400 hover:text-caramel-600"
                >
                    {isUploading ? <FiLoader className="animate-spin text-3xl" /> : <FiImage className="text-4xl" />}
                    <span className="mt-3 text-sm font-black">
                        {isUploading ? "در حال آپلود..." : "انتخاب تصویر کاور"}
                    </span>
                    <span className="mt-1 text-[10px]">PNG، JPG یا WebP تا ۵ مگابایت</span>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={upload}
                className="hidden"
            />

            {value && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600"
                >
                    {isUploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
                    تغییر تصویر
                </button>
            )}

            {message && <p className="text-xs font-bold text-coffee-500">{message}</p>}
        </div>
    );
}
