import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAuthenticatedUser } from "@/lib/auth/session";

import Ticket from "@/models/Ticket";

function createTicketFilter(identifier) {
    if (mongoose.isValidObjectId(identifier)) {
        return {
            _id: identifier,
        };
    }

    return {
        ticketNumber: identifier.trim().toUpperCase(),
    };
}

export async function POST(request, { params }) {
    const authentication = await requireAuthenticatedUser();

    if (!authentication.ok) {
        return authentication.response;
    }

    try {
        await connectToDB();

        const { id } = await params;

        const ticket = await Ticket.findOne({
            ...createTicketFilter(id),
            user: authentication.user.id,
        });

        if (!ticket) {
            return Response.json(
                {
                    success: false,
                    message: "تیکت پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        if (ticket.status === "closed") {
            return Response.json(
                {
                    success: false,
                    message: "این تیکت بسته شده است و امکان ارسال پیام جدید ندارد",
                },
                {
                    status: 409,
                },
            );
        }

        const body = await request.json();
        const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

        if (message.length < 2) {
            return Response.json(
                {
                    success: false,
                    message: "متن پیام باید حداقل ۲ کاراکتر باشد",
                },
                {
                    status: 400,
                },
            );
        }

        const now = new Date();

        ticket.messages.push({
            sender: authentication.user.id,
            senderRole: "user",
            message,
            attachments: [],
        });

        ticket.lastMessageAt = now;
        ticket.lastCustomerReplyAt = now;
        ticket.status = "customer-reply";

        await ticket.save();

        return Response.json(
            {
                success: true,
                message: "پیام با موفقیت ارسال شد",
                data: ticket.messages.at(-1),
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("USER TICKET REPLY ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "ارسال پیام انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
