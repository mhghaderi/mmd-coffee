"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
    FiCheck,
    FiHeart,
    FiMinus,
    FiPlus,
    FiShoppingBag,
    FiStar,
    FiZap,
} from "react-icons/fi";

import { useStore } from "@/context/StoreContext";
import getProductHref from "@/lib/catalog/getProductHref";
import { notifyInfo, notifySuccess, notifyWarning } from "@/lib/ui/notify";

const priceFormatter = new Intl.NumberFormat("fa-IR");
const FALLBACK_IMAGE = "/images/shop/product-placeholder.svg";

function getFinalPrice(product) {
    if (Number.isFinite(Number(product?.finalPrice))) {
        return Number(product.finalPrice);
    }

    const price = Number(product?.price) || 0;
    const discountPercent = Math.min(
        Math.max(Number(product?.discountPercent) || 0, 0),
        100,
    );

    return Math.round(price * (1 - discountPercent / 100));
}

export default function ProductCard({
    product,
    recommendationLabel,
    detailBasePath = "",
}) {
    const {
        addToCart,
        toggleWishlist,
        isInWishlist,
        getCartItemQuantity,
        incrementProductQuantity,
        decrementProductQuantity,
        recordInteraction,
    } = useStore();

    const resolvedDetailBasePath = detailBasePath || (
        getProductHref(product).startsWith("/shop") ? "/shop" : "/menu"
    );

    const normalizedProduct = {
        ...product,
        detailBasePath: resolvedDetailBasePath,
    };

    const isFavorite = isInWishlist(product);
    const cartQuantity = getCartItemQuantity(product);
    const [showAddedFeedback, setShowAddedFeedback] = useState(false);

    const finalPrice = getFinalPrice(product);
    const href = getProductHref(normalizedProduct, resolvedDetailBasePath);
    const rating = Number(product.ratingAverage ?? product.rating) || 0;
    const discountPercent = Number(product.discountPercent) || 0;
    const image = product.image || FALLBACK_IMAGE;

    const handleAddToCart = () => {
        if (product.isAvailable === false) {
            notifyWarning("این محصول فعلاً ناموجود است");
            return;
        }

        const added = addToCart(normalizedProduct, {
            detailBasePath: resolvedDetailBasePath,
        });

        if (added === false) {
            notifyWarning("افزودن محصول انجام نشد");
            return;
        }

        setShowAddedFeedback(true);
        notifySuccess("به سبد اضافه شد", product.name);

        window.setTimeout(() => {
            setShowAddedFeedback(false);
        }, 1100);
    };

    const handleWishlist = () => {
        toggleWishlist(normalizedProduct);
        if (isFavorite) {
            notifyInfo("از علاقه‌مندی‌ها حذف شد", product.name);
        } else {
            notifySuccess("به علاقه‌مندی‌ها اضافه شد", product.name);
        }
    };

    const handleIncrease = () => {
        incrementProductQuantity(normalizedProduct);
    };

    const handleDecrease = () => {
        decrementProductQuantity(normalizedProduct);
    };

    return (
        <article className="group relative overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white p-3 shadow-[0_12px_35px_rgba(48,32,26,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-coffee-200 hover:shadow-[0_25px_65px_rgba(48,32,26,0.13)]">
            <div className="relative aspect-[1/1.05] overflow-hidden rounded-[1.4rem] bg-cream-100">
                <div
                    className="absolute inset-0 opacity-70"
                    style={{
                        background: `radial-gradient(circle at center, ${
                            product.accentColor || product.accent || "#c8793f"
                        }38, transparent 68%)`,
                    }}
                />

                <Link
                    href={href}
                    onClick={() => recordInteraction(product, "view")}
                    aria-label={`مشاهده ${product.name}`}
                    className="absolute inset-0"
                >
                    <Image
                        src={image}
                        alt={product.imageAlt || `تصویر ${product.name}`}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                        unoptimized={Boolean(typeof image === "string" && image.startsWith("http"))}
                        className="object-contain p-8 drop-shadow-[0_25px_25px_rgba(48,32,26,0.22)] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2"
                    />
                </Link>

                <button
                    type="button"
                    aria-label={
                        isFavorite
                            ? `حذف ${product.name} از علاقه‌مندی‌ها`
                            : `افزودن ${product.name} به علاقه‌مندی‌ها`
                    }
                    aria-pressed={isFavorite}
                    onClick={handleWishlist}
                    className={`absolute left-3 top-3 z-10 flex size-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
                        isFavorite
                            ? "border-red-100 bg-red-50 text-red-500"
                            : "border-white/60 bg-white/75 text-coffee-700 hover:bg-white hover:text-red-500"
                    }`}
                >
                    <FiHeart className={isFavorite ? "fill-current" : ""} />
                </button>

                <div className="absolute right-3 top-3 z-10 flex flex-col items-start gap-2">
                    {discountPercent > 0 && (
                        <span className="rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                            ٪{discountPercent.toLocaleString("fa-IR")} تخفیف
                        </span>
                    )}

                    {product.isNew && (
                        <span className="rounded-full bg-coffee-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                            جدید
                        </span>
                    )}
                </div>

                {product.isAvailable === false && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-coffee-950/50 backdrop-blur-sm">
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-coffee-900">
                            فعلاً ناموجود
                        </span>
                    </div>
                )}
            </div>

            <div className="px-2 pb-2 pt-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold tracking-wider text-coffee-400">
                            {product.englishName || product.categoryTitle || "MMD Coffee"}
                        </p>

                        <Link href={href} onClick={() => recordInteraction(product, "view")}>
                            <h3 className="mt-1 line-clamp-1 text-lg font-black text-coffee-950 transition-colors hover:text-caramel-600">
                                {product.name}
                            </h3>
                        </Link>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-caramel-50 px-2.5 py-1.5 text-xs font-bold text-caramel-700">
                        <FiStar className="fill-caramel-400 text-caramel-400" />
                        {rating.toLocaleString("fa-IR", {
                            maximumFractionDigits: 1,
                        })}
                    </div>
                </div>

                <p className="mt-3 line-clamp-2 min-h-14 text-sm leading-7 text-coffee-500">
                    {product.shortDescription || product.description || "محصول منتخب ممد کافی"}
                </p>

                {recommendationLabel && (
                    <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-caramel-100 bg-caramel-50 px-3 py-1.5 text-[11px] font-bold text-caramel-700">
                            <FiZap className="text-caramel-500" />
                            {recommendationLabel}
                        </span>
                    </div>
                )}

                <div className="mt-5 flex items-end justify-between gap-3 border-t border-coffee-100 pt-4">
                    <div>
                        {discountPercent > 0 && (
                            <p className="text-xs text-coffee-400 line-through">
                                {priceFormatter.format(Number(product.price) || 0)} تومان
                            </p>
                        )}

                        <p className="mt-1 text-base font-black text-coffee-950">
                            {priceFormatter.format(finalPrice)}
                            <span className="mr-1 text-xs font-medium text-coffee-500">
                                تومان
                            </span>
                        </p>
                    </div>

                    {cartQuantity > 0 ? (
                        <div className="flex h-11 items-center overflow-hidden rounded-xl bg-coffee-900 text-white shadow-sm">
                            <button
                                type="button"
                                aria-label={`کم‌کردن ${product.name}`}
                                onClick={handleDecrease}
                                className="flex h-11 w-10 items-center justify-center transition hover:bg-coffee-800"
                            >
                                <FiMinus />
                            </button>
                            <span className="min-w-9 px-1 text-center text-xs font-black">
                                {cartQuantity.toLocaleString("fa-IR")}
                            </span>
                            <button
                                type="button"
                                aria-label={`زیادکردن ${product.name}`}
                                onClick={handleIncrease}
                                className="flex h-11 w-10 items-center justify-center transition hover:bg-coffee-800"
                            >
                                <FiPlus />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            disabled={product.isAvailable === false}
                            onClick={handleAddToCart}
                            className={`flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-all duration-300 ${
                                showAddedFeedback
                                    ? "bg-success text-white"
                                    : "bg-coffee-900 text-white hover:-translate-y-1 hover:bg-coffee-800"
                            } disabled:cursor-not-allowed disabled:bg-coffee-200`}
                        >
                            {showAddedFeedback ? (
                                <>
                                    <FiCheck />
                                    <span className="hidden xl:inline">اضافه شد</span>
                                </>
                            ) : (
                                <>
                                    <FiShoppingBag />
                                    <span className="hidden xl:inline">افزودن</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
