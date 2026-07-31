import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return Response.json(
            {
                success: false,
                message: "کاربر وارد حساب نشده است",
                data: null,
            },
            {
                status: 401,
            },
        );
    }

    return Response.json(
        {
            success: true,
            data: user,
        },
        {
            status: 200,
        },
    );
}
