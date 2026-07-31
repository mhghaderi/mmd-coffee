import bcrypt from "bcryptjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateEmail(email) {
    if (!email) {
        return "ایمیل الزامی است";
    }

    if (!emailPattern.test(email)) {
        return "فرمت ایمیل معتبر نیست";
    }

    return null;
}

export function validatePassword(password) {
    if (typeof password !== "string") {
        return "رمز عبور الزامی است";
    }

    if (password.length < 8) {
        return "رمز عبور باید حداقل ۸ کاراکتر باشد";
    }

    if (bcrypt.truncates(password)) {
        return "رمز عبور بیش‌ازحد طولانی است";
    }

    if (!/\p{L}/u.test(password)) {
        return "رمز عبور باید حداقل یک حرف داشته باشد";
    }

    if (!/\p{N}/u.test(password)) {
        return "رمز عبور باید حداقل یک عدد داشته باشد";
    }

    return null;
}

export function serializeUser(user) {
    const userObject = typeof user?.toObject === "function" ? user.toObject() : user;

    return {
        id: userObject._id.toString(),
        name: userObject.name,
        email: userObject.email,
        role: userObject.role,
        phone: userObject.phone || "",
        avatar: userObject.avatar || "",
        isActive: userObject.isActive,
        emailVerified: userObject.emailVerified,
        lastLoginAt: userObject.lastLoginAt,
        createdAt: userObject.createdAt,
        updatedAt: userObject.updatedAt,
    };
}
