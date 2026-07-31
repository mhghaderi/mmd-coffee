import { requireAdmin } from "@/lib/auth/session";

import { saveUploadedImage, UploadError } from "@/lib/uploads/saveUploadedImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        const formData = await request.formData();

        const result = await saveUploadedImage(formData.get("file"), {
            folder: "categories",
        });

        return Response.json(
            {
                success: true,
                message: "تصویر دسته‌بندی با موفقیت آپلود شد",
                data: result,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("CATEGORY UPLOAD ERROR:", error);

        return Response.json(
            {
                success: false,
                message: error instanceof UploadError ? error.message : "آپلود تصویر انجام نشد",
            },
            {
                status: error instanceof UploadError ? error.status : 500,
            },
        );
    }
}
