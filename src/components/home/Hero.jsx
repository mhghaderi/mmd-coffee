"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { products as featuredProductPool } from "@/data/products";

import {
    FiArrowLeft,
    FiCheck,
    FiClock,
    FiCoffee,
    FiRefreshCw,
    FiShoppingBag,
    FiStar,
} from "react-icons/fi";


function shuffleProducts(products) {
    const shuffledProducts = [...products];

    for (let index = shuffledProducts.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));

        [shuffledProducts[index], shuffledProducts[randomIndex]] = [
            shuffledProducts[randomIndex],
            shuffledProducts[index],
        ];
    }

    return shuffledProducts;
}

function haveSameProducts(firstIds, secondIds) {
    if (firstIds.length !== secondIds.length) {
        return false;
    }

    const sortedFirstIds = [...firstIds].sort();
    const sortedSecondIds = [...secondIds].sort();

    return sortedFirstIds.every((productId, index) => productId === sortedSecondIds[index]);
}

function selectFeaturedProducts(products, previousIds = [], count = 3) {
    /*
    بعداً این لیست از API می‌آید و از قبل بر اساس محبوبیت مرتب است.
    فعلاً محبوب‌ترین محصولات را بر اساس popularityScore جدا می‌کنیم.
  */

    const popularPool = [...products]
        .sort((firstProduct, secondProduct) => {
            return secondProduct.popularityScore - firstProduct.popularityScore;
        })
        .slice(0, 8);

    if (popularPool.length <= count) {
        return popularPool;
    }

    let selectedProducts = popularPool.slice(0, count);

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const nextSelection = shuffleProducts(popularPool).slice(0, count);

        const nextIds = nextSelection.map((product) => product.id);

        if (!haveSameProducts(nextIds, previousIds)) {
            selectedProducts = nextSelection;
            break;
        }
    }

    return selectedProducts;
}

export default function Hero() {
    const initialProducts = [...featuredProductPool]
        .sort((firstProduct, secondProduct) => {
            return secondProduct.popularityScore - firstProduct.popularityScore;
        })
        .slice(0, 3);

    const [visibleProducts, setVisibleProducts] = useState(initialProducts);
    const [activeProductId, setActiveProductId] = useState(initialProducts[0].id);

    const activeProduct =
        visibleProducts.find((product) => product.id === activeProductId) ||
        visibleProducts[0] ||
        featuredProductPool[0];

    useEffect(() => {
        let previousIds = [];

        try {
            const storedIds = sessionStorage.getItem("mmd-coffee-last-hero-products");

            if (storedIds) {
                previousIds = JSON.parse(storedIds);
            }
        } catch {
            previousIds = [];
        }

        const selectedProducts = selectFeaturedProducts(featuredProductPool, previousIds, 3);

        const selectedIds = selectedProducts.map((product) => product.id);

        setVisibleProducts(selectedProducts);
        setActiveProductId(selectedProducts[0].id);

        sessionStorage.setItem("mmd-coffee-last-hero-products", JSON.stringify(selectedIds));
    }, []);

    const handleRefreshProducts = () => {
        const currentIds = visibleProducts.map((product) => product.id);

        const selectedProducts = selectFeaturedProducts(featuredProductPool, currentIds, 3);

        const selectedIds = selectedProducts.map((product) => product.id);

        setVisibleProducts(selectedProducts);
        setActiveProductId(selectedProducts[0].id);

        sessionStorage.setItem("mmd-coffee-last-hero-products", JSON.stringify(selectedIds));
    };

    return (
        <section className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden">
            {/* Background decorations */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-36 -top-40 size-[420px] rounded-full bg-caramel-200/40 blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-56 -left-44 size-[520px] rounded-full bg-coffee-200/40 blur-3xl"
            />

            <div className="page-container relative grid min-h-[calc(100svh-76px)] items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-20">
                {/* Hero content */}

                <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-coffee-200 bg-white/75 px-4 py-2 text-xs font-semibold text-coffee-700 shadow-sm backdrop-blur-md sm:text-sm">
                        <span className="flex size-6 items-center justify-center rounded-full bg-caramel-100 text-caramel-700">
                            <FiCoffee />
                        </span>
                        پیشنهادهای محبوب ممد کافی
                    </div>

                    <h1 className="mt-7 max-w-2xl text-4xl font-black leading-[1.35] tracking-tight text-coffee-950 sm:text-5xl lg:text-6xl xl:text-[68px]">
                        هر روزت را با یک
                        <span
                            className="relative mx-2 inline-block"
                            style={{ color: activeProduct.accent }}
                        >
                            فنجان خوب
                            <span
                                aria-hidden="true"
                                className="absolute bottom-1 right-0 -z-10 h-3 w-full rounded-full opacity-25"
                                style={{ backgroundColor: activeProduct.accent }}
                            />
                        </span>
                        شروع کن
                    </h1>

                    <p className="mt-6 max-w-xl text-sm leading-8 text-coffee-600 sm:text-base lg:text-lg lg:leading-9">
                        در ممد کافی، هر نوشیدنی با دانه‌های تازه، ترکیب دقیق و توجه به جزئیات آماده
                        می‌شود؛ از اولین جرعه تا آخرین لحظه.
                    </p>

                    {/* Active product information */}

                    <div className="mt-7 min-h-[108px] rounded-2xl border border-coffee-100 bg-white/65 p-4 shadow-sm backdrop-blur-md sm:p-5">
                        <div className="flex items-start justify-between gap-5">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-coffee-400">
                                    {activeProduct.englishName}
                                </p>

                                <h2 className="mt-1 text-xl font-black text-coffee-950">
                                    {activeProduct.name}
                                </h2>
                            </div>

                            <span
                                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold"
                                style={{
                                    color: activeProduct.accent,
                                    backgroundColor: `${activeProduct.accent}20`,
                                }}
                            >
                                {activeProduct.shortDescription}
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-coffee-600">
                            {activeProduct.description}
                        </p>
                    </div>

                    {/* Product selector */}

                    <div className="mt-4 rounded-2xl border border-coffee-100 bg-white/60 p-2 shadow-sm backdrop-blur-md">
                        <div className="grid grid-cols-3 gap-2">
                            {visibleProducts.map((product) => {
                                const isActive = product.id === activeProduct.id;

                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setActiveProductId(product.id)}
                                        className={`relative min-h-14 rounded-xl px-2 py-2.5 text-center text-xs font-bold transition-all duration-300 sm:text-sm ${
                                            isActive
                                                ? "bg-coffee-900 text-white shadow-md"
                                                : "text-coffee-600 hover:bg-white hover:text-coffee-950"
                                        }`}
                                    >
                                        {product.name}

                                        {isActive && (
                                            <span
                                                className="absolute bottom-1.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full"
                                                style={{ backgroundColor: product.accent }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={handleRefreshProducts}
                            className="group mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-coffee-500 transition hover:bg-white hover:text-coffee-950"
                        >
                            <FiRefreshCw className="transition-transform duration-500 group-hover:-rotate-180" />
                            نمایش سه پیشنهاد تازه
                        </button>
                    </div>

                    {/* Main action */}

                    <div className="mt-8">
                        <Link
                            href="/menu"
                            className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-coffee-900 px-7 text-sm font-bold text-white shadow-[0_16px_35px_rgba(48,32,26,0.20)] transition duration-300 hover:-translate-y-1 hover:bg-coffee-800 hover:shadow-[0_20px_45px_rgba(48,32,26,0.28)]"
                        >
                            <FiShoppingBag className="text-lg" />
                            مشاهده منوی ممد کافی
                            <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                        </Link>
                    </div>

                    {/* Trust points */}

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-coffee-500 sm:text-sm">
                        {["دانه تازه‌برشت", "آماده‌سازی حرفه‌ای", "سفارش سریع و آسان"].map(
                            (item) => (
                                <span key={item} className="flex items-center gap-2">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-success/10 text-success">
                                        <FiCheck size={12} />
                                    </span>

                                    {item}
                                </span>
                            ),
                        )}
                    </div>
                </div>

                {/* Interactive product visual */}

                <div className="order-1 lg:order-2">
                    <div
                        className="relative mx-auto aspect-[4/4] w-full max-w-[570px] overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-[0_35px_100px_rgba(48,32,26,0.28)] transition-all duration-500 sm:p-7 lg:rounded-[2.5rem]"
                        style={{ background: activeProduct.gradient }}
                    >
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                                backgroundSize: "38px 38px",
                            }}
                        />

                        <div
                            aria-hidden="true"
                            className="absolute -left-20 -top-20 size-72 rounded-full blur-3xl"
                            style={{ backgroundColor: `${activeProduct.accent}35` }}
                        />

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <span className="text-xs font-semibold tracking-[0.2em] text-white/45">
                                    MMD COFFEE
                                </span>

                                <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                    {activeProduct.name}
                                </h3>
                            </div>

                            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">
                                <FiStar className="fill-caramel-300 text-caramel-300" />

                                {activeProduct.rating.toLocaleString("fa-IR")}
                            </div>
                        </div>

                        <div className="relative z-10 flex h-[62%] items-center justify-center">
                            <div className="absolute size-[76%] animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-white/15" />

                            <div
                                className="absolute size-[58%] rounded-full opacity-20 blur-2xl transition-colors duration-500"
                                style={{ backgroundColor: activeProduct.accent }}
                            />

                            {/* Product cutout image */}

                            <div className="hero-float relative h-[140%] w-[140%]">
                                {activeProduct.image ? (
                                    <Image
                                        key={activeProduct.id}
                                        src={activeProduct.image}
                                        alt={`تصویر ${activeProduct.name}`}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 65vw, 420px"
                                        className="object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.38)]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            className="flex size-32 items-center justify-center rounded-full shadow-2xl transition-colors duration-500 sm:size-40"
                                            style={{
                                                backgroundColor: activeProduct.accent,
                                                boxShadow: `0 18px 55px ${activeProduct.accent}45`,
                                            }}
                                        >
                                            <FiCoffee className="text-5xl text-coffee-950 sm:text-6xl" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-[4%] right-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-xl backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-white/10">
                                        <FiClock />
                                    </span>

                                    <div>
                                        <p className="text-[10px] text-white/50">زمان آماده‌سازی</p>

                                        <p className="mt-0.5 text-xs font-bold">
                                            {activeProduct.preparationTime}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute left-0 top-[8%] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-xl backdrop-blur-xl">
                                <p className="text-[10px] text-white/50">پروفایل طعمی</p>

                                <p className="mt-1 text-xs font-bold">{activeProduct.intensity}</p>
                            </div>
                        </div>

                        <div className="relative z-10 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl sm:p-5">
                            <div className="flex items-end justify-between gap-5">
                                <div>
                                    <p className="text-xs text-white/50">پیشنهاد محبوب امروز</p>

                                    <p className="mt-1 text-lg font-black text-white">
                                        {activeProduct.name}
                                    </p>
                                </div>

                                <Link
                                    href={`/menu?product=${activeProduct.id}`}
                                    aria-label={`مشاهده ${activeProduct.name}`}
                                    className="group flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-coffee-950 transition duration-300 hover:scale-105"
                                >
                                    <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-xs leading-6 text-coffee-400">
                        از میان محبوب‌ترین محصولات، سه پیشنهاد تازه برایت انتخاب می‌شود.
                    </p>
                </div>
            </div>
        </section>
    );
}
