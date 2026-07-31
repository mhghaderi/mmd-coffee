import connectToDB from "@/lib/db/connectToDB";

import { setAuthSession } from "@/lib/auth/session";

import {
    normalizeEmail,
    serializeUser,
    validateEmail,
    validatePassword,
} from "@/lib/auth/validation";

import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request) {
    try {
        await connectToDB();

        const body = await request.json();

        const name = typeof body.name === "string" ? body.name.trim() : "";

        const email = normalizeEmail(body.email);

        const password = body.password;
        const confirmPassword = body.confirmPassword;

        if (name.length < 2) {
            return Response.json(
                {
                    success: false,
                    message: "نام باید حداقل ۲ کاراکتر باشد",
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
                    message: "قبلاً با این ایمیل ثبت‌نام شده است",
                },
                {
                    status: 409,
                },
            );
        }

        /*
      role از Body خوانده نمی‌شود.
      ثبت‌نام عمومی همیشه user می‌سازد.
    */

        const user = await User.create({
            name,
            email,
            password,
            role: "user",
        });

        await setAuthSession(user);

        return Response.json(
            {
                success: true,
                message: "ثبت‌نام با موفقیت انجام شد",
                data: serializeUser(user),
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        if (error.code === 11000) {
            return Response.json(
                {
                    success: false,
                    message: "قبلاً با این ایمیل ثبت‌نام شده است",
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
                    message: errors[0] || "اطلاعات ثبت‌نام معتبر نیست",
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
                message: "ثبت‌نام انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
