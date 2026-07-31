"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FiHeart,
  FiInfo,
  FiRefreshCw,
  FiShoppingBag,
  FiStar,
  FiX,
  FiZap,
} from "react-icons/fi";

import ProductCard from "@/components/product/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { useStore } from "@/context/StoreContext";

import {
  getPersonalizedRecommendations,
  hasRecommendationSignals,
} from "@/lib/recommendations";

export default function PersonalizedRecommendations() {
  const {
    cart,
    wishlist,
    isHydrated,
  } = useStore();

  const [seedKey, setSeedKey] = useState("initial");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isExplanationOpen, setIsExplanationOpen] =
    useState(false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    setSeedKey(today);
  }, [isHydrated]);

  const hasPersonalData = hasRecommendationSignals({
    cart,
    wishlist,
  });

  const recommendations = useMemo(() => {
    return getPersonalizedRecommendations({
      cart,
      wishlist,
      limit: 4,
      seedKey: `${seedKey}-${refreshVersion}`,
    });
  }, [
    cart,
    wishlist,
    seedKey,
    refreshVersion,
  ]);

  const handleRefreshRecommendations = () => {
    setRefreshVersion((currentVersion) => currentVersion + 1);
  };

  return (
    <section className="section-spacing relative overflow-hidden bg-cream-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 top-12 size-[420px] rounded-full bg-caramel-200/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 -left-40 size-[480px] rounded-full bg-coffee-200/40 blur-3xl"
      />

      <div className="page-container relative">
        <div className="rounded-[2.25rem] border border-coffee-100 bg-white/75 p-5 shadow-[0_25px_80px_rgba(48,32,26,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow={
                hasPersonalData
                  ? "انتخاب‌شده برای تو"
                  : "پیشنهاد هوشمند"
              }
              title={
                hasPersonalData
                  ? "پیشنهادهایی مطابق سلیقه تو"
                  : "از این انتخاب‌ها شروع کن"
              }
              description={
                hasPersonalData
                  ? "این محصولات با توجه به علاقه‌مندی‌ها، سبد خرید و محبوبیت محصولات برای تو مرتب شده‌اند."
                  : "هنوز اطلاعات کافی از سلیقه تو نداریم؛ فعلاً بهترین و محبوب‌ترین انتخاب‌های ممد کافی را نمایش می‌دهیم."
              }
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setIsExplanationOpen((current) => !current)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-coffee-100 bg-white px-4 text-xs font-bold text-coffee-600 shadow-sm transition hover:border-coffee-200 hover:text-coffee-950"
              >
                {isExplanationOpen ? (
                  <FiX />
                ) : (
                  <FiInfo />
                )}

                {isExplanationOpen
                  ? "بستن توضیحات"
                  : "این پیشنهادها چطور انتخاب شدند؟"}
              </button>

              <button
                type="button"
                onClick={handleRefreshRecommendations}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-4 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-coffee-800"
              >
                <FiRefreshCw className="transition-transform duration-500 group-hover:-rotate-180" />

                پیشنهادهای متفاوت
              </button>
            </div>
          </div>

          {/* Recommendation explanation */}

          <div
            className={`grid transition-all duration-500 ${
              isExplanationOpen
                ? "mt-7 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="grid gap-3 rounded-2xl border border-coffee-100 bg-cream-50 p-4 sm:grid-cols-3 sm:p-5">
                <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <FiHeart />
                  </span>

                  <div>
                    <p className="text-sm font-black text-coffee-950">
                      علاقه‌مندی‌ها
                    </p>

                    <p className="mt-1 text-xs leading-6 text-coffee-500">
                      دسته محصولاتی که بیشتر ذخیره کرده‌ای امتیاز
                      بالاتری می‌گیرند.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coffee-100 text-coffee-700">
                    <FiShoppingBag />
                  </span>

                  <div>
                    <p className="text-sm font-black text-coffee-950">
                      سبد خرید
                    </p>

                    <p className="mt-1 text-xs leading-6 text-coffee-500">
                      انتخاب‌های داخل سبد برای تشخیص سلیقه تو
                      استفاده می‌شوند.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-caramel-100 text-caramel-700">
                    <FiStar />
                  </span>

                  <div>
                    <p className="text-sm font-black text-coffee-950">
                      محبوبیت و امتیاز
                    </p>

                    <p className="mt-1 text-xs leading-6 text-coffee-500">
                      محصولاتی که امتیاز و محبوبیت بیشتری دارند
                      در اولویت قرار می‌گیرند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation status */}

          <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-coffee-100 bg-cream-50 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coffee-900 text-white">
                <FiZap />
              </span>

              <div>
                <p className="text-sm font-black text-coffee-950">
                  {hasPersonalData
                    ? "پروفایل سلیقه فعال است"
                    : "پروفایل سلیقه در حال یادگیری است"}
                </p>

                <p className="mt-1 text-xs text-coffee-500">
                  {hasPersonalData
                    ? "پیشنهادها با رفتار فعلی تو هماهنگ شده‌اند."
                    : "با اضافه‌کردن محصولات به سبد و علاقه‌مندی‌ها، پیشنهادها دقیق‌تر می‌شوند."}
                </p>
              </div>
            </div>

            <span
              className={`hidden rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${
                hasPersonalData
                  ? "bg-success/10 text-success"
                  : "bg-caramel-100 text-caramel-700"
              }`}
            >
              {hasPersonalData
                ? "شخصی‌سازی‌شده"
                : "حالت اولیه"}
            </span>
          </div>

          {/* Product grid */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendations.map((recommendation) => (
              <ProductCard
                key={recommendation.product.id}
                product={recommendation.product}
                recommendationLabel={recommendation.reason}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}