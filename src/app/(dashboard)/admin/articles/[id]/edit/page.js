import { notFound, redirect } from "next/navigation";

import ArticleForm from "@/components/admin/articles/ArticleForm";
import getArticleFormData from "@/lib/admin/articles/getArticleFormData";

export const dynamic = "force-dynamic";
export const metadata = { title: "ویرایش مقاله" };

export default async function EditArticlePage({ params }) {
    const { id } = await params;
    const data = await getArticleFormData(id);

    if (!data.authorized) redirect(`/login?next=/admin/articles/${encodeURIComponent(id)}/edit`);
    if (!data.article) notFound();

    return (
        <div className="space-y-6">
            <section>
                <p className="text-xs font-bold text-caramel-600">ویرایش محتوا</p>
                <h1 className="mt-2 text-3xl font-black text-coffee-950">{data.article.title}</h1>
            </section>
            <ArticleForm article={data.article} />
        </div>
    );
}
