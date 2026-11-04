export const AUTH_COOKIE_NAME = "mmd-coffee-session";

export const JWT_ISSUER = "mmd-coffee";

export const JWT_AUDIENCE = "mmd-coffee-web";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function getJwtSecret() {
    return process.env.JWT_SECRET || "default_jwt_secret_coffee_university_project_key_32chars";
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
