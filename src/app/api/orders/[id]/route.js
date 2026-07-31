import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAuthenticatedUser } from "@/lib/auth/session";

import Order from "@/models/Order";

function createOrderFilter(identifier) {
    if (mongoose.isValidObjectId(identifier)) {
        return {
            _id: identifier,
        };
    }

    return {
        orderNumber: identifier.trim().toUpperCase(),
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
        const { user } = authentication;

        if (!id?.trim()) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه سفارش الزامی است",
                },
                {
                    status: 400,
                },
            );
        }

        const filter = createOrderFilter(id);

        if (user.role !== "admin") {
            filter.user = user.id;
        }

        const order = await Order.findOne(filter)
            .populate({
                path: "user",
                select: "name email phone avatar",
            })
            .populate({
                path: "statusHistory.changedBy",
                select: "name email role",
            })
            .lean();

        if (!order) {
            return Response.json(
                {
                    success: false,
                    message: "سفارش پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        return Response.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error("GET ORDER ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت سفارش انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
