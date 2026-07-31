import CheckoutClient from "@/components/checkout/CheckoutClient";

import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "تکمیل سفارش",
    description: "ثبت و تکمیل سفارش در ممد کافی",
};

export default async function CheckoutPage() {
    const currentUser = await getCurrentUser();

    return <CheckoutClient currentUser={currentUser} />;
}
