import { requireAdmin } from "@/lib/auth/session";
import { saveUploadedImage, UploadError } from "@/lib/uploads/saveUploadedImage";

export async function POST(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        const formData = await request.formData();
        const file = formData.get("image");

        const result = await saveUploadedImage(file, {
            folder: "articles",
        });

        return Response.json(
            {
                success: true,
                message: "تصویر مقاله با موفقیت آپلود شد",
                data: result,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("UPLOAD ARTICLE IMAGE ERROR:", error);

        if (error instanceof UploadError) {
            return Response.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: error.status,
                },
            );
        }

        return Response.json(
            {
                success: false,
                message: "آپلود تصویر مقاله انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
