import mongoose from "mongoose";

import {
    TICKET_PRIORITY_VALUES,
    TICKET_STATUS_VALUES,
} from "@/constants/ticket";

import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";

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

export async function PATCH(request, { params }) {
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

        if (Object.hasOwn(body, "status")) {
            if (!TICKET_STATUS_VALUES.includes(body.status)) {
                return Response.json(
                    {
                        success: false,
                        message: "وضعیت تیکت معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            ticket.status = body.status;
            ticket.closedAt = body.status === "closed" ? new Date() : null;
        }

        if (Object.hasOwn(body, "priority")) {
            if (!TICKET_PRIORITY_VALUES.includes(body.priority)) {
                return Response.json(
                    {
                        success: false,
                        message: "اولویت تیکت معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            ticket.priority = body.priority;
        }

        if (Object.hasOwn(body, "assignedTo")) {
            const assignedTo = typeof body.assignedTo === "string" ? body.assignedTo.trim() : "";

            if (!assignedTo) {
                ticket.assignedTo = null;
            } else {
                if (!mongoose.isValidObjectId(assignedTo)) {
                    return Response.json(
                        {
                            success: false,
                            message: "شناسه مدیر معتبر نیست",
                        },
                        {
                            status: 400,
                        },
                    );
                }

                const adminExists = await User.exists({
                    _id: assignedTo,
                    role: "admin",
                    isActive: true,
                });

                if (!adminExists) {
                    return Response.json(
                        {
                            success: false,
                            message: "مدیر انتخاب‌شده پیدا نشد",
                        },
                        {
                            status: 404,
                        },
                    );
                }

                ticket.assignedTo = assignedTo;
            }
        }

        await ticket.save();

        return Response.json({
            success: true,
            message: "تیکت با موفقیت به‌روزرسانی شد",
            data: ticket,
        });
    } catch (error) {
        console.error("UPDATE ADMIN TICKET ERROR:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: messages[0] || "اطلاعات تیکت معتبر نیست",
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
                message: "به‌روزرسانی تیکت انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
