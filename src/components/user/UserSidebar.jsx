"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiArrowRight,
    FiCoffee,
    FiHome,
    FiLogOut,
    FiMessageSquare,
    FiPackage,
    FiShoppingBag,
    FiUser,
} from "react-icons/fi";

const accountItems = [
    { title: "داشبورد", href: "/user", icon: FiHome },
    { title: "سفارش‌های من", href: "/user/orders", icon: FiPackage },
    { title: "تیکت‌ها", href: "/user/tickets", icon: FiMessageSquare },
    { title: "پروفایل", href: "/user/profile", icon: FiUser },
];

const siteItems = [
    { title: "بازگشت به سایت", href: "/", icon: FiArrowRight },
    { title: "منوی کافه", href: "/menu", icon: FiCoffee },
    { title: "فروشگاه", href: "/shop", icon: FiShoppingBag },
];

export default function UserSidebar({ user }) {
    const pathname = usePathname();
    const router = useRouter();

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            window.dispatchEvent(new Event("mmd-auth-changed"));
        } finally {
            router.replace("/");
            router.refresh();
        }
    };

    return (
        <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-sm">
                <div className="rounded-2xl bg-coffee-950 px-4 py-5 text-white">
                    <p className="text-[10px] font-bold text-caramel-300">حساب مشتری</p>
                    <h2 className="mt-2 truncate text-base font-black">
                        {user?.name || "کاربر ممد کافی"}
                    </h2>
                    <p className="mt-1 truncate text-[10px] text-white/45" dir="ltr">
                        {user?.email || ""}
                    </p>
                </div>

                <Link
                    href="/"
                    className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-caramel-100 bg-caramel-50 text-xs font-black text-caramel-700 transition hover:bg-caramel-100"
                >
                    <FiArrowRight /> بازگشت به سایت
                </Link>

                <nav className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                    {accountItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.href === "/user"
                            ? pathname === "/user"
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${
                                    active
                                        ? "bg-coffee-900 text-white"
                                        : "text-coffee-600 hover:bg-cream-100 hover:text-coffee-950"
                                }`}
                            >
                                <Icon className="text-base" /> {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <div className="my-3 h-px bg-coffee-100" />

                <nav className="space-y-1">
                    {siteItems.slice(1).map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-[11px] font-bold text-coffee-500 transition hover:bg-cream-100 hover:text-coffee-900"
                            >
                                <Icon /> {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={logout}
                    className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 text-xs font-black text-danger transition hover:bg-red-100"
                >
                    <FiLogOut /> خروج از حساب
                </button>
            </div>
        </aside>
    );
}
