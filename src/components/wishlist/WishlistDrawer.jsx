"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import {
    FiArrowLeft,
    FiHeart,
    FiShoppingBag,
    FiTrash2,
    FiX,
} from "react-icons/fi";

import { useStore } from "@/context/StoreContext";
import getProductHref from "@/lib/catalog/getProductHref";
import { confirmAction, notifySuccess } from "@/lib/ui/notify";

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

export default function WishlistDrawer({ isOpen, onClose }) {
    const {
        wishlistItems,
        wishlistCount,
        toggleWishlist,
        clearWishlist,
        addToCart,
        hasDatabaseProfile,
        preferencesReady,
    } = useStore();

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const handleAddToCart = (product) => {
        const detailBasePath = getProductHref(product).startsWith("/shop")
            ? "/shop"
            : "/menu";

        addToCart(
            {
                ...product,
                detailBasePath,
            },
            {
                detailBasePath,
            },
        );

        onClose();
    };

    const handleClear = async () => {
        const accepted = await confirmAction({
            title: "علاقه‌مندی‌ها پاک شوند؟",
            text: hasDatabaseProfile
                ? "این تغییر در حساب کاربری و دیتابیس هم ذخیره می‌شود."
                : "محصولات ذخیره‌شده روی این مرورگر پاک می‌شوند.",
            confirmText: "پاک‌کردن",
            dangerMode: true,
        });

        if (!accepted) return;
        clearWishlist();
        notifySuccess("علاقه‌مندی‌ها پاک شد");
    };

    return (
        <>
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`fixed inset-0 z-[70] bg-coffee-950/35 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="علاقه‌مندی‌ها"
                className={`fixed bottom-0 right-0 top-0 z-[80] flex w-[min(92%,430px)] flex-col border-l border-coffee-100 bg-cream-50 shadow-2xl transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-coffee-100 px-5">
                    <div>
                        <h2 className="text-lg font-black text-coffee-950">علاقه‌مندی‌ها</h2>
                        <p className="mt-1 text-xs text-coffee-500">
                            {wishlistCount.toLocaleString("fa-IR")} محصول ذخیره‌شده
                        </p>
                        {preferencesReady && (
                            <p className="mt-1 text-[10px] font-bold text-caramel-600">
                                {hasDatabaseProfile
                                    ? "ذخیره‌شده در حساب و دیتابیس"
                                    : "ذخیره موقت روی این مرورگر"}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label="بستن علاقه‌مندی‌ها"
                        onClick={onClose}
                        className="flex size-10 items-center justify-center rounded-full bg-white text-coffee-800 shadow-sm transition hover:bg-coffee-100"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <span className="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-400">
                            <FiHeart size={32} />
                        </span>
                        <h3 className="mt-6 text-xl font-black text-coffee-950">
                            هنوز چیزی ذخیره نکردی
                        </h3>
                        <p className="mt-3 max-w-xs text-sm leading-7 text-coffee-500">
                            با زدن قلب روی هر محصول، آن را برای بعد نگه دار.
                        </p>
                        <Link
                            href="/menu"
                            onClick={onClose}
                            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-bold text-white transition hover:bg-coffee-800"
                        >
                            مشاهده محصولات
                            <FiArrowLeft />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 space-y-3 overflow-y-auto p-4">
                            <div className="mb-2 flex items-center justify-between px-1">
                                <span className="text-xs font-bold text-coffee-500">
                                    انتخاب‌های تو
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-xs font-bold text-danger transition hover:opacity-70"
                                >
                                    پاک‌کردن همه
                                </button>
                            </div>

                            {wishlistItems.map((product) => {
                                const href = getProductHref(product);
                                const price = getFinalPrice(product);

                                return (
                                    <article
                                        key={product._id || product.id || product.slug}
                                        className="flex gap-3 rounded-2xl border border-coffee-100 bg-white p-3 shadow-sm"
                                    >
                                        <Link
                                            href={href}
                                            onClick={onClose}
                                            className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-cream-100"
                                        >
                                            <Image
                                                src={product.image || FALLBACK_IMAGE}
                                                alt={`تصویر ${product.name}`}
                                                fill
                                                sizes="96px"
                                                className="object-contain p-2"
                                            />
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={href}
                                                        onClick={onClose}
                                                        className="line-clamp-1 text-sm font-black text-coffee-950 hover:text-caramel-600"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <p className="mt-1 line-clamp-1 text-xs text-coffee-400">
                                                        {product.categoryTitle ||
                                                            product.englishName ||
                                                            "MMD Coffee"}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    aria-label={`حذف ${product.name} از علاقه‌مندی‌ها`}
                                                    onClick={() => toggleWishlist(product)}
                                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-coffee-400 transition hover:bg-red-50 hover:text-danger"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between gap-3">
                                                <p className="text-sm font-black text-coffee-950">
                                                    {priceFormatter.format(price)}
                                                    <span className="mr-1 text-[10px] font-medium text-coffee-500">
                                                        تومان
                                                    </span>
                                                </p>

                                                <button
                                                    type="button"
                                                    disabled={product.isAvailable === false}
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-coffee-900 px-3 text-[11px] font-bold text-white transition hover:bg-coffee-800 disabled:cursor-not-allowed disabled:bg-coffee-200"
                                                >
                                                    <FiShoppingBag />
                                                    افزودن
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="shrink-0 border-t border-coffee-100 bg-white p-5">
                            <Link
                                href="/menu"
                                onClick={onClose}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-cream-50 px-5 text-sm font-black text-coffee-800 transition hover:bg-cream-100"
                            >
                                ادامه خرید
                                <FiArrowLeft />
                            </Link>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
