import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Ticket from "@/models/Ticket";

function serialize(value) { return JSON.parse(JSON.stringify(value)); }
function first(value) { return Array.isArray(value) ? value[0] : value; }

export default async function getUserTickets(rawSearchParams = {}) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "admin") return null;
    await connectToDB();

    const page = Math.max(Number.parseInt(first(rawSearchParams.page) || "1", 10), 1);
    const limit = 10;
    const total = await Ticket.countDocuments({ user: currentUser.id });
    const pages = total ? Math.ceil(total / limit) : 0;
    const safePage = pages ? Math.min(page, pages) : 1;
    const tickets = await Ticket.find({ user: currentUser.id })
        .select("ticketNumber subject category priority status lastMessageAt lastCustomerReplyAt lastAdminReplyAt createdAt updatedAt")
        .sort({ lastMessageAt: -1, _id: -1 })
        .skip((safePage - 1) * limit)
        .limit(limit)
        .lean();

    return {
        currentUser,
        tickets: tickets.map(serialize),
        pagination: { page: safePage, total, pages, hasPreviousPage: safePage > 1, hasNextPage: safePage < pages },
    };
}
