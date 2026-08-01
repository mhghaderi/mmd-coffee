"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiChevronLeft,
    FiChevronRight,
    FiHeart,
    FiRefreshCw,
    FiStar,
    FiZap,
} from "react-icons/fi";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import ProductCard from "@/components/product/ProductCard";
import { useStore } from "@/context/StoreContext";

import styles from "./PersonalizedRecommendations.module.css";

const MAX_PRODUCTS = 6;

function getIdentity(item) {
    return String(item?._id || item?.productId || item?.id || item?.slug || "");
}

function uniqueProducts(items = []) {
    const map = new Map();

    for (const product of items) {
        const id = getIdentity(product);
        if (id && !map.has(id)) map.set(id, product);
    }

    return [...map.values()];
}

export default function PersonalizedRecommendations({
    products = [],
    content = {},
}) {
    const {
        isHydrated,
        wishlistItems = [],
        cartItems = [],
        preferencesReady,
    } = useStore();

    const [state, setState] = useState({
        loading: true,
        personalized: false,
        products: [],
    });
    const [requestKey, setRequestKey] = useState(0);

    const fallbackProducts = useMemo(
        () => uniqueProducts(products).slice(0, MAX_PRODUCTS),
        [products],
    );

    const preferenceFingerprint = useMemo(() => {
        const wishlist = wishlistItems.map((item) => `w:${getIdentity(item)}`);
        const cart = cartItems.map(
            (item) => `c:${getIdentity(item)}:${Math.max(1, Number(item?.quantity) || 1)}`,
        );

        return [...wishlist, ...cart].filter(Boolean).sort().join("|");
    }, [wishlistItems, cartItems]);

    const loadRecommendations = useCallback(async (signal) => {
        try {
            setState((current) => ({ ...current, loading: true }));

            const response = await fetch(`/api/recommendations?t=${Date.now()}`, {
                method: "GET",
                cache: "no-store",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                },
                signal,
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || !payload?.success) {
                throw new Error(payload?.message || "دریافت پیشنهادها انجام نشد");
            }

            const recommended = uniqueProducts(payload?.data?.products || []).slice(
                0,
                MAX_PRODUCTS,
            );

            setState({
                loading: false,
                personalized: Boolean(payload?.personalized),
                products: recommended.length ? recommended : fallbackProducts,
            });
        } catch (error) {
            if (error?.name === "AbortError") return;

            console.error("PERSONALIZED RECOMMENDATIONS ERROR:", error);
            setState({
                loading: false,
                personalized: false,
                products: fallbackProducts,
            });
        }
    }, [fallbackProducts]);

    useEffect(() => {
        if (!isHydrated) return undefined;

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            loadRecommendations(controller.signal);
        }, 180);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [
        isHydrated,
        preferencesReady,
        preferenceFingerprint,
        requestKey,
        loadRecommendations,
    ]);

    const displayProducts = useMemo(() => {
        const source = state.products.length ? state.products : fallbackProducts;
        return uniqueProducts(source).slice(0, MAX_PRODUCTS);
    }, [state.products, fallbackProducts]);

    const title = state.personalized
        ? content.personalizedTitle || "انتخاب‌شده برای سلیقه تو"
        : content.fallbackTitle || "پیشنهادهای منتخب ممد کافی";

    const description = state.personalized
        ? content.personalizedDescription ||
          "بر اساس علاقه‌مندی‌ها، سبد خرید و رفتار حساب تو؛ با هر انتخاب، پیشنهادها دقیق‌تر می‌شوند."
        : content.fallbackDescription ||
          "فعلاً از بهترین و محبوب‌ترین انتخاب‌ها شروع می‌کنیم؛ با استفاده بیشتر از سایت، این بخش مخصوص خودت می‌شود.";

    if (!state.loading && !displayProducts.length) return null;

    return (
        <section className="page-container section-spacing">
            <div className={styles.shell}>
                <div className={styles.glowOne} aria-hidden="true" />
                <div className={styles.glowTwo} aria-hidden="true" />

                <div className={styles.header}>
                    <div className={styles.headingGroup}>
                        <span className={styles.iconBox}>
                            {state.personalized ? <FiHeart size={20} /> : <FiStar size={20} />}
                        </span>

                        <div>
                            <div className={styles.eyebrowRow}>
                                <span className={styles.eyebrow}>
                                    {content.eyebrow || "پیشنهاد برای تو"}
                                </span>

                                {state.personalized && (
                                    <span className={styles.liveBadge}>
                                        <FiZap size={11} />
                                        شخصی‌سازی شده
                                    </span>
                                )}
                            </div>

                            <h2 className={styles.title}>{title}</h2>
                            <p className={styles.description}>{description}</p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.refreshButton}
                            onClick={() => setRequestKey((current) => current + 1)}
                            aria-label="به‌روزرسانی پیشنهادها"
                            title="پیشنهادهای تازه"
                        >
                            <FiRefreshCw size={17} />
                        </button>

                        <button
                            type="button"
                            className={`mmd-rec-prev ${styles.navButton}`}
                            aria-label="پیشنهاد قبلی"
                        >
                            <FiChevronRight size={19} />
                        </button>

                        <button
                            type="button"
                            className={`mmd-rec-next ${styles.navButton} ${styles.navButtonPrimary}`}
                            aria-label="پیشنهاد بعدی"
                        >
                            <FiChevronLeft size={19} />
                        </button>
                    </div>
                </div>

                {state.loading && !displayProducts.length ? (
                    <div className={styles.skeletonGrid}>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className={styles.skeleton} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.sliderWrap}>
                        <div className={styles.edgeRight} aria-hidden="true" />
                        <div className={styles.edgeLeft} aria-hidden="true" />

                        <Swiper
                            key={displayProducts.map(getIdentity).join("-")}
                            className="mmd-recommendations-swiper"
                            dir="rtl"
                            modules={[Autoplay, Navigation, Pagination, A11y]}
                            slidesPerView={1.08}
                            spaceBetween={14}
                            speed={720}
                            grabCursor
                            watchOverflow
                            loop={displayProducts.length >= 5}
                            rewind={displayProducts.length < 5}
                            navigation={{
                                nextEl: ".mmd-rec-next",
                                prevEl: ".mmd-rec-prev",
                            }}
                            pagination={{
                                el: ".mmd-rec-pagination",
                                clickable: true,
                                dynamicBullets: true,
                            }}
                            autoplay={
                                displayProducts.length > 4
                                    ? {
                                          delay: 4300,
                                          disableOnInteraction: false,
                                          pauseOnMouseEnter: true,
                                      }
                                    : false
                            }
                            breakpoints={{
                                560: {
                                    slidesPerView: 2,
                                    spaceBetween: 16,
                                },
                                900: {
                                    slidesPerView: 3,
                                    spaceBetween: 18,
                                },
                                1180: {
                                    slidesPerView: 4,
                                    spaceBetween: 20,
                                },
                            }}
                        >
                            {displayProducts.map((product) => (
                                <SwiperSlide key={getIdentity(product)} className={styles.slide}>
                                    <div className={styles.cardWrap}>
                                        <ProductCard
                                            product={product}
                                            recommendationLabel={product?.recommendationReason}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {displayProducts.length > 1 && (
                            <div className={`mmd-rec-pagination ${styles.pagination}`} />
                        )}
                    </div>
                )}

                <div className={styles.bottomNote}>
                    <span className={styles.dot} />
                    پیشنهادها با تغییر سبد خرید و علاقه‌مندی‌های تو دوباره محاسبه می‌شوند.
                </div>
            </div>
        </section>
    );
}
