import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";

import Category from "@/models/Category";

export async function PATCH(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const body = await request.json();

        if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "ترتیب دسته‌بندی‌ها ارسال نشده است",
                },
                {
                    status: 400,
                },
            );
        }

        const orderedIds = [...new Set(body.orderedIds)];

        if (
            orderedIds.length !== body.orderedIds.length ||
            orderedIds.some((id) => !mongoose.isValidObjectId(id))
        ) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه‌های دسته‌بندی معتبر نیستند",
                },
                {
                    status: 400,
                },
            );
        }

        const categoriesCount = await Category.countDocuments({
            _id: {
                $in: orderedIds,
            },
            archivedAt: null,
        });

        if (categoriesCount !== orderedIds.length) {
            return Response.json(
                {
                    success: false,
                    message: "یک یا چند دسته‌بندی پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        await Category.bulkWrite(
            orderedIds.map((categoryId, index) => ({
                updateOne: {
                    filter: {
                        _id: categoryId,
                    },

                    update: {
                        $set: {
                            displayOrder: (index + 1) * 10,
                        },
                    },
                },
            })),
        );

        return Response.json({
            success: true,
            message: "ترتیب دسته‌بندی‌ها ذخیره شد",
        });
    } catch (error) {
        console.error("REORDER CATEGORIES ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "تغییر ترتیب دسته‌بندی‌ها انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
