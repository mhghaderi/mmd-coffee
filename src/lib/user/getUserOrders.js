import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Order from "@/models/Order";

function first(value) { return Array.isArray(value) ? value[0] : value; }
function serialize(value) { return JSON.parse(JSON.stringify(value)); }

export default async function getUserOrders(rawSearchParams = {}) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "admin") return null;
    await connectToDB();

    const type = ["all", "cafe", "shop"].includes(first(rawSearchParams.type)) ? first(rawSearchParams.type) : "all";
    const status = String(first(rawSearchParams.status) || "all");
    const page = Math.max(Number.parseInt(first(rawSearchParams.page) || "1", 10), 1);
    const limit = 10;

    const query = { user: currentUser.id };
    if (type !== "all") query.catalogType = type;
    if (["pending","confirmed","preparing","ready","out-for-delivery","completed","cancelled"].includes(status)) query.status = status;

    const total = await Order.countDocuments(query);
    const pages = total ? Math.ceil(total / limit) : 0;
    const safePage = pages ? Math.min(page, pages) : 1;
    const orders = await Order.find(query)
        .select("orderNumber items delivery pricing payment status catalogType fulfillmentType tableNumber createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((safePage - 1) * limit)
        .limit(limit)
        .lean();

    return {
        currentUser,
        orders: orders.map((item) => serialize({
            ...item,
            context: {
                catalogType: item.catalogType || "shop",
                fulfillmentType: item.fulfillmentType || "delivery",
                tableNumber: item.tableNumber || "",
            },
        })),
        filters: { type, status },
        pagination: { page: safePage, total, pages, hasPreviousPage: safePage > 1, hasNextPage: safePage < pages },
    };
}
