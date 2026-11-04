import mongoose from "mongoose";

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
            default: "",
        },

        content: {
            type: String,
            required: [true, "متن نظر الزامی است"],
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved",
            index: true,
        },

        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },

        adminReply: {
            type: String,
            trim: true,
            default: "",
        },

        repliedAt: {
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

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
