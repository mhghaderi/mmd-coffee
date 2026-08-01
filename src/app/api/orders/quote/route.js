import { calculateOrderQuote, OrderServiceError } from "@/lib/orders/createOrder";

export async function POST(request) {
    try {
        const payload = await request.json();
        const quote = await calculateOrderQuote({ payload });
        return Response.json({ success: true, data: quote });
    } catch (error) {
        console.error("ORDER QUOTE API ERROR:", error);
        if (error instanceof OrderServiceError) {
            return Response.json(
                { success: false, message: error.message, code: error.code },
                { status: error.status || 400 },
            );
        }
        return Response.json({ success: false, message: "محاسبه سفارش انجام نشد" }, { status: 500 });
    }
}
