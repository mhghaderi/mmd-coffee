"use client";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import {
    FiBell,
    FiChevronDown,
    FiExternalLink,
    FiLoader,
    FiLogOut,
    FiMenu,
    FiUser,
} from "react-icons/fi";

const pageTitles = [
    {
        path: "/admin/products",
        title: "مدیریت محصولات",
    },
    {
        path: "/admin/categories",
        title: "مدیریت دسته‌بندی‌ها",
    },
    {
        path: "/admin/orders",
        title: "مدیریت سفارش‌ها",
    },
    {
        path: "/admin/users",
        title: "مدیریت کاربران",
    },
    {
        path: "/admin/reviews",
        title: "مدیریت نظرات",
    },
    {
        path: "/admin/articles",
        title: "مدیریت مقالات",
    },
    {
        path: "/admin/tickets",
        title: "مدیریت تیکت‌ها",
    },
    {
        path: "/admin/reports",
        title: "گزارش‌ها",
    },
    {
        path: "/admin/archive",
        title: "آرشیو",
    },
    {
        path: "/admin/settings",
        title: "تنظیمات",
    },
];

function getCurrentPageTitle(pathname) {
    const matchedPage = pageTitles.find(
        (page) => pathname === page.path || pathname.startsWith(`${page.path}/`),
    );

    return matchedPage?.title || "داشبورد مدیریت";
}

export default function AdminHeader({ user, onMenuOpen }) {
    const router = useRouter();
    const pathname = usePathname();

    const profileRef = useRef(null);

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const pageTitle = getCurrentPageTitle(pathname);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);

            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        setIsProfileOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } finally {
            router.replace("/login");
            router.refresh();
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-coffee-100 bg-cream-50/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        aria-label="باز کردن منوی مدیریت"
                        onClick={onMenuOpen}
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-700 shadow-sm transition hover:bg-coffee-100 lg:hidden"
                    >
                        <FiMenu size={20} />
                    </button>

                    <div className="min-w-0">
                        <p className="truncate text-lg font-black text-coffee-950 sm:text-xl">
                            {pageTitle}
                        </p>

                        <p className="mt-1 hidden text-xs text-coffee-400 sm:block">
                            مدیریت سامانه ممد کافی
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        aria-label="مشاهده سایت"
                        className="hidden h-11 items-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 shadow-sm transition hover:border-coffee-200 hover:text-coffee-950 sm:flex"
                    >
                        <FiExternalLink />
                        مشاهده سایت
                    </Link>

                    <button
                        type="button"
                        aria-label="اعلان‌ها"
                        className="flex size-11 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 shadow-sm transition hover:bg-coffee-100 hover:text-coffee-950"
                    >
                        <FiBell />
                    </button>

                    <div ref={profileRef} className="relative">
                        <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={isProfileOpen}
                            onClick={() => setIsProfileOpen((current) => !current)}
                            className="flex h-11 items-center gap-2 rounded-xl border border-coffee-100 bg-white pr-2 pl-3 text-coffee-700 shadow-sm transition hover:border-coffee-200"
                        >
                            <span className="flex size-8 items-center justify-center rounded-lg bg-coffee-900 text-xs font-black text-white">
                                {user.name?.trim()?.charAt(0) || "م"}
                            </span>

                            <span className="hidden max-w-32 truncate text-xs font-bold md:block">
                                {user.name}
                            </span>

                            <FiChevronDown
                                className={`text-coffee-400 transition-transform ${
                                    isProfileOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        <div
                            role="menu"
                            className={`absolute left-0 top-[calc(100%+10px)] w-64 origin-top-left rounded-2xl border border-coffee-100 bg-white p-2 shadow-[0_25px_70px_rgba(48,32,26,0.16)] transition ${
                                isProfileOpen
                                    ? "pointer-events-auto scale-100 opacity-100"
                                    : "pointer-events-none scale-95 opacity-0"
                            }`}
                        >
                            <div className="border-b border-coffee-100 px-3 py-3">
                                <p className="truncate text-sm font-black text-coffee-950">
                                    {user.name}
                                </p>

                                <p className="mt-1 truncate text-[11px] text-coffee-400" dir="ltr">
                                    {user.email}
                                </p>

                                <span className="mt-2 inline-flex rounded-full bg-caramel-50 px-2.5 py-1 text-[10px] font-bold text-caramel-700">
                                    مدیر سیستم
                                </span>
                            </div>

                            <Link
                                href="/admin/settings"
                                role="menuitem"
                                className="mt-2 flex h-11 items-center gap-3 rounded-xl px-3 text-xs font-bold text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                            >
                                <FiUser />
                                تنظیمات حساب
                            </Link>

                            <button
                                type="button"
                                role="menuitem"
                                disabled={isLoggingOut}
                                onClick={handleLogout}
                                className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-right text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                                {isLoggingOut ? (
                                    <FiLoader className="animate-spin" />
                                ) : (
                                    <FiLogOut />
                                )}

                                {isLoggingOut ? "در حال خروج" : "خروج از حساب"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
