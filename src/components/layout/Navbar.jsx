"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    FiChevronDown,
    FiHeart,
    FiHelpCircle,
    FiLogIn,
    FiLogOut,
    FiMenu,
    FiMessageSquare,
    FiPackage,
    FiSearch,
    FiSettings,
    FiShoppingBag,
    FiUser,
    FiX,
} from "react-icons/fi";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchDrawer from "@/components/search/SearchDrawer";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";
import { useStore } from "@/context/StoreContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import { notifySuccess } from "@/lib/ui/notify";

const fallbackNavigationItems = [
    { title: "خانه", href: "/" },
    {
        title: "منو",
        href: "/menu",
        children: [
            { title: "همه منوی کافه", description: "نوشیدنی، دسر و آیتم‌های آماده", href: "/menu" },
            { title: "نوشیدنی‌های گرم", description: "اسپرسو، لاته، کاپوچینو و بیشتر", href: "/menu?category=hot-drinks" },
            { title: "نوشیدنی‌های سرد", description: "آیس کافی، کلدبرو و نوشیدنی سرد", href: "/menu?category=cold-drinks" },
            { title: "دسر و شیرینی", description: "آیتم‌های شیرین کنار قهوه", href: "/menu?category=desserts" },
        ],
    },
    {
        title: "فروشگاه",
        href: "/shop",
        children: [
            { title: "همه محصولات فروشگاه", description: "دانه قهوه، ابزار و اکسسوری", href: "/shop" },
            { title: "دانه قهوه", description: "دانه و بلندهای تازه‌برشت", href: "/shop?category=coffee-beans" },
            { title: "ابزار دم‌آوری", description: "V60، فرنچ پرس، آسیاب و ابزار", href: "/shop?category=brewing-tools" },
            { title: "اکسسوری", description: "ماگ، تامبلر و لوازم جانبی", href: "/shop?category=accessories" },
        ],
    },
    { title: "مقالات", href: "/blog" },
    { title: "درباره ما", href: "/about" },
    { title: "تماس با ما", href: "/contact" },
];

function isNavigationActive(pathname, href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

function AccountMenu({ user, isLoading, onLogout, mobile = false }) {
    if (isLoading) {
        return <div className="h-20 animate-pulse rounded-xl bg-cream-100" />;
    }

    if (!user) {
        return (
            <div className="rounded-xl bg-cream-100 px-4 py-4">
                <p className="text-sm font-black text-coffee-950">هنوز وارد نشدی</p>
                <p className="mt-1 text-xs leading-5 text-coffee-500">برای سفارش‌ها، تیکت‌ها و حساب کاربری وارد شو.</p>
                <Link href="/login" className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-4 text-xs font-black text-white">
                    <FiLogIn /> ورود یا ثبت‌نام
                </Link>
            </div>
        );
    }

    const isAdmin = user.role === "admin";
    const primaryHref = isAdmin ? "/admin" : "/user";
    const items = isAdmin
        ? [
              { title: "پنل مدیریت", href: "/admin", icon: FiSettings },
              { title: "سفارش‌ها", href: "/admin/orders", icon: FiPackage },
              { title: "تیکت‌ها", href: "/admin/tickets", icon: FiMessageSquare },
          ]
        : [
              { title: "حساب کاربری", href: "/user", icon: FiUser },
              { title: "سفارش‌های من", href: "/user/orders", icon: FiPackage },
              { title: "تیکت‌های پشتیبانی", href: "/user/tickets", icon: FiMessageSquare },
              { title: "ویرایش پروفایل", href: "/user/profile", icon: FiSettings },
          ];

    return (
        <div>
            <Link href={primaryHref} className="block rounded-xl bg-cream-100 px-4 py-4 transition hover:bg-cream-200/60">
                <p className="text-sm font-black text-coffee-950">{user.name || "کاربر ممد کافی"}</p>
                <p className="mt-1 truncate text-xs text-coffee-500" dir="ltr">{user.email || (isAdmin ? "مدیر سیستم" : "حساب مشتری")}</p>
            </Link>

            <div className="mt-2 space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-coffee-700 transition hover:bg-cream-100 hover:text-coffee-950">
                            <Icon className="text-lg text-coffee-500" /> {item.title}
                        </Link>
                    );
                })}
            </div>

            {!isAdmin && (
                <Link href="/contact" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-coffee-700 transition hover:bg-cream-100">
                    <FiHelpCircle className="text-lg text-coffee-500" /> راهنما و تماس با ما
                </Link>
            )}

            <button type="button" onClick={onLogout} className={`mt-2 flex w-full items-center gap-3 rounded-xl border-t border-coffee-100 px-3 py-3 text-sm font-black text-danger transition hover:bg-red-50 ${mobile ? "justify-center border" : ""}`}>
                <FiLogOut /> خروج از حساب
            </button>
        </div>
    );
}

export default function Navbar({ navigationItems = [], brand = {} }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, setUser } = useCurrentUser();
    const resolvedNavigationItems = navigationItems.length
        ? navigationItems
        : fallbackNavigationItems;
    const logoSrc =
        typeof brand.logo === "string" && brand.logo.startsWith("/")
            ? brand.logo
            : "/images/logo.png";
    const brandName = brand.storeEnglishName || brand.storeName || "MMD Coffee";
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const { cartCount, wishlistCount, isCartOpen, openCart, closeCart } = useStore();

    const accountHref = useMemo(() => {
        if (!user) return "/login";
        return user.role === "admin" ? "/admin" : "/user";
    }, [user]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setOpenMobileSubmenu(null);
        setIsSearchOpen(false);
        setIsWishlistOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isMobileMenuOpen) return undefined;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, [isMobileMenuOpen]);

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } finally {
            setUser(null);
            setIsMobileMenuOpen(false);
            window.dispatchEvent(new Event("mmd-auth-changed"));
            notifySuccess("با موفقیت خارج شدی");
            router.replace("/");
            router.refresh();
        }
    };

    const openSearch = () => { setIsMobileMenuOpen(false); setIsWishlistOpen(false); setIsSearchOpen(true); };
    const openWishlist = () => { setIsMobileMenuOpen(false); setIsSearchOpen(false); setIsWishlistOpen(true); };
    const openCartDrawer = () => { setIsMobileMenuOpen(false); setIsSearchOpen(false); setIsWishlistOpen(false); openCart(); };

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-coffee-100/80 bg-cream-50/90 backdrop-blur-xl">
                <div className="page-container flex h-[76px] items-center justify-between gap-5">
                    <Link href="/" aria-label="صفحه اصلی MMD Coffee" className="flex shrink-0 items-center">
                        <Image src={logoSrc} alt={`لوگوی ${brandName}`} width={132} height={52} priority className="h-11 w-auto object-contain" />
                    </Link>

                    <nav className="hidden h-full items-center lg:flex">
                        <ul className="flex h-full items-center gap-1">
                            {resolvedNavigationItems.map((item) => {
                                const hasChildren = Boolean(item.children?.length);
                                const active = isNavigationActive(pathname, item.href);
                                return (
                                    <li key={item.title} className="group relative flex h-full items-center">
                                        <Link href={item.href} className={`flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors xl:px-4 ${active ? "bg-coffee-100 text-coffee-900" : "text-coffee-700 hover:bg-coffee-50 hover:text-coffee-950"}`}>
                                            {item.title}{hasChildren && <FiChevronDown className="transition-transform group-hover:rotate-180" />}
                                        </Link>
                                        {hasChildren && (
                                            <div className="pointer-events-none invisible absolute right-0 top-full w-80 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                                                <div className="rounded-2xl border border-coffee-100 bg-white p-2 shadow-[0_18px_60px_rgba(48,32,26,0.14)]">
                                                    {item.children.map((child) => <Link key={child.href} href={child.href} className="block rounded-xl px-3 py-3 transition hover:bg-cream-100"><span className="block text-sm font-black text-coffee-800">{child.title}</span><span className="mt-1 block text-xs leading-5 text-coffee-500">{child.description}</span></Link>)}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button type="button" aria-label="جست‌وجوی محصولات" onClick={openSearch} className="flex size-10 items-center justify-center rounded-full text-coffee-700 transition hover:bg-white"><FiSearch size={19} /></button>
                        <button type="button" aria-label="علاقه‌مندی‌ها" onClick={openWishlist} className="relative hidden size-10 items-center justify-center rounded-full text-coffee-700 transition hover:bg-white sm:flex"><FiHeart size={19} />{wishlistCount > 0 && <span className="absolute -left-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-caramel-500 px-1 text-[10px] font-bold text-white">{wishlistCount > 9 ? "+۹" : wishlistCount.toLocaleString("fa-IR")}</span>}</button>
                        <button type="button" aria-label="سبد خرید" onClick={openCartDrawer} className="relative flex size-10 items-center justify-center rounded-full text-coffee-700 transition hover:bg-white"><FiShoppingBag size={19} />{cartCount > 0 && <span className="absolute -left-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-caramel-500 px-1 text-[10px] font-bold text-white">{cartCount > 9 ? "+۹" : cartCount.toLocaleString("fa-IR")}</span>}</button>

                        <div className="group relative hidden h-[76px] items-center sm:flex">
                            <Link href={accountHref} aria-label={user?.role === "admin" ? "پنل مدیریت" : user ? "حساب کاربری" : "ورود"} className="flex size-10 items-center justify-center rounded-full bg-coffee-900 text-white shadow-sm transition hover:bg-coffee-800"><FiUser size={18} /></Link>
                            <div className="pointer-events-none invisible absolute left-0 top-full w-72 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                                <div className="rounded-2xl border border-coffee-100 bg-white p-2 shadow-[0_18px_60px_rgba(48,32,26,0.14)]"><AccountMenu user={user} isLoading={isLoading} onLogout={logout} /></div>
                            </div>
                        </div>

                        <button type="button" onClick={() => setIsMobileMenuOpen((value) => !value)} className="flex size-10 items-center justify-center rounded-full bg-white text-coffee-900 shadow-sm lg:hidden">{isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}</button>
                    </div>
                </div>
            </header>

            <div onClick={() => setIsMobileMenuOpen(false)} className={`fixed inset-0 z-40 bg-coffee-950/30 backdrop-blur-[2px] transition-opacity lg:hidden ${isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
            <aside className={`fixed bottom-0 right-0 top-0 z-50 w-[min(90%,370px)] overflow-y-auto bg-cream-50 p-5 shadow-2xl transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex items-center justify-between border-b border-coffee-100 pb-4"><Image src={logoSrc} alt={brandName} width={120} height={48} className="h-10 w-auto" /><button type="button" onClick={() => setIsMobileMenuOpen(false)} className="flex size-10 items-center justify-center rounded-full bg-white"><FiX /></button></div>
                <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={openSearch} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white text-xs font-black"><FiSearch /> جست‌وجو</button><button type="button" onClick={openWishlist} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white text-xs font-black"><FiHeart /> علاقه‌مندی</button></div>
                <nav className="mt-5"><ul className="space-y-1">{resolvedNavigationItems.map((item) => <li key={item.title}><div className="flex items-center"><Link href={item.href} className="flex h-12 flex-1 items-center rounded-xl px-3 text-sm font-black text-coffee-800">{item.title}</Link>{item.children?.length ? <button type="button" onClick={() => setOpenMobileSubmenu((v) => v === item.title ? null : item.title)} className="flex size-11 items-center justify-center"><FiChevronDown className={openMobileSubmenu === item.title ? "rotate-180" : ""} /></button> : null}</div>{item.children?.length && openMobileSubmenu === item.title ? <div className="mr-3 space-y-1 border-r border-coffee-200 py-2 pr-4">{item.children.map((child) => <Link key={child.href} href={child.href} className="block rounded-lg px-3 py-2 text-sm text-coffee-600">{child.title}</Link>)}</div> : null}</li>)}</ul></nav>
                <div className="mt-6 border-t border-coffee-100 pt-5"><p className="mb-3 text-xs font-black text-coffee-500">حساب کاربری</p><AccountMenu user={user} isLoading={isLoading} onLogout={logout} mobile /></div>
            </aside>

            <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
        </>
    );
}
