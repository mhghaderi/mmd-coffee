import Link from "next/link";

import { FiArrowLeft, FiCoffee } from "react-icons/fi";

export default function Categories({ categories = [] }) {
    if (!categories.length) {
        return null;
    }

    return (
        <section className="page-container section-spacing">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-caramel-600">دسته‌بندی محصولات</p>

                    <h2 className="mt-2 text-3xl font-black text-coffee-950">
                        برای هر سلیقه، یک انتخاب
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-coffee-500">
                        از میان قهوه‌ها، نوشیدنی‌ها و خوراکی‌های ممد کافی انتخاب کن.
                    </p>
                </div>

                <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 text-xs font-black text-coffee-600 transition hover:text-caramel-600"
                >
                    مشاهده همه محصولات
                    <FiArrowLeft />
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                    <Link
                        key={category._id}
                        href={`/menu?category=${encodeURIComponent(category.slug)}`}
                        className="group relative min-h-52 overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-[0_12px_40px_rgba(48,32,26,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(48,32,26,0.10)]"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute -left-12 -top-12 size-36 rounded-full opacity-20 blur-2xl transition group-hover:scale-125"
                            style={{
                                backgroundColor: category.accentColor || "#c8793f",
                            }}
                        />

                        <div className="relative flex items-start justify-between gap-4">
                            <div
                                className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                                style={{
                                    backgroundColor: `${category.accentColor || "#c8793f"}18`,
                                }}
                            >
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.imageAlt || category.title}
                                        className="size-full object-contain p-2"
                                    />
                                ) : (
                                    <FiCoffee
                                        size={24}
                                        style={{
                                            color: category.accentColor || "#c8793f",
                                        }}
                                    />
                                )}
                            </div>

                            <span className="flex size-9 items-center justify-center rounded-xl bg-cream-50 text-coffee-400 transition group-hover:bg-coffee-900 group-hover:text-white">
                                <FiArrowLeft className="text-current" />
                            </span>
                        </div>

                        <div className="relative mt-8">
                            <h3 className="text-lg font-black text-coffee-950">{category.title}</h3>

                            <p className="mt-2 line-clamp-2 min-h-12 text-xs leading-6 text-coffee-400">
                                {category.description || `محصولات دسته ${category.title} ممد کافی`}
                            </p>

                            <p className="mt-5 text-xs font-black text-caramel-600">
                                {category.productCount.toLocaleString("fa-IR")} محصول
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
