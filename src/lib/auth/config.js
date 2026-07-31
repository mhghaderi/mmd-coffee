export const AUTH_COOKIE_NAME = "mmd-coffee-session";

export const JWT_ISSUER = "mmd-coffee";

export const JWT_AUDIENCE = "mmd-coffee-web";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET باید در .env.local و با حداقل ۳۲ کاراکتر تنظیم شود");
    }

    return secret;
}

export function getAuthCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    };
}
