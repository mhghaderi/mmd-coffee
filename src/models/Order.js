import mongoose from "mongoose";

import {
    DELIVERY_METHOD_VALUES,
    ORDER_STATUS,
    ORDER_STATUS_VALUES,
    PAYMENT_METHOD_VALUES,
    PAYMENT_STATUS,
    PAYMENT_STATUS_VALUES,
} from "@/constants/order";

const selectedVariantSchema = new mongoose.Schema(
    {
        originalId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        title: {
            type: String,
            trim: true,
            default: "",
        },

        priceAdjustment: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        _id: false,
    },
);

const selectedAddOnSchema = new mongoose.Schema(
    {
        originalId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    },
);

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    englishName: {
        type: String,
        trim: true,
        default: "",
    },

    slug: {
        type: String,
        required: true,
        trim: true,
    },

    image: {
        type: String,
        trim: true,
        default: "",
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 20,
    },

    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },

    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    discountedBasePrice: {
        type: Number,
        required: true,
        min: 0,
    },

    variant: {
        type: selectedVariantSchema,
        default: null,
    },

    addOns: {
        type: [selectedAddOnSchema],
        default: [],
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
});

const customerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 150,
            default: "",
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },
    },
    {
        _id: false,
    },
);

const deliverySchema = new mongoose.Schema(
    {
        method: {
            type: String,
            enum: DELIVERY_METHOD_VALUES,
            required: true,
        },

        province: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
        },

        city: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
        },

        addressLine: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        postalCode: {
            type: String,
            trim: true,
            maxlength: 20,
            default: "",
        },

        plaque: {
            type: String,
            trim: true,
            maxlength: 20,
            default: "",
        },

        unit: {
            type: String,
            trim: true,
            maxlength: 20,
            default: "",
        },
    },
    {
        _id: false,
    },
);

const pricingSchema = new mongoose.Schema(
    {
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        deliveryFee: {
            type: Number,
            default: 0,
            min: 0,
        },

        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        priceUnit: {
            type: String,
            enum: ["toman"],
            default: "toman",
        },
    },
    {
        _id: false,
    },
);

const paymentSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            enum: PAYMENT_METHOD_VALUES,
            required: true,
        },

        status: {
            type: String,
            enum: PAYMENT_STATUS_VALUES,
            default: PAYMENT_STATUS.UNPAID,
        },

        transactionId: {
            type: String,
            trim: true,
            default: "",
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    },
);

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ORDER_STATUS_VALUES,
        required: true,
    },

    note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
    },

    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    changedAt: {
        type: Date,
        default: Date.now,
    },
});
const paymentHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: PAYMENT_STATUS_VALUES,
            required: true,
        },

        note: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        changedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: true,
    },
);
const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
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

            validate: {
                validator(items) {
                    return Array.isArray(items) && items.length > 0;
                },

                message: "سفارش باید حداقل یک محصول داشته باشد",
            },
        },

        delivery: {
            type: deliverySchema,
            required: true,
        },

        pricing: {
            type: pricingSchema,
            required: true,
        },

        payment: {
            type: paymentSchema,
            required: true,
        },
        paymentHistory: {
            type: [paymentHistorySchema],
            default: [],
        },
        status: {
            type: String,
            enum: ORDER_STATUS_VALUES,
            default: ORDER_STATUS.PENDING,
            index: true,
        },

        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },

        customerNote: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        adminNote: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },

        source: {
            type: String,
            enum: ["web", "admin"],
            default: "web",
        },

        inventoryRestored: {
            type: Boolean,
            default: false,
        },

        salesApplied: {
            type: Boolean,
            default: false,
        },

        confirmedAt: {
            type: Date,
            default: null,
        },

        completedAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        cancellationReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
    },
    {
        timestamps: true,
        optimisticConcurrency: true,
    },
);

orderSchema.index({
    status: 1,
    createdAt: -1,
});

orderSchema.index({
    user: 1,
    createdAt: -1,
});

orderSchema.index({
    "customer.phone": 1,
    createdAt: -1,
});

orderSchema.index({
    "payment.status": 1,
    createdAt: -1,
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
