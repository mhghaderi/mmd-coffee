import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";

import { getCurrentUser, requireAdmin } from "@/lib/auth/session";

import Category from "@/models/Category";
import Product from "@/models/Product";

function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function createCategoryFilter(identifier) {
    if (mongoose.isValidObjectId(identifier)) {
        return {
            _id: identifier,
        };
    }

    return {
        slug: identifier.trim().toLowerCase(),
    };
}

function createErrorResponse(error, message) {
    console.error(message, error);

    if (error.code === 11000) {
        return Response.json(
            {
                success: false,
                message: "دسته‌بندی با این اسلاگ قبلاً ثبت شده است",
            },
            {
                status: 409,
            },
        );
    }

    if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((item) => item.message);

        return Response.json(
            {
                success: false,
                message: errors[0] || "اطلاعات دسته‌بندی معتبر نیست",
                errors,
            },
            {
                status: 400,
            },
        );
    }

    return Response.json(
        {
            success: false,
            message,
        },
        {
            status: 500,
        },
    );
}

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        const currentUser = await getCurrentUser();

        const filter = createCategoryFilter(id);

        if (currentUser?.role !== "admin") {
            filter.archivedAt = null;
            filter.isActive = true;
        }

        const category = await Category.findOne(filter).lean();

        if (!category) {
            return Response.json(
                {
                    success: false,
                    message: "دسته‌بندی پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const productCount = await Product.countDocuments({
            category: category._id,
        });

        return Response.json({
            success: true,

            data: {
                ...category,
                _id: category._id.toString(),
                productCount,
            },
        });
    } catch (error) {
        return createErrorResponse(error, "دریافت دسته‌بندی انجام نشد");
    }
}

export async function PATCH(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const { id } = await params;

        const category = await Category.findOne(createCategoryFilter(id));

        if (!category) {
            return Response.json(
                {
                    success: false,
                    message: "دسته‌بندی پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const body = await request.json();

        if (body.restore === true) {
            category.archivedAt = null;
            category.isActive = true;

            await category.save();

            return Response.json({
                success: true,
                message: "دسته‌بندی با موفقیت بازیابی شد",
                data: category,
            });
        }

        const update = {};

        const stringFields = [
            "title",
            "slug",
            "description",
            "image",
            "imageAlt",
            "accentColor",
            "seoTitle",
            "seoDescription",
        ];

        for (const field of stringFields) {
            if (!hasOwn(body, field)) {
                continue;
            }

            if (typeof body[field] !== "string") {
                return Response.json(
                    {
                        success: false,
                        message: `${field} باید متنی باشد`,
                    },
                    {
                        status: 400,
                    },
                );
            }

            update[field] = body[field].trim();
        }

        if (hasOwn(update, "slug")) {
            update.slug = update.slug.toLowerCase();

            const duplicateCategory = await Category.exists({
                _id: {
                    $ne: category._id,
                },
                slug: update.slug,
            });

            if (duplicateCategory) {
                return Response.json(
                    {
                        success: false,
                        message: "دسته‌بندی با این اسلاگ قبلاً ثبت شده است",
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        if (hasOwn(body, "catalogType")) {
            if (!["cafe", "shop"].includes(body.catalogType)) {
                return Response.json(
                    { success: false, message: "نوع دسته‌بندی باید کافه یا فروشگاه باشد" },
                    { status: 400 },
                );
            }

            update.catalogType = body.catalogType;
        }

        if (hasOwn(body, "isActive")) {
            if (typeof body.isActive !== "boolean") {
                return Response.json(
                    {
                        success: false,
                        message: "وضعیت دسته‌بندی معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            update.isActive = body.isActive;
        }

        if (hasOwn(body, "displayOrder")) {
            const displayOrder = Number(body.displayOrder);

            if (!Number.isFinite(displayOrder)) {
                return Response.json(
                    {
                        success: false,
                        message: "ترتیب نمایش باید عدد باشد",
                    },
                    {
                        status: 400,
                    },
                );
            }

            update.displayOrder = displayOrder;
        }

        category.set(update);

        await category.save();

        const productCount = await Product.countDocuments({
            category: category._id,
        });

        return Response.json({
            success: true,
            message: "دسته‌بندی با موفقیت ویرایش شد",

            data: {
                ...category.toObject(),
                productCount,
            },
        });
    } catch (error) {
        return createErrorResponse(error, "ویرایش دسته‌بندی انجام نشد");
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

        const category = await Category.findOne(createCategoryFilter(id));

        if (!category) {
            return Response.json(
                {
                    success: false,
                    message: "دسته‌بندی پیدا نشد",
                },
                {
                    status: 404,
                },
            );
        }

        const productCount = await Product.countDocuments({
            category: category._id,
        });

        if (category.archivedAt) {
            return Response.json({
                success: true,
                message: "این دسته‌بندی قبلاً بایگانی شده است",
                data: {
                    ...category.toObject(),
                    productCount,
                },
            });
        }

        /*
      دسته‌بندی حذف دائمی نمی‌شود تا ارتباط
      محصولات قبلی از بین نرود.
    */

        category.archivedAt = new Date();
        category.isActive = false;

        await category.save();

        return Response.json({
            success: true,
            message:
                productCount > 0
                    ? `دسته‌بندی بایگانی شد و ارتباط ${productCount.toLocaleString(
                          "fa-IR",
                      )} محصول حفظ شد`
                    : "دسته‌بندی با موفقیت بایگانی شد",

            data: {
                ...category.toObject(),
                productCount,
            },
        });
    } catch (error) {
        return createErrorResponse(error, "بایگانی دسته‌بندی انجام نشد");
    }
}
