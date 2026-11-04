"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
    FiCheck,
    FiChevronLeft,
    FiClock,
    FiHeart,
    FiMinus,
    FiPlus,
    FiShoppingBag,
    FiStar,
    FiTag,
} from "react-icons/fi";

import { useStore } from "@/context/StoreContext";
import ProductReviews from "@/components/product/ProductReviews";
import { notifyInfo, notifySuccess, notifyWarning } from "@/lib/ui/notify";

const priceFormatter = new Intl.NumberFormat("fa-IR");
const FALLBACK_IMAGE = "/images/shop/product-placeholder.svg";

export default function ProductDetails({ product, detailBasePath = "/menu" }) {
    const { addToCart, toggleWishlist, isInWishlist, recordInteraction } = useStore();

    const activeVariants = useMemo(
        () => (Array.isArray(product.variants) ? product.variants : []),
        [product.variants],
    );

    const activeAddOns = useMemo(
        () => (Array.isArray(product.addOns) ? product.addOns : []),
        [product.addOns],
    );

    const defaultVariant =
        activeVariants.find((variant) => variant.isDefault) ||
        activeVariants[0] ||
        null;

    const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id || "");
    const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(product.image || FALLBACK_IMAGE);
    const [showAdded, setShowAdded] = useState(false);

    const selectedVariant =
        activeVariants.find((variant) => variant.id === selectedVariantId) ||
        null;

    const selectedAddOns = activeAddOns.filter((addOn) =>
        selectedAddOnIds.includes(addOn.id),
    );

    const finalPrice =
        Number(product.finalPrice) ||
        Math.round(
            (Number(product.price) || 0) *
                (1 - (Number(product.discountPercent) || 0) / 100),
        );

    const unitPrice =
        finalPrice +
        (Number(selectedVariant?.priceAdjustment) || 0) +
        selectedAddOns.reduce(
            (sum, addOn) => sum + (Number(addOn.price) || 0),
            0,
        );

    const isFavorite = isInWishlist(product);
    const gallery = [product.image, ...(product.gallery || [])].filter(Boolean);
    const normalizedProduct = {
        ...product,
        detailBasePath,
    };

    useEffect(() => {
        recordInteraction(normalizedProduct, "view");

    }, [product._id, product.id, product.slug]);

    const toggleAddOn = (id) => {
        setSelectedAddOnIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    const handleAddToCart = () => {
        const added = addToCart(normalizedProduct, {
            quantity,
            variant: selectedVariant,
            addOns: selectedAddOns,
            detailBasePath,
        });

        if (added === false) {
            notifyWarning("افزودن محصول انجام نشد");
            return;
        }

        notifySuccess("به سبد اضافه شد", product.name);
        setShowAdded(true);
        window.setTimeout(() => setShowAdded(false), 1500);
    };

    return (
        <main className="page-container py-10 sm:py-14">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-coffee-400">
                <Link href="/" className="transition hover:text-caramel-600">خانه</Link>
                <FiChevronLeft />
                <Link href={detailBasePath} className="transition hover:text-caramel-600">
                    {detailBasePath === "/shop" ? "فروشگاه" : "منو"}
                </Link>
                <FiChevronLeft />
                <span className="text-coffee-700">{product.name}</span>
            </nav>

            <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div>
                    <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-coffee-100 bg-white shadow-[0_24px_70px_rgba(48,32,26,0.08)]">
                        <div
                            className="absolute inset-0 opacity-60"
                            style={{
                                background: `radial-gradient(circle at center, ${product.accentColor}35, transparent 68%)`,
                            }}
                        />
                        <Image
                            src={activeImage || FALLBACK_IMAGE}
                            alt={product.name}
                            fill
                            priority
                            unoptimized={Boolean(typeof activeImage === "string" && activeImage.startsWith("http"))}
                            sizes="(max-width: 1024px) 92vw, 45vw"
                            className="object-contain p-12 drop-shadow-[0_30px_35px_rgba(48,32,26,0.2)]"
                        />
                    </div>

                    {gallery.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                            {gallery.map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    onClick={() => setActiveImage(image)}
                                    className={`relative size-20 shrink-0 overflow-hidden rounded-2xl border bg-white transition ${
                                        activeImage === image
                                            ? "border-caramel-500"
                                            : "border-coffee-100 hover:border-coffee-200"
                                    }`}
                                >
                                    <Image
                                        src={image || FALLBACK_IMAGE}
                                        alt={`${product.name} ${index + 1}`}
                                        fill
                                        sizes="80px"
                                        className="object-contain p-2"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-[2.5rem] border border-coffee-100 bg-white p-6 shadow-[0_24px_70px_rgba(48,32,26,0.07)] sm:p-9">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-wider text-caramel-600">
                                {product.englishName || product.categoryTitle}
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-coffee-950 sm:text-4xl">
                                {product.name}
                            </h1>
                        </div>

                        <button
                            type="button"
                            aria-label="افزودن به علاقه‌مندی‌ها"
                            aria-pressed={isFavorite}
                            onClick={() => {
                                toggleWishlist(normalizedProduct);
                                if (isFavorite) {
                                    notifyInfo("از علاقه‌مندی‌ها حذف شد", product.name);
                                } else {
                                    notifySuccess("به علاقه‌مندی‌ها اضافه شد", product.name);
                                }
                            }}
                            className={`flex size-12 items-center justify-center rounded-2xl border transition ${
                                isFavorite
                                    ? "border-red-100 bg-red-50 text-red-500"
                                    : "border-coffee-100 bg-cream-50 text-coffee-600 hover:text-red-500"
                            }`}
                        >
                            <FiHeart className={isFavorite ? "fill-current" : ""} />
                        </button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-caramel-50 px-3 py-2 text-caramel-700">
                            <FiStar className="fill-caramel-400 text-caramel-400" />
                            {(Number(product.ratingAverage) || 0).toLocaleString("fa-IR", {
                                maximumFractionDigits: 1,
                            })}
                            <span className="text-caramel-500/70">
                                ({Number(product.reviewsCount).toLocaleString("fa-IR")} نظر)
                            </span>
                        </span>

                        {Number(product.preparationTime) > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-2 text-coffee-600">
                                <FiClock />
                                {Number(product.preparationTime).toLocaleString("fa-IR")} دقیقه
                            </span>
                        )}

                        {product.isNew && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-coffee-900 px-3 py-2 text-white">
                                <FiTag />
                                محصول جدید
                            </span>
                        )}
                    </div>

                    <p className="mt-6 text-sm leading-8 text-coffee-500 sm:text-base">
                        {product.description || product.shortDescription}
                    </p>

                    {activeVariants.length > 0 && (
                        <div className="mt-7 border-t border-coffee-100 pt-6">
                            <p className="text-sm font-black text-coffee-900">انتخاب مدل</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {activeVariants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        onClick={() => setSelectedVariantId(variant.id)}
                                        className={`rounded-xl border px-4 py-3 text-xs font-black transition ${
                                            selectedVariantId === variant.id
                                                ? "border-coffee-900 bg-coffee-900 text-white"
                                                : "border-coffee-100 bg-cream-50 text-coffee-700 hover:border-coffee-200"
                                        }`}
                                    >
                                        {variant.title}
                                        {Number(variant.priceAdjustment) > 0 && (
                                            <span className="mr-1 opacity-70">
                                                +{priceFormatter.format(variant.priceAdjustment)}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeAddOns.length > 0 && (
                        <div className="mt-7 border-t border-coffee-100 pt-6">
                            <p className="text-sm font-black text-coffee-900">افزودنی‌ها</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {activeAddOns.map((addOn) => {
                                    const selected = selectedAddOnIds.includes(addOn.id);

                                    return (
                                        <button
                                            key={addOn.id}
                                            type="button"
                                            onClick={() => toggleAddOn(addOn.id)}
                                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-right transition ${
                                                selected
                                                    ? "border-caramel-400 bg-caramel-50"
                                                    : "border-coffee-100 bg-cream-50 hover:border-coffee-200"
                                            }`}
                                        >
                                            <span>
                                                <span className="block text-xs font-black text-coffee-800">
                                                    {addOn.title}
                                                </span>
                                                <span className="mt-1 block text-[10px] text-coffee-400">
                                                    +{priceFormatter.format(addOn.price)} تومان
                                                </span>
                                            </span>
                                            <span className={`flex size-6 items-center justify-center rounded-lg border ${
                                                selected
                                                    ? "border-caramel-500 bg-caramel-500 text-white"
                                                    : "border-coffee-200 text-transparent"
                                            }`}>
                                                <FiCheck size={13} />
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 border-t border-coffee-100 pt-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                {Number(product.discountPercent) > 0 && (
                                    <p className="text-sm text-coffee-400 line-through">
                                        {priceFormatter.format(product.price)} تومان
                                    </p>
                                )}
                                <p className="mt-1 text-2xl font-black text-coffee-950">
                                    {priceFormatter.format(unitPrice * quantity)}
                                    <span className="mr-1 text-sm font-medium text-coffee-500">تومان</span>
                                </p>
                            </div>

                            <div className="flex items-center rounded-xl border border-coffee-100 bg-cream-50 p-1">
                                <button
                                    type="button"
                                    aria-label="کاهش تعداد"
                                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                    className="flex size-10 items-center justify-center rounded-lg text-coffee-700 transition hover:bg-white"
                                >
                                    <FiMinus />
                                </button>
                                <span className="w-10 text-center text-sm font-black text-coffee-950">
                                    {quantity.toLocaleString("fa-IR")}
                                </span>
                                <button
                                    type="button"
                                    aria-label="افزایش تعداد"
                                    onClick={() => setQuantity((current) => current + 1)}
                                    className="flex size-10 items-center justify-center rounded-lg text-coffee-700 transition hover:bg-white"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className={`mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition ${
                                showAdded
                                    ? "bg-success"
                                    : "bg-coffee-900 hover:bg-coffee-800"
                            }`}
                        >
                            {showAdded ? <FiCheck /> : <FiShoppingBag />}
                            {showAdded ? "به سبد اضافه شد" : "افزودن به سبد خرید"}
                        </button>
                    </div>

                    {Array.isArray(product.ingredients) && product.ingredients.length > 0 && (
                        <div className="mt-7 border-t border-coffee-100 pt-6">
                            <p className="text-sm font-black text-coffee-900">ترکیبات و ویژگی‌ها</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {product.ingredients.map((ingredient) => (
                                    <span
                                        key={ingredient}
                                        className="rounded-full bg-cream-100 px-3 py-2 text-[11px] font-bold text-coffee-600"
                                    >
                                        {ingredient}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <ProductReviews product={product} />
        </main>
    );
}
