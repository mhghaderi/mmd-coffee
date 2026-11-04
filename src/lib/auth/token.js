import jwt from "jsonwebtoken";

import { JWT_AUDIENCE, JWT_ISSUER, SESSION_MAX_AGE, getJwtSecret } from "@/lib/auth/config";

export function signAuthToken(user) {
    const userId = user._id ? user._id.toString() : user.id;

    return jwt.sign(
        {
            sub: userId,
            userId: userId,
            role: user.role || "user",
            name: user.name,
            email: user.email,
        },
        getJwtSecret(),
        {
            algorithm: "HS256",
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            expiresIn: SESSION_MAX_AGE,
        },
    );
}

export function verifyAuthToken(token) {
    try {
        const payload = jwt.verify(token, getJwtSecret(), {
            algorithms: ["HS256"],
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        });

        if (typeof payload === "string" || (!payload.sub && !payload.userId)) {
            return null;
        }

        return {
            userId: payload.userId || payload.sub,
            role: payload.role,
            name: payload.name,
            email: payload.email,
        };
    } catch {
        return null;
    }
}
