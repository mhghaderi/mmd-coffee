import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        lineTotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const customerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            default: "",
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const deliverySchema = new mongoose.Schema(
    {
        method: {
            type: String,
            default: "delivery",
        },
        province: {
            type: String,
            default: "تهران",
        },
        city: {
            type: String,
            default: "تهران",
        },
        addressLine: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

const pricingSchema = new mongoose.Schema(
    {
        subtotal: {
            type: Number,
            default: 0,
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
        },
        priceUnit: {
            type: String,
            default: "toman",
        },
    },
    { _id: false }
);

const paymentSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            default: "online",
        },
        status: {
            type: String,
            default: "paid",
        },
        transactionId: {
            type: String,
            default: "",
        },
        paidAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        customer: {
            type: customerSchema,
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
        },

        delivery: {
            type: deliverySchema,
            default: () => ({}),
        },

        pricing: {
            type: pricingSchema,
            required: true,
        },

        payment: {
            type: paymentSchema,
            default: () => ({}),
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "ready", "out-for-delivery", "completed", "cancelled"],
            default: "pending",
            index: true,
        },

        catalogType: {
            type: String,
            default: "shop",
        },

        fulfillmentType: {
            type: String,
            default: "delivery",
        },

        tableNumber: {
            type: String,
            default: "",
        },

        customerNote: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({
    user: 1,
    createdAt: -1,
});

orderSchema.index({
    status: 1,
    createdAt: -1,
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
