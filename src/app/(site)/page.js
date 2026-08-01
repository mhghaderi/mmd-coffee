import Hero from "@/components/home/Hero";
import LatestArticles from "@/components/home/LatestArticles";
import PersonalizedRecommendations from "@/components/home/PersonalizedRecommendations";
import PopularProducts from "@/components/home/PopularProducts";
import getHomePageData from "@/lib/home/getHomePageData";
import getSiteContent from "@/lib/settings/getSiteContent";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const [homeData, siteContent] = await Promise.all([
        getHomePageData(),
        getSiteContent(),
    ]);

    const content = siteContent?.home || {};

    return (
        <>
            <Hero products={homeData.heroPool} content={content.hero} />

            <PopularProducts
                products={homeData.popularCafeProducts}
                eyebrow={content.cafePopular?.eyebrow || "انتخاب مشتری‌های کافه"}
                title={content.cafePopular?.title || "پرطرفدارهای کافه"}
                description={
                    content.cafePopular?.description ||
                    "نوشیدنی‌ها و خوراکی‌هایی که بیشتر از همه در کافه سفارش داده می‌شوند."
                }
                href="/menu?sort=popular"
                linkTitle={content.cafePopular?.linkTitle || "مشاهده منوی کافه"}
            />

            <PopularProducts
                products={homeData.popularShopProducts}
                eyebrow={content.shopPopular?.eyebrow || "برای قهوه‌دوست‌ها"}
                title={content.shopPopular?.title || "پرطرفدارهای فروشگاه"}
                description={
                    content.shopPopular?.description ||
                    "دانه قهوه، ابزار دم‌آوری و اکسسوری‌های محبوب فروشگاه."
                }
                href="/shop?sort=popular"
                linkTitle={content.shopPopular?.linkTitle || "مشاهده فروشگاه"}
            />

            <PersonalizedRecommendations
                products={homeData.recommendationPool}
                content={content.personalized}
            />

            <LatestArticles
                articles={homeData.latestArticles}
                content={content.latestArticles}
            />
        </>
    );
}
