"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { FiArrowLeft, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";

import { useStore } from "@/context/StoreContext";

const priceFormatter = new Intl.NumberFormat("fa-IR");

export default function CartDrawer({ isOpen, onClose }) {
    const {
        cart,
        cartCount,
        cartSubtotal,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
    } = useStore();

    useEffect(() => {
        if (!isOpen) {
            return;
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

    return (
        <>
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`fixed inset-0 z-[70] bg-coffee-950/35 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="سبد خرید"
                className={`fixed bottom-0 left-0 top-0 z-[80] flex w-[min(92%,430px)] flex-col border-r border-coffee-100 bg-cream-50 shadow-2xl transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-coffee-100 px-5">
                    <div>
                        <h2 className="text-lg font-black text-coffee-950">سبد خرید</h2>

                        <p className="mt-1 text-xs text-coffee-500">
                            {cartCount.toLocaleString("fa-IR")} محصول
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label="بستن سبد خرید"
                        onClick={onClose}
                        className="flex size-10 items-center justify-center rounded-full bg-white text-coffee-800 shadow-sm transition hover:bg-coffee-100"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {cart.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <span className="flex size-20 items-center justify-center rounded-full bg-coffee-100 text-coffee-700">
                            <FiShoppingBag size={32} />
                        </span>

                        <h3 className="mt-6 text-xl font-black text-coffee-950">
                            سبد خرید خالی است
                        </h3>

                        <p className="mt-3 max-w-xs text-sm leading-7 text-coffee-500">
                            محصولات موردعلاقه‌ات را از منوی ممد کافی انتخاب کن.
                        </p>

                        <Link
                            href="/menu"
                            onClick={onClose}
                            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-bold text-white transition hover:bg-coffee-800"
                        >
                            مشاهده منو
                            <FiArrowLeft />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 space-y-3 overflow-y-auto p-4">
                            <div className="mb-2 flex items-center justify-between px-1">
                                <span className="text-xs font-bold text-coffee-500">
                                    محصولات انتخاب‌شده
                                </span>

                                <button
                                    type="button"
                                    onClick={clearCart}
                                    className="text-xs font-bold text-danger transition hover:opacity-70"
                                >
                                    پاک‌کردن سبد
                                </button>
                            </div>

                            {cart.map((item) => (
                                <article
                                    key={item.id}
                                    className="flex gap-3 rounded-2xl border border-coffee-100 bg-white p-3 shadow-sm"
                                >
                                    <Link
                                        href={`/menu/${item.slug}`}
                                        onClick={onClose}
                                        className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-cream-100"
                                    >
                                        <Image
                                            src={item.image}
                                            alt={`تصویر ${item.name}`}
                                            fill
                                            sizes="96px"
                                            className="object-contain p-2"
                                        />
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/menu/${item.slug}`}
                                                    onClick={onClose}
                                                    className="line-clamp-1 text-sm font-black text-coffee-950 hover:text-caramel-600"
                                                >
                                                    {item.name}
                                                </Link>

                                                <p className="mt-1 text-xs text-coffee-400">
                                                    {item.englishName}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                aria-label={`حذف ${item.name}`}
                                                onClick={() => removeFromCart(item.id)}
                                                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-coffee-400 transition hover:bg-red-50 hover:text-danger"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-end justify-between gap-3">
                                            <div className="flex items-center rounded-xl border border-coffee-100 bg-cream-50 p-1">
                                                <button
                                                    type="button"
                                                    aria-label={`کاهش تعداد ${item.name}`}
                                                    onClick={() => decreaseQuantity(item.id)}
                                                    className="flex size-8 items-center justify-center rounded-lg text-coffee-700 transition hover:bg-white"
                                                >
                                                    <FiMinus size={14} />
                                                </button>

                                                <span className="w-8 text-center text-sm font-black text-coffee-950">
                                                    {item.quantity.toLocaleString("fa-IR")}
                                                </span>

                                                <button
                                                    type="button"
                                                    aria-label={`افزایش تعداد ${item.name}`}
                                                    onClick={() => increaseQuantity(item.id)}
                                                    className="flex size-8 items-center justify-center rounded-lg text-coffee-700 transition hover:bg-white"
                                                >
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>

                                            <p className="text-sm font-black text-coffee-950">
                                                {priceFormatter.format(
                                                    item.finalPrice * item.quantity,
                                                )}

                                                <span className="mr-1 text-[10px] font-medium text-coffee-500">
                                                    تومان
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="shrink-0 border-t border-coffee-100 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-coffee-600">
                                    جمع سبد خرید
                                </span>

                                <p className="text-lg font-black text-coffee-950">
                                    {priceFormatter.format(cartSubtotal)}

                                    <span className="mr-1 text-xs font-medium text-coffee-500">
                                        تومان
                                    </span>
                                </p>
                            </div>

                            <p className="mt-2 text-xs leading-6 text-coffee-400">
                                هزینه ارسال و تخفیف نهایی در مرحله پرداخت محاسبه می‌شود.
                            </p>

                            <Link
                                href="/checkout"
                                onClick={onClose}
                                className="mt-4 flex h-14 items-center justify-center gap-3 rounded-2xl bg-coffee-900 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-coffee-800"
                            >
                                ادامه فرایند خرید
                                <FiArrowLeft />
                            </Link>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
