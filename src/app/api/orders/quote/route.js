import { calculateOrderQuote, OrderServiceError } from "@/lib/orders/createOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const body = await request.json();

        const quote = await calculateOrderQuote({
            payload: body,
        });

        return Response.json({
            success: true,
            data: quote,
        });
    } catch (error) {
        console.error("ORDER QUOTE ERROR:", error);

        if (error instanceof OrderServiceError) {
            return Response.json(
                {
                    success: false,
                    message: error.message,
                    code: error.code,
                },
                {
                    status: error.status,
                },
            );
        }

        return Response.json(
            {
                success: false,
                message: "محاسبه صورتحساب انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
