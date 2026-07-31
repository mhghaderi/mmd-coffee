"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

import {
    FiAlertCircle,
    FiArrowRight,
    FiCheckCircle,
    FiCoffee,
    FiCreditCard,
    FiLoader,
    FiMapPin,
    FiPackage,
    FiPhone,
    FiShoppingBag,
    FiTruck,
    FiUser,
} from "react-icons/fi";

import { useStore } from "@/context/StoreContext";

const inputClassName =
    "h-13 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

const textareaClassName =
    "w-full resize-y rounded-xl border border-coffee-100 bg-cream-50 px-4 py-3 text-sm leading-7 text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

const priceFormatter = new Intl.NumberFormat("fa-IR");

function Price({ value, className = "" }) {
    return (
        <span className={className}>
            {priceFormatter.format(Number(value) || 0)}

            <span className="mr-1 text-[10px] font-medium text-coffee-400">تومان</span>
        </span>
    );
}

function CheckoutSection({ title, description, icon: Icon, children }) {
    return (
        <section className="overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)]">
            <header className="flex items-start gap-3 border-b border-coffee-100 p-5 sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-coffee-100 text-coffee-700">
                    <Icon size={19} />
                </span>

                <div>
                    <h2 className="text-base font-black text-coffee-950">{title}</h2>

                    {description && (
                        <p className="mt-1 text-xs leading-6 text-coffee-400">{description}</p>
                    )}
                </div>
            </header>

            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

export default function CheckoutClient({ currentUser }) {
    const router = useRouter();

    const { isHydrated, cartItems, checkoutItems, clearCart, openCart } = useStore();

    const [form, setForm] = useState({
        fullName: currentUser?.name || "",

        email: currentUser?.email || "",

        phone: currentUser?.phone || "",

        deliveryMethod: "pickup",

        province: "",
        city: "",
        addressLine: "",
        postalCode: "",
        plaque: "",
        unit: "",

        paymentMethod: "cash",

        customerNote: "",
    });

    const [quote, setQuote] = useState(null);

    const [isQuoteLoading, setIsQuoteLoading] = useState(false);

    const [quoteError, setQuoteError] = useState("");

    const [submitError, setSubmitError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkoutItemsSignature = useMemo(() => JSON.stringify(checkoutItems), [checkoutItems]);

    const updateField = (name, value) => {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        if (submitError) {
            setSubmitError("");
        }
    };

    useEffect(() => {
        if (!isHydrated || checkoutItems.length === 0) {
            setQuote(null);
            setQuoteError("");
            return;
        }

        const controller = new AbortController();

        const getQuote = async () => {
            setIsQuoteLoading(true);
            setQuoteError("");

            try {
                const response = await fetch("/api/orders/quote", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        items: checkoutItems,

                        delivery: {
                            method: form.deliveryMethod,
                        },
                    }),

                    signal: controller.signal,
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    setQuote(null);

                    setQuoteError(result.message || "محاسبه صورتحساب انجام نشد");

                    return;
                }

                setQuote(result.data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setQuote(null);

                    setQuoteError("ارتباط با سرور برقرار نشد");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsQuoteLoading(false);
                }
            }
        };

        getQuote();

        return () => {
            controller.abort();
        };
    }, [checkoutItemsSignature, form.deliveryMethod, isHydrated]);

    const validateForm = () => {
        if (form.fullName.trim().length < 2) {
            return "نام و نام خانوادگی را وارد کن";
        }

        if (form.phone.trim().length < 7) {
            return "شماره تماس معتبر نیست";
        }

        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            return "ایمیل واردشده معتبر نیست";
        }

        if (form.deliveryMethod === "delivery") {
            if (!form.city.trim()) {
                return "شهر را وارد کن";
            }

            if (form.addressLine.trim().length < 5) {
                return "آدرس کامل را وارد کن";
            }
        }

        if (!quote) {
            return "صورتحساب هنوز آماده نیست";
        }

        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const validationError = validateForm();

        if (validationError) {
            setSubmitError(validationError);
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch("/api/orders", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    customer: {
                        fullName: form.fullName.trim(),

                        email: form.email.trim().toLowerCase(),

                        phone: form.phone.trim(),
                    },

                    items: checkoutItems,

                    delivery: {
                        method: form.deliveryMethod,

                        province: form.province.trim(),

                        city: form.city.trim(),

                        addressLine: form.addressLine.trim(),

                        postalCode: form.postalCode.trim(),

                        plaque: form.plaque.trim(),

                        unit: form.unit.trim(),
                    },

                    paymentMethod: form.paymentMethod,

                    customerNote: form.customerNote.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setSubmitError(result.message || "ثبت سفارش انجام نشد");

                /*
          قیمت یا موجودی ممکن است تغییر کرده باشد.
        */

                if (
                    ["PRODUCT_UNAVAILABLE", "INSUFFICIENT_STOCK", "STOCK_CHANGED"].includes(
                        result.code,
                    )
                ) {
                    setQuote(null);
                }

                return;
            }

            clearCart();

            router.replace(
                `/checkout/success?order=${encodeURIComponent(result.data.orderNumber)}`,
            );

            router.refresh();
        } catch (error) {
            console.error("CHECKOUT ERROR:", error);

            setSubmitError("ارتباط با سرور برقرار نشد. دوباره تلاش کن.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isHydrated) {
        return (
            <div className="page-container py-16">
                <div className="h-[600px] animate-pulse rounded-[2rem] bg-white" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <section className="page-container flex min-h-[70vh] items-center justify-center py-16">
                <div className="w-full max-w-xl rounded-[2rem] border border-coffee-100 bg-white p-8 text-center shadow-[0_20px_65px_rgba(48,32,26,0.08)] sm:p-12">
                    <span className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-coffee-900 text-caramel-300">
                        <FiShoppingBag size={29} />
                    </span>

                    <h1 className="mt-6 text-3xl font-black text-coffee-950">سبد خرید خالی است</h1>

                    <p className="mt-4 text-sm leading-8 text-coffee-500">
                        برای ثبت سفارش ابتدا یک محصول به سبد خرید اضافه کن.
                    </p>

                    <Link
                        href="/menu"
                        className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white transition hover:bg-coffee-800"
                    >
                        <FiCoffee className="text-current" />

                        <span className="text-current">مشاهده منو</span>
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <main className="page-container py-10 sm:py-14">
            <section className="mb-8">
                <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 text-xs font-bold text-coffee-500 transition hover:text-coffee-950"
                >
                    <FiArrowRight />
                    بازگشت به منو
                </Link>

                <p className="mt-6 text-xs font-bold text-caramel-600">تکمیل خرید</p>

                <h1 className="mt-2 text-3xl font-black text-coffee-950 sm:text-4xl">
                    ثبت سفارش ممد کافی
                </h1>

                <p className="mt-3 text-sm leading-7 text-coffee-500">
                    اطلاعات دریافت‌کننده و روش تحویل را بررسی و سفارش را نهایی کن.
                </p>
            </section>

            {quoteError && (
                <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700"
                >
                    <FiAlertCircle className="mt-0.5 shrink-0" />

                    <div>
                        <p className="leading-7">{quoteError}</p>

                        <button type="button" onClick={openCart} className="mt-2 text-xs underline">
                            بررسی سبد خرید
                        </button>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                noValidate
                className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_390px]"
            >
                <div className="space-y-7">
                    <CheckoutSection
                        title="اطلاعات دریافت‌کننده"
                        description="اطلاعات تماس برای پیگیری سفارش"
                        icon={FiUser}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="checkout-full-name"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    نام و نام خانوادگی
                                </label>

                                <input
                                    id="checkout-full-name"
                                    value={form.fullName}
                                    onChange={(event) =>
                                        updateField("fullName", event.target.value)
                                    }
                                    autoComplete="name"
                                    placeholder="نام دریافت‌کننده سفارش"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="checkout-phone"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    شماره تماس
                                </label>

                                <div className="relative">
                                    <FiPhone className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400" />

                                    <input
                                        id="checkout-phone"
                                        type="tel"
                                        dir="ltr"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        value={form.phone}
                                        onChange={(event) =>
                                            updateField("phone", event.target.value)
                                        }
                                        placeholder="09121234567"
                                        className={`${inputClassName} pr-11 text-left`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="checkout-email"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    ایمیل
                                    <span className="mr-1 text-xs font-normal text-coffee-400">
                                        اختیاری
                                    </span>
                                </label>

                                <input
                                    id="checkout-email"
                                    type="email"
                                    dir="ltr"
                                    inputMode="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(event) => updateField("email", event.target.value)}
                                    placeholder="customer@example.com"
                                    className={`${inputClassName} text-left`}
                                />
                            </div>
                        </div>
                    </CheckoutSection>

                    <CheckoutSection
                        title="روش تحویل"
                        description="دریافت حضوری یا ارسال سفارش"
                        icon={FiTruck}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                aria-pressed={form.deliveryMethod === "pickup"}
                                onClick={() => updateField("deliveryMethod", "pickup")}
                                className={`flex items-start gap-3 rounded-2xl border p-4 text-right transition ${
                                    form.deliveryMethod === "pickup"
                                        ? "border-coffee-900 bg-coffee-900 text-white"
                                        : "border-coffee-100 bg-cream-50 text-coffee-700 hover:border-coffee-200"
                                }`}
                            >
                                <span
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                        form.deliveryMethod === "pickup"
                                            ? "bg-white/10 text-white"
                                            : "bg-white text-coffee-600"
                                    }`}
                                >
                                    <FiPackage className="text-current" />
                                </span>

                                <span>
                                    <span className="block text-sm font-black text-current">
                                        دریافت حضوری
                                    </span>

                                    <span
                                        className={`mt-1 block text-xs leading-6 ${
                                            form.deliveryMethod === "pickup"
                                                ? "text-white/55"
                                                : "text-coffee-400"
                                        }`}
                                    >
                                        دریافت سفارش از ممد کافی
                                    </span>
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-pressed={form.deliveryMethod === "delivery"}
                                onClick={() => updateField("deliveryMethod", "delivery")}
                                className={`flex items-start gap-3 rounded-2xl border p-4 text-right transition ${
                                    form.deliveryMethod === "delivery"
                                        ? "border-coffee-900 bg-coffee-900 text-white"
                                        : "border-coffee-100 bg-cream-50 text-coffee-700 hover:border-coffee-200"
                                }`}
                            >
                                <span
                                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                        form.deliveryMethod === "delivery"
                                            ? "bg-white/10 text-white"
                                            : "bg-white text-coffee-600"
                                    }`}
                                >
                                    <FiTruck className="text-current" />
                                </span>

                                <span>
                                    <span className="block text-sm font-black text-current">
                                        ارسال به آدرس
                                    </span>

                                    <span
                                        className={`mt-1 block text-xs leading-6 ${
                                            form.deliveryMethod === "delivery"
                                                ? "text-white/55"
                                                : "text-coffee-400"
                                        }`}
                                    >
                                        ارسال با هزینه محاسبه‌شده
                                    </span>
                                </span>
                            </button>
                        </div>

                        {form.deliveryMethod === "delivery" && (
                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-coffee-800">
                                        استان
                                    </label>

                                    <input
                                        value={form.province}
                                        onChange={(event) =>
                                            updateField("province", event.target.value)
                                        }
                                        autoComplete="address-level1"
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-coffee-800">
                                        شهر
                                    </label>

                                    <input
                                        value={form.city}
                                        onChange={(event) =>
                                            updateField("city", event.target.value)
                                        }
                                        autoComplete="address-level2"
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-bold text-coffee-800">
                                        آدرس کامل
                                    </label>

                                    <div className="relative">
                                        <FiMapPin className="pointer-events-none absolute right-4 top-4 text-coffee-400" />

                                        <textarea
                                            rows={4}
                                            value={form.addressLine}
                                            onChange={(event) =>
                                                updateField("addressLine", event.target.value)
                                            }
                                            autoComplete="street-address"
                                            placeholder="خیابان، کوچه و جزئیات آدرس..."
                                            className={`${textareaClassName} pr-11`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-coffee-800">
                                        پلاک
                                    </label>

                                    <input
                                        value={form.plaque}
                                        onChange={(event) =>
                                            updateField("plaque", event.target.value)
                                        }
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-coffee-800">
                                        واحد
                                    </label>

                                    <input
                                        value={form.unit}
                                        onChange={(event) =>
                                            updateField("unit", event.target.value)
                                        }
                                        className={inputClassName}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-bold text-coffee-800">
                                        کد پستی
                                    </label>

                                    <input
                                        dir="ltr"
                                        inputMode="numeric"
                                        value={form.postalCode}
                                        onChange={(event) =>
                                            updateField("postalCode", event.target.value)
                                        }
                                        autoComplete="postal-code"
                                        className={`${inputClassName} text-left`}
                                    />
                                </div>
                            </div>
                        )}
                    </CheckoutSection>

                    <CheckoutSection
                        title="روش پرداخت"
                        description="پرداخت هنگام دریافت سفارش"
                        icon={FiCreditCard}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                {
                                    value: "cash",
                                    title: "پرداخت نقدی",
                                    description: "پرداخت مبلغ هنگام تحویل",
                                },

                                {
                                    value: "card",
                                    title: "کارت‌خوان",
                                    description: "پرداخت با کارت هنگام تحویل",
                                },
                            ].map((option) => {
                                const isActive = form.paymentMethod === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => updateField("paymentMethod", option.value)}
                                        className={`rounded-2xl border p-4 text-right transition ${
                                            isActive
                                                ? "border-coffee-900 bg-coffee-900 text-white"
                                                : "border-coffee-100 bg-cream-50 text-coffee-700 hover:border-coffee-200"
                                        }`}
                                    >
                                        <span className="text-sm font-black text-current">
                                            {option.title}
                                        </span>

                                        <span
                                            className={`mt-1 block text-xs leading-6 ${
                                                isActive ? "text-white/55" : "text-coffee-400"
                                            }`}
                                        >
                                            {option.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </CheckoutSection>

                    <CheckoutSection
                        title="یادداشت سفارش"
                        description="توضیحی درباره آماده‌سازی سفارش"
                        icon={FiCoffee}
                    >
                        <textarea
                            rows={4}
                            maxLength={1000}
                            value={form.customerNote}
                            onChange={(event) => updateField("customerNote", event.target.value)}
                            placeholder="مثلاً نوشیدنی بدون شکر آماده شود..."
                            className={textareaClassName}
                        />
                    </CheckoutSection>
                </div>

                {/* Order summary */}

                <aside className="space-y-5 xl:sticky xl:top-28">
                    <section className="overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.08)]">
                        <header className="border-b border-coffee-100 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-black text-coffee-950">
                                        خلاصه سفارش
                                    </h2>

                                    <p className="mt-1 text-xs text-coffee-400">
                                        قیمت محاسبه‌شده از دیتابیس
                                    </p>
                                </div>

                                {isQuoteLoading && (
                                    <FiLoader className="animate-spin text-caramel-600" />
                                )}
                            </div>
                        </header>

                        <div className="p-5">
                            {quote ? (
                                <>
                                    <div className="max-h-80 space-y-4 overflow-y-auto pl-1">
                                        {quote.items.map((item, index) => (
                                            <article
                                                key={`${item.productId}-${item.variant?.originalId || "default"}-${index}`}
                                                className="flex gap-3"
                                            >
                                                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream-100">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="size-full object-contain p-1.5"
                                                        />
                                                    ) : (
                                                        <FiCoffee className="text-coffee-300" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-black text-coffee-950">
                                                        {item.name}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-coffee-400">
                                                        تعداد:{" "}
                                                        {item.quantity.toLocaleString("fa-IR")}
                                                    </p>

                                                    {item.variant?.title && (
                                                        <p className="mt-1 text-[10px] text-coffee-500">
                                                            {item.variant.title}
                                                        </p>
                                                    )}

                                                    <Price
                                                        value={item.lineTotal}
                                                        className="mt-2 block text-xs font-black text-coffee-900"
                                                    />
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    <div className="mt-5 space-y-4 border-t border-coffee-100 pt-5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-coffee-500">جمع محصولات</span>

                                            <Price
                                                value={quote.pricing.subtotal}
                                                className="font-black text-coffee-900"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-coffee-500">هزینه ارسال</span>

                                            {quote.pricing.deliveryFee > 0 ? (
                                                <Price
                                                    value={quote.pricing.deliveryFee}
                                                    className="font-black text-coffee-900"
                                                />
                                            ) : (
                                                <span className="font-black text-emerald-700">
                                                    رایگان
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-coffee-100 pt-4">
                                            <span className="text-sm font-black text-coffee-950">
                                                مبلغ نهایی
                                            </span>

                                            <Price
                                                value={quote.pricing.total}
                                                className="text-xl font-black text-coffee-950"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-10 text-center">
                                    {isQuoteLoading ? (
                                        <>
                                            <FiLoader className="mx-auto animate-spin text-2xl text-caramel-600" />

                                            <p className="mt-3 text-xs font-bold text-coffee-500">
                                                در حال محاسبه صورتحساب
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <FiAlertCircle className="mx-auto text-2xl text-red-500" />

                                            <p className="mt-3 text-xs font-bold leading-6 text-red-600">
                                                صورتحساب آماده نیست
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {submitError && (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-700"
                        >
                            <FiAlertCircle className="mt-0.5 shrink-0" />

                            <p className="leading-6">{submitError}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isQuoteLoading || !quote}
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-coffee-900 px-6 text-sm font-black text-white shadow-[0_15px_35px_rgba(48,32,26,0.20)] transition hover:-translate-y-0.5 hover:bg-coffee-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {isSubmitting ? (
                            <>
                                <FiLoader className="animate-spin text-current" />

                                <span className="text-current">در حال ثبت سفارش</span>
                            </>
                        ) : (
                            <>
                                <FiCheckCircle className="text-current" />

                                <span className="text-current">ثبت نهایی سفارش</span>
                            </>
                        )}
                    </button>

                    <p className="px-3 text-center text-[10px] leading-6 text-coffee-400">
                        مبلغ نهایی هنگام ثبت سفارش دوباره از دیتابیس محاسبه می‌شود.
                    </p>
                </aside>
            </form>
        </main>
    );
}
