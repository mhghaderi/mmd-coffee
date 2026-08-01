import MenuCatalog from "@/components/menu/MenuCatalog";
import getMenuCatalog from "@/lib/catalog/getMenuCatalog";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "منوی کافه",
    description: "منوی قهوه، نوشیدنی و دسرهای ممد کافی",
};

export default async function MenuPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const data = await getMenuCatalog(resolvedSearchParams);

    return (
        <main className="page-container py-10 sm:py-14">
            <section className="mb-8">
                <p className="text-xs font-bold text-caramel-600">منوی ممد کافی</p>

                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-coffee-950 sm:text-4xl">
                            انتخاب طعم مورد علاقه
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-8 text-coffee-500">
                            نوشیدنی‌ها، دسرها و آیتم‌های فعال کافه مستقیماً از منوی ممد کافی نمایش داده می‌شوند.
                        </p>
                    </div>

                    <p className="text-xs font-bold text-coffee-400">
                        {data.pagination.total.toLocaleString("fa-IR")} محصول آماده سفارش
                    </p>
                </div>
            </section>

            <MenuCatalog
                products={data.products}
                categories={data.categories}
                filters={data.filters}
                pagination={data.pagination}
            />
        </main>
    );
}
