import Link from "next/link";

import {
  FiArrowLeft,
  FiBox,
  FiCoffee,
  FiDroplet,
  FiGift,
} from "react-icons/fi";

import SectionHeading from "@/components/ui/SectionHeading";
import { productCategories, products } from "@/data/products";

const categoryIcons = {
  "hot-drinks": FiCoffee,
  "cold-drinks": FiDroplet,
  desserts: FiGift,
  "coffee-beans": FiBox,
};

const categoryStyles = {
  "hot-drinks": {
    background: "bg-[#f3e6db]",
    icon: "text-[#8c5232]",
  },

  "cold-drinks": {
    background: "bg-[#e1ecec]",
    icon: "text-[#3e7376]",
  },

  desserts: {
    background: "bg-[#f6e7e2]",
    icon: "text-[#a65d53]",
  },

  "coffee-beans": {
    background: "bg-[#e8e2d7]",
    icon: "text-[#66523a]",
  },
};

export default function Categories() {
  const visibleCategories = productCategories.filter(
    (category) => category.id !== "all",
  );

  return (
    <section className="section-spacing">
      <div className="page-container">
        <SectionHeading
          eyebrow="دسته‌بندی‌ها"
          title="امروز چی میل داری؟"
          description="از نوشیدنی‌های گرم و سرد تا دسرهای تازه؛ انتخابت را سریع‌تر پیدا کن."
          actionTitle="مشاهده منوی کامل"
          actionHref="/menu"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCategories.map((category) => {
            const Icon = categoryIcons[category.id] || FiCoffee;
            const styles = categoryStyles[category.id];

            const productsCount = products.filter(
              (product) => product.category === category.id,
            ).length;

            return (
              <Link
                key={category.id}
                href={`/menu?category=${category.id}`}
                className="group relative min-h-60 overflow-hidden rounded-[1.75rem] border border-coffee-100 bg-white p-6 shadow-[0_12px_35px_rgba(48,32,26,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-coffee-200 hover:shadow-[0_24px_55px_rgba(48,32,26,0.12)]"
              >
                <div
                  className={`flex size-14 items-center justify-center rounded-2xl ${styles.background} ${styles.icon} transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
                >
                  <Icon size={25} />
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-black text-coffee-950">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-coffee-500">
                    {category.description}
                  </p>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-coffee-400">
                    {productsCount.toLocaleString("fa-IR")} محصول
                  </span>

                  <span className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-coffee-700 transition-all duration-300 group-hover:bg-coffee-900 group-hover:text-white">
                    <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>

                <div className="pointer-events-none absolute -bottom-20 -left-16 size-44 rounded-full bg-caramel-100/40 blur-3xl transition duration-500 group-hover:scale-150" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}