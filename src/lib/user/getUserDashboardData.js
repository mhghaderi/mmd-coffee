import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Order from "@/models/Order";
import OrderContext from "@/models/OrderContext";
import Ticket from "@/models/Ticket";

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getUserDashboardData() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "admin") return null;

    await connectToDB();

    const [orderCount, activeOrderCount, ticketCount, openTicketCount, recentOrders, recentTickets] = await Promise.all([
        Order.countDocuments({ user: currentUser.id }),
        Order.countDocuments({ user: currentUser.id, status: { $in: ["pending", "confirmed", "preparing", "ready", "out-for-delivery"] } }),
        Ticket.countDocuments({ user: currentUser.id }),
        Ticket.countDocuments({ user: currentUser.id, status: { $in: ["open", "answered", "customer-reply"] } }),
        Order.find({ user: currentUser.id }).select("orderNumber pricing status payment delivery createdAt").sort({ createdAt: -1 }).limit(5).lean(),
        Ticket.find({ user: currentUser.id }).select("ticketNumber subject status priority lastMessageAt createdAt").sort({ lastMessageAt: -1 }).limit(5).lean(),
    ]);

    const contexts = recentOrders.length
        ? await OrderContext.find({ order: { $in: recentOrders.map((item) => item._id) } }).lean()
        : [];
    const contextMap = new Map(contexts.map((item) => [String(item.order), item]));

    return {
        currentUser,
        stats: { orderCount, activeOrderCount, ticketCount, openTicketCount },
        recentOrders: recentOrders.map((order) => serialize({ ...order, context: contextMap.get(String(order._id)) || null })),
        recentTickets: recentTickets.map(serialize),
    };
}
