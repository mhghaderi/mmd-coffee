import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        priceAdjustment: {
            type: Number,
            default: 0,
            min: 0,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true }
);

const addOnSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "نام محصول الزامی است"],
            trim: true,
        },

        englishName: {
            type: String,
            trim: true,
            default: "",
        },

        slug: {
            type: String,
            required: [true, "اسلاگ محصول الزامی است"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "دسته‌بندی محصول الزامی است"],
            index: true,
        },

        catalogType: {
            type: String,
            enum: ["cafe", "shop"],
            default: "cafe",
            index: true,
        },

        shortDescription: {
            type: String,
            trim: true,
            default: "",
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        price: {
            type: Number,
            required: [true, "قیمت محصول الزامی است"],
            min: [0, "قیمت نمی‌تواند منفی باشد"],
        },

        discountPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        image: {
            type: String,
            trim: true,
            default: "",
        },

        gallery: {
            type: [String],
            default: [],
        },

        variants: {
            type: [variantSchema],
            default: [],
        },

        addOns: {
            type: [addOnSchema],
            default: [],
        },

        stock: {
            type: Number,
            min: 0,
            default: 10,
        },

        isAvailable: {
            type: Boolean,
            default: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published",
            index: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isNew: {
            type: Boolean,
            default: false,
        },

        ratingAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        reviewsCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        salesCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        popularityScore: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },

        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

productSchema.index({
    category: 1,
    status: 1,
    isAvailable: 1,
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
