import { redirect } from "next/navigation";
import { FiSettings } from "react-icons/fi";

import SettingsForm from "@/components/admin/settings/SettingsForm";
import getAdminSettings from "@/lib/admin/settings/getAdminSettings";

export const dynamic = "force-dynamic";
export const metadata = { title: "تنظیمات فروشگاه" };

export default async function AdminSettingsPage() {
    const data = await getAdminSettings();

    if (!data) {
        redirect("/login?next=/admin/settings");
    }

    return (
        <div className="space-y-7">
            <section className="flex items-start gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-coffee-900 text-caramel-300">
                    <FiSettings size={23} />
                </span>

                <div>
                    <p className="text-xs font-bold text-caramel-600">پیکربندی سامانه</p>
                    <h1 className="mt-2 text-3xl font-black text-coffee-950">تنظیمات ممد کافی</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                        اطلاعات فروشگاه، سفارش‌ها، ساعات کاری، سئو و اعلان‌های مدیریتی را از یک محل کنترل کن.
                    </p>
                </div>
            </section>

            <SettingsForm initialSettings={data.settings} />
        </div>
    );
}
