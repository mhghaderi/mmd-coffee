import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";

import User from "@/models/User";

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function serializeUser(user) {
    return {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
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
                    message: "شناسه کاربر معتبر نیست",
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const user = await User.findById(id);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "کاربر پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const isCurrentAdmin = user._id.toString() === authorization.user.id;

        const nextName = Object.hasOwn(body, "name") ? cleanText(body.name, 80) : user.name;
        const nextPhone = Object.hasOwn(body, "phone") ? cleanText(body.phone, 20) : user.phone;
        const nextRole = Object.hasOwn(body, "role") ? body.role : user.role;
        const nextIsActive = Object.hasOwn(body, "isActive") ? body.isActive : user.isActive;
        const nextEmailVerified = Object.hasOwn(body, "emailVerified")
            ? body.emailVerified
            : user.emailVerified;

        if (nextName.length < 2) {
            return Response.json(
                {
                    success: false,
                    message: "نام کاربر باید حداقل ۲ کاراکتر باشد",
                },
                {
                    status: 400,
                },
            );
        }

        if (!["user", "admin"].includes(nextRole)) {
            return Response.json(
                {
                    success: false,
                    message: "نقش انتخاب‌شده معتبر نیست",
                },
                {
                    status: 400,
                },
            );
        }

        if (typeof nextIsActive !== "boolean" || typeof nextEmailVerified !== "boolean") {
            return Response.json(
                {
                    success: false,
                    message: "مقادیر وضعیت کاربر معتبر نیست",
                },
                {
                    status: 400,
                },
            );
        }

        if (isCurrentAdmin && nextRole !== "admin") {
            return Response.json(
                {
                    success: false,
                    message: "نمی‌توانی نقش حساب مدیریتی فعلی خودت را تغییر بدهی",
                },
                {
                    status: 409,
                },
            );
        }

        if (isCurrentAdmin && nextIsActive === false) {
            return Response.json(
                {
                    success: false,
                    message: "نمی‌توانی حساب مدیریتی فعلی خودت را غیرفعال کنی",
                },
                {
                    status: 409,
                },
            );
        }

        const removesAnActiveAdmin =
            user.role === "admin" &&
            user.isActive === true &&
            (nextRole !== "admin" || nextIsActive === false);

        if (removesAnActiveAdmin) {
            const otherActiveAdmins = await User.countDocuments({
                _id: {
                    $ne: user._id,
                },
                role: "admin",
                isActive: true,
            });

            if (otherActiveAdmins === 0) {
                return Response.json(
                    {
                        success: false,
                        message: "آخرین مدیر فعال سامانه را نمی‌توان غیرفعال یا به کاربر عادی تبدیل کرد",
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        const sessionCriticalChange =
            user.role !== nextRole || user.isActive !== nextIsActive;

        user.name = nextName;
        user.phone = nextPhone;
        user.role = nextRole;
        user.isActive = nextIsActive;
        user.emailVerified = nextEmailVerified;

        if (sessionCriticalChange) {
            user.tokenVersion += 1;
        }

        await user.save();

        return Response.json({
            success: true,
            message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد",
            data: serializeUser(user),
        });
    } catch (error) {
        console.error("UPDATE ADMIN USER ERROR:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: messages[0] || "اطلاعات کاربر معتبر نیست",
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
                message: "به‌روزرسانی کاربر انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
