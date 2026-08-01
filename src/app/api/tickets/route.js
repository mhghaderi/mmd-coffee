import mongoose from "mongoose";

import {
    TICKET_CATEGORY_VALUES,
    TICKET_PRIORITY_VALUES,
} from "@/constants/ticket";

import connectToDB from "@/lib/db/connectToDB";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import createTicketNumber from "@/lib/tickets/createTicketNumber";

import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import SiteSettings from "@/models/SiteSettings";

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET(request) {
    const authentication = await requireAuthenticatedUser();

    if (!authentication.ok) {
        return authentication.response;
    }

    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
        const limit = 10;

        const query = {
            user: authentication.user.id,
        };

        const total = await Ticket.countDocuments(query);
        const pages = total === 0 ? 0 : Math.ceil(total / limit);
        const safePage = pages > 0 ? Math.min(page, pages) : 1;

        const tickets = await Ticket.find(query)
            .select(
                "ticketNumber subject category priority status lastMessageAt lastCustomerReplyAt lastAdminReplyAt createdAt updatedAt",
            )
            .sort({
                lastMessageAt: -1,
                _id: -1,
            })
            .skip((safePage - 1) * limit)
            .limit(limit)
            .lean();

        return Response.json({
            success: true,
            data: {
                tickets,
                pagination: {
                    page: safePage,
                    total,
                    pages,
                    hasPreviousPage: safePage > 1,
                    hasNextPage: safePage < pages,
                },
            },
        });
    } catch (error) {
        console.error("GET USER TICKETS ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت تیکت‌ها انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request) {
    const authentication = await requireAuthenticatedUser();

    if (!authentication.ok) {
        return authentication.response;
    }

    try {
        await connectToDB();

        const settings = await SiteSettings.findOne({ key: "main" })
            .select("features.ticketsEnabled")
            .lean();

        if (settings?.features?.ticketsEnabled === false) {
            return Response.json(
                {
                    success: false,
                    message: "ثبت تیکت موقتاً توسط مدیریت غیرفعال شده است",
                },
                {
                    status: 503,
                },
            );
        }

        const body = await request.json();

        const subject = cleanText(body.subject, 160);
        const message = cleanText(body.message, 5000);
        const category = TICKET_CATEGORY_VALUES.includes(body.category) ? body.category : "other";
        const priority = TICKET_PRIORITY_VALUES.includes(body.priority) ? body.priority : "normal";
        const orderId = cleanText(body.orderId, 50);

        if (subject.length < 3 || message.length < 2) {
            return Response.json(
                {
                    success: false,
                    message: "موضوع و متن تیکت را کامل وارد کن",
                },
                {
                    status: 400,
                },
            );
        }

        let order = null;

        if (orderId) {
            if (!mongoose.isValidObjectId(orderId)) {
                return Response.json(
                    {
                        success: false,
                        message: "شناسه سفارش معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            order = await Order.findOne({
                _id: orderId,
                user: authentication.user.id,
            })
                .select("_id")
                .lean();

            if (!order) {
                return Response.json(
                    {
                        success: false,
                        message: "سفارش انتخاب‌شده پیدا نشد",
                    },
                    {
                        status: 404,
                    },
                );
            }
        }

        const now = new Date();
        const ticketNumber = await createTicketNumber();

        const ticket = await Ticket.create({
            ticketNumber,
            user: authentication.user.id,
            subject,
            category,
            priority,
            status: "open",
            order: order?._id || null,
            lastMessageAt: now,
            lastCustomerReplyAt: now,
            messages: [
                {
                    sender: authentication.user.id,
                    senderRole: "user",
                    message,
                    attachments: [],
                },
            ],
        });

        return Response.json(
            {
                success: true,
                message: "تیکت با موفقیت ثبت شد",
                data: {
                    _id: ticket._id,
                    ticketNumber: ticket.ticketNumber,
                    status: ticket.status,
                    createdAt: ticket.createdAt,
                },
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("CREATE TICKET ERROR:", error);

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
                message: "ثبت تیکت انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
