import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";

import Category from "@/models/Category";
import Product from "@/models/Product";

function serializeCategory(category) {
    return {
        _id: category._id.toString(),
        title: category.title,
        slug: category.slug,
        isActive: category.isActive !== false,
    };
}

function serializeSubdocument(item) {
    return {
        _id: item._id?.toString() || undefined,
        title: item.title || "",
        priceAdjustment: item.priceAdjustment || 0,
        price: item.price || 0,
        isDefault: Boolean(item.isDefault),
        isActive: item.isActive !== false,
    };
}

function serializeProduct(product) {
    return {
        _id: product._id.toString(),

        name: product.name || "",
        englishName: product.englishName || "",
        slug: product.slug || "",

        category: product.category ? product.category.toString() : "",

        shortDescription: product.shortDescription || "",

        description: product.description || "",

        price: product.price || 0,

        discountPercent: product.discountPercent || 0,

        image: product.image || "",

        gallery: Array.isArray(product.gallery) ? product.gallery : [],

        preparationTime: product.preparationTime || 0,

        intensity: product.intensity || "medium",

        ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],

        tags: Array.isArray(product.tags) ? product.tags : [],

        variants: Array.isArray(product.variants) ? product.variants.map(serializeSubdocument) : [],

        addOns: Array.isArray(product.addOns) ? product.addOns.map(serializeSubdocument) : [],

        trackStock: Boolean(product.trackStock),

        stock: product.stock || 0,

        isAvailable: product.isAvailable !== false,

        status: product.status || "draft",

        isFeatured: Boolean(product.isFeatured),

        isNew: Boolean(product.isNew),

        accentColor: product.accentColor || "#c8793f",

        displayOrder: product.displayOrder || 0,

        seoTitle: product.seoTitle || "",

        seoDescription: product.seoDescription || "",
    };
}

export async function getProductFormCategories() {
    await connectToDB();

    const categories = await Category.find({
        $or: [
            {
                isActive: true,
            },
            {
                isActive: {
                    $exists: false,
                },
            },
        ],
    })
        .select("title slug isActive displayOrder")
        .sort({
            displayOrder: 1,
            createdAt: -1,
        })
        .lean();

    return categories.map(serializeCategory);
}

export async function getAdminProductForForm(productId) {
    if (!mongoose.isValidObjectId(productId)) {
        return null;
    }

    await connectToDB();

    const product = await Product.findById(productId).lean();

    if (!product) {
        return null;
    }

    return serializeProduct(product);
}
