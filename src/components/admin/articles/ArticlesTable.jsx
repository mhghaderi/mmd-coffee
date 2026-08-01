import Link from "next/link";
import { FiEdit3, FiEye, FiFileText } from "react-icons/fi";

import {
    articleStatusClasses,
    articleStatusLabels,
} from "@/constants/article";

import ArticleActions from "@/components/admin/articles/ArticleActions";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

export default function ArticlesTable({ articles }) {
    if (!articles.length) {
        return (
            <div className="rounded-[1.75rem] border border-dashed border-coffee-200 bg-white px-6 py-16 text-center">
                <FiFileText className="mx-auto text-4xl text-coffee-300" />
                <h3 className="mt-4 text-lg font-black text-coffee-950">مقاله‌ای پیدا نشد</h3>
                <p className="mt-2 text-sm text-coffee-400">یک مقاله جدید بساز یا فیلترها را تغییر بده.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)]">
            <div className="overflow-x-auto">
                <table className="min-w-[1050px] w-full text-right">
                    <thead className="bg-cream-50 text-[10px] font-bold text-coffee-400">
                        <tr>
                            <th className="px-5 py-4">مقاله</th>
                            <th className="px-4 py-4">نویسنده</th>
                            <th className="px-4 py-4">وضعیت</th>
                            <th className="px-4 py-4">زمان مطالعه</th>
                            <th className="px-4 py-4">بازدید</th>
                            <th className="px-4 py-4">تاریخ</th>
                            <th className="px-5 py-4">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article._id} className="border-b border-coffee-100 last:border-0 hover:bg-cream-50/60">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        {article.coverImage ? (
                                            <img src={article.coverImage} alt="" className="size-14 rounded-xl object-cover" />
                                        ) : (
                                            <span className="flex size-14 items-center justify-center rounded-xl bg-cream-100 text-coffee-400">
                                                <FiFileText />
                                            </span>
                                        )}
                                        <div className="min-w-0">
                                            <p className="max-w-72 truncate text-xs font-black text-coffee-900">{article.title}</p>
                                            <p dir="ltr" className="mt-1 max-w-72 truncate text-right text-[10px] text-coffee-400">{article.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                    {article.author?.name || "مدیر"}
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${articleStatusClasses[article.status]}`}>
                                        {articleStatusLabels[article.status]}
                                    </span>
                                    {article.isFeatured && (
                                        <span className="mr-2 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-700">ویژه</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                    {Number(article.readingTime || 0).toLocaleString("fa-IR")} دقیقه
                                </td>
                                <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                    {Number(article.viewsCount || 0).toLocaleString("fa-IR")}
                                </td>
                                <td className="px-4 py-4 text-[10px] text-coffee-500">
                                    {dateFormatter.format(new Date(article.publishedAt || article.createdAt))}
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        {article.status === "published" && (
                                            <Link
                                                href={`/blog/${article.slug}`}
                                                target="_blank"
                                                className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100"
                                            >
                                                <FiEye />
                                            </Link>
                                        )}
                                        <Link
                                            href={`/admin/articles/${article._id}/edit`}
                                            className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100"
                                        >
                                            <FiEdit3 />
                                        </Link>
                                        <ArticleActions article={article} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
