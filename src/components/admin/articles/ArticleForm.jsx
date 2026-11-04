"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheck, FiLoader, FiSave } from "react-icons/fi";

import ArticleImageUploader from "@/components/admin/articles/ArticleImageUploader";

const inputClass =
    "h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

function fieldLabel(title, required = false) {
    return (
        <span className="text-xs font-bold text-coffee-600">
            {title}
            {required && <span className="mr-1 text-red-500">*</span>}
        </span>
    );
}

export default function ArticleForm({ article = null }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({
        title: article?.title || "",
        slug: article?.slug || "",
        excerpt: article?.excerpt || "",
        content: article?.content || "",
        coverImage: article?.coverImage || "",
        coverImageAlt: article?.coverImageAlt || "",
        status: article?.status || "draft",
        tags: article?.tags?.join(", ") || "",
        readingTime: article?.readingTime || 5,
        isFeatured: Boolean(article?.isFeatured),
        seoTitle: article?.seoTitle || "",
        seoDescription: article?.seoDescription || "",
    });

    const update = (key, value) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setMessage("");

        try {
            const response = await fetch(
                article ? `/api/admin/articles/${article._id}` : "/api/admin/articles",
                {
                    method: article ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                },
            );

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || "ذخیره مقاله انجام نشد");
            }

            setMessage(payload.message);
            router.push("/admin/articles");
            router.refresh();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-7">
            <div className="flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-bold text-coffee-500 transition hover:text-coffee-950"
                >
                    <FiArrowRight />
                    بازگشت
                </button>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white disabled:opacity-50"
                >
                    {isSaving ? <FiLoader className="animate-spin" /> : article ? <FiCheck /> : <FiSave />}
                    {article ? "ذخیره تغییرات" : "ثبت مقاله"}
                </button>
            </div>

            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-7">
                    <section className="space-y-5 rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-[0_12px_40px_rgba(48,32,26,0.05)] sm:p-6">
                        <div>
                            <h2 className="text-lg font-black text-coffee-950">محتوای مقاله</h2>
                            <p className="mt-1 text-xs text-coffee-400">عنوان، خلاصه و متن اصلی را وارد کن.</p>
                        </div>

                        <label className="block space-y-2">
                            {fieldLabel("عنوان مقاله", true)}
                            <input
                                value={form.title}
                                onChange={(event) => update("title", event.target.value)}
                                className={inputClass}
                                maxLength={160}
                                required
                            />
                        </label>

                        <label className="block space-y-2">
                            {fieldLabel("اسلاگ انگلیسی", true)}
                            <input
                                dir="ltr"
                                value={form.slug}
                                onChange={(event) =>
                                    update(
                                        "slug",
                                        event.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]/g, "-")
                                            .replace(/-+/g, "-")
                                            .replace(/^-|-$/g, ""),
                                    )
                                }
                                className={`${inputClass} text-left`}
                                placeholder="coffee-brewing-guide"
                                required
                            />
                        </label>

                        <label className="block space-y-2">
                            {fieldLabel("خلاصه مقاله", true)}
                            <textarea
                                value={form.excerpt}
                                onChange={(event) => update("excerpt", event.target.value)}
                                rows={4}
                                maxLength={320}
                                required
                                className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-7 outline-none focus:border-caramel-400 focus:bg-white"
                            />
                        </label>

                        <label className="block space-y-2">
                            {fieldLabel("متن مقاله", true)}
                            <textarea
                                value={form.content}
                                onChange={(event) => update("content", event.target.value)}
                                rows={22}
                                required
                                className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-8 outline-none focus:border-caramel-400 focus:bg-white"
                                placeholder="متن مقاله را با پاراگراف‌بندی کامل وارد کن..."
                            />
                        </label>
                    </section>

                    <section className="space-y-5 rounded-[1.75rem] border border-coffee-100 bg-white p-5 sm:p-6">
                        <div>
                            <h2 className="text-lg font-black text-coffee-950">سئو</h2>
                            <p className="mt-1 text-xs text-coffee-400">عنوان و توضیح مناسب برای موتورهای جست‌وجو.</p>
                        </div>

                        <label className="block space-y-2">
                            {fieldLabel("عنوان سئو")}
                            <input
                                value={form.seoTitle}
                                onChange={(event) => update("seoTitle", event.target.value)}
                                maxLength={70}
                                className={inputClass}
                            />
                        </label>

                        <label className="block space-y-2">
                            {fieldLabel("توضیح سئو")}
                            <textarea
                                value={form.seoDescription}
                                onChange={(event) => update("seoDescription", event.target.value)}
                                rows={3}
                                maxLength={180}
                                className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-7 outline-none focus:border-caramel-400"
                            />
                        </label>
                    </section>
                </div>

                <aside className="space-y-7">
                    <section className="space-y-5 rounded-[1.75rem] border border-coffee-100 bg-white p-5">
                        <h2 className="text-base font-black text-coffee-950">انتشار</h2>

                        <label className="block space-y-2">
                            {fieldLabel("وضعیت")}
                            <select
                                value={form.status}
                                onChange={(event) => update("status", event.target.value)}
                                className={inputClass}
                            >
                                <option value="draft">پیش‌نویس</option>
                                <option value="published">منتشرشده</option>
                                
                            </select>
                        </label>

                        <label className="block space-y-2">
                            {fieldLabel("زمان مطالعه")}
                            <input
                                type="number"
                                min={1}
                                max={180}
                                value={form.readingTime}
                                onChange={(event) => update("readingTime", event.target.value)}
                                className={inputClass}
                            />
                        </label>

                        <label className="flex items-center gap-3 rounded-xl bg-cream-50 p-4">
                            <input
                                type="checkbox"
                                checked={form.isFeatured}
                                onChange={(event) => update("isFeatured", event.target.checked)}
                            />
                            <span className="text-xs font-bold text-coffee-700">مقاله ویژه</span>
                        </label>
                    </section>

                    <section className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5">
                        <h2 className="text-base font-black text-coffee-950">تصویر کاور</h2>
                        <ArticleImageUploader
                            value={form.coverImage}
                            onChange={(value) => update("coverImage", value)}
                        />
                        <label className="block space-y-2">
                            {fieldLabel("متن جایگزین تصویر")}
                            <input
                                value={form.coverImageAlt}
                                onChange={(event) => update("coverImageAlt", event.target.value)}
                                className={inputClass}
                            />
                        </label>
                    </section>

                    <section className="space-y-4 rounded-[1.75rem] border border-coffee-100 bg-white p-5">
                        <h2 className="text-base font-black text-coffee-950">برچسب‌ها</h2>
                        <textarea
                            value={form.tags}
                            onChange={(event) => update("tags", event.target.value)}
                            rows={4}
                            placeholder="قهوه، آموزش، دم‌آوری"
                            className="w-full rounded-xl border border-coffee-100 bg-cream-50 p-3 text-sm leading-7 outline-none focus:border-caramel-400"
                        />
                        <p className="text-[10px] leading-5 text-coffee-400">برچسب‌ها را با ویرگول جدا کن.</p>
                    </section>
                </aside>
            </div>

            {message && (
                <p className="rounded-xl bg-cream-100 px-4 py-3 text-sm font-bold text-coffee-700">
                    {message}
                </p>
            )}
        </form>
    );
}
