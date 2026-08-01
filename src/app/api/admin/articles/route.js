import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";

import Article from "@/models/Article";

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeSlug(value) {
    return cleanText(value, 160).toLowerCase();
}

function normalizeTags(value) {
    const source = Array.isArray(value)
        ? value
        : typeof value === "string"
          ? value.split(",")
          : [];

    return [
        ...new Set(
            source
                .map((item) => cleanText(item, 40).toLowerCase())
                .filter(Boolean),
        ),
    ].slice(0, 12);
}

function createArticlePayload(body, currentUser) {
    const status = ["draft", "published", "archived"].includes(body.status)
        ? body.status
        : "draft";

    const readingTime = Number.parseInt(body.readingTime || "5", 10);

    return {
        title: cleanText(body.title, 160),
        slug: normalizeSlug(body.slug),
        excerpt: cleanText(body.excerpt, 320),
        content: cleanText(body.content, 50000),
        coverImage: cleanText(body.coverImage, 500),
        coverImageAlt: cleanText(body.coverImageAlt, 180),
        author: currentUser.id,
        status,
        tags: normalizeTags(body.tags),
        readingTime: Number.isInteger(readingTime) ? readingTime : 5,
        isFeatured: body.isFeatured === true,
        seoTitle: cleanText(body.seoTitle, 70),
        seoDescription: cleanText(body.seoDescription, 180),
        publishedAt: status === "published" ? new Date() : null,
        archivedAt: status === "archived" ? new Date() : null,
    };
}

export async function POST(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const body = await request.json();
        const payload = createArticlePayload(body, authorization.user);

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
            return Response.json(
                {
                    success: false,
                    message: "اسلاگ مقاله فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            await Article.exists({
                slug: payload.slug,
            })
        ) {
            return Response.json(
                {
                    success: false,
                    message: "مقاله‌ای با این اسلاگ قبلاً ثبت شده است",
                },
                {
                    status: 409,
                },
            );
        }

        const article = await Article.create(payload);

        return Response.json(
            {
                success: true,
                message: "مقاله با موفقیت ثبت شد",
                data: article,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("CREATE ARTICLE ERROR:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: messages[0] || "اطلاعات مقاله معتبر نیست",
                    errors: messages,
                },
                {
                    status: 400,
                },
            );
        }

        return Response.json(
            {
                success: false,
                message: "ثبت مقاله انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
