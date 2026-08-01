import ArticleForm from "@/components/admin/articles/ArticleForm";

export const metadata = { title: "مقاله جدید" };

export default function NewArticlePage() {
    return (
        <div className="space-y-6">
            <section>
                <p className="text-xs font-bold text-caramel-600">محتوای جدید</p>
                <h1 className="mt-2 text-3xl font-black text-coffee-950">ساخت مقاله</h1>
            </section>
            <ArticleForm />
        </div>
    );
}
