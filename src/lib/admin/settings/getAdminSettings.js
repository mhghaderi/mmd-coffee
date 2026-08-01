import { getCurrentUser } from "@/lib/auth/session";
import getSiteSettings from "@/lib/settings/getSiteSettings";

export default async function getAdminSettings() {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
        return null;
    }

    const settings = await getSiteSettings();

    return {
        currentUser,
        settings,
    };
}
