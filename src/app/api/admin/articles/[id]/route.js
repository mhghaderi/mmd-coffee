import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";

import Article from "@/models/Article";

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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

function createArticleFilter(identifier) {
    if (mongoose.isValidObjectId(identifier)) {
        return {
            _id: identifier,
        };
    }

    return {
        slug: identifier.trim().toLowerCase(),
    };
}

export async function PATCH(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const { id } = await params;
        const article = await Article.findOne(createArticleFilter(id));

        if (!article) {
            return Response.json(
                {
                    success: false,
                    message: "مقاله پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const body = await request.json();

        if (Object.hasOwn(body, "title")) {
            article.title = cleanText(body.title, 160);
        }

        if (Object.hasOwn(body, "slug")) {
            const slug = cleanText(body.slug, 160).toLowerCase();

            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
                return Response.json(
                    {
                        success: false,
                        message: "اسلاگ مقاله معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (
                await Article.exists({
                    _id: {
                        $ne: article._id,
                    },
                    slug,
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

            article.slug = slug;
        }

        if (Object.hasOwn(body, "excerpt")) {
            article.excerpt = cleanText(body.excerpt, 320);
        }

        if (Object.hasOwn(body, "content")) {
            article.content = cleanText(body.content, 50000);
        }

        if (Object.hasOwn(body, "coverImage")) {
            article.coverImage = cleanText(body.coverImage, 500);
        }

        if (Object.hasOwn(body, "coverImageAlt")) {
            article.coverImageAlt = cleanText(body.coverImageAlt, 180);
        }

        if (Object.hasOwn(body, "tags")) {
            article.tags = normalizeTags(body.tags);
        }

        if (Object.hasOwn(body, "readingTime")) {
            article.readingTime = Number.parseInt(body.readingTime, 10);
        }

        if (Object.hasOwn(body, "isFeatured")) {
            article.isFeatured = body.isFeatured === true;
        }

        if (Object.hasOwn(body, "seoTitle")) {
            article.seoTitle = cleanText(body.seoTitle, 70);
        }

        if (Object.hasOwn(body, "seoDescription")) {
            article.seoDescription = cleanText(body.seoDescription, 180);
        }

        if (Object.hasOwn(body, "status")) {
            if (!["draft", "published"].includes(body.status)) {
                return Response.json(
                    {
                        success: false,
                        message: "وضعیت مقاله معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            const previousStatus = article.status;
            article.status = body.status;

            if (body.status === "published") {
                article.archivedAt = null;

                if (previousStatus !== "published" || !article.publishedAt) {
                    article.publishedAt = new Date();
                }
            }

            if (body.status === "draft") {
                article.archivedAt = null;
            }

        }

        await article.save();

        return Response.json({
            success: true,
            message: "مقاله با موفقیت ویرایش شد",
            data: article,
        });
    } catch (error) {
        console.error("UPDATE ARTICLE ERROR:", error);

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
                message: "ویرایش مقاله انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const { id } = await params;
        const article = await Article.findOneAndDelete(createArticleFilter(id));

        if (!article) {
            return Response.json(
                {
                    success: false,
                    message: "مقاله پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        return Response.json({
            success: true,
            message: "مقاله با موفقیت حذف شد",
        });
    } catch (error) {
        console.error("DELETE ARTICLE ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "حذف مقاله انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
