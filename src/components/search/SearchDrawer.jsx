"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
    FiArrowLeft,
    FiCoffee,
    FiSearch,
    FiX,
} from "react-icons/fi";

import getProductHref from "@/lib/catalog/getProductHref";

const priceFormatter = new Intl.NumberFormat("fa-IR");
const FALLBACK_IMAGE = "/images/shop/product-placeholder.svg";

export default function SearchDrawer({ isOpen, onClose }) {
    const router = useRouter();
    const inputRef = useRef(null);

    const [query, setQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 180);

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            window.clearTimeout(timer);
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const normalizedQuery = query.trim();

        if (!isOpen || normalizedQuery.length < 2) {
            setProducts([]);
            setMessage("");
            setIsLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                setIsLoading(true);
                setMessage("");

                const response = await fetch(
                    `/api/catalog/products?q=${encodeURIComponent(normalizedQuery)}&limit=8`,
                    {
                        signal: controller.signal,
                        cache: "no-store",
                    },
                );

                const payload = await response.json();

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || "جست‌وجو انجام نشد");
                }

                const nextProducts = payload.data?.products || [];
                setProducts(nextProducts);
                setMessage(nextProducts.length === 0 ? "محصولی با این عبارت پیدا نشد." : "");
            } catch (error) {
                if (error.name !== "AbortError") {
                    setProducts([]);
                    setMessage(error.message || "جست‌وجو انجام نشد");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 320);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [isOpen, query]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const normalizedQuery = query.trim();

        if (!normalizedQuery) {
            return;
        }

        onClose();
        router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
    };

    return (
        <>
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`fixed inset-0 z-[85] bg-coffee-950/45 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            <section
                role="dialog"
                aria-modal="true"
                aria-label="جست‌وجوی محصولات"
                className={`fixed left-1/2 top-4 z-[90] flex max-h-[calc(100vh-2rem)] w-[min(94%,760px)] -translate-x-1/2 flex-col overflow-hidden rounded-[2rem] border border-coffee-100 bg-cream-50 shadow-[0_30px_100px_rgba(32,21,16,0.35)] transition-all duration-300 sm:top-8 ${
                    isOpen
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-6 opacity-0"
                }`}
            >
                <div className="border-b border-coffee-100 bg-white p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-coffee-950">
                                جست‌وجوی سریع
                            </h2>
                            <p className="mt-1 text-xs text-coffee-400">
                                نام محصول، دسته‌بندی یا طعم موردنظر را بنویس.
                            </p>
                        </div>

                        <button
                            type="button"
                            aria-label="بستن جست‌وجو"
                            onClick={onClose}
                            className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-coffee-700 transition hover:bg-coffee-100"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="relative">
                        <FiSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400" />
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="مثلاً اسپرسو، دانه اتیوپی یا فرنچ پرس"
                            className="h-14 w-full rounded-2xl border border-coffee-100 bg-cream-50 pr-12 pl-28 text-sm font-medium text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white"
                        />
                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="absolute left-2 top-2 h-10 rounded-xl bg-coffee-900 px-4 text-xs font-black text-white transition hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            جست‌وجو
                        </button>
                    </form>
                </div>

                <div className="min-h-52 flex-1 overflow-y-auto p-4 sm:p-5">
                    {query.trim().length < 2 ? (
                        <div className="flex min-h-52 flex-col items-center justify-center text-center">
                            <span className="flex size-16 items-center justify-center rounded-2xl bg-coffee-100 text-coffee-700">
                                <FiCoffee size={26} />
                            </span>
                            <p className="mt-4 text-sm font-black text-coffee-900">
                                حداقل دو حرف وارد کن
                            </p>
                            <p className="mt-2 text-xs leading-6 text-coffee-400">
                                نتیجه‌ها هم‌زمان از محصولات فعال فروشگاه دریافت می‌شوند.
                            </p>
                        </div>
                    ) : isLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-24 animate-pulse rounded-2xl bg-white"
                                />
                            ))}
                        </div>
                    ) : message ? (
                        <div className="flex min-h-52 items-center justify-center text-center text-sm font-bold text-coffee-500">
                            {message}
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {products.map((product) => {
                                const href = getProductHref(product);

                                return (
                                    <Link
                                        key={product._id}
                                        href={href}
                                        onClick={onClose}
                                        className="group flex items-center gap-3 rounded-2xl border border-coffee-100 bg-white p-3 transition hover:-translate-y-0.5 hover:border-coffee-200 hover:shadow-lg"
                                    >
                                        <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                                            <Image
                                                src={product.image || FALLBACK_IMAGE}
                                                alt={product.name}
                                                fill
                                                sizes="80px"
                                                className="object-contain p-2 transition group-hover:scale-105"
                                            />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-black text-coffee-950">
                                                {product.name}
                                            </span>
                                            <span className="mt-1 block truncate text-xs text-coffee-400">
                                                {product.categoryTitle || product.englishName}
                                            </span>
                                            <span className="mt-2 block text-xs font-black text-caramel-600">
                                                {priceFormatter.format(product.finalPrice)} تومان
                                            </span>
                                        </span>
                                        <FiArrowLeft className="shrink-0 text-coffee-300 transition group-hover:-translate-x-1 group-hover:text-caramel-600" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
