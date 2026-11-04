import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

const sortOptions = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    priority: { priority: -1, createdAt: -1 },
};

function firstValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getAdminTickets(rawSearchParams = {}) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return null;
    }

    await connectToDB();

    const filters = {
        q: firstValue(rawSearchParams.q)?.toString().trim() || "",
        status: firstValue(rawSearchParams.status)?.toString() || "all",
        priority: firstValue(rawSearchParams.priority)?.toString() || "all",
        category: firstValue(rawSearchParams.category)?.toString() || "all",
        sort: firstValue(rawSearchParams.sort)?.toString() || "newest",
        page: Math.max(Number.parseInt(firstValue(rawSearchParams.page) || "1", 10), 1),
        limit: 10,
    };

    if (!sortOptions[filters.sort]) {
        filters.sort = "newest";
    }

    const query = {};

    if (["open", "answered", "closed"].includes(filters.status)) {
        query.status = filters.status;
    }

    if (["low", "normal", "high", "urgent"].includes(filters.priority)) {
        query.priority = filters.priority;
    }

    if (["order", "payment", "product", "account", "technical", "suggestion", "other"].includes(filters.category)) {
        query.category = filters.category;
    }

    if (filters.q) {
        const regex = new RegExp(escapeRegExp(filters.q), "i");

        const matchingUsers = await User.find({
            $or: [{ name: regex }, { email: regex }, { phone: regex }],
        })
            .select("_id")
            .limit(100)
            .lean();

        query.$or = [
            { ticketNumber: regex },
            { subject: regex },
            { user: { $in: matchingUsers.map((user) => user._id) } },
        ];
    }

    const [total, allCount, openCount, answeredCount, closedCount] = await Promise.all([
        Ticket.countDocuments(query),
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: "open" }),
        Ticket.countDocuments({ status: "answered" }),
        Ticket.countDocuments({ status: "closed" }),
    ]);

    const pages = total === 0 ? 0 : Math.ceil(total / filters.limit);
    filters.page = pages > 0 ? Math.min(filters.page, pages) : 1;

    const tickets = await Ticket.find(query)
        .select("ticketNumber user subject category priority status message adminReply repliedAt createdAt updatedAt")
        .populate({
            path: "user",
            select: "name email phone avatar",
        })
        .sort(sortOptions[filters.sort])
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .lean();

    return {
        currentUser,
        tickets: tickets.map(serialize),
        filters,
        pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            pages,
            hasPreviousPage: filters.page > 1,
            hasNextPage: filters.page < pages,
        },
        stats: {
            allCount,
            openCount,
            answeredCount,
            closedCount,
        },
    };
}
