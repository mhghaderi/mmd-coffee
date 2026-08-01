import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";
import Order from "@/models/Order";
import OrderContext from "@/models/OrderContext";

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

    let orderIds = null;
    if (type !== "all") {
        const contexts = await OrderContext.find({ catalogType: type, user: currentUser.id }).select("order").lean();
        orderIds = contexts.map((item) => item.order);
    }

    const query = { user: currentUser.id };
    if (orderIds) query._id = { $in: orderIds };
    if (["pending","confirmed","preparing","ready","out-for-delivery","completed","cancelled"].includes(status)) query.status = status;

    const total = await Order.countDocuments(query);
    const pages = total ? Math.ceil(total / limit) : 0;
    const safePage = pages ? Math.min(page, pages) : 1;
    const orders = await Order.find(query)
        .select("orderNumber items delivery pricing payment status createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((safePage - 1) * limit)
        .limit(limit)
        .lean();

    const contexts = orders.length ? await OrderContext.find({ order: { $in: orders.map((item) => item._id) } }).lean() : [];
    const contextMap = new Map(contexts.map((item) => [String(item.order), item]));

    return {
        currentUser,
        orders: orders.map((item) => serialize({ ...item, context: contextMap.get(String(item._id)) || null })),
        filters: { type, status },
        pagination: { page: safePage, total, pages, hasPreviousPage: safePage > 1, hasNextPage: safePage < pages },
    };
}
