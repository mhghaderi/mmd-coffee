import mongoose from "mongoose";
import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Ticket from "@/models/Ticket";

function serialize(value) { return JSON.parse(JSON.stringify(value)); }

export default async function getUserTicketDetails(identifier) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "admin") return null;
    await connectToDB();
    const filter = mongoose.isValidObjectId(identifier) ? { _id: identifier } : { ticketNumber: String(identifier || "").trim().toUpperCase() };
    const ticket = await Ticket.findOne({ ...filter, user: currentUser.id }).lean();
    return ticket ? serialize(ticket) : null;
}
