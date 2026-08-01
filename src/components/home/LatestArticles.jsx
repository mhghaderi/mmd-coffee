import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiClock } from "react-icons/fi";

function formatDate(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(value));
}

export default function LatestArticles({ articles = [], content = {} }) {
    if (!articles.length) return null;

    return (
        <section className="page-container pb-20 pt-8 sm:pb-24 sm:pt-10">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">
                        {content.eyebrow || "مجله ممد کافی"}
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-coffee-950">
                        {content.title || "جدیدترین مقالات"}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                        {content.description ||
                            "راهنمای قهوه، دم‌آوری و انتخاب بهتر؛ مستقیم از مقالات منتشرشده سایت."}
                    </p>
                </div>

                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-xs font-black text-coffee-600 transition hover:text-caramel-600"
                >
                    {content.linkTitle || "همه مقالات"}
                    <FiArrowLeft />
                </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {articles.slice(0, 3).map((article) => (
                    <article
                        key={article._id || article.slug}
                        className="group overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_35px_rgba(48,32,26,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(48,32,26,0.11)]"
                    >
                        <Link href={`/blog/${article.slug}`} className="block">
                            <div className="relative aspect-[16/9] overflow-hidden bg-cream-100">
                                {article.coverImage ? (
                                    <Image
                                        src={article.coverImage}
                                        alt={article.coverImageAlt || article.title}
                                        fill
                                        sizes="(max-width: 768px) 94vw, 33vw"
                                        className="object-cover transition duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,125,75,0.35),transparent_48%),linear-gradient(145deg,#2c1b16,#55362b)]" />
                                )}
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-coffee-400">
                                    {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
                                    {Number(article.readingTime) > 0 ? (
                                        <span className="inline-flex items-center gap-1">
                                            <FiClock />
                                            {Number(article.readingTime).toLocaleString("fa-IR")} دقیقه مطالعه
                                        </span>
                                    ) : null}
                                </div>

                                <h3 className="mt-3 line-clamp-2 text-lg font-black leading-8 text-coffee-950 transition group-hover:text-caramel-600">
                                    {article.title}
                                </h3>
                                <p className="mt-3 line-clamp-2 text-sm leading-7 text-coffee-500">
                                    {article.excerpt || "ادامه مقاله را در مجله ممد کافی بخوان."}
                                </p>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
