import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight, FiClock, FiCoffee, FiEye, FiUser } from "react-icons/fi";

import { getPublicArticle } from "@/lib/articles/getPublicArticles";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const article = await getPublicArticle(slug);

    if (!article) {
        return {
            title: "مقاله پیدا نشد",
        };
    }

    return {
        title: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt,
        openGraph: article.coverImage
            ? {
                  images: [article.coverImage],
              }
            : undefined,
    };
}

export default async function ArticlePage({ params }) {
    const { slug } = await params;
    const article = await getPublicArticle(slug);

    if (!article) {
        notFound();
    }

    return (
        <main className="page-container py-10 sm:py-16">
            <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-coffee-500 transition hover:text-coffee-950"
            >
                <FiArrowRight />
                بازگشت به مجله
            </Link>

            <article className="mx-auto mt-7 max-w-4xl overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_18px_65px_rgba(48,32,26,0.07)]">
                {article.coverImage ? (
                    <img
                        src={article.coverImage}
                        alt={article.coverImageAlt || article.title}
                        className="max-h-[520px] w-full object-cover"
                    />
                ) : (
                    <div className="flex h-80 items-center justify-center bg-cream-100 text-coffee-300">
                        <FiCoffee size={54} />
                    </div>
                )}

                <div className="p-6 sm:p-10">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-coffee-400">
                        <span className="inline-flex items-center gap-1.5">
                            <FiUser />
                            {article.author?.name || "ممد کافی"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <FiClock />
                            {Number(article.readingTime || 0).toLocaleString("fa-IR")} دقیقه مطالعه
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <FiEye />
                            {Number(article.viewsCount || 0).toLocaleString("fa-IR")} بازدید
                        </span>
                        <span>{dateFormatter.format(new Date(article.publishedAt))}</span>
                    </div>

                    <h1 className="mt-6 text-3xl font-black leading-[1.55] text-coffee-950 sm:text-5xl">
                        {article.title}
                    </h1>

                    <p className="mt-5 text-base font-bold leading-9 text-coffee-500">
                        {article.excerpt}
                    </p>

                    <div className="my-8 h-px bg-coffee-100" />

                    <div className="whitespace-pre-line text-sm leading-10 text-coffee-700 sm:text-base">
                        {article.content}
                    </div>

                    {article.tags?.length > 0 && (
                        <div className="mt-10 flex flex-wrap gap-2 border-t border-coffee-100 pt-6">
                            {article.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                                    className="rounded-full bg-cream-100 px-4 py-2 text-[10px] font-bold text-coffee-600"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </article>
        </main>
    );
}
