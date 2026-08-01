import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";
import syncProductReviewStats from "@/lib/reviews/syncProductReviewStats";

import Review from "@/models/Review";

function cleanText(value, maxLength = 1500) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function PATCH(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه نظر معتبر نیست",
                },
                {
                    status: 400,
                },
            );
        }

        const review = await Review.findById(id);

        if (!review) {
            return Response.json(
                {
                    success: false,
                    message: "نظر پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const body = await request.json();
        const previousProductId = review.product.toString();

        if (Object.hasOwn(body, "status")) {
            if (!["pending", "approved", "rejected", "archived"].includes(body.status)) {
                return Response.json(
                    {
                        success: false,
                        message: "وضعیت انتخاب‌شده معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            review.status = body.status;
            review.moderatedBy = authorization.user.id;
            review.moderatedAt = new Date();

            if (body.status !== "approved") {
                review.isFeatured = false;
            }

            if (body.status !== "rejected") {
                review.rejectionReason = "";
            }
        }

        if (Object.hasOwn(body, "isFeatured")) {
            if (typeof body.isFeatured !== "boolean") {
                return Response.json(
                    {
                        success: false,
                        message: "مقدار نظر ویژه معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (body.isFeatured && review.status !== "approved") {
                return Response.json(
                    {
                        success: false,
                        message: "فقط نظر تأییدشده می‌تواند ویژه شود",
                    },
                    {
                        status: 409,
                    },
                );
            }

            review.isFeatured = body.isFeatured;
        }

        if (Object.hasOwn(body, "rejectionReason")) {
            review.rejectionReason = cleanText(body.rejectionReason, 500);
        }

        if (Object.hasOwn(body, "adminReply")) {
            const message = cleanText(body.adminReply, 1500);

            review.adminReply = {
                message,
                repliedBy: message ? authorization.user.id : null,
                repliedAt: message ? new Date() : null,
            };
        }

        await review.save();
        await syncProductReviewStats(previousProductId);

        return Response.json({
            success: true,
            message: "نظر با موفقیت به‌روزرسانی شد",
            data: review,
        });
    } catch (error) {
        console.error("UPDATE REVIEW ERROR:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: messages[0] || "اطلاعات نظر معتبر نیست",
                    errors: messages,
                },
                {
                    status: 400,
                },
            );
        }

        return Response.json(
            {
                success: false,
                message: "به‌روزرسانی نظر انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
