import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";
import User from "@/models/User";
import SiteSettings from "@/models/SiteSettings";

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeEmail(value) {
    return cleanText(value, 150).toLowerCase();
}

export async function GET(request) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId")?.trim() || "";
        const slug = searchParams.get("slug")?.trim().toLowerCase() || "";
        const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
        const limit = 10;

        if (!productId && !slug) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه یا اسلاگ محصول الزامی است",
                },
                {
                    status: 400,
                },
            );
        }

        const productFilter = productId && mongoose.isValidObjectId(productId)
            ? {
                  _id: productId,
              }
            : {
                  slug,
              };

        const product = await Product.findOne({
            ...productFilter,
            status: "published",
        })
            .select("_id name slug ratingAverage reviewsCount")
            .lean();

        if (!product) {
            return Response.json(
                {
                    success: false,
                    message: "محصول پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const query = {
            product: product._id,
            status: "approved",
        };

        const total = await Review.countDocuments(query);
        const pages = total === 0 ? 0 : Math.ceil(total / limit);
        const safePage = pages > 0 ? Math.min(page, pages) : 1;

        const reviews = await Review.find(query)
            .select(
                "author rating title content isVerifiedPurchase isFeatured helpfulCount adminReply createdAt",
            )
            .populate({
                path: "adminReply.repliedBy",
                select: "name avatar",
            })
            .sort({
                isFeatured: -1,
                createdAt: -1,
            })
            .skip((safePage - 1) * limit)
            .limit(limit)
            .lean();

        return Response.json({
            success: true,
            data: {
                product,
                reviews,
                pagination: {
                    page: safePage,
                    total,
                    pages,
                    hasPreviousPage: safePage > 1,
                    hasNextPage: safePage < pages,
                },
            },
        });
    } catch (error) {
        console.error("GET PUBLIC REVIEWS ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت نظرات انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request) {
    try {
        await connectToDB();

        const settings = await SiteSettings.findOne({ key: "main" })
            .select("features.reviewsEnabled")
            .lean();

        if (settings?.features?.reviewsEnabled === false) {
            return Response.json(
                {
                    success: false,
                    message: "ثبت نظر موقتاً توسط مدیریت غیرفعال شده است",
                },
                {
                    status: 503,
                },
            );
        }

        const currentUser = await getCurrentUser();
        const body = await request.json();

        const productId = cleanText(body.productId, 50);

        if (!mongoose.isValidObjectId(productId)) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه محصول معتبر نیست",
                },
                {
                    status: 400,
                },
            );
        }

        const product = await Product.findOne({
            _id: productId,
            status: "published",
            isAvailable: true,
        })
            .select("_id name")
            .lean();

        if (!product) {
            return Response.json(
                {
                    success: false,
                    message: "محصول قابل ثبت نظر پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const rating = Number(body.rating);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return Response.json(
                {
                    success: false,
                    message: "امتیاز باید عددی بین یک تا پنج باشد",
                },
                {
                    status: 400,
                },
            );
        }

        const authorName = cleanText(currentUser?.name || body.name, 80);
        const authorEmail = normalizeEmail(currentUser?.email || body.email);
        const title = cleanText(body.title, 120);
        const content = cleanText(body.content, 2000);

        if (authorName.length < 2 || content.length < 5) {
            return Response.json(
                {
                    success: false,
                    message: "نام و متن نظر را کامل وارد کن",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            currentUser &&
            (await Review.exists({
                product: product._id,
                user: currentUser.id,
                status: {
                    $in: ["pending", "approved"],
                },
            }))
        ) {
            return Response.json(
                {
                    success: false,
                    message: "برای این محصول قبلاً یک نظر فعال ثبت کرده‌ای",
                },
                {
                    status: 409,
                },
            );
        }

        let isVerifiedPurchase = false;

        if (currentUser) {
            isVerifiedPurchase = Boolean(
                await Order.exists({
                    user: currentUser.id,
                    status: {
                        $ne: "cancelled",
                    },
                    "items.product": product._id,
                }),
            );
        }

        const review = await Review.create({
            product: product._id,
            user: currentUser?.id || null,
            author: {
                name: authorName,
                email: authorEmail,
            },
            rating,
            title,
            content,
            isVerifiedPurchase,
            status: "pending",
        });

        return Response.json(
            {
                success: true,
                message: "نظر ثبت شد و پس از بررسی مدیر نمایش داده می‌شود",
                data: {
                    _id: review._id,
                    status: review.status,
                    createdAt: review.createdAt,
                },
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: messages[0] || "اطلاعات نظر معتبر نیست",
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
                message: "ثبت نظر انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
