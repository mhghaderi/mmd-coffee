import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";

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
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const { id } = await params;
        const ticket = await Ticket.findOne(createTicketFilter(id));

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

        const body = await request.json();
        const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

        if (message.length < 2) {
            return Response.json(
                {
                    success: false,
                    message: "متن پاسخ باید حداقل ۲ کاراکتر باشد",
                },
                {
                    status: 400,
                },
            );
        }

        const now = new Date();

        ticket.messages.push({
            sender: authorization.user.id,
            senderRole: "admin",
            message,
            attachments: [],
        });

        ticket.lastMessageAt = now;
        ticket.lastAdminReplyAt = now;
        ticket.status = body.closeAfterReply === true ? "closed" : "answered";
        ticket.closedAt = body.closeAfterReply === true ? now : null;

        if (!ticket.assignedTo) {
            ticket.assignedTo = authorization.user.id;
        }

        await ticket.save();

        return Response.json(
            {
                success: true,
                message: body.closeAfterReply
                    ? "پاسخ ثبت و تیکت بسته شد"
                    : "پاسخ مدیر با موفقیت ثبت شد",
                data: ticket.messages.at(-1),
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("ADMIN TICKET REPLY ERROR:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: messages[0] || "متن پاسخ معتبر نیست",
                    errors: messages,
                },
                {
                    status: 400,
                },
            );
        }

        return Response.json(
            {
                success: false,
                message: "ثبت پاسخ تیکت انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
