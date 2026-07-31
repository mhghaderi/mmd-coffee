import jwt from "jsonwebtoken";

import { JWT_AUDIENCE, JWT_ISSUER, SESSION_MAX_AGE, getJwtSecret } from "@/lib/auth/config";

export function signAuthToken(user) {
    return jwt.sign(
        {
            role: user.role,
            tokenVersion: user.tokenVersion || 0,
        },
        getJwtSecret(),
        {
            algorithm: "HS256",
            subject: user._id.toString(),
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            expiresIn: SESSION_MAX_AGE,
        },
    );
}

export function verifyAuthToken(token) {
    const payload = jwt.verify(token, getJwtSecret(), {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });

    if (typeof payload === "string" || !payload.sub) {
        throw new Error("توکن احراز هویت معتبر نیست");
    }

    return {
        userId: payload.sub,
        tokenVersion: Number(payload.tokenVersion || 0),
    };
}
