"use client";

import Link from "next/link";

import { useMemo, useState } from "react";

import { FiArrowLeft, FiClock, FiPercent, FiStar } from "react-icons/fi";

import ProductCard from "@/components/product/ProductCard";

function mergeProducts(...collections) {
    const productMap = new Map();

    collections.flat().forEach((product) => {
        if (!product?._id) {
            return;
        }

        productMap.set(product._id, product);
    });

    return [...productMap.values()];
}

const filters = [
    {
        value: "popular",
        title: "محبوب‌ترین",
        icon: FiStar,
    },
    {
        value: "newest",
        title: "جدیدترین",
        icon: FiClock,
    },
    {
        value: "discounted",
        title: "تخفیف‌دار",
        icon: FiPercent,
    },
];

export default function PopularProducts({ products = [], newestProducts = [] }) {
    const [activeFilter, setActiveFilter] = useState("popular");

    const allProducts = useMemo(
        () => mergeProducts(products, newestProducts),
        [products, newestProducts],
    );

    const visibleProducts = useMemo(() => {
        if (activeFilter === "newest") {
            return newestProducts.slice(0, 8);
        }

        if (activeFilter === "discounted") {
            return allProducts
                .filter((product) => Number(product.discountPercent) > 0)
                .sort(
                    (first, second) =>
                        Number(second.discountPercent) - Number(first.discountPercent),
                )
                .slice(0, 8);
        }

        return products.slice(0, 8);
    }, [activeFilter, allProducts, newestProducts, products]);

    if (!allProducts.length) {
        return null;
    }

    return (
        <section className="page-container section-spacing">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">انتخاب‌های پرطرفدار</p>

                    <h2 className="mt-2 text-3xl font-black text-coffee-950">محبوب‌های ممد کافی</h2>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-coffee-500">
                        محصولاتی که بیشتر از بقیه مورد توجه مشتری‌های ممد کافی قرار گرفته‌اند.
                    </p>
                </div>

                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                    {filters.map((filter) => {
                        const Icon = filter.icon;

                        const isActive = activeFilter === filter.value;

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setActiveFilter(filter.value)}
                                className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                                    isActive
                                        ? "bg-coffee-900 text-white shadow-sm"
                                        : "border border-coffee-100 bg-white text-coffee-500 hover:bg-cream-100 hover:text-coffee-950"
                                }`}
                            >
                                <Icon className="text-current" />

                                <span className="text-current">{filter.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {visibleProducts.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="rounded-[2rem] border border-dashed border-coffee-200 bg-white px-6 py-14 text-center">
                    <FiPercent className="mx-auto text-3xl text-coffee-300" />

                    <h3 className="mt-4 text-lg font-black text-coffee-950">
                        فعلاً محصول تخفیف‌داری نداریم
                    </h3>

                    <p className="mt-2 text-sm text-coffee-400">سایر محصولات محبوب را بررسی کن.</p>
                </div>
            )}

            <div className="mt-8 flex justify-center">
                <Link
                    href={
                        activeFilter === "discounted"
                            ? "/menu?discounted=true"
                            : activeFilter === "newest"
                              ? "/menu?sort=newest"
                              : "/menu?sort=popular"
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-6 text-sm font-black text-coffee-700 transition hover:bg-coffee-900 hover:text-white"
                >
                    <span className="text-current">مشاهده محصولات بیشتر</span>

                    <FiArrowLeft className="text-current" />
                </Link>
            </div>
        </section>
    );
}
