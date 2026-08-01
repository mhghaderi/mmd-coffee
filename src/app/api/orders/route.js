import { getCurrentUser } from "@/lib/auth/session";
import { createOrder, OrderServiceError } from "@/lib/orders/createOrder";

export async function POST(request) {
    try {
        const payload = await request.json();
        const currentUser = await getCurrentUser();
        const order = await createOrder({ payload, currentUser });

        return Response.json(
            {
                success: true,
                message: "سفارش با موفقیت ثبت شد",
                data: {
                    id: order._id?.toString(),
                    orderNumber: order.orderNumber,
                    status: order.status,
                    pricing: order.pricing,
                    orderContext: order._mmdOrderContext || null,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("CREATE ORDER API ERROR:", error);
        if (error instanceof OrderServiceError) {
            return Response.json(
                { success: false, message: error.message, code: error.code },
                { status: error.status || 400 },
            );
        }
        return Response.json(
            { success: false, message: "ثبت سفارش انجام نشد" },
            { status: 500 },
        );
    }
}
