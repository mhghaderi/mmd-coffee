"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
    FiArrowLeft,
    FiCoffee,
    FiMinus,
    FiPlus,
    FiShoppingBag,
    FiTrash2,
    FiTruck,
    FiX,
} from "react-icons/fi";
import { useStore } from "@/context/StoreContext";
import getProductHref from "@/lib/catalog/getProductHref";

const priceFormatter = new Intl.NumberFormat("fa-IR");
const FALLBACK_IMAGE = "/images/shop/product-placeholder.svg";

function getItemUnitPrice(item) {
    const price = Number(item.price) || 0;
    const discountPercent = Math.min(Math.max(Number(item.discountPercent) || 0, 0), 100);
    const basePrice = Math.round(price * (1 - discountPercent / 100));
    const variantPrice = Number(item.variant?.priceAdjustment) || 0;
    const addOnsPrice = Array.isArray(item.addOns)
        ? item.addOns.reduce((sum, addOn) => sum + (Number(addOn.price) || 0), 0)
        : 0;
    return basePrice + variantPrice + addOnsPrice;
}

function CartGroup({ title, description, icon: Icon, items, subtotal, checkoutHref, onClose, incrementQuantity, decrementQuantity, removeFromCart }) {
    if (!items.length) return null;

    return (
        <section className="rounded-2xl border border-coffee-100 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-cream-50 px-3 py-3">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white text-coffee-800"><Icon /></span>
                    <div>
                        <p className="text-sm font-black text-coffee-950">{title}</p>
                        <p className="mt-1 text-[10px] text-coffee-400">{description}</p>
                    </div>
                </div>
                <span className="text-[10px] font-black text-caramel-600">{items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("fa-IR")} آیتم</span>
            </div>

            <div className="space-y-3">
                {items.map((item) => {
                    const href = getProductHref(item);
                    const unitPrice = getItemUnitPrice(item);
                    return (
                        <article key={item.key} className="flex gap-3 rounded-xl border border-coffee-100 p-3">
                            <Link href={href} onClick={onClose} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                                <Image src={item.image || FALLBACK_IMAGE} alt={item.name} fill sizes="80px" className="object-contain p-2" />
                            </Link>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <Link href={href} onClick={onClose} className="line-clamp-1 text-sm font-black text-coffee-950 hover:text-caramel-600">{item.name}</Link>
                                        <p className="mt-1 text-[10px] text-coffee-400">{item.variant?.title || item.englishName || "MMD Coffee"}</p>
                                    </div>
                                    <button type="button" onClick={() => removeFromCart(item.key)} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-coffee-400 hover:bg-red-50 hover:text-danger"><FiTrash2 /></button>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center rounded-lg border border-coffee-100 bg-cream-50 p-0.5">
                                        <button type="button" onClick={() => decrementQuantity(item.key)} className="flex size-7 items-center justify-center rounded-md hover:bg-white"><FiMinus size={12} /></button>
                                        <span className="w-7 text-center text-xs font-black">{item.quantity.toLocaleString("fa-IR")}</span>
                                        <button type="button" onClick={() => incrementQuantity(item.key)} className="flex size-7 items-center justify-center rounded-md hover:bg-white"><FiPlus size={12} /></button>
                                    </div>
                                    <p className="text-xs font-black text-coffee-900">{priceFormatter.format(unitPrice * item.quantity)} تومان</p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-coffee-100 pt-3">
                <span className="text-xs font-bold text-coffee-500">جمع این بخش</span>
                <span className="text-sm font-black text-coffee-950">{priceFormatter.format(subtotal)} تومان</span>
            </div>

            <Link href={checkoutHref} onClick={onClose} className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-4 text-xs font-black text-white transition hover:bg-coffee-800">
                ادامه ثبت سفارش <FiArrowLeft />
            </Link>
        </section>
    );
}

export default function CartDrawer({ isOpen, onClose }) {
    const {
        cartItems,
        cartCount,
        cafeCartItems,
        shopCartItems,
        subtotalsByType,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
    } = useStore();

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleEscape = (event) => event.key === "Escape" && onClose();
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    return (
        <>
            <div aria-hidden="true" onClick={onClose} className={`fixed inset-0 z-[70] bg-coffee-950/35 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
            <aside role="dialog" aria-modal="true" aria-label="سبد خرید" className={`fixed bottom-0 left-0 top-0 z-[80] flex w-[min(94%,470px)] flex-col border-r border-coffee-100 bg-cream-50 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-coffee-100 px-5">
                    <div>
                        <h2 className="text-lg font-black text-coffee-950">سبد خرید</h2>
                        <p className="mt-1 text-xs text-coffee-500">{cartCount.toLocaleString("fa-IR")} آیتم در دو بخش مستقل</p>
                    </div>
                    <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-white text-coffee-800 shadow-sm"><FiX size={20} /></button>
                </div>

                {!cartItems.length ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <span className="flex size-20 items-center justify-center rounded-full bg-coffee-100 text-coffee-700"><FiShoppingBag size={32} /></span>
                        <h3 className="mt-6 text-xl font-black text-coffee-950">سبد خرید خالی است</h3>
                        <p className="mt-3 max-w-xs text-sm leading-7 text-coffee-500">سفارش داخل کافه و خرید فروشگاهی مستقل از هم ثبت می‌شوند.</p>
                        <div className="mt-6 flex gap-2">
                            <Link href="/menu" onClick={onClose} className="rounded-xl bg-coffee-900 px-5 py-3 text-xs font-black text-white">منوی کافه</Link>
                            <Link href="/shop" onClick={onClose} className="rounded-xl bg-white px-5 py-3 text-xs font-black text-coffee-800 shadow-sm">فروشگاه</Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="mb-3 flex items-center justify-between px-1">
                            <p className="text-xs font-bold text-coffee-500">هر بخش Checkout جداگانه دارد</p>
                            <button type="button" onClick={clearCart} className="text-xs font-black text-danger">پاک کردن همه</button>
                        </div>
                        <div className="space-y-4">
                            <CartGroup title="سفارش کافه" description="مصرف داخل کافه یا بیرون‌بر" icon={FiCoffee} items={cafeCartItems} subtotal={subtotalsByType.cafe} checkoutHref="/checkout?type=cafe" onClose={onClose} incrementQuantity={incrementQuantity} decrementQuantity={decrementQuantity} removeFromCart={removeFromCart} />
                            <CartGroup title="خرید فروشگاهی" description="ارسال به آدرس یا تحویل حضوری" icon={FiTruck} items={shopCartItems} subtotal={subtotalsByType.shop} checkoutHref="/checkout?type=shop" onClose={onClose} incrementQuantity={incrementQuantity} decrementQuantity={decrementQuantity} removeFromCart={removeFromCart} />
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
