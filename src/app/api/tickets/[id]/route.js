import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAuthenticatedUser } from "@/lib/auth/session";

import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

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

export async function GET(request, { params }) {
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
        })
            .populate({
                path: "order",
                select: "orderNumber pricing status payment createdAt",
            })
            .populate({
                path: "messages.sender",
                select: "name avatar role",
            })
            .lean();

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

        return Response.json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        console.error("GET USER TICKET ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت تیکت انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
