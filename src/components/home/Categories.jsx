import Link from "next/link";
import { FiArrowLeft, FiCoffee, FiShoppingBag } from "react-icons/fi";

export default function Categories({ categories = [], content = {} }) {
    if (!categories.length) return null;

    return (
        <section className="page-container section-spacing">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-caramel-600">{content.eyebrow || "دسته‌بندی‌ها"}</p>
                    <h2 className="mt-2 text-2xl font-black text-coffee-950 sm:text-3xl">{content.title || "سریع‌تر به انتخابت برس"}</h2>
                </div>
                <Link href="/menu" className="hidden items-center gap-2 text-xs font-black text-coffee-500 transition hover:text-caramel-600 sm:flex">
                    مشاهده منو <FiArrowLeft />
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((category) => {
                    const isShop = category.catalogType === "shop";
                    const Icon = isShop ? FiShoppingBag : FiCoffee;
                    const href = `${isShop ? "/shop" : "/menu"}?category=${encodeURIComponent(category.slug)}`;

                    return (
                        <Link key={category._id || category.slug} href={href} className="group flex min-w-[210px] items-center gap-4 rounded-2xl border border-coffee-100 bg-white px-4 py-4 shadow-[0_8px_30px_rgba(48,32,26,0.04)] transition hover:-translate-y-0.5 hover:border-caramel-200 hover:shadow-[0_16px_40px_rgba(48,32,26,0.08)]">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-coffee-700 transition group-hover:bg-coffee-900 group-hover:text-white">
                                <Icon />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-black text-coffee-950">{category.title}</span>
                                <span className="mt-1 block text-[10px] font-bold text-coffee-400">
                                    {isShop ? "فروشگاه" : "منوی کافه"} · {(Number(category.productCount) || 0).toLocaleString("fa-IR")} آیتم
                                </span>
                            </span>
                            <FiArrowLeft className="shrink-0 text-coffee-300 transition group-hover:-translate-x-1 group-hover:text-caramel-600" />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
