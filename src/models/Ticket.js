import mongoose from "mongoose";

import {
    TICKET_CATEGORY_VALUES,
    TICKET_PRIORITY_VALUES,
    TICKET_STATUS_VALUES,
} from "@/constants/ticket";

const ticketMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "فرستنده پیام الزامی است"],
        },

        senderRole: {
            type: String,
            enum: {
                values: ["user", "admin"],
                message: "نقش فرستنده پیام معتبر نیست",
            },
            required: true,
        },

        message: {
            type: String,
            required: [true, "متن پیام الزامی است"],
            trim: true,
            minlength: [2, "متن پیام باید حداقل ۲ کاراکتر باشد"],
            maxlength: [5000, "متن پیام نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد"],
        },

        attachments: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

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
            minlength: [3, "موضوع تیکت باید حداقل ۳ کاراکتر باشد"],
            maxlength: [160, "موضوع تیکت نمی‌تواند بیشتر از ۱۶۰ کاراکتر باشد"],
        },

        category: {
            type: String,
            enum: {
                values: TICKET_CATEGORY_VALUES,
                message: "دسته‌بندی تیکت معتبر نیست",
            },
            default: "other",
            index: true,
        },

        priority: {
            type: String,
            enum: {
                values: TICKET_PRIORITY_VALUES,
                message: "اولویت تیکت معتبر نیست",
            },
            default: "normal",
            index: true,
        },

        status: {
            type: String,
            enum: {
                values: TICKET_STATUS_VALUES,
                message: "وضعیت تیکت معتبر نیست",
            },
            default: "open",
            index: true,
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
            index: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        messages: {
            type: [ticketMessageSchema],
            default: [],
        },

        lastMessageAt: {
            type: Date,
            default: Date.now,
            index: true,
        },

        lastCustomerReplyAt: {
            type: Date,
            default: null,
        },

        lastAdminReplyAt: {
            type: Date,
            default: null,
        },

        closedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

ticketSchema.index({
    status: 1,
    priority: 1,
    lastMessageAt: -1,
});

ticketSchema.index({
    user: 1,
    createdAt: -1,
});

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;
