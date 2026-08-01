import { notFound } from "next/navigation";
import ProductDetails from "@/components/product/ProductDetails";
import getPublicProductBySlug from "@/lib/catalog/getPublicProductBySlug";

export const dynamic = "force-dynamic";

export default async function MenuProductPage({ params }) {
    const { slug } = await params;
    const product = await getPublicProductBySlug(slug, { catalogType: "cafe" });

    if (!product) notFound();

    return <ProductDetails product={product} detailBasePath="/menu" />;
}
