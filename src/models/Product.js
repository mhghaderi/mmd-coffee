import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "عنوان مدل محصول الزامی است"],
            trim: true,
            maxlength: [50, "عنوان مدل محصول نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"],
        },

        priceAdjustment: {
            type: Number,
            default: 0,
            min: [0, "افزایش قیمت نمی‌تواند منفی باشد"],
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
    {
        timestamps: false,
    },
);

const addOnSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "عنوان افزودنی الزامی است"],
            trim: true,
            maxlength: [50, "عنوان افزودنی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"],
        },

        price: {
            type: Number,
            default: 0,
            min: [0, "قیمت افزودنی نمی‌تواند منفی باشد"],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: false,
    },
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "نام محصول الزامی است"],
            trim: true,
            minlength: [2, "نام محصول باید حداقل ۲ کاراکتر باشد"],
            maxlength: [100, "نام محصول نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"],
        },

        englishName: {
            type: String,
            trim: true,
            maxlength: [100, "نام انگلیسی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"],
            default: "",
        },

        slug: {
            type: String,
            required: [true, "اسلاگ محصول الزامی است"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "اسلاگ فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد",
            ],
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "دسته‌بندی محصول الزامی است"],
            index: true,
        },

        catalogType: {
            type: String,
            enum: {
                values: ["cafe", "shop"],
                message: "نوع محصول باید cafe یا shop باشد",
            },
            default: "cafe",
            index: true,
        },

        shortDescription: {
            type: String,
            trim: true,
            maxlength: [200, "توضیح کوتاه محصول نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد"],
            default: "",
        },

        description: {
            type: String,
            trim: true,
            maxlength: [3000, "توضیحات محصول نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد"],
            default: "",
        },

        price: {
            type: Number,
            required: [true, "قیمت محصول الزامی است"],
            min: [0, "قیمت محصول نمی‌تواند منفی باشد"],
        },

        discountPercent: {
            type: Number,
            default: 0,
            min: [0, "درصد تخفیف نمی‌تواند کمتر از صفر باشد"],
            max: [100, "درصد تخفیف نمی‌تواند بیشتر از صد باشد"],
        },

        image: {
            type: String,
            trim: true,
            default: "",
        },

        gallery: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            default: [],
        },

        preparationTime: {
            type: Number,
            min: [0, "زمان آماده‌سازی نمی‌تواند منفی باشد"],
            default: 0,
        },

        intensity: {
            type: String,
            enum: {
                values: ["low", "medium", "high"],
                message: "شدت محصول معتبر نیست",
            },
            default: "medium",
        },

        ingredients: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            default: [],
        },

        tags: {
            type: [
                {
                    type: String,
                    trim: true,
                    lowercase: true,
                },
            ],
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

        trackStock: {
            type: Boolean,
            default: false,
        },

        stock: {
            type: Number,
            min: [0, "موجودی نمی‌تواند منفی باشد"],
            default: 0,
        },

        isAvailable: {
            type: Boolean,
            default: true,
            index: true,
        },

        status: {
            type: String,
            enum: {
                values: ["draft", "published", "archived"],
                message: "وضعیت محصول معتبر نیست",
            },
            default: "draft",
            index: true,
        },

        archivedAt: {
            type: Date,
            default: null,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isNew: {
            type: Boolean,
            default: false,
        },

        accentColor: {
            type: String,
            trim: true,
            default: "#c8793f",
            match: [/^#[0-9a-fA-F]{6}$/, "رنگ محصول باید به‌صورت کد HEX مانند #c8793f باشد"],
        },

        ratingAverage: {
            type: Number,
            default: 0,
            min: [0, "امتیاز نمی‌تواند کمتر از صفر باشد"],
            max: [5, "امتیاز نمی‌تواند بیشتر از پنج باشد"],
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

        viewsCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        wishlistCount: {
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

        seoTitle: {
            type: String,
            trim: true,
            maxlength: 70,
            default: "",
        },

        seoDescription: {
            type: String,
            trim: true,
            maxlength: 180,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

productSchema.index({
    name: "text",
    englishName: "text",
    shortDescription: "text",
    tags: "text",
});

productSchema.index({
    category: 1,
    status: 1,
    isAvailable: 1,
});

productSchema.index({
    popularityScore: -1,
    createdAt: -1,
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
