import { cookies } from "next/headers";

import connectToDB from "@/lib/db/connectToDB";

import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/config";

import { signAuthToken, verifyAuthToken } from "@/lib/auth/token";

import { serializeUser } from "@/lib/auth/validation";

import User from "@/models/User";

export async function setAuthSession(user) {
    const token = signAuthToken(user);
    const cookieStore = await cookies();

    cookieStore.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        ...getAuthCookieOptions(),
    });
}

export async function clearAuthSession() {
    const cookieStore = await cookies();

    cookieStore.set({
        name: AUTH_COOKIE_NAME,
        value: "",
        ...getAuthCookieOptions(),
        maxAge: 0,
        expires: new Date(0),
    });
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

        if (!token) {
            return null;
        }

        const payload = verifyAuthToken(token);

        if (!payload?.userId) {
            return null;
        }

        await connectToDB();

        const user = await User.findById(payload.userId)
            .select(
                "name email role phone avatar isActive emailVerified lastLoginAt createdAt updatedAt",
            )
            .lean();

        if (!user || user.isActive === false) {
            return null;
        }

        return serializeUser(user);
    } catch {
        return null;
    }
}

export async function requireAuthenticatedUser() {
    const user = await getCurrentUser();

    if (!user) {
        return {
            ok: false,
            response: Response.json(
                {
                    success: false,
                    message: "برای انجام این عملیات باید وارد حساب کاربری شوید",
                },
                {
                    status: 401,
                },
            ),
        };
    }

    return {
        ok: true,
        user,
    };
}

export async function requireAdmin() {
    const authentication = await requireAuthenticatedUser();

    if (!authentication.ok) {
        return authentication;
    }

    if (authentication.user.role !== "admin") {
        return {
            ok: false,
            response: Response.json(
                {
                    success: false,
                    message: "شما اجازه انجام این عملیات را ندارید",
                },
                {
                    status: 403,
                },
            ),
        };
    }

    return authentication;
}
