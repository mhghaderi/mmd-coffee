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
    if (typeof password !== "string" || !password) {
        return "رمز عبور الزامی است";
    }

    if (password.length < 4) {
        return "رمز عبور باید حداقل ۴ کاراکتر باشد";
    }

    return null;
}

export function serializeUser(user) {
    const userObject = typeof user?.toObject === "function" ? user.toObject() : user;

    return {
        id: (userObject._id || userObject.id).toString(),
        name: userObject.name,
        email: userObject.email,
        role: userObject.role || "user",
        phone: userObject.phone || "",
        avatar: userObject.avatar || "",
        isActive: userObject.isActive !== false,
        emailVerified: Boolean(userObject.emailVerified),
        lastLoginAt: userObject.lastLoginAt ? new Date(userObject.lastLoginAt).toISOString() : null,
        createdAt: userObject.createdAt ? new Date(userObject.createdAt).toISOString() : null,
        updatedAt: userObject.updatedAt ? new Date(userObject.updatedAt).toISOString() : null,
    };
}
