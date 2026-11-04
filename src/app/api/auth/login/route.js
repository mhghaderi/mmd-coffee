import connectToDB from "@/lib/db/connectToDB";

import { setAuthSession } from "@/lib/auth/session";

import { normalizeEmail, serializeUser } from "@/lib/auth/validation";

import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request) {
    try {
        await connectToDB();

        let body;
        try {
            body = await request.json();
        } catch {
            return Response.json(
                {
                    success: false,
                    message: "اطلاعات ورود معتبر نیست",
                },
                { status: 400 },
            );
        }

        const email = normalizeEmail(body?.email);

        const password = typeof body?.password === "string" ? body.password : "";

        if (!email || !password) {
            return Response.json(
                {
                    success: false,
                    message: "ایمیل و رمز عبور الزامی هستند",
                },
                {
                    status: 400,
                },
            );
        }

        const user = await User.findOne({
            email,
        }).select("+password");

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "ایمیل یا رمز عبور صحیح نیست",
                },
                {
                    status: 401,
                },
            );
        }

        const passwordIsCorrect = await user.comparePassword(password);

        if (!passwordIsCorrect) {
            return Response.json(
                {
                    success: false,
                    message: "ایمیل یا رمز عبور صحیح نیست",
                },
                {
                    status: 401,
                },
            );
        }

        if (!user.isActive) {
            return Response.json(
                {
                    success: false,
                    message: "حساب کاربری شما غیرفعال شده است",
                },
                {
                    status: 403,
                },
            );
        }

        user.lastLoginAt = new Date();

        await user.save();

        await setAuthSession(user);

        return Response.json(
            {
                success: true,
                message: "ورود با موفقیت انجام شد",
                data: serializeUser(user),
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "ورود انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
