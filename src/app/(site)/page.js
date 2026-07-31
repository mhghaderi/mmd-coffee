import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import PopularProducts from "@/components/home/PopularProducts";

export default function HomePage() {
    return (
        <>
            <Hero />
            <Categories />
            <PopularProducts />
        </>
    );
}
