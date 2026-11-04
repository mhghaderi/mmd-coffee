import Link from "next/link";

import { notFound } from "next/navigation";

import { FiArrowLeft, FiCoffee, FiTool } from "react-icons/fi";

const adminSections = {
    products: {
        title: "مدیریت محصولات",
        description: "ثبت، ویرایش، انتشار، موجودی و بایگانی محصولات",
    },

    categories: {
        title: "مدیریت دسته‌بندی‌ها",
        description: "ساخت و مدیریت دسته‌بندی‌های فروشگاه",
    },

    orders: {
        title: "مدیریت سفارش‌ها",
        description: "بررسی سفارش‌ها و تغییر وضعیت آماده‌سازی",
    },

    users: {
        title: "مدیریت کاربران",
        description: "مشاهده کاربران و کنترل وضعیت حساب‌ها",
    },

    reviews: {
        title: "مدیریت نظرات",
        description: "بررسی و تأیید نظرات ثبت‌شده",
    },

    articles: {
        title: "مدیریت مقالات",
        description: "ایجاد و انتشار محتوای آموزشی ممد کافی",
    },

    tickets: {
        title: "مدیریت تیکت‌ها",
        description: "پاسخ‌گویی به درخواست‌های پشتیبانی",
    },

    reports: {
        title: "گزارش‌ها",
        description: "تحلیل فروش، کاربران و محصولات محبوب",
    },

    settings: {
        title: "تنظیمات",
        description: "مدیریت تنظیمات عمومی سامانه",
    },
};

export default async function AdminSectionPage({ params }) {
    const { section } = await params;

    const sectionData = adminSections[section];

    if (!sectionData) {
        notFound();
    }

    return (
        <section className="flex min-h-[calc(100vh-150px)] items-center justify-center">
            <div className="w-full max-w-2xl rounded-[2rem] border border-coffee-100 bg-white p-8 text-center shadow-[0_20px_65px_rgba(48,32,26,0.08)] sm:p-12">
                <div className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-coffee-900 text-caramel-300 shadow-lg">
                    <FiTool size={30} />
                </div>

                <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-caramel-50 px-3 py-1.5 text-xs font-bold text-caramel-700">
                    <FiCoffee />
                    در حال توسعه
                </span>

                <h1 className="mt-5 text-3xl font-black text-coffee-950">{sectionData.title}</h1>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-coffee-500">
                    {sectionData.description}
                </p>

                <p className="mt-2 text-xs leading-6 text-coffee-400">
                    ساختار این قسمت آماده است و در مراحل بعد به API و دیتابیس متصل می‌شود.
                </p>

                <Link
                    href="/admin"
                    className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coffee-800"
                >
                    بازگشت به داشبورد
                    <FiArrowLeft />
                </Link>
            </div>
        </section>
    );
}
