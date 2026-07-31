import { requireAdmin } from "@/lib/auth/session";

import { updateOrderPayment, OrderManagementError } from "@/lib/orders/manageOrder";

export async function PATCH(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        const { id } = await params;
        const body = await request.json();

        const order = await updateOrderPayment({
            identifier: id,

            nextStatus: body.status,

            adminUser: authorization.user,

            note: typeof body.note === "string" ? body.note : "",

            transactionId: typeof body.transactionId === "string" ? body.transactionId : "",
        });

        return Response.json({
            success: true,
            message: "وضعیت پرداخت با موفقیت تغییر کرد",

            data: {
                id: order._id.toString(),
                orderNumber: order.orderNumber,
                payment: order.payment,
                updatedAt: order.updatedAt,
            },
        });
    } catch (error) {
        console.error("UPDATE ORDER PAYMENT ERROR:", error);

        if (error instanceof OrderManagementError) {
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
                message: "تغییر وضعیت پرداخت انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
