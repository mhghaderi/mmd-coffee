"use client";

import { useCallback, useEffect, useState } from "react";

function extractUser(payload) {
    if (!payload || typeof payload !== "object") return null;
    return payload.user || payload.data?.user || payload.data || null;
}

export default function useCurrentUser() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                setUser(null);
                return null;
            }

            const payload = await response.json();
            const nextUser = extractUser(payload);
            setUser(nextUser && nextUser.id !== undefined ? nextUser : nextUser?._id ? { ...nextUser, id: nextUser._id } : nextUser);
            return nextUser;
        } catch {
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();

        const handleAuthChanged = () => {
            refresh();
        };

        window.addEventListener("mmd-auth-changed", handleAuthChanged);

        return () => {
            window.removeEventListener("mmd-auth-changed", handleAuthChanged);
        };
    }, [refresh]);

    return { user, isLoading, refresh, setUser };
}
