"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";
import ProductImageUploader from "@/components/admin/products/ProductImageUploader";
import { useState } from "react";

import {
    FiAlertCircle,
    FiArchive,
    FiBox,
    FiCheck,
    FiCheckCircle,
    FiChevronDown,
    FiClock,
    FiCoffee,
    FiFileText,
    FiImage,
    FiInfo,
    FiLoader,
    FiMinus,
    FiPackage,
    FiPlus,
    FiSave,
    FiSearch,
    FiStar,
    FiTag,
    FiTrash2,
    FiX,
} from "react-icons/fi";

const inputClassName =
    "h-13 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

const textareaClassName =
    "w-full resize-y rounded-xl border border-coffee-100 bg-cream-50 px-4 py-3 text-sm leading-7 text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

const statusOptions = [
    {
        value: "draft",
        title: "پیش‌نویس",
        description: "محصول فقط در پنل مدیریت دیده می‌شود.",
        icon: FiFileText,
    },
    {
        value: "published",
        title: "منتشرشده",
        description: "محصول در سایت عمومی قابل مشاهده است.",
        icon: FiCheckCircle,
    },
    {
        value: "archived",
        title: "بایگانی‌شده",
        description: "محصول غیرفعال و از فروشگاه خارج می‌شود.",
        icon: FiArchive,
    },
];

function slugify(value) {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

function splitList(value) {
    return [
        ...new Set(
            value
                .split(/[\n,،]+/)
                .map((item) => item.trim())
                .filter(Boolean),
        ),
    ];
}

function createInitialForm(product) {
    return {
        name: product?.name || "",
        englishName: product?.englishName || "",
        slug: product?.slug || "",
        category: product?.category || "",

        shortDescription: product?.shortDescription || "",

        description: product?.description || "",

        price: product?.price !== undefined ? String(product.price) : "",

        discountPercent: String(product?.discountPercent || 0),

        image: product?.image || "",

        gallery: Array.isArray(product?.gallery) ? product.gallery.join("\n") : "",

        preparationTime: String(product?.preparationTime || 0),

        intensity: product?.intensity || "medium",

        ingredients: Array.isArray(product?.ingredients) ? product.ingredients.join("، ") : "",

        tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",

        variants: Array.isArray(product?.variants)
            ? product.variants.map((variant) => ({
                  title: variant.title || "",

                  priceAdjustment: String(variant.priceAdjustment || 0),

                  isDefault: Boolean(variant.isDefault),

                  isActive: variant.isActive !== false,
              }))
            : [],

        addOns: Array.isArray(product?.addOns)
            ? product.addOns.map((addOn) => ({
                  title: addOn.title || "",

                  price: String(addOn.price || 0),

                  isActive: addOn.isActive !== false,
              }))
            : [],

        trackStock: Boolean(product?.trackStock),

        stock: String(product?.stock || 0),

        isAvailable: product?.isAvailable !== false,

        status: product?.status || "draft",

        isFeatured: Boolean(product?.isFeatured),

        isNew: Boolean(product?.isNew),

        accentColor: product?.accentColor || "#c8793f",

        displayOrder: String(product?.displayOrder || 0),

        seoTitle: product?.seoTitle || "",

        seoDescription: product?.seoDescription || "",
    };
}

function FormSection({ title, description, icon: Icon, children }) {
    return (
        <section className="overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white shadow-[0_12px_40px_rgba(48,32,26,0.05)]">
            <header className="flex items-start gap-3 border-b border-coffee-100 px-5 py-5 sm:px-6">
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

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
            <FiAlertCircle />
            {message}
        </p>
    );
}

function Toggle({ checked, onChange, title, description }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-coffee-100 bg-cream-50 p-4 text-right transition hover:border-coffee-200 hover:bg-cream-100"
        >
            <div>
                <p className="text-sm font-black text-coffee-900">{title}</p>

                {description && (
                    <p className="mt-1 text-xs leading-6 text-coffee-400">{description}</p>
                )}
            </div>

            <span
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    checked ? "bg-coffee-900" : "bg-coffee-200"
                }`}
            >
                <span
                    className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${
                        checked ? "left-1" : "left-6"
                    }`}
                />
            </span>
        </button>
    );
}

export default function ProductForm({ mode = "create", categories, initialProduct = null }) {
    const router = useRouter();

    const [form, setForm] = useState(() => createInitialForm(initialProduct));

    const [slugWasEdited, setSlugWasEdited] = useState(mode === "edit");

    const [errors, setErrors] = useState({});

    const [serverError, setServerError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = mode === "edit";

    const updateField = (name, value) => {
        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                [name]: "",
            }));
        }

        if (serverError) {
            setServerError("");
        }
    };

    const handleEnglishNameChange = (value) => {
        setForm((currentForm) => ({
            ...currentForm,

            englishName: value,

            slug: slugWasEdited ? currentForm.slug : slugify(value),
        }));
    };

    const handleSlugChange = (value) => {
        setSlugWasEdited(true);

        updateField("slug", slugify(value));
    };

    const addVariant = () => {
        setForm((currentForm) => ({
            ...currentForm,

            variants: [
                ...currentForm.variants,

                {
                    title: "",
                    priceAdjustment: "0",
                    isDefault: currentForm.variants.length === 0,
                    isActive: true,
                },
            ],
        }));
    };

    const updateVariant = (index, key, value) => {
        setForm((currentForm) => ({
            ...currentForm,

            variants: currentForm.variants.map((variant, variantIndex) => {
                if (variantIndex !== index) {
                    return variant;
                }

                return {
                    ...variant,
                    [key]: value,
                };
            }),
        }));
    };

    const makeDefaultVariant = (index) => {
        setForm((currentForm) => ({
            ...currentForm,

            variants: currentForm.variants.map((variant, variantIndex) => ({
                ...variant,
                isDefault: variantIndex === index,
            })),
        }));
    };

    const removeVariant = (index) => {
        setForm((currentForm) => {
            const removedVariant = currentForm.variants[index];

            const nextVariants = currentForm.variants.filter(
                (_, variantIndex) => variantIndex !== index,
            );

            if (removedVariant?.isDefault && nextVariants.length > 0) {
                nextVariants[0] = {
                    ...nextVariants[0],
                    isDefault: true,
                };
            }

            return {
                ...currentForm,
                variants: nextVariants,
            };
        });
    };

    const addAddOn = () => {
        setForm((currentForm) => ({
            ...currentForm,

            addOns: [
                ...currentForm.addOns,

                {
                    title: "",
                    price: "0",
                    isActive: true,
                },
            ],
        }));
    };

    const updateAddOn = (index, key, value) => {
        setForm((currentForm) => ({
            ...currentForm,

            addOns: currentForm.addOns.map((addOn, addOnIndex) => {
                if (addOnIndex !== index) {
                    return addOn;
                }

                return {
                    ...addOn,
                    [key]: value,
                };
            }),
        }));
    };

    const removeAddOn = (index) => {
        setForm((currentForm) => ({
            ...currentForm,

            addOns: currentForm.addOns.filter((_, addOnIndex) => addOnIndex !== index),
        }));
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.name.trim()) {
            nextErrors.name = "نام محصول الزامی است";
        }

        if (!form.slug.trim()) {
            nextErrors.slug = "اسلاگ محصول الزامی است";
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
            nextErrors.slug = "اسلاگ فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد";
        }

        if (!form.category) {
            nextErrors.category = "دسته‌بندی محصول را انتخاب کن";
        }

        const price = Number(form.price);

        if (form.price === "" || !Number.isFinite(price) || price < 0) {
            nextErrors.price = "قیمت محصول معتبر نیست";
        }

        const discountPercent = Number(form.discountPercent);

        if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
            nextErrors.discountPercent = "درصد تخفیف باید بین صفر تا صد باشد";
        }

        if (form.status === "published" && !form.image.trim()) {
            nextErrors.image = "برای انتشار محصول باید تصویر اصلی وارد شود";
        }

        if (form.trackStock) {
            const stock = Number(form.stock);

            if (!Number.isFinite(stock) || stock < 0) {
                nextErrors.stock = "موجودی محصول معتبر نیست";
            }
        }

        form.variants.forEach((variant, index) => {
            if (!variant.title.trim()) {
                nextErrors[`variant-${index}`] = `عنوان مدل شماره ${index + 1} الزامی است`;
            }

            const priceAdjustment = Number(variant.priceAdjustment);

            if (!Number.isFinite(priceAdjustment) || priceAdjustment < 0) {
                nextErrors[`variant-${index}`] = `افزایش قیمت مدل شماره ${index + 1} معتبر نیست`;
            }
        });

        form.addOns.forEach((addOn, index) => {
            if (!addOn.title.trim()) {
                nextErrors[`addon-${index}`] = `عنوان افزودنی شماره ${index + 1} الزامی است`;
            }

            const addOnPrice = Number(addOn.price);

            if (!Number.isFinite(addOnPrice) || addOnPrice < 0) {
                nextErrors[`addon-${index}`] = `قیمت افزودنی شماره ${index + 1} معتبر نیست`;
            }
        });

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const createPayload = () => {
        return {
            name: form.name.trim(),

            englishName: form.englishName.trim(),

            slug: form.slug.trim(),

            category: form.category,

            shortDescription: form.shortDescription.trim(),

            description: form.description.trim(),

            price: Number(form.price),

            discountPercent: Number(form.discountPercent),

            image: form.image.trim(),

            gallery: splitList(form.gallery),

            preparationTime: Number(form.preparationTime),

            intensity: form.intensity,

            ingredients: splitList(form.ingredients),

            tags: splitList(form.tags).map((tag) => tag.toLowerCase()),

            variants: form.variants.map((variant) => ({
                title: variant.title.trim(),

                priceAdjustment: Number(variant.priceAdjustment),

                isDefault: variant.isDefault,

                isActive: variant.isActive,
            })),

            addOns: form.addOns.map((addOn) => ({
                title: addOn.title.trim(),

                price: Number(addOn.price),

                isActive: addOn.isActive,
            })),

            trackStock: form.trackStock,

            stock: form.trackStock ? Number(form.stock) : 0,

            isAvailable: form.status === "archived" ? false : form.isAvailable,

            status: form.status,

            isFeatured: form.status === "archived" ? false : form.isFeatured,

            isNew: form.isNew,

            accentColor: form.accentColor.trim(),

            displayOrder: Number(form.displayOrder),

            seoTitle: form.seoTitle.trim(),

            seoDescription: form.seoDescription.trim(),
        };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setServerError("");

        if (!validateForm()) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        setIsSubmitting(true);

        try {
            const endpoint = isEditMode ? `/api/products/${initialProduct._id}` : "/api/products";

            const response = await fetch(endpoint, {
                method: isEditMode ? "PATCH" : "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(createPayload()),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setServerError(result.message || "ذخیره محصول انجام نشد");

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });

                return;
            }

            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error("PRODUCT FORM ERROR:", error);

            setServerError("ارتباط با سرور برقرار نشد. دوباره تلاش کن.");

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const finalPrice = (() => {
        const price = Number(form.price) || 0;

        const discount = Number(form.discountPercent) || 0;

        return Math.round(price * (1 - discount / 100));
    })();

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-7">
            {/* Page heading */}

            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">مدیریت محصولات</p>

                    <h1 className="mt-2 text-3xl font-black text-coffee-950">
                        {isEditMode ? `ویرایش ${initialProduct.name}` : "افزودن محصول جدید"}
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-coffee-500">
                        اطلاعات محصول، قیمت، موجودی، مدل‌ها و تنظیمات انتشار را تکمیل کن.
                    </p>
                </div>

                <Link
                    href="/admin/products"
                    className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
                >
                    <FiX />
                    انصراف و بازگشت
                </Link>
            </section>

            {/* Server error */}

            {serverError && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700"
                >
                    <FiAlertCircle className="mt-0.5 shrink-0" />

                    <p className="leading-7">{serverError}</p>
                </div>
            )}

            {categories.length === 0 && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800"
                >
                    <FiInfo className="mt-0.5 shrink-0" />

                    <p className="leading-7">
                        هنوز دسته‌بندی فعالی وجود ندارد. قبل از ثبت محصول، یک دسته‌بندی ایجاد کن.
                    </p>
                </div>
            )}

            <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_330px]">
                {/* Main form */}

                <div className="space-y-7">
                    <FormSection
                        title="اطلاعات اصلی"
                        description="نام، دسته‌بندی و توضیحات اصلی محصول"
                        icon={FiCoffee}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="product-name"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    نام محصول
                                    <span className="mr-1 text-red-500">*</span>
                                </label>

                                <input
                                    id="product-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(event) => updateField("name", event.target.value)}
                                    maxLength={100}
                                    placeholder="مثلاً کافه لاته"
                                    className={inputClassName}
                                />

                                <FieldError message={errors.name} />
                            </div>

                            <div>
                                <label
                                    htmlFor="product-english-name"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    نام انگلیسی
                                </label>

                                <input
                                    id="product-english-name"
                                    type="text"
                                    dir="ltr"
                                    value={form.englishName}
                                    onChange={(event) =>
                                        handleEnglishNameChange(event.target.value)
                                    }
                                    maxLength={100}
                                    placeholder="Caffe Latte"
                                    className={`${inputClassName} text-left`}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="product-slug"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    اسلاگ
                                    <span className="mr-1 text-red-500">*</span>
                                </label>

                                <input
                                    id="product-slug"
                                    type="text"
                                    dir="ltr"
                                    value={form.slug}
                                    onChange={(event) => handleSlugChange(event.target.value)}
                                    placeholder="cafe-latte"
                                    className={`${inputClassName} text-left`}
                                />

                                <p className="mt-2 text-[11px] leading-5 text-coffee-400">
                                    آدرس نهایی محصول:
                                    <span className="mr-1" dir="ltr">
                                        /menu/{form.slug || "..."}
                                    </span>
                                </p>

                                <FieldError message={errors.slug} />
                            </div>

                            <div>
                                <label
                                    htmlFor="product-category"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    دسته‌بندی
                                    <span className="mr-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <select
                                        id="product-category"
                                        value={form.category}
                                        onChange={(event) =>
                                            updateField("category", event.target.value)
                                        }
                                        className={`${inputClassName} appearance-none pl-10`}
                                    >
                                        <option value="">انتخاب دسته‌بندی</option>

                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.title}
                                            </option>
                                        ))}
                                    </select>

                                    <FiChevronDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" />
                                </div>

                                <FieldError message={errors.category} />
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="short-description"
                                    className="text-sm font-bold text-coffee-800"
                                >
                                    توضیح کوتاه
                                </label>

                                <span className="text-[10px] text-coffee-400">
                                    {form.shortDescription.length.toLocaleString("fa-IR")}
                                    /۲۰۰
                                </span>
                            </div>

                            <textarea
                                id="short-description"
                                rows={3}
                                value={form.shortDescription}
                                onChange={(event) =>
                                    updateField("shortDescription", event.target.value)
                                }
                                maxLength={200}
                                placeholder="توضیح کوتاهی که در کارت محصول نمایش داده می‌شود..."
                                className={textareaClassName}
                            />
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor="description"
                                className="mb-2 block text-sm font-bold text-coffee-800"
                            >
                                توضیحات کامل
                            </label>

                            <textarea
                                id="description"
                                rows={7}
                                value={form.description}
                                onChange={(event) => updateField("description", event.target.value)}
                                maxLength={3000}
                                placeholder="معرفی کامل محصول، طعم، عطر، روش آماده‌سازی و ویژگی‌ها..."
                                className={textareaClassName}
                            />
                        </div>
                    </FormSection>

                    {/* Price */}

                    <FormSection
                        title="قیمت و آماده‌سازی"
                        description="قیمت پایه، تخفیف و زمان آماده‌شدن محصول"
                        icon={FiTag}
                    >
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label
                                    htmlFor="product-price"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    قیمت پایه
                                    <span className="mr-1 text-red-500">*</span>
                                </label>

                                <input
                                    id="product-price"
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    value={form.price}
                                    onChange={(event) => updateField("price", event.target.value)}
                                    placeholder="145000"
                                    className={inputClassName}
                                />

                                <FieldError message={errors.price} />
                            </div>

                            <div>
                                <label
                                    htmlFor="discount-percent"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    درصد تخفیف
                                </label>

                                <input
                                    id="discount-percent"
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    max="100"
                                    value={form.discountPercent}
                                    onChange={(event) =>
                                        updateField("discountPercent", event.target.value)
                                    }
                                    className={inputClassName}
                                />

                                <FieldError message={errors.discountPercent} />
                            </div>

                            <div>
                                <label
                                    htmlFor="preparation-time"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    زمان آماده‌سازی
                                </label>

                                <div className="relative">
                                    <input
                                        id="preparation-time"
                                        type="number"
                                        inputMode="numeric"
                                        min="0"
                                        value={form.preparationTime}
                                        onChange={(event) =>
                                            updateField("preparationTime", event.target.value)
                                        }
                                        className={`${inputClassName} pl-14`}
                                    />

                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-coffee-400">
                                        دقیقه
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="product-intensity"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    شدت طعم
                                </label>

                                <select
                                    id="product-intensity"
                                    value={form.intensity}
                                    onChange={(event) =>
                                        updateField("intensity", event.target.value)
                                    }
                                    className={inputClassName}
                                >
                                    <option value="low">ملایم</option>

                                    <option value="medium">متوسط</option>

                                    <option value="high">قوی</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 rounded-xl border border-coffee-100 bg-cream-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs font-bold text-coffee-500">
                                قیمت نهایی محصول
                            </span>

                            <p className="text-lg font-black text-coffee-950">
                                {finalPrice.toLocaleString("fa-IR")}

                                <span className="mr-1 text-xs font-medium text-coffee-400">
                                    تومان
                                </span>
                            </p>
                        </div>
                    </FormSection>

                    {/* Image */}

                    <FormSection
                        title="تصاویر محصول"
                        description="آپلود تصویر اصلی دوربری‌شده و تصاویر گالری"
                        icon={FiImage}
                    >
                        <ProductImageUploader
                            productName={form.name}
                            image={form.image}
                            gallery={form.gallery}
                            errorMessage={errors.image}
                            onImageChange={(value) => updateField("image", value)}
                            onGalleryChange={(value) => updateField("gallery", value)}
                        />
                    </FormSection>

                    {/* Ingredients */}

                    <FormSection
                        title="ترکیبات و برچسب‌ها"
                        description="برای جست‌وجو، معرفی محصول و سیستم پیشنهاد هوشمند"
                        icon={FiSearch}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="ingredients"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    ترکیبات
                                </label>

                                <textarea
                                    id="ingredients"
                                    rows={5}
                                    value={form.ingredients}
                                    onChange={(event) =>
                                        updateField("ingredients", event.target.value)
                                    }
                                    placeholder="اسپرسو، شیر، فوم شیر"
                                    className={textareaClassName}
                                />

                                <p className="mt-2 text-[11px] text-coffee-400">
                                    مقادیر را با ویرگول یا خط جدید جدا کن.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="tags"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    برچسب‌ها
                                </label>

                                <textarea
                                    id="tags"
                                    rows={5}
                                    dir="ltr"
                                    value={form.tags}
                                    onChange={(event) => updateField("tags", event.target.value)}
                                    placeholder="coffee, latte, hot-drink"
                                    className={`${textareaClassName} text-left`}
                                />

                                <p className="mt-2 text-[11px] text-coffee-400">
                                    بهتر است برچسب‌ها کوتاه و انگلیسی باشند.
                                </p>
                            </div>
                        </div>
                    </FormSection>

                    {/* Variants */}

                    <FormSection
                        title="مدل‌ها و اندازه‌ها"
                        description="مانند کوچک، متوسط و بزرگ با اختلاف قیمت"
                        icon={FiPackage}
                    >
                        <div className="space-y-4">
                            {form.variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-coffee-100 bg-cream-50 p-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-coffee-600">
                                                عنوان مدل
                                            </label>

                                            <input
                                                type="text"
                                                value={variant.title}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        "title",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="مثلاً بزرگ"
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-coffee-600">
                                                افزایش قیمت
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={variant.priceAdjustment}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        "priceAdjustment",
                                                        event.target.value,
                                                    )
                                                }
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                aria-label={`حذف مدل ${index + 1}`}
                                                onClick={() => removeVariant(index)}
                                                className="flex size-13 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            aria-pressed={variant.isDefault}
                                            onClick={() => makeDefaultVariant(index)}
                                            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
                                                variant.isDefault
                                                    ? "bg-coffee-900 text-white"
                                                    : "border border-coffee-100 bg-white text-coffee-600 hover:bg-coffee-100"
                                            }`}
                                        >
                                            <FiCheck className="text-current" />

                                            <span className="text-current">
                                                {variant.isDefault
                                                    ? "مدل پیش‌فرض"
                                                    : "انتخاب به‌عنوان پیش‌فرض"}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            aria-pressed={variant.isActive}
                                            onClick={() =>
                                                updateVariant(index, "isActive", !variant.isActive)
                                            }
                                            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
                                                variant.isActive
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {variant.isActive ? "فعال" : "غیرفعال"}
                                        </button>
                                    </div>

                                    <FieldError message={errors[`variant-${index}`]} />
                                </div>
                            ))}

                            {form.variants.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-coffee-200 bg-cream-50 px-5 py-8 text-center">
                                    <FiBox className="mx-auto text-2xl text-coffee-300" />

                                    <p className="mt-3 text-sm font-bold text-coffee-600">
                                        این محصول مدل متفاوتی ندارد
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addVariant}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-coffee-200 bg-white px-4 text-xs font-bold text-coffee-700 transition hover:bg-cream-100"
                            >
                                <FiPlus />
                                افزودن مدل جدید
                            </button>
                        </div>
                    </FormSection>

                    {/* Add-ons */}

                    <FormSection
                        title="افزودنی‌های محصول"
                        description="مانند شات اضافه، سیروپ یا شیر بدون لاکتوز"
                        icon={FiPlus}
                    >
                        <div className="space-y-4">
                            {form.addOns.map((addOn, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-coffee-100 bg-cream-50 p-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-coffee-600">
                                                عنوان افزودنی
                                            </label>

                                            <input
                                                type="text"
                                                value={addOn.title}
                                                onChange={(event) =>
                                                    updateAddOn(index, "title", event.target.value)
                                                }
                                                placeholder="مثلاً شات اسپرسو اضافه"
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-coffee-600">
                                                قیمت افزودنی
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={addOn.price}
                                                onChange={(event) =>
                                                    updateAddOn(index, "price", event.target.value)
                                                }
                                                className={inputClassName}
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                aria-label={`حذف افزودنی ${index + 1}`}
                                                onClick={() => removeAddOn(index)}
                                                className="flex size-13 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        aria-pressed={addOn.isActive}
                                        onClick={() =>
                                            updateAddOn(index, "isActive", !addOn.isActive)
                                        }
                                        className={`mt-4 inline-flex h-10 items-center rounded-xl px-4 text-xs font-bold transition ${
                                            addOn.isActive
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {addOn.isActive ? "افزودنی فعال" : "افزودنی غیرفعال"}
                                    </button>

                                    <FieldError message={errors[`addon-${index}`]} />
                                </div>
                            ))}

                            {form.addOns.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-coffee-200 bg-cream-50 px-5 py-8 text-center">
                                    <FiPlus className="mx-auto text-2xl text-coffee-300" />

                                    <p className="mt-3 text-sm font-bold text-coffee-600">
                                        هنوز افزودنی ثبت نشده است
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={addAddOn}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-coffee-200 bg-white px-4 text-xs font-bold text-coffee-700 transition hover:bg-cream-100"
                            >
                                <FiPlus />
                                افزودن گزینه جدید
                            </button>
                        </div>
                    </FormSection>

                    {/* SEO */}

                    <FormSection
                        title="تنظیمات سئو"
                        description="عنوان و توضیحی که در نتایج موتورهای جست‌وجو استفاده می‌شود"
                        icon={FiSearch}
                    >
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="seo-title"
                                    className="text-sm font-bold text-coffee-800"
                                >
                                    عنوان SEO
                                </label>

                                <span className="text-[10px] text-coffee-400">
                                    {form.seoTitle.length.toLocaleString("fa-IR")}
                                    /۷۰
                                </span>
                            </div>

                            <input
                                id="seo-title"
                                type="text"
                                maxLength={70}
                                value={form.seoTitle}
                                onChange={(event) => updateField("seoTitle", event.target.value)}
                                placeholder="خرید کافه لاته از ممد کافی"
                                className={inputClassName}
                            />
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="seo-description"
                                    className="text-sm font-bold text-coffee-800"
                                >
                                    توضیحات SEO
                                </label>

                                <span className="text-[10px] text-coffee-400">
                                    {form.seoDescription.length.toLocaleString("fa-IR")}
                                    /۱۸۰
                                </span>
                            </div>

                            <textarea
                                id="seo-description"
                                rows={4}
                                maxLength={180}
                                value={form.seoDescription}
                                onChange={(event) =>
                                    updateField("seoDescription", event.target.value)
                                }
                                placeholder="توضیح کوتاه و مناسب نتایج جست‌وجو..."
                                className={textareaClassName}
                            />
                        </div>
                    </FormSection>
                </div>

                {/* Sidebar */}

                <aside className="space-y-5 xl:sticky xl:top-28">
                    <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-[0_14px_45px_rgba(48,32,26,0.07)]">
                        <h2 className="text-base font-black text-coffee-950">وضعیت انتشار</h2>

                        <p className="mt-1 text-xs leading-6 text-coffee-400">
                            مشخص کن محصول در چه وضعیتی ذخیره شود.
                        </p>

                        <div className="mt-5 space-y-2">
                            {statusOptions.map((option) => {
                                const Icon = option.icon;

                                const isActive = form.status === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => updateField("status", option.value)}
                                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-right transition ${
                                            isActive
                                                ? "border-coffee-900 bg-coffee-900 text-white shadow-sm"
                                                : "border-coffee-100 bg-cream-50 text-coffee-700 hover:border-coffee-200"
                                        }`}
                                    >
                                        <span
                                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                                                isActive
                                                    ? "bg-white/10 text-white"
                                                    : "bg-white text-coffee-600"
                                            }`}
                                        >
                                            <Icon className="text-current" />
                                        </span>

                                        <span>
                                            <span className="block text-sm font-black text-current">
                                                {option.title}
                                            </span>

                                            <span
                                                className={`mt-1 block text-[10px] leading-5 ${
                                                    isActive ? "text-white/55" : "text-coffee-400"
                                                }`}
                                            >
                                                {option.description}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-[0_14px_45px_rgba(48,32,26,0.07)]">
                        <h2 className="text-base font-black text-coffee-950">نمایش و موجودی</h2>

                        <div className="mt-5 space-y-3">
                            <Toggle
                                checked={form.isAvailable}
                                onChange={(value) => updateField("isAvailable", value)}
                                title="محصول موجود است"
                                description="امکان افزودن محصول به سبد خرید"
                            />

                            <Toggle
                                checked={form.isFeatured}
                                onChange={(value) => updateField("isFeatured", value)}
                                title="محصول ویژه"
                                description="قابل استفاده در Hero و پیشنهادهای ویژه"
                            />

                            <Toggle
                                checked={form.isNew}
                                onChange={(value) => updateField("isNew", value)}
                                title="محصول جدید"
                                description="نمایش نشان جدید روی کارت محصول"
                            />

                            <Toggle
                                checked={form.trackStock}
                                onChange={(value) => updateField("trackStock", value)}
                                title="کنترل موجودی"
                                description="کاهش موجودی پس از ثبت سفارش"
                            />
                        </div>

                        {form.trackStock && (
                            <div className="mt-4">
                                <label
                                    htmlFor="product-stock"
                                    className="mb-2 block text-sm font-bold text-coffee-800"
                                >
                                    تعداد موجودی
                                </label>

                                <input
                                    id="product-stock"
                                    type="number"
                                    min="0"
                                    value={form.stock}
                                    onChange={(event) => updateField("stock", event.target.value)}
                                    className={inputClassName}
                                />

                                <FieldError message={errors.stock} />
                            </div>
                        )}
                    </section>

                    <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-[0_14px_45px_rgba(48,32,26,0.07)]">
                        <h2 className="text-base font-black text-coffee-950">تنظیمات ظاهری</h2>

                        <div className="mt-5">
                            <label
                                htmlFor="accent-color"
                                className="mb-2 block text-sm font-bold text-coffee-800"
                            >
                                رنگ محصول
                            </label>

                            <div className="flex gap-2">
                                <input
                                    id="accent-color"
                                    type="color"
                                    value={form.accentColor}
                                    onChange={(event) =>
                                        updateField("accentColor", event.target.value)
                                    }
                                    className="h-13 w-14 shrink-0 cursor-pointer rounded-xl border border-coffee-100 bg-white p-1.5"
                                />

                                <input
                                    type="text"
                                    dir="ltr"
                                    value={form.accentColor}
                                    onChange={(event) =>
                                        updateField("accentColor", event.target.value)
                                    }
                                    className={`${inputClassName} text-left`}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="display-order"
                                className="mb-2 block text-sm font-bold text-coffee-800"
                            >
                                ترتیب نمایش
                            </label>

                            <input
                                id="display-order"
                                type="number"
                                value={form.displayOrder}
                                onChange={(event) =>
                                    updateField("displayOrder", event.target.value)
                                }
                                className={inputClassName}
                            />
                        </div>
                    </section>

                    <section className="rounded-[1.75rem] bg-coffee-950 p-5 text-white shadow-[0_20px_55px_rgba(48,32,26,0.18)]">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-caramel-300">
                                <FiSave />
                            </span>

                            <div>
                                <h2 className="text-sm font-black text-white">ذخیره تغییرات</h2>

                                <p className="mt-1 text-[10px] text-white/40">
                                    اطلاعات قبل از ذخیره اعتبارسنجی می‌شوند.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || categories.length === 0}
                            className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-coffee-950 transition hover:-translate-y-0.5 hover:bg-caramel-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <>
                                    <FiLoader className="animate-spin text-current" />

                                    <span className="text-current">در حال ذخیره</span>
                                </>
                            ) : (
                                <>
                                    <FiSave className="text-current" />

                                    <span className="text-current">
                                        {isEditMode ? "ذخیره ویرایش‌ها" : "ایجاد محصول"}
                                    </span>
                                </>
                            )}
                        </button>

                        <Link
                            href="/admin/products"
                            className="mt-3 flex h-11 items-center justify-center rounded-xl border border-white/10 text-xs font-bold text-white/55 transition hover:bg-white/10 hover:text-white"
                        >
                            انصراف
                        </Link>
                    </section>
                </aside>
            </div>
        </form>
    );
}
