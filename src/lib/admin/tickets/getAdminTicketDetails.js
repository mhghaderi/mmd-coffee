import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getAdminTicketDetails(identifier) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return {
            authorized: false,
            ticket: null,
        };
    }

    await connectToDB();

    const filter = mongoose.isValidObjectId(identifier)
        ? {
              _id: identifier,
          }
        : {
              ticketNumber: identifier.trim().toUpperCase(),
          };

    const [ticket, admins] = await Promise.all([
        Ticket.findOne(filter)
            .populate({
                path: "user",
                select: "name email phone avatar isActive createdAt",
            })
            
            
            .lean(),

        User.find({
            role: "admin",
            isActive: true,
        })
            .select("name email avatar")
            .sort({
                name: 1,
            })
            .lean(),
    ]);

    return {
        authorized: true,
        currentUser,
        ticket: ticket ? serialize(ticket) : null,
        admins: admins.map(serialize),
    };
}
