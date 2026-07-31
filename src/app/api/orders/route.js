import connectToDB from "@/lib/db/connectToDB";

import {
  getCurrentUser,
  requireAuthenticatedUser,
} from "@/lib/auth/session";

import {
  createOrder,
  OrderServiceError,
} from "@/lib/orders/createOrder";

import {
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
} from "@/constants/order";

import Order from "@/models/Order";

function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

/*
  POST /api/orders

  ثبت سفارش برای کاربر عضو یا مهمان
*/

export async function POST(request) {
  try {
    const body = await request.json();

    const currentUser =
      await getCurrentUser();

    const order = await createOrder({
      payload: body,
      currentUser,
    });

    return Response.json(
      {
        success: true,

        message:
          "سفارش با موفقیت ثبت شد",

        data: {
          id: order._id.toString(),

          orderNumber:
            order.orderNumber,

          status: order.status,

          payment: order.payment,

          pricing: order.pricing,

          createdAt: order.createdAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error,
    );

    if (
      error instanceof
      OrderServiceError
    ) {
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

    if (error.name === "ValidationError") {
      const errors = Object.values(
        error.errors,
      ).map((item) => item.message);

      return Response.json(
        {
          success: false,

          message:
            errors[0] ||
            "اطلاعات سفارش معتبر نیست",

          errors,
        },
        {
          status: 400,
        },
      );
    }

    return Response.json(
      {
        success: false,
        message:
          "ثبت سفارش انجام نشد",
      },
      {
        status: 500,
      },
    );
  }
}

/*
  GET /api/orders

  کاربر عادی فقط سفارش‌های خودش را می‌بیند.
  ادمین همه سفارش‌ها را می‌بیند.
*/

export async function GET(request) {
  const authentication =
    await requireAuthenticatedUser();

  if (!authentication.ok) {
    return authentication.response;
  }

  try {
    await connectToDB();

    const { user } = authentication;

    const { searchParams } = new URL(
      request.url,
    );

    const page = Math.max(
      Number.parseInt(
        searchParams.get("page") || "1",
        10,
      ),
      1,
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          searchParams.get("limit") ||
            "10",
          10,
        ),
        1,
      ),
      50,
    );

    const filter =
      user.role === "admin"
        ? {}
        : {
            user: user.id,
          };

    if (user.role === "admin") {
      const status =
        searchParams.get("status");

      const paymentStatus =
        searchParams.get(
          "paymentStatus",
        );

      const q =
        searchParams
          .get("q")
          ?.trim() || "";

      if (
        ORDER_STATUS_VALUES.includes(
          status,
        )
      ) {
        filter.status = status;
      }

      if (
        PAYMENT_STATUS_VALUES.includes(
          paymentStatus,
        )
      ) {
        filter["payment.status"] =
          paymentStatus;
      }

      if (q) {
        const regex = new RegExp(
          escapeRegExp(q),
          "i",
        );

        filter.$or = [
          {
            orderNumber: regex,
          },
          {
            "customer.fullName": regex,
          },
          {
            "customer.phone": regex,
          },
          {
            "customer.email": regex,
          },
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] =
      await Promise.all([
        Order.find(filter)
          .select(
            "orderNumber user customer items delivery pricing payment status createdAt updatedAt",
          )
          .populate({
            path: "user",
            select: "name email",
          })
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Order.countDocuments(filter),
      ]);

    const pages =
      total === 0
        ? 0
        : Math.ceil(total / limit);

    return Response.json({
      success: true,
      data: orders,

      pagination: {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "دریافت سفارش‌ها انجام نشد",
      },
      {
        status: 500,
      },
    );
  }
}