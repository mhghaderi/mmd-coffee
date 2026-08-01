import ShopCatalog from "@/components/catalog/ShopCatalog";
import getShopCatalog from "@/lib/catalog/getShopCatalog";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "فروشگاه قهوه و تجهیزات",
    description:
        "خرید دانه قهوه تازه‌برشت، ابزار دم‌آوری و اکسسوری‌های ممد کافی",
};

export default async function ShopPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const data = await getShopCatalog(resolvedSearchParams);

    return (
        <main className="page-container py-10 sm:py-14">
            <section className="relative mb-8 overflow-hidden rounded-[2.25rem] bg-coffee-950 px-6 py-10 text-white sm:px-10 lg:px-14">
                <div className="absolute -left-20 -top-24 size-72 rounded-full bg-caramel-500/20 blur-3xl" />
                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <p className="text-xs font-bold text-caramel-300">فروشگاه ممد کافی</p>
                        <h1 className="mt-3 text-3xl font-black sm:text-5xl">
                            قهوه را حرفه‌ای‌تر تجربه کن
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-8 text-white/60 sm:text-base">
                            دانه‌های تازه‌برشت، ابزارهای دم‌آوری و اکسسوری‌های منتخب؛
                            آماده ارسال برای یک فنجان بهتر در خانه یا محل کار.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                            <p className="text-lg font-black text-caramel-300">تازه</p>
                            <p className="mt-1 text-[10px] text-white/45">رُست روز</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                            <p className="text-lg font-black text-caramel-300">اصل</p>
                            <p className="mt-1 text-[10px] text-white/45">ضمانت کالا</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                            <p className="text-lg font-black text-caramel-300">سریع</p>
                            <p className="mt-1 text-[10px] text-white/45">ارسال امن</p>
                        </div>
                    </div>
                </div>
            </section>

            <ShopCatalog
                products={data.products}
                categories={data.categories}
                filters={data.filters}
                pagination={data.pagination}
            />
        </main>
    );
}
