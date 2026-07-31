import connectToDB from "@/lib/db/connectToDB";

import {
    normalizeEmail,
    serializeUser,
    validateEmail,
    validatePassword,
} from "@/lib/auth/validation";

import { setAuthSession } from "@/lib/auth/session";

import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request) {
    try {
        const configuredSetupSecret = process.env.ADMIN_SETUP_SECRET;

        const receivedSetupSecret = request.headers.get("x-setup-secret");

        if (!configuredSetupSecret || receivedSetupSecret !== configuredSetupSecret) {
            return Response.json(
                {
                    success: false,
                    message: "دسترسی به ساخت ادمین مجاز نیست",
                },
                {
                    status: 403,
                },
            );
        }

        await connectToDB();

        const existingAdmin = await User.exists({
            role: "admin",
        });

        if (existingAdmin) {
            return Response.json(
                {
                    success: false,
                    message: "ادمین اصلی قبلاً ساخته شده است",
                },
                {
                    status: 409,
                },
            );
        }

        const body = await request.json();

        const name = typeof body.name === "string" ? body.name.trim() : "";

        const email = normalizeEmail(body.email);
        const password = body.password;
        const confirmPassword = body.confirmPassword;

        if (name.length < 2) {
            return Response.json(
                {
                    success: false,
                    message: "نام ادمین باید حداقل ۲ کاراکتر باشد",
                },
                {
                    status: 400,
                },
            );
        }

        const emailError = validateEmail(email);

        if (emailError) {
            return Response.json(
                {
                    success: false,
                    message: emailError,
                },
                {
                    status: 400,
                },
            );
        }

        const passwordError = validatePassword(password);

        if (passwordError) {
            return Response.json(
                {
                    success: false,
                    message: passwordError,
                },
                {
                    status: 400,
                },
            );
        }

        if (password !== confirmPassword) {
            return Response.json(
                {
                    success: false,
                    message: "رمز عبور و تکرار آن یکسان نیستند",
                },
                {
                    status: 400,
                },
            );
        }

        const existingUser = await User.exists({
            email,
        });

        if (existingUser) {
            return Response.json(
                {
                    success: false,
                    message: "کاربری با این ایمیل وجود دارد",
                },
                {
                    status: 409,
                },
            );
        }

        const admin = await User.create({
            name,
            email,
            password,
            role: "admin",
            isActive: true,
            emailVerified: true,
        });

        await setAuthSession(admin);

        return Response.json(
            {
                success: true,
                message: "ادمین اصلی با موفقیت ساخته شد",
                data: serializeUser(admin),
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("SETUP ADMIN ERROR:", error);

        if (error.code === 11000) {
            return Response.json(
                {
                    success: false,
                    message: "کاربری با این ایمیل وجود دارد",
                },
                {
                    status: 409,
                },
            );
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: errors[0] || "اطلاعات ادمین معتبر نیست",
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
                message: "ساخت ادمین با خطا مواجه شد",
            },
            {
                status: 500,
            },
        );
    }
}
