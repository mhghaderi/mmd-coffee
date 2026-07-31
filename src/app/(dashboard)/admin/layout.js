import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/layout/AdminShell";

import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
    title: {
        default: "پنل مدیریت",
        template: "%s | پنل مدیریت ممد کافی",
    },

    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminLayout({ children }) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect("/login?next=/admin");
    }

    if (currentUser.role !== "admin") {
        redirect("/");
    }

    return <AdminShell user={currentUser}>{children}</AdminShell>;
}
