"use client";

import { useMemo, useState } from "react";

import ProductCard from "@/components/product/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { getPopularProducts, productCategories } from "@/data/products";

export default function PopularProducts() {
    const [activeCategory, setActiveCategory] = useState("all");

    const popularProducts = useMemo(() => getPopularProducts(8), []);

    const filteredProducts = useMemo(() => {
        if (activeCategory === "all") {
            return popularProducts;
        }

        return popularProducts.filter((product) => product.category === activeCategory);
    }, [activeCategory, popularProducts]);

    return (
        <section className="section-spacing bg-white">
            <div className="page-container">
                <SectionHeading
                    eyebrow="محبوب‌ترین انتخاب‌ها"
                    title="پرطرفدارهای ممد کافی"
                    description="محصولاتی که بیشتر از بقیه سفارش داده شده‌اند و امتیاز بالاتری از مشتری‌ها گرفته‌اند."
                    actionTitle="مشاهده همه محصولات"
                    actionHref="/menu"
                />

                <div className="mt-8 flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {productCategories.map((category) => {
                        const isActive = activeCategory === category.id;

                        return (
                            <button
                                key={category.id}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setActiveCategory(category.id)}
                                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                                    isActive
                                        ? "bg-coffee-900 text-white shadow-md"
                                        : "border border-coffee-100 bg-cream-50 text-coffee-600 hover:border-coffee-200 hover:bg-cream-100 hover:text-coffee-950"
                                }`}
                            >
                                {category.shortTitle}
                            </button>
                        );
                    })}
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-dashed border-coffee-200 bg-cream-50 px-5 text-center">
                        <p className="text-lg font-black text-coffee-900">
                            محصولی در این دسته وجود ندارد
                        </p>

                        <p className="mt-2 text-sm text-coffee-500">
                            با اضافه‌شدن محصولات جدید، این قسمت هم به‌روزرسانی می‌شود.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
