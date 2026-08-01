import mongoose from "mongoose";

import { REVIEW_STATUS_VALUES } from "@/constants/review";

const adminReplySchema = new mongoose.Schema(
    {
        message: {
            type: String,
            trim: true,
            maxlength: [1500, "پاسخ مدیر نمی‌تواند بیشتر از ۱۵۰۰ کاراکتر باشد"],
            default: "",
        },

        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        repliedAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    },
);

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "محصول نظر الزامی است"],
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        author: {
            name: {
                type: String,
                required: [true, "نام نویسنده نظر الزامی است"],
                trim: true,
                maxlength: [80, "نام نویسنده بیش‌ازحد طولانی است"],
            },

            email: {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: [150, "ایمیل بیش‌ازحد طولانی است"],
                default: "",
            },
        },

        rating: {
            type: Number,
            required: [true, "امتیاز نظر الزامی است"],
            min: [1, "امتیاز نمی‌تواند کمتر از یک باشد"],
            max: [5, "امتیاز نمی‌تواند بیشتر از پنج باشد"],
            index: true,
        },

        title: {
            type: String,
            trim: true,
            maxlength: [120, "عنوان نظر نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد"],
            default: "",
        },

        content: {
            type: String,
            required: [true, "متن نظر الزامی است"],
            trim: true,
            minlength: [5, "متن نظر باید حداقل ۵ کاراکتر باشد"],
            maxlength: [2000, "متن نظر نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد"],
        },

        status: {
            type: String,
            enum: {
                values: REVIEW_STATUS_VALUES,
                message: "وضعیت نظر معتبر نیست",
            },
            default: "pending",
            index: true,
        },

        isVerifiedPurchase: {
            type: Boolean,
            default: false,
            index: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },

        helpfulCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        rejectionReason: {
            type: String,
            trim: true,
            maxlength: [500, "دلیل رد نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد"],
            default: "",
        },

        adminReply: {
            type: adminReplySchema,
            default: () => ({
                message: "",
                repliedBy: null,
                repliedAt: null,
            }),
        },

        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        moderatedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

reviewSchema.index({
    product: 1,
    status: 1,
    createdAt: -1,
});

reviewSchema.index({
    user: 1,
    product: 1,
    createdAt: -1,
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
