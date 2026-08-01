import { getCurrentUser } from "@/lib/auth/session";
import UserProfileForm from "@/components/user/UserProfileForm";

export default async function UserProfilePage() {
    const user = await getCurrentUser();
    return <div><p className="text-xs font-bold text-caramel-600">تنظیمات حساب</p><h1 className="mt-2 text-3xl font-black text-coffee-950">پروفایل من</h1><p className="mt-2 text-sm text-coffee-500">اطلاعات پایه حساب مشتری را ویرایش کن.</p><div className="mt-6"><UserProfileForm user={user} /></div></div>;
}
