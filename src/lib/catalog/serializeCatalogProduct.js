function serializeId(value) {
    if (!value) {
        return "";
    }

    return value.toString();
}

function serializeDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function serializeVariant(variant) {
    const id = serializeId(variant?._id);

    return {
        _id: id,
        id,

        title: variant?.title || "",

        priceAdjustment: Number(variant?.priceAdjustment) || 0,

        isDefault: variant?.isDefault === true,

        isActive: variant?.isActive !== false,
    };
}

function serializeAddOn(addOn) {
    const id = serializeId(addOn?._id);

    return {
        _id: id,
        id,

        title: addOn?.title || "",
        price: Number(addOn?.price) || 0,

        isActive: addOn?.isActive !== false,
    };
}

function serializeCategory(category) {
    if (!category) {
        return null;
    }

    const id = serializeId(category._id);

    return {
        _id: id,
        id,

        title: category.title || "",
        slug: category.slug || "",

        image: category.image || "",

        imageAlt: category.imageAlt || category.title || "",

        accentColor: category.accentColor || "#c8793f",
    };
}

export function serializeCatalogProduct(product) {
    const id = serializeId(product._id);

    const category = serializeCategory(product.category);

    const price = Number(product.price) || 0;

    const discountPercent = Number(product.discountPercent) || 0;

    const finalPrice =
        product.finalPrice !== undefined
            ? Number(product.finalPrice) || 0
            : Math.round(price * (1 - Math.min(Math.max(discountPercent, 0), 100) / 100));

    return {
        _id: id,
        id,

        name: product.name || "",
        title: product.name || "",

        englishName: product.englishName || "",

        slug: product.slug || "",

        category,
        categoryId: category?._id || "",
        categorySlug: category?.slug || "",
        categoryTitle: category?.title || "",

        shortDescription: product.shortDescription || "",

        description: product.description || "",

        price,
        finalPrice,

        discountPercent,
        discount: discountPercent,

        image: product.image || "",

        gallery: Array.isArray(product.gallery) ? product.gallery : [],

        preparationTime: Number(product.preparationTime) || 0,

        intensity: product.intensity || "medium",

        ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],

        tags: Array.isArray(product.tags) ? product.tags : [],

        variants: Array.isArray(product.variants)
            ? product.variants.map(serializeVariant).filter((variant) => variant.isActive)
            : [],

        addOns: Array.isArray(product.addOns)
            ? product.addOns.map(serializeAddOn).filter((addOn) => addOn.isActive)
            : [],

        trackStock: product.trackStock === true,

        stock: Number(product.stock) || 0,

        isAvailable: product.isAvailable === true,

        status: product.status,

        isFeatured: product.isFeatured === true,

        isPopular: product.isFeatured === true || Number(product.popularityScore) > 0,

        isNew: product.isNew === true,

        accentColor: product.accentColor || category?.accentColor || "#c8793f",

        ratingAverage: Number(product.ratingAverage) || 0,

        rating: Number(product.ratingAverage) || 0,

        reviewsCount: Number(product.reviewsCount) || 0,

        salesCount: Number(product.salesCount) || 0,

        viewsCount: Number(product.viewsCount) || 0,

        wishlistCount: Number(product.wishlistCount) || 0,

        popularityScore: Number(product.popularityScore) || 0,

        displayOrder: Number(product.displayOrder) || 0,

        createdAt: serializeDate(product.createdAt),

        updatedAt: serializeDate(product.updatedAt),
    };
}

export function serializeCatalogCategory(category) {
    const id = serializeId(category._id);

    return {
        _id: id,
        id,

        title: category.title || "",
        slug: category.slug || "",

        description: category.description || "",

        image: category.image || "",

        imageAlt: category.imageAlt || category.title || "",

        accentColor: category.accentColor || "#c8793f",

        displayOrder: Number(category.displayOrder) || 0,

        productCount: Number(category.productCount) || 0,
    };
}
