import mongoose from "mongoose";

import { ARTICLE_STATUS_VALUES } from "@/constants/article";

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "عنوان مقاله الزامی است"],
            trim: true,
            minlength: [3, "عنوان مقاله باید حداقل ۳ کاراکتر باشد"],
            maxlength: [160, "عنوان مقاله نمی‌تواند بیشتر از ۱۶۰ کاراکتر باشد"],
        },

        slug: {
            type: String,
            required: [true, "اسلاگ مقاله الزامی است"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "اسلاگ فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد",
            ],
            index: true,
        },

        excerpt: {
            type: String,
            required: [true, "خلاصه مقاله الزامی است"],
            trim: true,
            minlength: [10, "خلاصه مقاله باید حداقل ۱۰ کاراکتر باشد"],
            maxlength: [320, "خلاصه مقاله نمی‌تواند بیشتر از ۳۲۰ کاراکتر باشد"],
        },

        content: {
            type: String,
            required: [true, "متن مقاله الزامی است"],
            trim: true,
            minlength: [50, "متن مقاله باید حداقل ۵۰ کاراکتر باشد"],
            maxlength: [50000, "متن مقاله بیش‌ازحد طولانی است"],
        },

        coverImage: {
            type: String,
            trim: true,
            default: "",
        },

        coverImageAlt: {
            type: String,
            trim: true,
            maxlength: [180, "متن جایگزین تصویر بیش‌ازحد طولانی است"],
            default: "",
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "نویسنده مقاله الزامی است"],
            index: true,
        },

        status: {
            type: String,
            enum: {
                values: ARTICLE_STATUS_VALUES,
                message: "وضعیت مقاله معتبر نیست",
            },
            default: "draft",
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
            index: true,
        },

        archivedAt: {
            type: Date,
            default: null,
        },

        tags: {
            type: [
                {
                    type: String,
                    trim: true,
                    lowercase: true,
                    maxlength: 40,
                },
            ],
            default: [],
        },

        readingTime: {
            type: Number,
            min: [1, "زمان مطالعه باید حداقل یک دقیقه باشد"],
            max: [180, "زمان مطالعه معتبر نیست"],
            default: 5,
        },

        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },

        viewsCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        seoTitle: {
            type: String,
            trim: true,
            maxlength: [70, "عنوان سئو نمی‌تواند بیشتر از ۷۰ کاراکتر باشد"],
            default: "",
        },

        seoDescription: {
            type: String,
            trim: true,
            maxlength: [180, "توضیح سئو نمی‌تواند بیشتر از ۱۸۰ کاراکتر باشد"],
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

articleSchema.index({
    status: 1,
    publishedAt: -1,
});

articleSchema.index({
    tags: 1,
    status: 1,
    publishedAt: -1,
});

const Article = mongoose.models.Article || mongoose.model("Article", articleSchema);

export default Article;
