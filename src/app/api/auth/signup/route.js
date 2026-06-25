import connectToDB from "@/configs/db";
import UserModel from "@/models/User";
import { generateAccessToken, hashPassword } from "@/utils/auth";
import { roles } from "@/utils/constants";

const isValidPhone = (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    const patterns = [/^09[0-9]{9}$/, /^\+989[0-9]{9}$/, /^00989[0-9]{9}$/];
    return patterns.some((pattern) => pattern.test(cleanPhone));
};

const isValidEmail = (email) => {
    if (!email) return true;
    const cleanEmail = email.trim();
    if (cleanEmail.length === 0) return true;
    const pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return pattern.test(cleanEmail);
};

const isValidName = (name) => {
    if (!name) return false;
    return name.trim().length >= 2;
};

const isValidPassword = (password) => {
    if (!password) return false;
    return password.length >= 6;
};

export async function POST(req) {
    try {
        await connectToDB();

        const body = await req.json();
        const { name, phone, email, password } = body;

        if (!isValidName(name)) {
            return Response.json({ message: "نام باید حداقل ۲ کاراکتر باشد" }, { status: 400 });
        }

        if (!isValidPhone(phone)) {
            return Response.json(
                { message: "شماره موبایل نامعتبر است (مثال: 09123456789)" },
                { status: 400 },
            );
        }

        if (email && !isValidEmail(email)) {
            return Response.json(
                { message: "ایمیل نامعتبر است (مثال: name@domain.com)" },
                { status: 400 },
            );
        }

        if (!isValidPassword(password)) {
            return Response.json(
                { message: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
                { status: 400 },
            );
        }

        const existingUser = await UserModel.findOne({
            $or: [{ name: name.trim() }, { email: email?.trim() || undefined }, { phone }],
        });

        if (existingUser) {
            return Response.json(
                { message: "نام کاربری، ایمیل یا شماره موبایل قبلاً ثبت شده است" },
                { status: 422 },
            );
        }

        const hashedPassword = await hashPassword(password);
        const accessToken = await generateAccessToken({ name: name.trim() });
        const userCount = await UserModel.countDocuments();

        const newUser = await UserModel.create({
            name: name.trim(),
            phone,
            email: email?.trim() || undefined,
            password: hashedPassword,
            role: userCount === 0 ? roles.ADMIN : roles.USER,
        });

        return Response.json(
            {
                message: "ثبت نام با موفقیت انجام شد",
                data: {
                    name: newUser.name,
                    phone: newUser.phone,
                    email: newUser.email,
                    role: newUser.role,
                },
                token: accessToken,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return Response.json({ message: "اطلاعات تکراری است" }, { status: 422 });
        }

        return Response.json({ message: "خطای داخلی سرور" }, { status: 500 });
    }
}
