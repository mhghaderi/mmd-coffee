import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "عنوان دسته‌بندی الزامی است"],
            trim: true,
            minlength: [2, "عنوان دسته‌بندی باید حداقل ۲ کاراکتر باشد"],
            maxlength: [80, "عنوان دسته‌بندی نمی‌تواند بیشتر از ۸۰ کاراکتر باشد"],
        },

        slug: {
            type: String,
            required: [true, "اسلاگ دسته‌بندی الزامی است"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "اسلاگ فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد",
            ],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "توضیحات دسته‌بندی نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد"],
            default: "",
        },

        image: {
            type: String,
            trim: true,
            default: "",
        },

        imageAlt: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "",
        },

        accentColor: {
            type: String,
            trim: true,
            default: "#c8793f",
            match: [/^#[0-9a-fA-F]{6}$/, "رنگ دسته‌بندی باید به‌شکل HEX مانند #c8793f باشد"],
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        displayOrder: {
            type: Number,
            default: 0,
            index: true,
        },

        archivedAt: {
            type: Date,
            default: null,
            index: true,
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

categorySchema.index({
    title: "text",
    slug: "text",
    description: "text",
});

categorySchema.index({
    archivedAt: 1,
    isActive: 1,
    displayOrder: 1,
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
