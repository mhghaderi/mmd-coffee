import Image from "next/image";

import { FiBox, FiCheck, FiX } from "react-icons/fi";

import ProductActions from "@/components/admin/products/ProductActions";

const priceFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

const statusConfig = {
    published: {
        title: "منتشرشده",
        className: "bg-emerald-50 text-emerald-700",
    },

    draft: {
        title: "پیش‌نویس",
        className: "bg-amber-50 text-amber-700",
    },

    archived: {
        title: "بایگانی‌شده",
        className: "bg-slate-100 text-slate-600",
    },
};

function ProductImage({ product }) {
    return (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream-100">
            {product.image ? (
                <Image
                    src={product.image}
                    alt={`تصویر ${product.name}`}
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                />
            ) : (
                <div className="flex size-full items-center justify-center text-coffee-300">
                    <FiBox size={21} />
                </div>
            )}
        </div>
    );
}

function ProductAvailability({ product }) {
    if (product.status === "archived") {
        return <span className="text-xs font-bold text-slate-400">غیرفعال</span>;
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                product.isAvailable ? "text-emerald-700" : "text-red-600"
            }`}
        >
            {product.isAvailable ? <FiCheck /> : <FiX />}

            {product.isAvailable ? "موجود" : "ناموجود"}
        </span>
    );
}

export default function ProductsTable({ products }) {
    if (products.length === 0) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-coffee-200 bg-white px-5 text-center">
                <span className="flex size-20 items-center justify-center rounded-full bg-cream-100 text-coffee-500">
                    <FiBox size={30} />
                </span>

                <h2 className="mt-6 text-xl font-black text-coffee-950">محصولی پیدا نشد</h2>

                <p className="mt-3 max-w-sm text-sm leading-7 text-coffee-500">
                    فیلترها یا عبارت جست‌وجو را تغییر بده، یا یک محصول جدید به فروشگاه اضافه کن.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop table */}

            <div className="hidden overflow-visible rounded-[2rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.06)] md:block">
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full min-w-[940px] border-collapse text-right">
                        <thead>
                            <tr className="border-b border-coffee-100 bg-cream-50 text-[11px] text-coffee-400">
                                <th className="rounded-tr-[2rem] px-5 py-4 font-bold">محصول</th>

                                <th className="px-4 py-4 font-bold">دسته‌بندی</th>

                                <th className="px-4 py-4 font-bold">قیمت</th>

                                <th className="px-4 py-4 font-bold">موجودی</th>

                                <th className="px-4 py-4 font-bold">وضعیت</th>

                                <th className="px-4 py-4 font-bold">تاریخ ثبت</th>

                                <th className="rounded-tl-[2rem] px-5 py-4 font-bold">عملیات</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => {
                                const status = statusConfig[product.status] || statusConfig.draft;

                                const finalPrice =
                                    product.discountPercent > 0
                                        ? Math.round(
                                              product.price * (1 - product.discountPercent / 100),
                                          )
                                        : product.price;

                                return (
                                    <tr
                                        key={product._id}
                                        className="border-b border-coffee-100 transition last:border-b-0 hover:bg-cream-50/60"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <ProductImage product={product} />

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="max-w-52 truncate text-sm font-black text-coffee-950">
                                                            {product.name}
                                                        </p>

                                                        {product.isFeatured && (
                                                            <span className="rounded-full bg-caramel-50 px-2 py-1 text-[9px] font-bold text-caramel-700">
                                                                ویژه
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p
                                                        className="mt-1 max-w-52 truncate text-[10px] text-coffee-400"
                                                        dir="ltr"
                                                    >
                                                        {product.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-xs font-bold text-coffee-600">
                                            {product.category?.title || "بدون دسته‌بندی"}
                                        </td>

                                        <td className="px-4 py-4">
                                            {product.discountPercent > 0 && (
                                                <p className="text-[10px] text-coffee-400 line-through">
                                                    {priceFormatter.format(product.price)}
                                                </p>
                                            )}

                                            <p className="mt-1 whitespace-nowrap text-xs font-black text-coffee-900">
                                                {priceFormatter.format(finalPrice)}

                                                <span className="mr-1 text-[9px] font-medium text-coffee-400">
                                                    تومان
                                                </span>
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <ProductAvailability product={product} />

                                            {product.trackStock && (
                                                <p className="mt-1 text-[10px] text-coffee-400">
                                                    موجودی: {product.stock.toLocaleString("fa-IR")}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                                            >
                                                {status.title}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-xs text-coffee-500">
                                            {product.createdAt
                                                ? dateFormatter.format(new Date(product.createdAt))
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <ProductActions product={product} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}

            <div className="grid gap-4 md:hidden">
                {products.map((product) => {
                    const status = statusConfig[product.status] || statusConfig.draft;

                    return (
                        <article
                            key={product._id}
                            className="rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_12px_35px_rgba(48,32,26,0.06)]"
                        >
                            <div className="flex items-start gap-3">
                                <ProductImage product={product} />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-black text-coffee-950">
                                        {product.name}
                                    </p>

                                    <p
                                        className="mt-1 truncate text-[10px] text-coffee-400"
                                        dir="ltr"
                                    >
                                        {product.slug}
                                    </p>

                                    <p className="mt-2 text-xs font-bold text-coffee-500">
                                        {product.category?.title || "بدون دسته‌بندی"}
                                    </p>
                                </div>

                                <ProductActions product={product} />
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-coffee-100 pt-4">
                                <div>
                                    <p className="text-[10px] text-coffee-400">قیمت</p>

                                    <p className="mt-1 text-xs font-black text-coffee-900">
                                        {priceFormatter.format(product.price)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-coffee-400">موجودی</p>

                                    <div className="mt-1">
                                        <ProductAvailability product={product} />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] text-coffee-400">وضعیت</p>

                                    <span
                                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${status.className}`}
                                    >
                                        {status.title}
                                    </span>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
}
