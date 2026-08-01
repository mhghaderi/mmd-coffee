"use client";

import { useState } from "react";
import {
    FiBell,
    FiCheck,
    FiClock,
    FiGlobe,
    FiLoader,
    FiSave,
    FiSettings,
    FiShoppingBag,
} from "react-icons/fi";

const tabs = [
    { id: "general", title: "عمومی", icon: FiSettings },
    { id: "orders", title: "سفارش‌ها", icon: FiShoppingBag },
    { id: "hours", title: "ساعات کاری", icon: FiClock },
    { id: "seo", title: "سئو و شبکه‌ها", icon: FiGlobe },
    { id: "notifications", title: "اعلان‌ها", icon: FiBell },
];

const dayLabels = {
    saturday: "شنبه",
    sunday: "یکشنبه",
    monday: "دوشنبه",
    tuesday: "سه‌شنبه",
    wednesday: "چهارشنبه",
    thursday: "پنجشنبه",
    friday: "جمعه",
};

const fieldClassName =
    "h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none transition focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

function normalizeSettings(settings) {
    return {
        storeName: settings?.storeName || "ممد کافی",
        storeEnglishName: settings?.storeEnglishName || "MMD Coffee",
        tagline: settings?.tagline || "",
        logo: settings?.logo || "",
        supportEmail: settings?.supportEmail || "",
        supportPhone: settings?.supportPhone || "",
        address: settings?.address || "",
        orderSettings: {
            minOrderAmount: settings?.orderSettings?.minOrderAmount ?? 0,
            deliveryFee: settings?.orderSettings?.deliveryFee ?? 45000,
            freeDeliveryThreshold: settings?.orderSettings?.freeDeliveryThreshold ?? 0,
            defaultPreparationTime: settings?.orderSettings?.defaultPreparationTime ?? 20,
            maxDailyOrders: settings?.orderSettings?.maxDailyOrders ?? 0,
        },
        features: {
            acceptOrders: settings?.features?.acceptOrders ?? true,
            maintenanceMode: settings?.features?.maintenanceMode ?? false,
            reviewsEnabled: settings?.features?.reviewsEnabled ?? true,
            ticketsEnabled: settings?.features?.ticketsEnabled ?? true,
            guestCheckoutEnabled: settings?.features?.guestCheckoutEnabled ?? true,
        },
        notifications: {
            newOrderEmail: settings?.notifications?.newOrderEmail ?? true,
            newTicketEmail: settings?.notifications?.newTicketEmail ?? true,
            newReviewEmail: settings?.notifications?.newReviewEmail ?? false,
            lowStockEmail: settings?.notifications?.lowStockEmail ?? true,
            lowStockThreshold: settings?.notifications?.lowStockThreshold ?? 5,
        },
        seo: {
            defaultTitle: settings?.seo?.defaultTitle || "",
            defaultDescription: settings?.seo?.defaultDescription || "",
            keywords: Array.isArray(settings?.seo?.keywords)
                ? settings.seo.keywords.join(", ")
                : "",
        },
        socialLinks: {
            instagram: settings?.socialLinks?.instagram || "",
            telegram: settings?.socialLinks?.telegram || "",
            whatsapp: settings?.socialLinks?.whatsapp || "",
        },
        workingHours: Array.isArray(settings?.workingHours) ? settings.workingHours : [],
    };
}

function ToggleCard({ title, description, checked, onChange, danger = false }) {
    return (
        <button
            type="button"
            aria-pressed={checked}
            onClick={() => onChange(!checked)}
            className={`flex items-start justify-between gap-4 rounded-2xl border p-4 text-right transition ${
                checked
                    ? danger
                        ? "border-red-200 bg-red-50"
                        : "border-emerald-200 bg-emerald-50"
                    : "border-coffee-100 bg-cream-50"
            }`}
        >
            <div>
                <p
                    className={`text-sm font-black ${
                        checked ? (danger ? "text-red-700" : "text-emerald-700") : "text-coffee-800"
                    }`}
                >
                    {title}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-coffee-400">{description}</p>
            </div>

            <span
                className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${
                    checked ? (danger ? "bg-red-500" : "bg-emerald-500") : "bg-coffee-200"
                }`}
            >
                <span
                    className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
                        checked ? "left-1" : "right-1"
                    }`}
                />
            </span>
        </button>
    );
}

export default function SettingsForm({ initialSettings }) {
    const [activeTab, setActiveTab] = useState("general");
    const [form, setForm] = useState(() => normalizeSettings(initialSettings));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const setTopField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const setNestedField = (section, field, value) => {
        setForm((current) => ({
            ...current,
            [section]: {
                ...current[section],
                [field]: value,
            },
        }));
    };

    const updateWorkingHour = (day, field, value) => {
        setForm((current) => ({
            ...current,
            workingHours: current.workingHours.map((item) =>
                item.day === day ? { ...item, [field]: value } : item,
            ),
        }));
    };

    const submit = async () => {
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    seo: {
                        ...form.seo,
                        keywords: form.seo.keywords,
                    },
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "ذخیره تنظیمات انجام نشد");
            }

            setForm(normalizeSettings(result.data));
            setMessage({ type: "success", text: result.message });
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="h-fit rounded-[1.75rem] border border-coffee-100 bg-white p-3 shadow-[0_12px_40px_rgba(48,32,26,0.05)] xl:sticky xl:top-24">
                <div className="space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-black transition ${
                                    isActive
                                        ? "bg-coffee-900 text-white"
                                        : "text-coffee-500 hover:bg-cream-100 hover:text-coffee-950"
                                }`}
                            >
                                <Icon className="text-current" />
                                <span className="text-current">{tab.title}</span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <section className="rounded-[2rem] border border-coffee-100 bg-white p-5 shadow-[0_14px_50px_rgba(48,32,26,0.06)] sm:p-7">
                {activeTab === "general" && (
                    <div>
                        <h2 className="text-xl font-black text-coffee-950">اطلاعات عمومی فروشگاه</h2>
                        <p className="mt-2 text-xs leading-6 text-coffee-400">
                            نام برند، راه‌های تماس و اطلاعات پایه فروشگاه را مدیریت کن.
                        </p>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <label>
                                <span className="mb-2 block text-sm font-bold text-coffee-800">نام فروشگاه</span>
                                <input
                                    value={form.storeName}
                                    onChange={(event) => setTopField("storeName", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label>
                                <span className="mb-2 block text-sm font-bold text-coffee-800">نام انگلیسی</span>
                                <input
                                    dir="ltr"
                                    value={form.storeEnglishName}
                                    onChange={(event) => setTopField("storeEnglishName", event.target.value)}
                                    className={`${fieldClassName} text-left`}
                                />
                            </label>

                            <label className="sm:col-span-2">
                                <span className="mb-2 block text-sm font-bold text-coffee-800">شعار فروشگاه</span>
                                <input
                                    value={form.tagline}
                                    onChange={(event) => setTopField("tagline", event.target.value)}
                                    className={fieldClassName}
                                />
                            </label>

                            <label>
                                <span className="mb-2 block text-sm font-bold text-coffee-800">ایمیل پشتیبانی</span>
                                <input
                                    type="email"
                                    dir="ltr"
                                    value={form.supportEmail}
                                    onChange={(event) => setTopField("supportEmail", event.target.value)}
                                    className={`${fieldClassName} text-left`}
                                />
                            </label>

                            <label>
                                <span className="mb-2 block text-sm font-bold text-coffee-800">شماره تماس</span>
                                <input
                                    dir="ltr"
                                    value={form.supportPhone}
                                    onChange={(event) => setTopField("supportPhone", event.target.value)}
                                    className={`${fieldClassName} text-left`}
                                />
                            </label>

                            <label className="sm:col-span-2">
                                <span className="mb-2 block text-sm font-bold text-coffee-800">آدرس</span>
                                <textarea
                                    rows={4}
                                    value={form.address}
                                    onChange={(event) => setTopField("address", event.target.value)}
                                    className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 px-4 py-3 text-sm leading-7 text-coffee-950 outline-none transition focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div>
                        <h2 className="text-xl font-black text-coffee-950">تنظیمات سفارش و فروش</h2>
                        <p className="mt-2 text-xs leading-6 text-coffee-400">
                            محدودیت‌های سفارش، هزینه ارسال و دسترسی‌های فروشگاه را تعیین کن.
                        </p>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {[
                                ["minOrderAmount", "حداقل مبلغ سفارش", "تومان"],
                                ["deliveryFee", "هزینه ارسال", "تومان"],
                                ["freeDeliveryThreshold", "ارسال رایگان از مبلغ", "تومان"],
                                ["defaultPreparationTime", "زمان آماده‌سازی پیش‌فرض", "دقیقه"],
                                ["maxDailyOrders", "حداکثر سفارش روزانه", "۰ یعنی نامحدود"],
                            ].map(([field, title, hint]) => (
                                <label key={field}>
                                    <span className="mb-2 block text-sm font-bold text-coffee-800">{title}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.orderSettings[field]}
                                        onChange={(event) =>
                                            setNestedField("orderSettings", field, event.target.value)
                                        }
                                        className={fieldClassName}
                                    />
                                    <span className="mt-1 block text-[10px] text-coffee-400">{hint}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mt-7 grid gap-3 sm:grid-cols-2">
                            <ToggleCard
                                title="پذیرش سفارش فعال"
                                description="وقتی غیرفعال باشد ثبت سفارش جدید متوقف می‌شود."
                                checked={form.features.acceptOrders}
                                onChange={(value) => setNestedField("features", "acceptOrders", value)}
                            />
                            <ToggleCard
                                title="حالت تعمیر و نگهداری"
                                description="برای توقف موقت دسترسی عمومی سایت استفاده می‌شود."
                                checked={form.features.maintenanceMode}
                                onChange={(value) => setNestedField("features", "maintenanceMode", value)}
                                danger
                            />
                            <ToggleCard
                                title="ثبت نظر کاربران"
                                description="امکان ارسال نظر و امتیاز محصول فعال باشد."
                                checked={form.features.reviewsEnabled}
                                onChange={(value) => setNestedField("features", "reviewsEnabled", value)}
                            />
                            <ToggleCard
                                title="سامانه تیکت"
                                description="کاربران بتوانند درخواست پشتیبانی ثبت کنند."
                                checked={form.features.ticketsEnabled}
                                onChange={(value) => setNestedField("features", "ticketsEnabled", value)}
                            />
                            <ToggleCard
                                title="خرید مهمان"
                                description="ثبت سفارش بدون ورود به حساب مجاز باشد."
                                checked={form.features.guestCheckoutEnabled}
                                onChange={(value) =>
                                    setNestedField("features", "guestCheckoutEnabled", value)
                                }
                            />
                        </div>
                    </div>
                )}

                {activeTab === "hours" && (
                    <div>
                        <h2 className="text-xl font-black text-coffee-950">ساعات کاری</h2>
                        <p className="mt-2 text-xs leading-6 text-coffee-400">
                            وضعیت باز یا بسته بودن فروشگاه را برای هر روز هفته مشخص کن.
                        </p>

                        <div className="mt-6 space-y-3">
                            {form.workingHours.map((item) => (
                                <div
                                    key={item.day}
                                    className="grid items-center gap-3 rounded-2xl border border-coffee-100 bg-cream-50 p-4 sm:grid-cols-[120px_110px_1fr_1fr]"
                                >
                                    <p className="text-sm font-black text-coffee-900">{dayLabels[item.day]}</p>
                                    <button
                                        type="button"
                                        onClick={() => updateWorkingHour(item.day, "isOpen", !item.isOpen)}
                                        className={`h-10 rounded-xl text-xs font-black transition ${
                                            item.isOpen
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {item.isOpen ? "باز" : "تعطیل"}
                                    </button>
                                    <label>
                                        <span className="mb-1 block text-[10px] text-coffee-400">شروع</span>
                                        <input
                                            type="time"
                                            disabled={!item.isOpen}
                                            value={item.opensAt}
                                            onChange={(event) =>
                                                updateWorkingHour(item.day, "opensAt", event.target.value)
                                            }
                                            className={`${fieldClassName} disabled:opacity-45`}
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-[10px] text-coffee-400">پایان</span>
                                        <input
                                            type="time"
                                            disabled={!item.isOpen}
                                            value={item.closesAt}
                                            onChange={(event) =>
                                                updateWorkingHour(item.day, "closesAt", event.target.value)
                                            }
                                            className={`${fieldClassName} disabled:opacity-45`}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "seo" && (
                    <div>
                        <h2 className="text-xl font-black text-coffee-950">سئو و شبکه‌های اجتماعی</h2>
                        <p className="mt-2 text-xs leading-6 text-coffee-400">
                            اطلاعات پیش‌فرض موتورهای جست‌وجو و لینک شبکه‌های اجتماعی را مدیریت کن.
                        </p>

                        <div className="mt-6 grid gap-5">
                            <label>
                                <span className="mb-2 block text-sm font-bold text-coffee-800">عنوان پیش‌فرض سئو</span>
                                <input
                                    value={form.seo.defaultTitle}
                                    onChange={(event) =>
                                        setNestedField("seo", "defaultTitle", event.target.value)
                                    }
                                    className={fieldClassName}
                                />
                                <span className="mt-1 block text-[10px] text-coffee-400">
                                    {form.seo.defaultTitle.length.toLocaleString("fa-IR")} از ۷۰ کاراکتر
                                </span>
                            </label>

                            <label>
                                <span className="mb-2 block text-sm font-bold text-coffee-800">توضیح پیش‌فرض سئو</span>
                                <textarea
                                    rows={4}
                                    value={form.seo.defaultDescription}
                                    onChange={(event) =>
                                        setNestedField("seo", "defaultDescription", event.target.value)
                                    }
                                    className="w-full resize-none rounded-xl border border-coffee-100 bg-cream-50 px-4 py-3 text-sm leading-7 text-coffee-950 outline-none transition focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100"
                                />
                                <span className="mt-1 block text-[10px] text-coffee-400">
                                    {form.seo.defaultDescription.length.toLocaleString("fa-IR")} از ۱۸۰ کاراکتر
                                </span>
                            </label>

                            <label>
                                <span className="mb-2 block text-sm font-bold text-coffee-800">کلمات کلیدی</span>
                                <input
                                    value={form.seo.keywords}
                                    onChange={(event) =>
                                        setNestedField("seo", "keywords", event.target.value)
                                    }
                                    placeholder="قهوه، کافه، سفارش آنلاین"
                                    className={fieldClassName}
                                />
                            </label>

                            <div className="grid gap-5 sm:grid-cols-3">
                                {[
                                    ["instagram", "اینستاگرام"],
                                    ["telegram", "تلگرام"],
                                    ["whatsapp", "واتساپ"],
                                ].map(([field, title]) => (
                                    <label key={field}>
                                        <span className="mb-2 block text-sm font-bold text-coffee-800">{title}</span>
                                        <input
                                            dir="ltr"
                                            value={form.socialLinks[field]}
                                            onChange={(event) =>
                                                setNestedField("socialLinks", field, event.target.value)
                                            }
                                            className={`${fieldClassName} text-left`}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div>
                        <h2 className="text-xl font-black text-coffee-950">اعلان‌های مدیریتی</h2>
                        <p className="mt-2 text-xs leading-6 text-coffee-400">
                            رویدادهایی که باید برای مدیر اعلان ایجاد کنند را مشخص کن.
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <ToggleCard
                                title="سفارش جدید"
                                description="برای سفارش تازه اعلان مدیریتی ایجاد شود."
                                checked={form.notifications.newOrderEmail}
                                onChange={(value) =>
                                    setNestedField("notifications", "newOrderEmail", value)
                                }
                            />
                            <ToggleCard
                                title="تیکت جدید"
                                description="ثبت تیکت تازه به مدیر اطلاع داده شود."
                                checked={form.notifications.newTicketEmail}
                                onChange={(value) =>
                                    setNestedField("notifications", "newTicketEmail", value)
                                }
                            />
                            <ToggleCard
                                title="نظر جدید"
                                description="نظر در انتظار بررسی به مدیر اطلاع داده شود."
                                checked={form.notifications.newReviewEmail}
                                onChange={(value) =>
                                    setNestedField("notifications", "newReviewEmail", value)
                                }
                            />
                            <ToggleCard
                                title="هشدار موجودی کم"
                                description="برای محصولات دارای کنترل موجودی هشدار فعال باشد."
                                checked={form.notifications.lowStockEmail}
                                onChange={(value) =>
                                    setNestedField("notifications", "lowStockEmail", value)
                                }
                            />
                        </div>

                        <label className="mt-5 block max-w-sm">
                            <span className="mb-2 block text-sm font-bold text-coffee-800">آستانه موجودی کم</span>
                            <input
                                type="number"
                                min="0"
                                value={form.notifications.lowStockThreshold}
                                onChange={(event) =>
                                    setNestedField("notifications", "lowStockThreshold", event.target.value)
                                }
                                className={fieldClassName}
                            />
                        </label>
                    </div>
                )}

                {message.text && (
                    <div
                        role="status"
                        className={`mt-7 flex items-center gap-2 rounded-xl p-3 text-xs font-black ${
                            message.type === "success"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        {message.type === "success" && <FiCheck />}
                        {message.text}
                    </div>
                )}

                <div className="mt-7 flex justify-end border-t border-coffee-100 pt-6">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={submit}
                        className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white transition hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {isSubmitting ? "در حال ذخیره" : "ذخیره تنظیمات"}
                    </button>
                </div>
            </section>
        </div>
    );
}
