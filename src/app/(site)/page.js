import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import PersonalizedRecommendations from "@/components/home/PersonalizedRecommendations";
import PopularProducts from "@/components/home/PopularProducts";

import getHomeData from "@/lib/home/getHomeData";

export default async function HomePage() {
    const { categories, popularProducts, newestProducts } = await getHomeData();

    return (
        <>
            <Hero products={popularProducts} />

            <Categories categories={categories} />

            <PopularProducts products={popularProducts} newestProducts={newestProducts} />

            <PersonalizedRecommendations products={popularProducts} />
        </>
    );
}
