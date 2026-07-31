import { requireAdmin } from "@/lib/auth/session";

import { updateOrderStatus, OrderManagementError } from "@/lib/orders/manageOrder";

export async function PATCH(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        const { id } = await params;
        const body = await request.json();

        const order = await updateOrderStatus({
            identifier: id,

            nextStatus: body.status,

            adminUser: authorization.user,

            note: typeof body.note === "string" ? body.note : "",

            cancellationReason:
                typeof body.cancellationReason === "string" ? body.cancellationReason : "",
        });

        return Response.json({
            success: true,
            message: "وضعیت سفارش با موفقیت تغییر کرد",

            data: {
                id: order._id.toString(),
                orderNumber: order.orderNumber,
                status: order.status,
                inventoryRestored: order.inventoryRestored,
                salesApplied: order.salesApplied,
                updatedAt: order.updatedAt,
            },
        });
    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);

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
                message: "تغییر وضعیت سفارش انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
