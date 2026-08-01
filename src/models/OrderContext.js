import mongoose from "mongoose";

const OrderContextSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        catalogType: {
            type: String,
            enum: ["cafe", "shop"],
            required: true,
            index: true,
        },
        fulfillmentType: {
            type: String,
            enum: ["dine_in", "takeaway", "delivery", "pickup"],
            required: true,
            index: true,
        },
        tableNumber: {
            type: String,
            trim: true,
            maxlength: 30,
            default: "",
        },
    },
    { timestamps: true },
);

export default mongoose.models.OrderContext || mongoose.model("OrderContext", OrderContextSchema);
