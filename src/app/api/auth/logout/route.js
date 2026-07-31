import { clearAuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
    await clearAuthSession();

    return Response.json(
        {
            success: true,
            message: "با موفقیت از حساب خارج شدید",
        },
        {
            status: 200,
        },
    );
}
