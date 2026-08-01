import mongoose from "mongoose";

const categoryScoreSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        score: {
            type: Number,
            default: 0,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false },
);

const productSignalSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        viewCount: { type: Number, min: 0, default: 0 },
        cartCount: { type: Number, min: 0, default: 0 },
        wishlistCount: { type: Number, min: 0, default: 0 },
        purchaseCount: { type: Number, min: 0, default: 0 },
        lastInteractionAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

const wishlistItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        addedAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            min: 1,
            max: 99,
            default: 1,
        },
        variantId: {
            type: String,
            trim: true,
            default: "",
        },
        addOnIds: {
            type: [{ type: String, trim: true }],
            default: [],
        },
        addedAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

const userPreferenceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        wishlist: { type: [wishlistItemSchema], default: [] },
        cart: { type: [cartItemSchema], default: [] },
        categoryScores: { type: [categoryScoreSchema], default: [] },
        productSignals: { type: [productSignalSchema], default: [] },
        lastPersonalizedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

userPreferenceSchema.index({ "wishlist.product": 1 });
userPreferenceSchema.index({ "cart.product": 1 });
userPreferenceSchema.index({ "productSignals.product": 1 });

const UserPreference =
    mongoose.models.UserPreference ||
    mongoose.model("UserPreference", userPreferenceSchema);

export default UserPreference;
