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

function normalizePhone(value) {
    return typeof value === "string" ? value.replace(/[\s\-()]/g, "").trim() : "";
}

function validatePhone(phone) {
    if (!phone) return null;

    if (phone.length > 20) {
        return "شماره تماس معتبر نیست";
    }

    if (!/^\+?\d{7,15}$/.test(phone)) {
        return "شماره تماس معتبر نیست";
    }

    return null;
}

export async function POST(request) {
    try {
        await connectToDB();

        let body;
        try {
            body = await request.json();
        } catch {
            return Response.json(
                { success: false, message: "اطلاعات ارسال‌شده معتبر نیست" },
                { status: 400 },
            );
        }

        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const email = normalizeEmail(body?.email);
        const phone = normalizePhone(body?.phone);
        const password = typeof body?.password === "string" ? body.password : "";

        const confirmPassword =
            typeof body?.confirmPassword === "string" ? body.confirmPassword : password;

        if (name.length < 2) {
            return Response.json(
                { success: false, message: "نام باید حداقل ۲ کاراکتر باشد" },
                { status: 400 },
            );
        }

        const emailError = validateEmail(email);
        if (emailError) {
            return Response.json(
                { success: false, message: emailError },
                { status: 400 },
            );
        }

        const phoneError = validatePhone(phone);
        if (phoneError) {
            return Response.json(
                { success: false, message: phoneError },
                { status: 400 },
            );
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return Response.json(
                { success: false, message: passwordError },
                { status: 400 },
            );
        }

        if (password !== confirmPassword) {
            return Response.json(
                { success: false, message: "رمز عبور و تکرار آن یکسان نیستند" },
                { status: 400 },
            );
        }

        const existingUser = await User.exists({ email });
        if (existingUser) {
            return Response.json(
                { success: false, message: "قبلاً با این ایمیل ثبت‌نام شده است" },
                { status: 409 },
            );
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: "user",
            isActive: true,
        });

        let sessionCreated = true;
        try {
            await setAuthSession(user);
        } catch (sessionError) {
            
            console.error("REGISTER SESSION ERROR:", sessionError);
            sessionCreated = false;
        }

        return Response.json(
            {
                success: true,
                message: sessionCreated
                    ? "ثبت‌نام با موفقیت انجام شد"
                    : "حساب ساخته شد؛ لطفاً وارد حساب کاربری شوید",
                data: serializeUser(user),
                sessionCreated,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        if (error?.code === 11000) {
            return Response.json(
                { success: false, message: "قبلاً با این ایمیل ثبت‌نام شده است" },
                { status: 409 },
            );
        }

        if (error?.name === "ValidationError") {
            const errors = Object.values(error.errors || {}).map((item) => item.message);
            return Response.json(
                {
                    success: false,
                    message: errors[0] || "اطلاعات ثبت‌نام معتبر نیست",
                    errors,
                },
                { status: 400 },
            );
        }

        return Response.json(
            { success: false, message: "ثبت‌نام انجام نشد؛ دوباره تلاش کنید" },
            { status: 500 },
        );
    }
}
