import { Suspense } from "react";

import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";

import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "ورود به حساب",
    description: "ورود به حساب کاربری ممد کافی",
};

function LoginFormLoading() {
    return (
        <div className="h-[650px] w-full max-w-5xl animate-pulse rounded-[2rem] bg-white shadow-xl" />
    );
}

export default async function LoginPage() {
    const currentUser = await getCurrentUser();

    if (currentUser?.role === "admin") {
        redirect("/admin");
    }

    if (currentUser) {
        redirect("/");
    }

    return (
        <Suspense fallback={<LoginFormLoading />}>
            <LoginForm />
        </Suspense>
    );
}
