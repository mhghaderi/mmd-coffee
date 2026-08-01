import mongoose from "mongoose";
import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Order from "@/models/Order";
import OrderContext from "@/models/OrderContext";

function serialize(value) { return JSON.parse(JSON.stringify(value)); }

export default async function getUserOrderDetails(identifier) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "admin") return { authorized: false, order: null };
    await connectToDB();

    const filter = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { orderNumber: String(identifier || "").trim().toUpperCase() };
    const order = await Order.findOne({ ...filter, user: currentUser.id }).lean();
    if (!order) return { authorized: true, order: null };
    const context = await OrderContext.findOne({ order: order._id }).lean();
    return { authorized: true, order: serialize({ ...order, context: context || null }) };
}
