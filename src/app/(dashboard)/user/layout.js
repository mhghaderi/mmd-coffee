import { redirect } from "next/navigation";
import UserSidebar from "@/components/user/UserSidebar";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect("/login?next=/user");
    }

    return (
        <main className="page-container py-8 sm:py-10">
            <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
                <UserSidebar user={currentUser} />
                <div className="min-w-0">{children}</div>
            </div>
        </main>
    );
}
