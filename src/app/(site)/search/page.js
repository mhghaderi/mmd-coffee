import SearchCatalog from "@/components/catalog/SearchCatalog";
import getPublicCatalog from "@/lib/catalog/getPublicCatalog";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "جست‌وجوی محصولات",
    description: "جست‌وجو در منوی کافه و فروشگاه ممد کافی",
};

export default async function SearchPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const data = await getPublicCatalog(resolvedSearchParams);

    return (
        <main className="page-container py-10 sm:py-14">
            <section className="mb-8">
                <p className="text-xs font-bold text-caramel-600">جست‌وجوی ممد کافی</p>
                <h1 className="mt-2 text-3xl font-black text-coffee-950 sm:text-4xl">
                    نتیجه‌های منو و فروشگاه
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-coffee-500">
                    در نوشیدنی‌ها، دسرها، دانه قهوه و تجهیزات دم‌آوری جست‌وجو کن.
                </p>
            </section>

            <SearchCatalog
                products={data.products}
                categories={data.categories}
                filters={data.filters}
                pagination={data.pagination}
            />
        </main>
    );
}
