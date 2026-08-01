import { FiCheckCircle, FiMessageSquare, FiStar, FiUser } from "react-icons/fi";

import {
    reviewStatusClasses,
    reviewStatusLabels,
} from "@/constants/review";

import ReviewActions from "@/components/admin/reviews/ReviewActions";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

function Rating({ value }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
            <FiStar className="fill-current" />
            {Number(value || 0).toLocaleString("fa-IR")}
        </span>
    );
}

export default function ReviewsTable({ reviews }) {
    if (!reviews.length) {
        return (
            <div className="rounded-[1.75rem] border border-dashed border-coffee-200 bg-white px-6 py-16 text-center">
                <FiMessageSquare className="mx-auto text-4xl text-coffee-300" />
                <h3 className="mt-4 text-lg font-black text-coffee-950">نظری پیدا نشد</h3>
                <p className="mt-2 text-sm text-coffee-400">
                    فیلترها را تغییر بده یا منتظر ثبت نظر جدید باش.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)]">
            <div className="overflow-x-auto">
                <table className="min-w-[1050px] w-full text-right">
                    <thead className="bg-cream-50 text-[10px] font-bold text-coffee-400">
                        <tr>
                            <th className="px-5 py-4">نویسنده</th>
                            <th className="px-4 py-4">محصول</th>
                            <th className="px-4 py-4">متن نظر</th>
                            <th className="px-4 py-4">امتیاز</th>
                            <th className="px-4 py-4">وضعیت</th>
                            <th className="px-4 py-4">تاریخ</th>
                            <th className="px-5 py-4">عملیات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reviews.map((review) => (
                            <tr
                                key={review._id}
                                className="border-b border-coffee-100 last:border-0 hover:bg-cream-50/60"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-coffee-100 text-coffee-600">
                                            <FiUser />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-black text-coffee-900">
                                                {review.author?.name || review.user?.name || "کاربر"}
                                            </p>
                                            <p dir="ltr" className="mt-1 truncate text-right text-[10px] text-coffee-400">
                                                {review.author?.email || review.user?.email || "—"}
                                            </p>
                                        </div>
                                    </div>

                                    {review.isVerifiedPurchase && (
                                        <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                                            <FiCheckCircle />
                                            خرید تأییدشده
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        {review.product?.image ? (
                                            <img
                                                src={review.product.image}
                                                alt={review.product.name}
                                                className="size-11 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <span className="size-11 rounded-xl bg-cream-100" />
                                        )}
                                        <p className="max-w-36 truncate text-xs font-black text-coffee-900">
                                            {review.product?.name || "محصول حذف‌شده"}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <p className="max-w-80 truncate text-xs font-black text-coffee-900">
                                        {review.title || "بدون عنوان"}
                                    </p>
                                    <p className="mt-1 max-w-80 line-clamp-2 text-[10px] leading-5 text-coffee-400">
                                        {review.content}
                                    </p>
                                </td>

                                <td className="px-4 py-4">
                                    <Rating value={review.rating} />
                                </td>

                                <td className="px-4 py-4">
                                    <span
                                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                            reviewStatusClasses[review.status]
                                        }`}
                                    >
                                        {reviewStatusLabels[review.status]}
                                    </span>

                                    {review.isFeatured && (
                                        <span className="mr-2 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-700">
                                            ویژه
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-4 text-[10px] text-coffee-500">
                                    {dateFormatter.format(new Date(review.createdAt))}
                                </td>

                                <td className="px-5 py-4">
                                    <ReviewActions review={review} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
