"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/cart/CartDrawer";
import { useStore } from "@/context/StoreContext";

import {
    FiChevronDown,
    FiHeart,
    FiHelpCircle,
    FiLogIn,
    FiMenu,
    FiMessageSquare,
    FiPackage,
    FiSearch,
    FiShoppingBag,
    FiUser,
    FiX,
} from "react-icons/fi";

const navigationItems = [
    {
        title: "خانه",
        href: "/",
    },
    {
        title: "منو",
        href: "/menu",
        children: [
            {
                title: "همه محصولات",
                description: "مشاهده منوی کامل کافه",
                href: "/menu",
            },
            {
                title: "نوشیدنی‌های گرم",
                description: "قهوه، چای و هات‌چاکلت",
                href: "/menu?category=hot-drinks",
            },
            {
                title: "نوشیدنی‌های سرد",
                description: "آیس‌کافی، شیک و اسموتی",
                href: "/menu?category=cold-drinks",
            },
            {
                title: "دسر و کیک",
                description: "کیک‌های تازه و دسرهای کافه",
                href: "/menu?category=desserts",
            },
            {
                title: "صبحانه",
                description: "صبحانه‌های سبک و کامل",
                href: "/menu?category=breakfast",
            },
        ],
    },
    {
        title: "فروشگاه",
        href: "/shop",
        children: [
            {
                title: "دانه قهوه",
                description: "قهوه‌های تازه‌برشت",
                href: "/shop?category=coffee-beans",
            },
            {
                title: "ابزار دم‌آوری",
                description: "تجهیزات تهیه قهوه",
                href: "/shop?category=brewing-tools",
            },
            {
                title: "ماگ و اکسسوری",
                description: "محصولات جانبی MMD Coffee",
                href: "/shop?category=accessories",
            },
        ],
    },
    {
        title: "مقالات",
        href: "/articles",
    },
    {
        title: "درباره ما",
        href: "/about",
    },
    {
        title: "تماس با ما",
        href: "/contact",
    },
];

const profileItems = [
    {
        title: "حساب کاربری",
        href: "/user",
        icon: FiUser,
    },
    {
        title: "سفارش‌های من",
        href: "/user/orders",
        icon: FiPackage,
    },
    {
        title: "علاقه‌مندی‌ها",
        href: "/user/wishlist",
        icon: FiHeart,
    },
    {
        title: "تیکت‌های پشتیبانی",
        href: "/user/tickets",
        icon: FiMessageSquare,
    },
];

export default function Navbar() {
    const pathname = usePathname();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { cartCount, wishlistCount } = useStore();

    // بعد از تغییر صفحه، منوی موبایل بسته شود
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setOpenMobileSubmenu(null);
    }, [pathname]);

    // هنگام باز بودن منوی موبایل، اسکرول صفحه متوقف شود
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    const toggleMobileSubmenu = (title) => {
        setOpenMobileSubmenu((currentMenu) => (currentMenu === title ? null : title));
    };

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-coffee-100/80 bg-cream-50/90 backdrop-blur-xl">
                <div className="page-container flex h-[76px] items-center justify-between gap-5">
                    {/* Logo */}
                    <Link
                        href="/"
                        aria-label="صفحه اصلی MMD Coffee"
                        className="flex shrink-0 items-center"
                    >
                        <Image
                            src="/images/logo.png"
                            alt="لوگوی MMD Coffee"
                            width={132}
                            height={52}
                            priority
                            className="h-11 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="hidden h-full items-center lg:flex">
                        <ul className="flex h-full items-center gap-1">
                            {navigationItems.map((item) => {
                                const hasChildren = Boolean(item.children?.length);

                                return (
                                    <li
                                        key={item.title}
                                        className="group relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={`flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-medium transition-colors ${
                                                pathname === item.href
                                                    ? "bg-coffee-100 text-coffee-900"
                                                    : "text-coffee-700 hover:bg-coffee-50 hover:text-coffee-950"
                                            }`}
                                        >
                                            <span>{item.title}</span>

                                            {hasChildren && (
                                                <FiChevronDown className="text-sm transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
                                            )}
                                        </Link>

                                        {hasChildren && (
                                            <div
                                                className="
                          pointer-events-none
                          invisible
                          absolute
                          right-0
                          top-full
                          w-80
                          translate-y-2
                          pt-3
                          opacity-0
                          transition-all
                          duration-200
                          group-hover:pointer-events-auto
                          group-hover:visible
                          group-hover:translate-y-0
                          group-hover:opacity-100
                          group-focus-within:pointer-events-auto
                          group-focus-within:visible
                          group-focus-within:translate-y-0
                          group-focus-within:opacity-100
                        "
                                            >
                                                <div className="overflow-hidden rounded-2xl border border-coffee-100 bg-white p-2 shadow-[0_18px_60px_rgba(48,32,26,0.14)]">
                                                    <div className="border-b border-coffee-100 px-3 py-3">
                                                        <p className="text-sm font-bold text-coffee-950">
                                                            {item.title}
                                                        </p>

                                                        <p className="mt-1 text-xs text-coffee-500">
                                                            یکی از بخش‌های زیر را انتخاب کنید
                                                        </p>
                                                    </div>

                                                    <div className="mt-1 space-y-1">
                                                        {item.children.map((child) => (
                                                            <Link
                                                                key={child.href}
                                                                href={child.href}
                                                                className="group/item block rounded-xl px-3 py-3 transition hover:bg-cream-100"
                                                            >
                                                                <span className="block text-sm font-semibold text-coffee-800 transition group-hover/item:text-caramel-600">
                                                                    {child.title}
                                                                </span>

                                                                <span className="mt-1 block text-xs leading-5 text-coffee-500">
                                                                    {child.description}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Desktop actions */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="جست‌وجو"
                            className="hidden size-10 items-center justify-center rounded-full text-coffee-700 transition hover:bg-white hover:text-coffee-950 sm:flex"
                        >
                            <FiSearch size={19} />
                        </button>

                        <Link
                            href="/user/wishlist"
                            aria-label="علاقه‌مندی‌ها"
                            className="relative hidden size-10 items-center justify-center rounded-full text-coffee-700 transition hover:bg-white hover:text-coffee-950 sm:flex"
                        >
                            <FiHeart size={19} />

                            {wishlistCount > 0 && (
                                <span className="absolute -left-0.5 -top-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-caramel-500 px-1 text-[10px] font-bold text-white">
                                    {wishlistCount > 9
                                        ? "+۹"
                                        : wishlistCount.toLocaleString("fa-IR")}
                                </span>
                            )}
                        </Link>

                        <button
                            type="button"
                            aria-label="باز کردن سبد خرید"
                            onClick={() => setIsCartOpen(true)}
                            className="relative hidden size-10 items-center justify-center rounded-full text-coffee-700 transition hover:bg-white hover:text-coffee-950 sm:flex"
                        >
                            <FiShoppingBag size={19} />

                            {cartCount > 0 && (
                                <span className="absolute -left-0.5 -top-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-caramel-500 px-1 text-[10px] font-bold text-white">
                                    {cartCount > 9 ? "+۹" : cartCount.toLocaleString("fa-IR")}
                                </span>
                            )}
                        </button>

                        {/* Profile dropdown */}
                        <div className="group relative hidden h-[76px] items-center sm:flex">
                            <button
                                type="button"
                                aria-label="حساب کاربری"
                                className="flex size-10 items-center justify-center rounded-full bg-coffee-900 text-white shadow-sm transition hover:bg-coffee-800"
                            >
                                <FiUser size={18} />
                            </button>

                            <div
                                className="
                  pointer-events-none
                  invisible
                  absolute
                  left-0
                  top-full
                  w-72
                  translate-y-2
                  pt-3
                  opacity-0
                  transition-all
                  duration-200
                  group-hover:pointer-events-auto
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                  group-focus-within:pointer-events-auto
                  group-focus-within:visible
                  group-focus-within:translate-y-0
                  group-focus-within:opacity-100
                "
                            >
                                <div className="overflow-hidden rounded-2xl border border-coffee-100 bg-white p-2 shadow-[0_18px_60px_rgba(48,32,26,0.14)]">
                                    <div className="rounded-xl bg-cream-100 px-4 py-4">
                                        <p className="text-sm font-bold text-coffee-950">
                                            خوش آمدید
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-coffee-500">
                                            برای مشاهده سفارش‌ها و پیشنهادهای اختصاصی وارد حساب
                                            شوید.
                                        </p>

                                        <Link
                                            href="/login"
                                            className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-4 text-sm font-semibold !text-white transition hover:bg-coffee-800"
                                        >
                                            <FiLogIn />
                                            ورود یا ثبت‌نام
                                        </Link>
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        {profileItems.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-coffee-700 transition hover:bg-cream-100 hover:text-coffee-950"
                                                >
                                                    <Icon className="text-lg text-coffee-500" />
                                                    {item.title}
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-2 border-t border-coffee-100 pt-2">
                                        <Link
                                            href="/contact"
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-coffee-700 transition hover:bg-cream-100 hover:text-coffee-950"
                                        >
                                            <FiHelpCircle className="text-lg text-coffee-500" />
                                            راهنما و پشتیبانی
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            aria-label={
                                isMobileMenuOpen ? "بستن منوی موبایل" : "باز کردن منوی موبایل"
                            }
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen((current) => !current)}
                            className="flex size-10 items-center justify-center rounded-full bg-white text-coffee-900 shadow-sm transition hover:bg-coffee-50 lg:hidden"
                        >
                            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile overlay */}
            <div
                onClick={() => setIsMobileMenuOpen(false)}
                className={`fixed inset-0 z-40 bg-coffee-950/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
                    isMobileMenuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            {/* Mobile drawer */}
            <aside
                className={`fixed bottom-0 right-0 top-0 z-50 w-[min(88%,360px)] overflow-y-auto bg-cream-50 p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-coffee-100 pb-4">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/logo.svg"
                            alt="لوگوی MMD Coffee"
                            width={120}
                            height={48}
                            className="h-10 w-auto"
                        />
                    </Link>

                    <button
                        type="button"
                        aria-label="بستن منوی موبایل"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex size-10 items-center justify-center rounded-full bg-white text-coffee-900"
                    >
                        <FiX size={21} />
                    </button>
                </div>

                <nav className="mt-5">
                    <ul className="space-y-1">
                        {navigationItems.map((item) => {
                            const hasChildren = Boolean(item.children?.length);
                            const isOpen = openMobileSubmenu === item.title;

                            return (
                                <li key={item.title}>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={item.href}
                                            className="flex h-12 flex-1 items-center rounded-xl px-3 text-sm font-semibold text-coffee-800 transition hover:bg-white"
                                        >
                                            {item.title}
                                        </Link>

                                        {hasChildren && (
                                            <button
                                                type="button"
                                                aria-label={`نمایش زیرمنوی ${item.title}`}
                                                aria-expanded={isOpen}
                                                onClick={() => toggleMobileSubmenu(item.title)}
                                                className="flex size-11 items-center justify-center rounded-xl text-coffee-600 transition hover:bg-white"
                                            >
                                                <FiChevronDown
                                                    className={`transition-transform duration-200 ${
                                                        isOpen ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {hasChildren && (
                                        <div
                                            className={`grid transition-all duration-300 ${
                                                isOpen
                                                    ? "grid-rows-[1fr] opacity-100"
                                                    : "grid-rows-[0fr] opacity-0"
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="mr-3 space-y-1 border-r border-coffee-200 py-2 pr-4">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            className="block rounded-xl px-3 py-2.5 text-sm text-coffee-600 transition hover:bg-white hover:text-coffee-950"
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="mt-6 border-t border-coffee-100 pt-5">
                    <p className="mb-3 text-xs font-bold text-coffee-500">حساب کاربری</p>

                    <div className="space-y-1">
                        {profileItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-coffee-700 transition hover:bg-white"
                                >
                                    <Icon className="text-lg text-coffee-500" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>

                    <Link
                        href="/login"
                        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-4 text-sm font-bold text-white transition hover:bg-coffee-800"
                    >
                        <FiLogIn />
                        ورود یا ثبت‌نام
                    </Link>
                </div>
            </aside>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
