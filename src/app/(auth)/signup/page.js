import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
    const currentUser = await getCurrentUser();
    if (currentUser) redirect(currentUser.role === "admin" ? "/admin" : "/user");
    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
            <SignupForm />
        </div>
    );
}
