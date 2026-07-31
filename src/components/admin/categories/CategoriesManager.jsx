"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {
    FiAlertCircle,
    FiArchive,
    FiArrowDown,
    FiArrowUp,
    FiCheck,
    FiEdit3,
    FiFolder,
    FiImage,
    FiLoader,
    FiPlus,
    FiRefreshCw,
    FiRotateCcw,
    FiSearch,
    FiTrash2,
    FiUploadCloud,
    FiX,
} from "react-icons/fi";

const inputClassName =
    "h-12 w-full rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

const textareaClassName =
    "w-full resize-y rounded-xl border border-coffee-100 bg-cream-50 px-4 py-3 text-sm leading-7 text-coffee-950 outline-none transition placeholder:text-coffee-300 focus:border-caramel-400 focus:bg-white focus:ring-4 focus:ring-caramel-100";

const emptyForm = {
    title: "",
    slug: "",
    description: "",
    image: "",
    imageAlt: "",
    accentColor: "#c8793f",
    displayOrder: "0",
    isActive: true,
    seoTitle: "",
    seoDescription: "",
};

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

export default function CategoriesManager({ initialCategories }) {
    const router = useRouter();
    const imageInputRef = useRef(null);

    const [categories, setCategories] = useState(initialCategories);

    const [searchValue, setSearchValue] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [slugWasEdited, setSlugWasEdited] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    const [actionId, setActionId] = useState(null);

    const [archiveCategory, setArchiveCategory] = useState(null);

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    useEffect(() => {
        if (!isFormOpen && !archiveCategory) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsFormOpen(false);
                setArchiveCategory(null);
            }
        };

        document.body.style.overflow = "hidden";

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";

            document.removeEventListener("keydown", handleEscape);
        };
    }, [archiveCategory, isFormOpen]);

    const visibleCategories = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        return categories.filter((category) => {
            const matchesSearch =
                !normalizedSearch ||
                category.title.toLowerCase().includes(normalizedSearch) ||
                category.slug.toLowerCase().includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && !category.archivedAt && category.isActive) ||
                (statusFilter === "inactive" && !category.archivedAt && !category.isActive) ||
                (statusFilter === "archived" && category.archivedAt);

            return matchesSearch && matchesStatus;
        });
    }, [categories, searchValue, statusFilter]);

    const orderedActiveCategories = useMemo(
        () =>
            categories
                .filter((category) => !category.archivedAt)
                .sort((first, second) => first.displayOrder - second.displayOrder),
        [categories],
    );

    const openCreateForm = () => {
        const highestOrder = Math.max(
            0,
            ...orderedActiveCategories.map((category) => Number(category.displayOrder) || 0),
        );

        setEditingCategory(null);

        setForm({
            ...emptyForm,
            displayOrder: String(highestOrder + 10),
        });

        setSlugWasEdited(false);
        setErrorMessage("");
        setIsFormOpen(true);
    };

    const openEditForm = (category) => {
        setEditingCategory(category);

        setForm({
            title: category.title || "",
            slug: category.slug || "",
            description: category.description || "",
            image: category.image || "",
            imageAlt: category.imageAlt || "",
            accentColor: category.accentColor || "#c8793f",
            displayOrder: String(category.displayOrder || 0),
            isActive: category.isActive !== false,
            seoTitle: category.seoTitle || "",
            seoDescription: category.seoDescription || "",
        });

        setSlugWasEdited(true);
        setErrorMessage("");
        setIsFormOpen(true);
    };

    const updateField = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (errorMessage) {
            setErrorMessage("");
        }
    };

    const handleTitleChange = (value) => {
        setForm((current) => ({
            ...current,

            title: value,

            slug: !slugWasEdited && /^[a-zA-Z0-9\s-]*$/.test(value) ? slugify(value) : current.slug,
        }));
    };

    const uploadImage = async (file) => {
        if (!file || isUploading) {
            return;
        }

        setIsUploading(true);
        setErrorMessage("");

        try {
            const formData = new FormData();

            formData.append("file", file);

            const response = await fetch("/api/uploads/categories", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "آپلود تصویر انجام نشد");

                return;
            }

            updateField("image", result.data.url);
        } catch {
            setErrorMessage("ارتباط با سرور برقرار نشد");
        } finally {
            setIsUploading(false);

            if (imageInputRef.current) {
                imageInputRef.current.value = "";
            }
        }
    };

    const saveCategory = async (event) => {
        event.preventDefault();

        if (isSaving) {
            return;
        }

        if (!form.title.trim()) {
            setErrorMessage("عنوان دسته‌بندی الزامی است");

            return;
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
            setErrorMessage("اسلاگ معتبر نیست");

            return;
        }

        setIsSaving(true);
        setErrorMessage("");

        try {
            const endpoint = editingCategory
                ? `/api/categories/${editingCategory._id}`
                : "/api/categories";

            const response = await fetch(endpoint, {
                method: editingCategory ? "PATCH" : "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    title: form.title.trim(),
                    slug: form.slug.trim(),
                    description: form.description.trim(),
                    image: form.image.trim(),
                    imageAlt: form.imageAlt.trim(),
                    accentColor: form.accentColor.trim(),
                    displayOrder: Number(form.displayOrder),
                    isActive: form.isActive,
                    seoTitle: form.seoTitle.trim(),
                    seoDescription: form.seoDescription.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "ذخیره دسته‌بندی انجام نشد");

                return;
            }

            setIsFormOpen(false);
            setEditingCategory(null);

            router.refresh();
        } catch {
            setErrorMessage("ارتباط با سرور برقرار نشد");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCategory = async (category) => {
        setActionId(category._id);

        try {
            const response = await fetch(`/api/categories/${category._id}`, {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    isActive: !category.isActive,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "تغییر وضعیت انجام نشد");

                return;
            }

            router.refresh();
        } finally {
            setActionId(null);
        }
    };

    const restoreCategory = async (category) => {
        setActionId(category._id);

        try {
            const response = await fetch(`/api/categories/${category._id}`, {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    restore: true,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "بازیابی انجام نشد");

                return;
            }

            router.refresh();
        } finally {
            setActionId(null);
        }
    };

    const confirmArchive = async () => {
        if (!archiveCategory) {
            return;
        }

        setActionId(archiveCategory._id);

        try {
            const response = await fetch(`/api/categories/${archiveCategory._id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "بایگانی انجام نشد");

                return;
            }

            setArchiveCategory(null);
            router.refresh();
        } finally {
            setActionId(null);
        }
    };

    const moveCategory = async (categoryId, direction) => {
        const currentIndex = orderedActiveCategories.findIndex(
            (category) => category._id === categoryId,
        );

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedActiveCategories.length) {
            return;
        }

        const nextOrder = [...orderedActiveCategories];

        [nextOrder[currentIndex], nextOrder[targetIndex]] = [
            nextOrder[targetIndex],
            nextOrder[currentIndex],
        ];

        setActionId(categoryId);

        try {
            const response = await fetch("/api/categories/reorder", {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    orderedIds: nextOrder.map((category) => category._id),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorMessage(result.message || "تغییر ترتیب انجام نشد");

                return;
            }

            router.refresh();
        } finally {
            setActionId(null);
        }
    };

    return (
        <>
            <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-4 shadow-[0_14px_45px_rgba(48,32,26,0.06)]">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <label className="relative flex h-12 flex-1 items-center">
                        <FiSearch className="pointer-events-none absolute right-4 text-coffee-400" />

                        <input
                            type="search"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="جست‌وجوی عنوان یا اسلاگ..."
                            className={`${inputClassName} pr-11 pl-11`}
                        />

                        {searchValue && (
                            <button
                                type="button"
                                onClick={() => setSearchValue("")}
                                className="absolute left-3 flex size-8 items-center justify-center rounded-lg text-coffee-400 hover:bg-coffee-100"
                            >
                                <FiX />
                            </button>
                        )}
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className={`${inputClassName} lg:w-44`}
                    >
                        <option value="all">همه وضعیت‌ها</option>

                        <option value="active">فعال</option>

                        <option value="inactive">غیرفعال</option>

                        <option value="archived">بایگانی‌شده</option>
                    </select>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-5 text-sm font-black text-white transition hover:bg-coffee-800"
                    >
                        <FiPlus className="text-current" />
                        <span className="text-current">افزودن دسته‌بندی</span>
                    </button>
                </div>
            </section>

            {errorMessage && !isFormOpen && (
                <div
                    role="alert"
                    className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700"
                >
                    <FiAlertCircle />
                    {errorMessage}
                </div>
            )}

            {visibleCategories.length > 0 ? (
                <div className="overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.06)]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-right">
                            <thead className="border-b border-coffee-100 bg-cream-50 text-[11px] text-coffee-400">
                                <tr>
                                    <th className="px-5 py-4">دسته‌بندی</th>

                                    <th className="px-4 py-4">محصولات</th>

                                    <th className="px-4 py-4">وضعیت</th>

                                    <th className="px-4 py-4">ترتیب</th>

                                    <th className="px-5 py-4">عملیات</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleCategories.map((category) => {
                                    const categoryIndex = orderedActiveCategories.findIndex(
                                        (item) => item._id === category._id,
                                    );

                                    const isBusy = actionId === category._id;

                                    return (
                                        <tr
                                            key={category._id}
                                            className="border-b border-coffee-100 last:border-0 hover:bg-cream-50/60"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                                                        style={{
                                                            backgroundColor: `${category.accentColor}20`,
                                                        }}
                                                    >
                                                        {category.image ? (
                                                            <img
                                                                src={category.image}
                                                                alt={
                                                                    category.imageAlt ||
                                                                    category.title
                                                                }
                                                                className="size-full object-contain p-1.5"
                                                            />
                                                        ) : (
                                                            <FiFolder
                                                                size={22}
                                                                style={{
                                                                    color: category.accentColor,
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-black text-coffee-950">
                                                            {category.title}
                                                        </p>

                                                        <p
                                                            className="mt-1 text-[10px] text-coffee-400"
                                                            dir="ltr"
                                                        >
                                                            {category.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="rounded-full bg-cream-100 px-3 py-1.5 text-xs font-bold text-coffee-600">
                                                    {category.productCount.toLocaleString("fa-IR")}{" "}
                                                    محصول
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                {category.archivedAt ? (
                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                                        بایگانی‌شده
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => toggleCategory(category)}
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                                                            category.isActive
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-amber-50 text-amber-700"
                                                        }`}
                                                    >
                                                        {isBusy ? (
                                                            <FiLoader className="animate-spin" />
                                                        ) : (
                                                            <FiCheck />
                                                        )}

                                                        {category.isActive ? "فعال" : "غیرفعال"}
                                                    </button>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                {category.archivedAt ? (
                                                    <span className="text-xs text-coffee-300">
                                                        —
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            disabled={categoryIndex <= 0 || isBusy}
                                                            onClick={() =>
                                                                moveCategory(category._id, "up")
                                                            }
                                                            className="flex size-9 items-center justify-center rounded-lg border border-coffee-100 text-coffee-500 hover:bg-cream-100 disabled:opacity-25"
                                                        >
                                                            <FiArrowUp />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                categoryIndex ===
                                                                    orderedActiveCategories.length -
                                                                        1 || isBusy
                                                            }
                                                            onClick={() =>
                                                                moveCategory(category._id, "down")
                                                            }
                                                            className="flex size-9 items-center justify-center rounded-lg border border-coffee-100 text-coffee-500 hover:bg-cream-100 disabled:opacity-25"
                                                        >
                                                            <FiArrowDown />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {category.archivedAt ? (
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() =>
                                                                restoreCategory(category)
                                                            }
                                                            className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 text-coffee-600 hover:bg-cream-100"
                                                            aria-label={`بازیابی ${category.title}`}
                                                        >
                                                            {isBusy ? (
                                                                <FiLoader className="animate-spin" />
                                                            ) : (
                                                                <FiRotateCcw />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditForm(category)
                                                                }
                                                                className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 text-coffee-600 hover:bg-cream-100"
                                                                aria-label={`ویرایش ${category.title}`}
                                                            >
                                                                <FiEdit3 />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setArchiveCategory(category)
                                                                }
                                                                className="flex size-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                                                                aria-label={`بایگانی ${category.title}`}
                                                            >
                                                                <FiArchive />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-coffee-200 bg-white text-center">
                    <FiFolder size={32} className="text-coffee-300" />

                    <p className="mt-4 text-lg font-black text-coffee-950">دسته‌بندی پیدا نشد</p>

                    <p className="mt-2 text-sm text-coffee-400">جست‌وجو یا فیلتر را تغییر بده.</p>
                </div>
            )}

            {/* Create/edit modal */}

            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="بستن فرم"
                        onClick={() => !isSaving && setIsFormOpen(false)}
                        className="absolute inset-0 bg-coffee-950/45 backdrop-blur-sm"
                    />

                    <form
                        onSubmit={saveCategory}
                        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-caramel-600">
                                    مدیریت دسته‌بندی
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-coffee-950">
                                    {editingCategory ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => setIsFormOpen(false)}
                                className="flex size-10 items-center justify-center rounded-xl bg-cream-100 text-coffee-600"
                            >
                                <FiX />
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-700">
                                <FiAlertCircle className="mt-0.5" />
                                {errorMessage}
                            </div>
                        )}

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    عنوان دسته‌بندی
                                </label>

                                <input
                                    value={form.title}
                                    onChange={(event) => handleTitleChange(event.target.value)}
                                    placeholder="نوشیدنی‌های گرم"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    اسلاگ
                                </label>

                                <input
                                    dir="ltr"
                                    value={form.slug}
                                    onChange={(event) => {
                                        setSlugWasEdited(true);

                                        updateField("slug", slugify(event.target.value));
                                    }}
                                    placeholder="hot-drinks"
                                    className={`${inputClassName} text-left`}
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-bold text-coffee-800">
                                توضیحات
                            </label>

                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={(event) => updateField("description", event.target.value)}
                                maxLength={500}
                                className={textareaClassName}
                            />
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_180px]">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    تصویر دسته‌بندی
                                </label>

                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(event) => uploadImage(event.target.files?.[0])}
                                />

                                <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => imageInputRef.current?.click()}
                                    className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-coffee-200 bg-cream-50"
                                >
                                    {isUploading ? (
                                        <FiLoader className="animate-spin text-xl text-caramel-600" />
                                    ) : (
                                        <FiUploadCloud className="text-2xl text-coffee-500" />
                                    )}

                                    <span className="mt-2 text-xs font-bold text-coffee-600">
                                        انتخاب تصویر
                                    </span>
                                </button>

                                <input
                                    value={form.image}
                                    onChange={(event) => updateField("image", event.target.value)}
                                    dir="ltr"
                                    placeholder="/uploads/categories/..."
                                    className={`${inputClassName} mt-3 text-left`}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    پیش‌نمایش
                                </label>

                                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-cream-100">
                                    {form.image ? (
                                        <img
                                            src={form.image}
                                            alt="پیش‌نمایش دسته‌بندی"
                                            className="size-full object-contain p-3"
                                        />
                                    ) : (
                                        <FiImage size={28} className="text-coffee-300" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-bold text-coffee-800">
                                متن جایگزین تصویر
                            </label>

                            <input
                                value={form.imageAlt}
                                onChange={(event) => updateField("imageAlt", event.target.value)}
                                placeholder="تصویر نوشیدنی‌های گرم"
                                className={inputClassName}
                            />
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    رنگ دسته‌بندی
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={form.accentColor}
                                        onChange={(event) =>
                                            updateField("accentColor", event.target.value)
                                        }
                                        className="h-12 w-14 rounded-xl border border-coffee-100 p-1"
                                    />

                                    <input
                                        dir="ltr"
                                        value={form.accentColor}
                                        onChange={(event) =>
                                            updateField("accentColor", event.target.value)
                                        }
                                        className={`${inputClassName} text-left`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-coffee-800">
                                    ترتیب نمایش
                                </label>

                                <input
                                    type="number"
                                    value={form.displayOrder}
                                    onChange={(event) =>
                                        updateField("displayOrder", event.target.value)
                                    }
                                    className={inputClassName}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.isActive}
                            onClick={() => updateField("isActive", !form.isActive)}
                            className="mt-5 flex w-full items-center justify-between rounded-xl border border-coffee-100 bg-cream-50 p-4"
                        >
                            <div className="text-right">
                                <p className="text-sm font-black text-coffee-900">
                                    دسته‌بندی فعال باشد
                                </p>

                                <p className="mt-1 text-xs text-coffee-400">
                                    در منو و سایت عمومی نمایش داده شود
                                </p>
                            </div>

                            <span
                                className={`relative h-7 w-12 rounded-full ${
                                    form.isActive ? "bg-coffee-900" : "bg-coffee-200"
                                }`}
                            >
                                <span
                                    className={`absolute top-1 size-5 rounded-full bg-white transition-all ${
                                        form.isActive ? "left-1" : "left-6"
                                    }`}
                                />
                            </span>
                        </button>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-bold text-coffee-800">
                                عنوان SEO
                            </label>

                            <input
                                value={form.seoTitle}
                                onChange={(event) => updateField("seoTitle", event.target.value)}
                                maxLength={70}
                                className={inputClassName}
                            />
                        </div>

                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-bold text-coffee-800">
                                توضیحات SEO
                            </label>

                            <textarea
                                rows={3}
                                value={form.seoDescription}
                                onChange={(event) =>
                                    updateField("seoDescription", event.target.value)
                                }
                                maxLength={180}
                                className={textareaClassName}
                            />
                        </div>

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => setIsFormOpen(false)}
                                className="h-12 flex-1 rounded-xl border border-coffee-100 text-sm font-bold text-coffee-600"
                            >
                                انصراف
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving || isUploading}
                                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-coffee-900 text-sm font-black text-white disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <FiLoader className="animate-spin text-current" />
                                ) : (
                                    <FiCheck className="text-current" />
                                )}

                                <span className="text-current">
                                    {isSaving ? "در حال ذخیره" : "ذخیره دسته‌بندی"}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Archive confirmation */}

            {archiveCategory && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <button
                        type="button"
                        onClick={() => setArchiveCategory(null)}
                        className="absolute inset-0 bg-coffee-950/45 backdrop-blur-sm"
                    />

                    <div className="relative z-10 w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <FiTrash2 size={22} />
                        </span>

                        <h2 className="mt-5 text-xl font-black text-coffee-950">
                            بایگانی دسته‌بندی
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-coffee-500">
                            دسته‌بندی «{archiveCategory.title}» بایگانی می‌شود. ارتباط محصولات آن
                            حفظ خواهد شد.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setArchiveCategory(null)}
                                className="h-12 flex-1 rounded-xl border border-coffee-100 text-sm font-bold text-coffee-600"
                            >
                                انصراف
                            </button>

                            <button
                                type="button"
                                disabled={actionId === archiveCategory._id}
                                onClick={confirmArchive}
                                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-black text-white"
                            >
                                {actionId === archiveCategory._id && (
                                    <FiLoader className="animate-spin text-current" />
                                )}

                                <span className="text-current">تأیید بایگانی</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
