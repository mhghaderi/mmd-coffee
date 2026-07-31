import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "عنوان دسته‌بندی الزامی است"],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        slug: {
            type: String,
            required: [true, "اسلاگ دسته‌بندی الزامی است"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: "",
        },

        image: {
            type: String,
            default: "",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
