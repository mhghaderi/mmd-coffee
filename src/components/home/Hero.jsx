"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
    FiArrowLeft,
    FiCheck,
    FiClock,
    FiCoffee,
    FiRefreshCw,
    FiShoppingBag,
    FiStar,
} from "react-icons/fi";

import { useStore } from "@/context/StoreContext";
import getProductHref from "@/lib/catalog/getProductHref";

function productId(product) {
    return String(product?._id || product?.id || product?.slug || "");
}

function getPopularityScore(product) {
    return (
        Number(product?.popularityScore || 0) * 1.3 +
        Number(product?.salesCount || 0) * 0.65 +
        Number(product?.ratingAverage || product?.rating || 0) * 12 +
        Number(product?.reviewsCount || 0) * 0.15 +
        (product?.isFeatured ? 20 : 0)
    );
}

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
    if (firstIds.length !== secondIds.length) return false;

    const sortedFirstIds = [...firstIds].sort();
    const sortedSecondIds = [...secondIds].sort();

    return sortedFirstIds.every((id, index) => id === sortedSecondIds[index]);
}

function selectFeaturedProducts(products, previousIds = [], count = 3) {
    
    const popularPool = [...products]
        .filter((product) => product && product.isAvailable !== false && product.status !== "draft")
        .sort((first, second) => getPopularityScore(second) - getPopularityScore(first))
        .slice(0, 12);

    if (popularPool.length <= count) return popularPool;

    let selectedProducts = popularPool.slice(0, count);

    for (let attempt = 0; attempt < 12; attempt += 1) {
        const nextSelection = shuffleProducts(popularPool).slice(0, count);
        const nextIds = nextSelection.map(productId);

        if (!haveSameProducts(nextIds, previousIds)) {
            selectedProducts = nextSelection;
            break;
        }
    }

    return selectedProducts;
}

function getAccent(product) {
    return product?.accentColor || product?.category?.accentColor || "#c8793f";
}

function getHeroGradient(product) {
    const accent = getAccent(product);
    return `linear-gradient(145deg, #261814 0%, #3a241d 52%, ${accent} 150%)`;
}

function getIntensityLabel(value) {
    const labels = {
        low: "ملایم",
        medium: "متعادل",
        high: "قوی",
    };

    return labels[value] || "متعادل";
}

export default function Hero({ products = [], content = {} }) {
    const { recordInteraction } = useStore();

    const candidates = useMemo(
        () => [...products].sort((a, b) => getPopularityScore(b) - getPopularityScore(a)).slice(0, 12),
        [products],
    );

    const initialProducts = candidates.slice(0, 3);
    const [visibleProducts, setVisibleProducts] = useState(initialProducts);
    const [activeProductId, setActiveProductId] = useState(productId(initialProducts[0]));

    const activeProduct =
        visibleProducts.find((product) => productId(product) === activeProductId) ||
        visibleProducts[0] ||
        candidates[0] ||
        null;

    useEffect(() => {
        if (!candidates.length) {
            setVisibleProducts([]);
            setActiveProductId("");
            return;
        }

        let previousIds = [];

        try {
            const storedIds = sessionStorage.getItem("mmd-coffee-last-hero-products");
            if (storedIds) previousIds = JSON.parse(storedIds);
        } catch {
            previousIds = [];
        }

        const selectedProducts = selectFeaturedProducts(candidates, previousIds, 3);
        const selectedIds = selectedProducts.map(productId);

        setVisibleProducts(selectedProducts);
        setActiveProductId(productId(selectedProducts[0]));

        try {
            sessionStorage.setItem(
                "mmd-coffee-last-hero-products",
                JSON.stringify(selectedIds),
            );
        } catch {}
    }, [candidates]);

    const handleRefreshProducts = () => {
        const currentIds = visibleProducts.map(productId);
        const selectedProducts = selectFeaturedProducts(candidates, currentIds, 3);
        const selectedIds = selectedProducts.map(productId);

        setVisibleProducts(selectedProducts);
        setActiveProductId(productId(selectedProducts[0]));

        try {
            sessionStorage.setItem(
                "mmd-coffee-last-hero-products",
                JSON.stringify(selectedIds),
            );
        } catch {}
    };

    const selectProduct = (product) => {
        setActiveProductId(productId(product));
        recordInteraction(product, "view");
    };

    if (!activeProduct) return null;

    const accent = getAccent(activeProduct);
    const activeHref = getProductHref(activeProduct);
    const preparationText =
        Number(activeProduct.preparationTime) > 0
            ? `${Number(activeProduct.preparationTime).toLocaleString("fa-IR")} دقیقه`
            : "آماده ارسال";

    const trustPoints =
        Array.isArray(content.trustPoints) && content.trustPoints.length
            ? content.trustPoints
            : ["دانه تازه‌برشت", "آماده‌سازی حرفه‌ای", "سفارش سریع و آسان"];

    return (
        <section className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden">
            
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-36 -top-40 size-[420px] rounded-full bg-caramel-200/40 blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-56 -left-44 size-[520px] rounded-full bg-coffee-200/40 blur-3xl"
            />

            <div className="page-container relative grid min-h-[calc(100svh-76px)] items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-20">
                <div className="order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-coffee-200 bg-white/75 px-4 py-2 text-xs font-semibold text-coffee-700 shadow-sm backdrop-blur-md sm:text-sm">
                        <span className="flex size-6 items-center justify-center rounded-full bg-caramel-100 text-caramel-700">
                            <FiCoffee />
                        </span>
                        {content.eyebrow || "پیشنهادهای محبوب ممد کافی"}
                    </div>

                    <h1 className="mt-7 max-w-2xl text-4xl font-black leading-[1.35] tracking-tight text-coffee-950 sm:text-5xl lg:text-6xl xl:text-[68px]">
                        {content.titlePrefix || "هر روزت را با یک"}
                        <span className="relative mx-2 inline-block" style={{ color: accent }}>
                            {content.highlightTitle || "فنجان خوب"}
                            <span
                                aria-hidden="true"
                                className="absolute bottom-1 right-0 -z-10 h-3 w-full rounded-full opacity-25"
                                style={{ backgroundColor: accent }}
                            />
                        </span>
                        {content.titleSuffix || "شروع کن"}
                    </h1>

                    <p className="mt-6 max-w-xl text-sm leading-8 text-coffee-600 sm:text-base lg:text-lg lg:leading-9">
                        {content.description ||
                            "در ممد کافی، هر نوشیدنی و محصول با انتخاب دقیق و توجه به جزئیات آماده می‌شود؛ از اولین جرعه تا آخرین لحظه."}
                    </p>

                    <div className="mt-7 min-h-[108px] rounded-2xl border border-coffee-100 bg-white/65 p-4 shadow-sm backdrop-blur-md sm:p-5">
                        <div className="flex items-start justify-between gap-5">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-coffee-400">
                                    {activeProduct.englishName || activeProduct.categoryTitle || "MMD Coffee"}
                                </p>
                                <h2 className="mt-1 text-xl font-black text-coffee-950">
                                    {activeProduct.name}
                                </h2>
                            </div>

                            <span
                                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold"
                                style={{ color: accent, backgroundColor: `${accent}20` }}
                            >
                                {activeProduct.shortDescription || "انتخاب محبوب"}
                            </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-coffee-600">
                            {activeProduct.description || activeProduct.shortDescription}
                        </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-coffee-100 bg-white/60 p-2 shadow-sm backdrop-blur-md">
                        <div className="grid grid-cols-3 gap-2">
                            {visibleProducts.map((product) => {
                                const id = productId(product);
                                const isActive = id === productId(activeProduct);
                                const productAccent = getAccent(product);

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => selectProduct(product)}
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
                                                style={{ backgroundColor: productAccent }}
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
                            {content.refreshTitle || "نمایش سه پیشنهاد تازه"}
                        </button>
                    </div>

                    <div className="mt-8">
                        <Link
                            href={content.primaryActionHref || "/menu"}
                            className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-coffee-900 px-7 text-sm font-bold !text-white shadow-[0_16px_35px_rgba(48,32,26,0.20)] transition duration-300 hover:-translate-y-1 hover:bg-coffee-800 hover:shadow-[0_20px_45px_rgba(48,32,26,0.28)]"
                        >
                            <FiShoppingBag className="text-lg" />
                            {content.primaryActionTitle || "مشاهده منوی ممد کافی"}
                            <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-coffee-500 sm:text-sm">
                        {trustPoints.map((item) => (
                            <span key={item} className="flex items-center gap-2">
                                <span className="flex size-5 items-center justify-center rounded-full bg-success/10 text-success">
                                    <FiCheck size={12} />
                                </span>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="order-1 lg:order-2">
                    <div
                        className="relative mx-auto aspect-[4/4] w-full max-w-[570px] overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-[0_35px_100px_rgba(48,32,26,0.28)] transition-all duration-500 sm:p-7 lg:rounded-[2.5rem]"
                        style={{ background: activeProduct.heroGradient || getHeroGradient(activeProduct) }}
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
                            style={{ backgroundColor: `${accent}35` }}
                        />

                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <span className="text-xs font-semibold tracking-[0.2em] text-white/45">
                                    {content.brandLabel || "MMD COFFEE"}
                                </span>
                                <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                    {activeProduct.name}
                                </h3>
                            </div>

                            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">
                                <FiStar className="fill-caramel-300 text-caramel-300" />
                                {Number(activeProduct.ratingAverage || activeProduct.rating || 0).toLocaleString("fa-IR", {
                                    maximumFractionDigits: 1,
                                })}
                            </div>
                        </div>

                        <div className="relative z-10 flex h-[62%] items-center justify-center">
                            <div className="absolute size-[76%] animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-white/15" />
                            <div
                                className="absolute size-[58%] rounded-full opacity-20 blur-2xl transition-colors duration-500"
                                style={{ backgroundColor: accent }}
                            />

                            <div className="hero-float relative h-[140%] w-[140%]">
                                {activeProduct.image ? (
                                    <Image
                                        key={productId(activeProduct)}
                                        src={activeProduct.image}
                                        alt={activeProduct.imageAlt || `تصویر ${activeProduct.name}`}
                                        fill
                                        priority
                                        unoptimized={Boolean(typeof activeProduct?.image === "string" && activeProduct.image.startsWith("http"))}
                                        sizes="(max-width: 768px) 65vw, 420px"
                                        className="object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.38)]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                            className="flex size-32 items-center justify-center rounded-full shadow-2xl transition-colors duration-500 sm:size-40"
                                            style={{
                                                backgroundColor: accent,
                                                boxShadow: `0 18px 55px ${accent}45`,
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
                                        <p className="text-[10px] text-white/50">
                                            {content.preparationLabel || "زمان آماده‌سازی"}
                                        </p>
                                        <p className="mt-0.5 text-xs font-bold">{preparationText}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute left-0 top-[8%] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-xl backdrop-blur-xl">
                                <p className="text-[10px] text-white/50">
                                    {content.intensityLabel || "پروفایل طعمی"}
                                </p>
                                <p className="mt-1 text-xs font-bold">
                                    {getIntensityLabel(activeProduct.intensity)}
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl sm:p-5">
                            <div className="flex items-end justify-between gap-5">
                                <div>
                                    <p className="text-xs text-white/50">
                                        {content.popularLabel || "پیشنهاد محبوب امروز"}
                                    </p>
                                    <p className="mt-1 text-lg font-black text-white">
                                        {activeProduct.name}
                                    </p>
                                </div>

                                <Link
                                    href={activeHref}
                                    onClick={() => recordInteraction(activeProduct, "view")}
                                    aria-label={`مشاهده ${activeProduct.name}`}
                                    className="group flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-coffee-950 transition duration-300 hover:scale-105"
                                >
                                    <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-xs leading-6 text-coffee-400">
                        {content.rotationHint ||
                            "از میان محبوب‌ترین محصولات، سه پیشنهاد تازه برایت انتخاب می‌شود."}
                    </p>
                </div>
            </div>
        </section>
    );
}
