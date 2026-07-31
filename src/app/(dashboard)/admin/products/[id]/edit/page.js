import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/products/ProductForm";

import {
    getAdminProductForForm,
    getProductFormCategories,
} from "@/lib/admin/products/getProductFormData";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "ویرایش محصول",
};

export default async function EditProductPage({ params }) {
    const { id } = await params;

    const [product, categories] = await Promise.all([
        getAdminProductForForm(id),
        getProductFormCategories(),
    ]);

    if (!product) {
        notFound();
    }

    return <ProductForm mode="edit" initialProduct={product} categories={categories} />;
}
