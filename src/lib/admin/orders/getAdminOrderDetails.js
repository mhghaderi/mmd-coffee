import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Order from "@/models/Order";

function createOrderFilter(identifier) {
    const normalizedIdentifier = typeof identifier === "string" ? identifier.trim() : "";

    if (mongoose.isValidObjectId(normalizedIdentifier)) {
        return {
            _id: normalizedIdentifier,
        };
    }

    return {
        orderNumber: normalizedIdentifier.toUpperCase(),
    };
}

function serializeOrder(order) {
    return JSON.parse(JSON.stringify(order));
}

export default async function getAdminOrderDetails(identifier) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return {
            authorized: false,
            order: null,
        };
    }

    await connectToDB();

    const order = await Order.findOne(createOrderFilter(identifier))
        .populate({
            path: "user",
            select: "name email phone avatar isActive createdAt",
        })
        .populate({
            path: "statusHistory.changedBy",
            select: "name email role",
        })
        .populate({
            path: "paymentHistory.changedBy",
            select: "name email role",
        })
        .lean();

    return {
        authorized: true,

        order: order ? serializeOrder(order) : null,
    };
}
