import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "کاربر تیکت الزامی است"],
            index: true,
        },

        subject: {
            type: String,
            required: [true, "موضوع تیکت الزامی است"],
            trim: true,
            minlength: [2, "موضوع تیکت باید حداقل ۲ کاراکتر باشد"],
            maxlength: [160, "موضوع تیکت نمی‌تواند بیشتر از ۱۶۰ کاراکتر باشد"],
        },

        category: {
            type: String,
            default: "other",
        },

        priority: {
            type: String,
            default: "normal",
        },

        message: {
            type: String,
            required: [true, "متن پیام الزامی است"],
            trim: true,
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

        status: {
            type: String,
            enum: ["open", "answered", "closed"],
            default: "open",
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

ticketSchema.index({
    user: 1,
    createdAt: -1,
});

ticketSchema.index({
    status: 1,
    createdAt: -1,
});

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;
