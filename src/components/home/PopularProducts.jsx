import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import ProductCard from "@/components/product/ProductCard";

export default function PopularProducts({
    products = [],
    eyebrow = "محبوب‌ها",
    title = "محصولات پرطرفدار",
    description = "",
    href = "/shop",
    linkTitle = "مشاهده همه",
}) {
    if (!products.length) return null;

    return (
        <section className="page-container section-spacing">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">{eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-black text-coffee-950">{title}</h2>
                    {description ? (
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                            {description}
                        </p>
                    ) : null}
                </div>

                <Link
                    href={href}
                    className="inline-flex shrink-0 items-center gap-2 text-xs font-black text-coffee-600 transition hover:text-caramel-600"
                >
                    {linkTitle}
                    <FiArrowLeft />
                </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.slice(0, 8).map((product) => (
                    <ProductCard
                        key={product._id || product.id || product.slug}
                        product={product}
                    />
                ))}
            </div>
        </section>
    );
}
