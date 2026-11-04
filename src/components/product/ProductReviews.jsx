"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCheckCircle, FiMessageCircle, FiStar } from "react-icons/fi";
import useCurrentUser from "@/hooks/useCurrentUser";
import { notifyError, notifySuccess } from "@/lib/ui/notify";

function formatDate(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(value));
}

function Stars({ value = 0, interactive = false, onChange }) {
    return (
        <div className="flex items-center gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= value;
                if (!interactive) {
                    return (
                        <FiStar
                            key={star}
                            className={active ? "fill-caramel-400 text-caramel-400" : "text-coffee-200"}
                        />
                    );
                }

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange?.(star)}
                        aria-label={`${star} ستاره`}
                        className="text-xl transition hover:scale-110"
                    >
                        <FiStar
                            className={active ? "fill-caramel-400 text-caramel-400" : "text-coffee-200"}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export default function ProductReviews({ product }) {
    const { user, isLoading: userLoading } = useCurrentUser();
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ ratingAverage: 0, reviewsCount: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        rating: 5,
        title: "",
        content: "",
        name: "",
        email: "",
    });

    const productId = String(product?._id || product?.id || "");

    const loadReviews = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, {
                cache: "no-store",
                credentials: "include",
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || "دریافت نظرات انجام نشد");
            }

            setReviews(Array.isArray(payload?.data?.reviews) ? payload.data.reviews : []);
            setSummary({
                ratingAverage: Number(payload?.data?.product?.ratingAverage) || 0,
                reviewsCount: Number(payload?.data?.product?.reviewsCount) || 0,
            });
        } catch (error) {
            console.error("LOAD PRODUCT REVIEWS ERROR:", error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const submitReview = async (event) => {
        event.preventDefault();
        if (!productId || submitting) return;

        setSubmitting(true);
        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    rating: form.rating,
                    title: form.title,
                    content: form.content,
                    name: user?.name || form.name,
                    email: user?.email || form.email,
                }),
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || "ثبت نظر انجام نشد");
            }

            setForm((current) => ({
                ...current,
                rating: 5,
                title: "",
                content: "",
            }));

            await notifySuccess("نظر شما با موفقیت ثبت شد");
            loadReviews();
        } catch (error) {
            notifyError("ثبت نظر انجام نشد", error.message || "دوباره تلاش کن");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mt-12 border-t border-coffee-100 pt-10 sm:mt-16 sm:pt-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
                <div className="h-fit rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-sm sm:p-7">
                    <p className="text-xs font-bold text-caramel-600">تجربه مشتری‌ها</p>
                    <h2 className="mt-2 text-2xl font-black text-coffee-950">نظر درباره {product.name}</h2>

                    <div className="mt-5 flex items-center gap-4 rounded-2xl bg-cream-50 p-4">
                        <span className="text-3xl font-black text-coffee-950">
                            {summary.ratingAverage.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
                        </span>
                        <div>
                            <Stars value={Math.round(summary.ratingAverage)} />
                            <p className="mt-1 text-[11px] font-bold text-coffee-400">
                                از {summary.reviewsCount.toLocaleString("fa-IR")} نظر تأییدشده
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submitReview} className="mt-7 space-y-4">
                        <div>
                            <label className="text-xs font-black text-coffee-700">امتیاز تو</label>
                            <div className="mt-2">
                                <Stars
                                    value={form.rating}
                                    interactive
                                    onChange={(rating) => setForm((current) => ({ ...current, rating }))}
                                />
                            </div>
                        </div>

                        {!userLoading && !user ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                <input
                                    value={form.name}
                                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                    placeholder="نام شما"
                                    className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none transition focus:border-caramel-400"
                                    required
                                />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                                    placeholder="ایمیل (اختیاری)"
                                    className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none transition focus:border-caramel-400"
                                />
                            </div>
                        ) : null}

                        <input
                            value={form.title}
                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                            placeholder="عنوان کوتاه نظر (اختیاری)"
                            maxLength={120}
                            className="h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none transition focus:border-caramel-400"
                        />

                        <textarea
                            value={form.content}
                            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                            placeholder="تجربه‌ات از این محصول را بنویس..."
                            minLength={5}
                            maxLength={2000}
                            rows={5}
                            required
                            className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm leading-7 outline-none transition focus:border-caramel-400"
                        />

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-coffee-900 text-sm font-black text-white transition hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FiMessageCircle />
                            {submitting ? "در حال ثبت..." : "ارسال نظر برای بررسی"}
                        </button>
                    </form>
                </div>

                <div>
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-caramel-600">نظرات تأییدشده</p>
                            <h3 className="mt-2 text-2xl font-black text-coffee-950">مشتری‌ها چه گفته‌اند؟</h3>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="h-40 animate-pulse rounded-[1.5rem] bg-white" />
                            ))}
                        </div>
                    ) : reviews.length ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <article
                                    key={review._id}
                                    className="rounded-[1.5rem] border border-coffee-100 bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-coffee-950">
                                                    {review.author?.name || "مشتری ممد کافی"}
                                                </h4>
                                                {review.isVerifiedPurchase ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[9px] font-black text-green-700">
                                                        <FiCheckCircle /> خرید تأییدشده
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-1 text-[10px] font-bold text-coffee-400">
                                                {formatDate(review.createdAt)}
                                            </p>
                                        </div>
                                        <Stars value={Number(review.rating) || 0} />
                                    </div>

                                    {review.title ? (
                                        <p className="mt-4 text-sm font-black text-coffee-800">{review.title}</p>
                                    ) : null}
                                    <p className="mt-2 whitespace-pre-line text-sm leading-8 text-coffee-600">
                                        {review.content}
                                    </p>

                                    {Boolean(review.adminReply?.message || (typeof review.adminReply === "string" && review.adminReply.trim())) ? (
                                        <div className="mt-5 rounded-2xl border border-caramel-100 bg-caramel-50/70 p-4">
                                            <p className="text-[10px] font-black text-caramel-700">پاسخ ممد کافی</p>
                                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-coffee-700">
                                                {review.adminReply?.message || review.adminReply}
                                            </p>
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[1.75rem] border border-dashed border-coffee-200 bg-white px-6 py-14 text-center">
                            <FiMessageCircle className="mx-auto text-3xl text-coffee-300" />
                            <p className="mt-4 text-sm font-black text-coffee-700">هنوز نظر تأییدشده‌ای ثبت نشده.</p>
                            <p className="mt-2 text-xs leading-6 text-coffee-400">اولین تجربه را تو ثبت کن.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
