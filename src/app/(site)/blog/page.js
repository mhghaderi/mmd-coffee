import Link from "next/link";
import { FiArrowLeft, FiClock, FiCoffee, FiEye, FiTag } from "react-icons/fi";

import { getPublicArticles } from "@/lib/articles/getPublicArticles";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "مجله ممد کافی",
    description: "آموزش، داستان و دانستنی‌های قهوه در مجله ممد کافی",
};

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

function pageHref(page, tag) {
    const params = new URLSearchParams();

    if (page > 1) {
        params.set("page", String(page));
    }

    if (tag) {
        params.set("tag", tag);
    }

    const query = params.toString();
    return query ? `/blog?${query}` : "/blog";
}

export default async function BlogPage({ searchParams }) {
    const data = await getPublicArticles(await searchParams);

    return (
        <main className="page-container py-12 sm:py-16">
            <section className="relative overflow-hidden rounded-[2.25rem] bg-coffee-950 px-6 py-12 text-white sm:px-10">
                <div className="absolute -left-20 -top-20 size-72 rounded-full bg-caramel-500/20 blur-3xl" />
                <div className="relative max-w-2xl">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-caramel-300">
                        <FiCoffee size={24} />
                    </span>
                    <p className="mt-6 text-xs font-bold text-caramel-300">مجله ممد کافی</p>
                    <h1 className="mt-2 text-4xl font-black sm:text-5xl">دانستنی‌های قهوه</h1>
                    <p className="mt-5 text-sm leading-8 text-white/55">
                        راهنماهای کاربردی، داستان قهوه و نکته‌هایی برای تجربه بهتر هر فنجان.
                    </p>
                </div>
            </section>

            {data.tag && (
                <div className="mt-8 flex items-center justify-between rounded-2xl bg-cream-100 px-5 py-4">
                    <span className="inline-flex items-center gap-2 text-xs font-black text-coffee-700">
                        <FiTag />
                        برچسب: {data.tag}
                    </span>
                    <Link href="/blog" className="text-xs font-bold text-caramel-700">
                        حذف فیلتر
                    </Link>
                </div>
            )}

            {data.articles.length ? (
                <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {data.articles.map((article) => (
                        <article
                            key={article._id}
                            className="group overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)] transition hover:-translate-y-1"
                        >
                            <Link href={`/blog/${article.slug}`} className="block">
                                {article.coverImage ? (
                                    <img
                                        src={article.coverImage}
                                        alt={article.coverImageAlt || article.title}
                                        className="h-56 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-56 items-center justify-center bg-cream-100 text-coffee-300">
                                        <FiCoffee size={42} />
                                    </div>
                                )}
                            </Link>

                            <div className="p-5">
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-coffee-400">
                                    <span className="inline-flex items-center gap-1">
                                        <FiClock />
                                        {Number(article.readingTime || 0).toLocaleString("fa-IR")} دقیقه
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <FiEye />
                                        {Number(article.viewsCount || 0).toLocaleString("fa-IR")}
                                    </span>
                                    <span>{dateFormatter.format(new Date(article.publishedAt))}</span>
                                </div>

                                <Link href={`/blog/${article.slug}`}>
                                    <h2 className="mt-4 line-clamp-2 text-xl font-black leading-8 text-coffee-950 transition group-hover:text-caramel-700">
                                        {article.title}
                                    </h2>
                                </Link>

                                <p className="mt-3 line-clamp-3 text-xs leading-7 text-coffee-500">
                                    {article.excerpt}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {article.tags?.slice(0, 3).map((tag) => (
                                        <Link
                                            key={tag}
                                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                                            className="rounded-full bg-cream-100 px-3 py-1 text-[9px] font-bold text-coffee-600"
                                        >
                                            {tag}
                                        </Link>
                                    ))}
                                </div>

                                <Link
                                    href={`/blog/${article.slug}`}
                                    className="mt-6 inline-flex items-center gap-2 text-xs font-black text-caramel-700"
                                >
                                    مطالعه مقاله
                                    <FiArrowLeft />
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <section className="mt-10 rounded-[2rem] border border-dashed border-coffee-200 bg-white py-20 text-center">
                    <FiCoffee className="mx-auto text-5xl text-coffee-300" />
                    <h2 className="mt-5 text-2xl font-black text-coffee-950">فعلاً مقاله‌ای منتشر نشده</h2>
                </section>
            )}

            {data.pagination.pages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-3">
                    {data.pagination.hasPreviousPage && (
                        <Link
                            href={pageHref(data.pagination.page - 1, data.tag)}
                            className="rounded-xl border border-coffee-100 bg-white px-5 py-3 text-xs font-black text-coffee-700"
                        >
                            صفحه قبل
                        </Link>
                    )}

                    <span className="text-xs font-bold text-coffee-400">
                        صفحه {data.pagination.page.toLocaleString("fa-IR")} از{" "}
                        {data.pagination.pages.toLocaleString("fa-IR")}
                    </span>

                    {data.pagination.hasNextPage && (
                        <Link
                            href={pageHref(data.pagination.page + 1, data.tag)}
                            className="rounded-xl border border-coffee-100 bg-white px-5 py-3 text-xs font-black text-coffee-700"
                        >
                            صفحه بعد
                        </Link>
                    )}
                </nav>
            )}
        </main>
    );
}
