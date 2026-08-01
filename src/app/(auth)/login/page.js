import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
    const currentUser = await getCurrentUser();
    if (currentUser) redirect(currentUser.role === "admin" ? "/admin" : "/user");
    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
            <LoginForm />
        </div>
    );
}
