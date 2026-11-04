import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Order from "@/models/Order";
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
        Order.find({ user: currentUser.id }).select("orderNumber pricing status payment delivery catalogType fulfillmentType tableNumber createdAt").sort({ createdAt: -1 }).limit(5).lean(),
        Ticket.find({ user: currentUser.id }).select("ticketNumber subject status priority lastMessageAt createdAt").sort({ lastMessageAt: -1 }).limit(5).lean(),
    ]);

    return {
        currentUser,
        stats: { orderCount, activeOrderCount, ticketCount, openTicketCount },
        recentOrders: recentOrders.map((order) => serialize({
            ...order,
            context: {
                catalogType: order.catalogType || "shop",
                fulfillmentType: order.fulfillmentType || "delivery",
                tableNumber: order.tableNumber || "",
            },
        })),
        recentTickets: recentTickets.map(serialize),
    };
}
