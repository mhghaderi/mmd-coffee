"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
    FiBarChart2,
    FiBox,
    FiCoffee,
    FiExternalLink,
    FiFileText,
    FiGrid,
    FiHome,
    FiMessageSquare,
    FiSettings,
    FiShoppingBag,
    FiStar,
    FiUsers,
    FiX,
} from "react-icons/fi";

const navigationGroups = [
    {
        title: "نمای کلی",

        items: [
            {
                title: "داشبورد",
                href: "/admin",
                icon: FiHome,
            },
        ],
    },

    {
        title: "مدیریت فروشگاه",

        items: [
            {
                title: "محصولات",
                href: "/admin/products",
                icon: FiBox,
            },
            {
                title: "دسته‌بندی‌ها",
                href: "/admin/categories",
                icon: FiGrid,
            },
            {
                title: "سفارش‌ها",
                href: "/admin/orders",
                icon: FiShoppingBag,
            },
            {
                title: "کاربران",
                href: "/admin/users",
                icon: FiUsers,
            },
        ],
    },

    {
        title: "محتوا و ارتباطات",

        items: [
            {
                title: "نظرات",
                href: "/admin/reviews",
                icon: FiStar,
            },
            {
                title: "مقالات",
                href: "/admin/articles",
                icon: FiFileText,
            },
            {
                title: "تیکت‌ها",
                href: "/admin/tickets",
                icon: FiMessageSquare,
            },
        ],
    },

    {
        title: "تحلیل و تنظیمات",

        items: [
            {
                title: "گزارش‌ها",
                href: "/admin/reports",
                icon: FiBarChart2,
            },
            {
                title: "تنظیمات",
                href: "/admin/settings",
                icon: FiSettings,
            },
        ],
    },
];

function isNavigationItemActive(pathname, href) {
    if (href === "/admin") {
        return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ user, isOpen, onClose }) {
    const pathname = usePathname();

    return (
        <>
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-coffee-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
                    isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                aria-label="منوی مدیریت"
                className={`fixed bottom-0 right-0 top-0 z-50 flex w-[280px] flex-col border-l border-white/10 bg-coffee-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
                    <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-caramel-500 text-white shadow-lg">
                            <FiCoffee size={22} />
                        </span>

                        <div>
                            <p className="text-base font-black">پنل ممد کافی</p>

                            <p className="mt-0.5 text-[10px] tracking-[0.18em] text-white/35">
                                MMD COFFEE ADMIN
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        aria-label="بستن منوی مدیریت"
                        onClick={onClose}
                        className="flex size-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <FiX size={19} />
                    </button>
                </div>

                <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
                    {navigationGroups.map((group) => (
                        <div key={group.title}>
                            <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-white/30">
                                {group.title}
                            </p>

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;

                                    const isActive = isNavigationItemActive(pathname, item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`group flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                                                isActive
                                                    ? "bg-white text-coffee-950 shadow-lg"
                                                    : "text-white/55 hover:bg-white/7 hover:text-white"
                                            }`}
                                        >
                                            <span
                                                className={`flex size-9 items-center justify-center rounded-xl transition ${
                                                    isActive
                                                        ? "bg-caramel-100 text-caramel-700"
                                                        : "bg-white/5 text-white/45 group-hover:bg-white/10 group-hover:text-white"
                                                }`}
                                            >
                                                <Icon size={17} />
                                            </span>

                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="shrink-0 border-t border-white/10 p-4">
                    <div className="rounded-2xl bg-white/5 p-3">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-caramel-500 text-sm font-black text-white">
                                {user.name?.trim()?.charAt(0) || "م"}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-black text-white">
                                    {user.name}
                                </p>

                                <p className="mt-1 truncate text-[10px] text-white/35" dir="ltr">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-bold text-white/55 transition hover:bg-white/10 hover:text-white"
                        >
                            <FiExternalLink />
                            مشاهده سایت
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
