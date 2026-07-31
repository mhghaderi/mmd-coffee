import ProductForm from "@/components/admin/products/ProductForm";

import { getProductFormCategories } from "@/lib/admin/products/getProductFormData";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "افزودن محصول",
};

export default async function NewProductPage() {
    const categories = await getProductFormCategories();

    return <ProductForm mode="create" categories={categories} />;
}
