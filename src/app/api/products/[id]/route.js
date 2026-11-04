import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import Category from "@/models/Category";
import Product from "@/models/Product";

import { getCurrentUser, requireAdmin } from "@/lib/auth/session";

const allowedStatuses = ["draft", "published"];

const allowedIntensities = ["low", "medium", "high"];

function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function createProductFilter(identifier) {
    if (mongoose.isValidObjectId(identifier)) {
        return {
            _id: identifier,
        };
    }

    return {
        slug: identifier.trim().toLowerCase(),
    };
}

function normalizeStringArray(value, fieldTitle) {
    if (!Array.isArray(value)) {
        return {
            error: `${fieldTitle} باید به‌صورت آرایه ارسال شود`,
        };
    }

    for (const item of value) {
        if (typeof item !== "string") {
            return {
                error: `تمام مقادیر ${fieldTitle} باید متنی باشند`,
            };
        }
    }

    const normalizedValue = [...new Set(value.map((item) => item.trim()).filter(Boolean))];

    return {
        value: normalizedValue,
    };
}

function normalizeVariants(value) {
    if (!Array.isArray(value)) {
        return {
            error: "مدل‌های محصول باید به‌صورت آرایه ارسال شوند",
        };
    }

    const normalizedVariants = [];
    let defaultVariantsCount = 0;

    for (let index = 0; index < value.length; index += 1) {
        const variant = value[index];

        if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
            return {
                error: `مدل شماره ${index + 1} معتبر نیست`,
            };
        }

        const title = typeof variant.title === "string" ? variant.title.trim() : "";

        if (!title) {
            return {
                error: `عنوان مدل شماره ${index + 1} الزامی است`,
            };
        }

        const priceAdjustment = Number(variant.priceAdjustment ?? 0);

        if (!Number.isFinite(priceAdjustment) || priceAdjustment < 0) {
            return {
                error: `افزایش قیمت مدل ${title} معتبر نیست`,
            };
        }

        const isDefault = variant.isDefault === true;

        if (isDefault) {
            defaultVariantsCount += 1;
        }

        normalizedVariants.push({
            title,
            priceAdjustment,
            isDefault,

            isActive: typeof variant.isActive === "boolean" ? variant.isActive : true,
        });
    }

    if (defaultVariantsCount > 1) {
        return {
            error: "فقط یکی از مدل‌های محصول می‌تواند مدل پیش‌فرض باشد",
        };
    }

    if (normalizedVariants.length > 0 && defaultVariantsCount === 0) {
        normalizedVariants[0].isDefault = true;
    }

    return {
        value: normalizedVariants,
    };
}

function normalizeAddOns(value) {
    if (!Array.isArray(value)) {
        return {
            error: "افزودنی‌ها باید به‌صورت آرایه ارسال شوند",
        };
    }

    const normalizedAddOns = [];

    for (let index = 0; index < value.length; index += 1) {
        const addOn = value[index];

        if (!addOn || typeof addOn !== "object" || Array.isArray(addOn)) {
            return {
                error: `افزودنی شماره ${index + 1} معتبر نیست`,
            };
        }

        const title = typeof addOn.title === "string" ? addOn.title.trim() : "";

        if (!title) {
            return {
                error: `عنوان افزودنی شماره ${index + 1} الزامی است`,
            };
        }

        const price = Number(addOn.price ?? 0);

        if (!Number.isFinite(price) || price < 0) {
            return {
                error: `قیمت افزودنی ${title} معتبر نیست`,
            };
        }

        normalizedAddOns.push({
            title,
            price,

            isActive: typeof addOn.isActive === "boolean" ? addOn.isActive : true,
        });
    }

    return {
        value: normalizedAddOns,
    };
}

function assignStringField({ body, update, key, title, required = false, lowercase = false }) {
    if (!hasOwn(body, key)) {
        return null;
    }

    if (typeof body[key] !== "string") {
        return `${title} باید متنی باشد`;
    }

    let value = body[key].trim();

    if (required && !value) {
        return `${title} نمی‌تواند خالی باشد`;
    }

    if (lowercase) {
        value = value.toLowerCase();
    }

    update[key] = value;

    return null;
}

function assignNumberField({ body, update, key, title, minimum, maximum }) {
    if (!hasOwn(body, key)) {
        return null;
    }

    if (body[key] === "" || body[key] === null) {
        return `${title} معتبر نیست`;
    }

    const value = Number(body[key]);

    if (!Number.isFinite(value)) {
        return `${title} باید عدد باشد`;
    }

    if (minimum !== undefined && value < minimum) {
        return `${title} نمی‌تواند کمتر از ${minimum} باشد`;
    }

    if (maximum !== undefined && value > maximum) {
        return `${title} نمی‌تواند بیشتر از ${maximum} باشد`;
    }

    update[key] = value;

    return null;
}

function assignBooleanField({ body, update, key, title }) {
    if (!hasOwn(body, key)) {
        return null;
    }

    if (typeof body[key] !== "boolean") {
        return `${title} باید true یا false باشد`;
    }

    update[key] = body[key];

    return null;
}

function createProductUpdate(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return {
            error: "اطلاعات ارسال‌شده معتبر نیست",
        };
    }

    const update = {};
    const errors = [];

    const stringFields = [
        {
            key: "name",
            title: "نام محصول",
            required: true,
        },
        {
            key: "englishName",
            title: "نام انگلیسی محصول",
        },
        {
            key: "slug",
            title: "اسلاگ محصول",
            required: true,
            lowercase: true,
        },
        {
            key: "shortDescription",
            title: "توضیح کوتاه محصول",
        },
        {
            key: "description",
            title: "توضیحات محصول",
        },
        {
            key: "image",
            title: "تصویر اصلی محصول",
        },
        {
            key: "accentColor",
            title: "رنگ محصول",
        },
        {
            key: "seoTitle",
            title: "عنوان سئو",
        },
        {
            key: "seoDescription",
            title: "توضیحات سئو",
        },
    ];

    stringFields.forEach((field) => {
        const error = assignStringField({
            body,
            update,
            ...field,
        });

        if (error) {
            errors.push(error);
        }
    });

    const numberFields = [
        {
            key: "price",
            title: "قیمت محصول",
            minimum: 0,
        },
        {
            key: "discountPercent",
            title: "درصد تخفیف",
            minimum: 0,
            maximum: 100,
        },
        {
            key: "preparationTime",
            title: "زمان آماده‌سازی",
            minimum: 0,
        },
        {
            key: "stock",
            title: "موجودی محصول",
            minimum: 0,
        },
        {
            key: "displayOrder",
            title: "ترتیب نمایش",
        },
    ];

    numberFields.forEach((field) => {
        const error = assignNumberField({
            body,
            update,
            ...field,
        });

        if (error) {
            errors.push(error);
        }
    });

    const booleanFields = [
        {
            key: "trackStock",
            title: "وضعیت کنترل موجودی",
        },
        {
            key: "isAvailable",
            title: "وضعیت موجود بودن",
        },
        {
            key: "isFeatured",
            title: "وضعیت محصول ویژه",
        },
        {
            key: "isNew",
            title: "وضعیت محصول جدید",
        },
    ];

    booleanFields.forEach((field) => {
        const error = assignBooleanField({
            body,
            update,
            ...field,
        });

        if (error) {
            errors.push(error);
        }
    });

    if (hasOwn(body, "category")) {
        if (typeof body.category !== "string" || !body.category.trim()) {
            errors.push("شناسه دسته‌بندی معتبر نیست");
        } else {
            update.category = body.category.trim();
        }
    }

    if (hasOwn(body, "status")) {
        if (!allowedStatuses.includes(body.status)) {
            errors.push("وضعیت محصول معتبر نیست");
        } else {
            update.status = body.status;
        }
    }

    if (hasOwn(body, "intensity")) {
        if (!allowedIntensities.includes(body.intensity)) {
            errors.push("شدت محصول معتبر نیست");
        } else {
            update.intensity = body.intensity;
        }
    }

    const arrayFields = [
        {
            key: "gallery",
            title: "گالری تصاویر",
        },
        {
            key: "ingredients",
            title: "ترکیبات محصول",
        },
        {
            key: "tags",
            title: "برچسب‌های محصول",
        },
    ];

    arrayFields.forEach(({ key, title }) => {
        if (!hasOwn(body, key)) {
            return;
        }

        const result = normalizeStringArray(body[key], title);

        if (result.error) {
            errors.push(result.error);
            return;
        }

        update[key] =
            key === "tags" ? result.value.map((item) => item.toLowerCase()) : result.value;
    });

    if (hasOwn(body, "variants")) {
        const result = normalizeVariants(body.variants);

        if (result.error) {
            errors.push(result.error);
        } else {
            update.variants = result.value;
        }
    }

    if (hasOwn(body, "addOns")) {
        const result = normalizeAddOns(body.addOns);

        if (result.error) {
            errors.push(result.error);
        } else {
            update.addOns = result.value;
        }
    }

    if (errors.length > 0) {
        return {
            error: errors[0],
            errors,
        };
    }

    if (Object.keys(update).length === 0) {
        return {
            error: "هیچ فیلد قابل ویرایشی ارسال نشده است",
        };
    }

    return {
        update,
    };
}

function createErrorResponse(error, fallbackMessage) {
    console.error(fallbackMessage, error);

    if (error.code === 11000) {
        return Response.json(
            {
                success: false,
                message: "محصولی با این اسلاگ قبلاً ثبت شده است",
            },
            {
                status: 409,
            },
        );
    }

    if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
            (validationError) => validationError.message,
        );

        return Response.json(
            {
                success: false,
                message: validationErrors[0] || "اطلاعات محصول معتبر نیست",
                errors: validationErrors,
            },
            {
                status: 400,
            },
        );
    }

    if (error.name === "CastError") {
        return Response.json(
            {
                success: false,
                message: "یکی از اطلاعات ارسال‌شده معتبر نیست",
            },
            {
                status: 400,
            },
        );
    }

    return Response.json(
        {
            success: false,
            message: fallbackMessage,
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

        if (!id?.trim()) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه محصول الزامی است",
                },
                {
                    status: 400,
                },
            );
        }

        const currentUser = await getCurrentUser();

        const productFilter = createProductFilter(id);

        if (currentUser?.role !== "admin") {
            productFilter.status = "published";
            productFilter.isAvailable = true;
        }

        const product = await Product.findOne(productFilter)
            .populate({
                path: "category",
                select: "title slug image description isActive",
            })
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

        return Response.json(
            {
                success: true,
                data: product,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        return createErrorResponse(error, "دریافت محصول انجام نشد");
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

        if (!id?.trim()) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه محصول الزامی است",
                },
                {
                    status: 400,
                },
            );
        }

        const product = await Product.findOne(createProductFilter(id));

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

        const body = await request.json();

        const { update, error, errors } = createProductUpdate(body);

        if (error) {
            return Response.json(
                {
                    success: false,
                    message: error,
                    errors: errors || [error],
                },
                {
                    status: 400,
                },
            );
        }

        if (update.category) {
            if (!mongoose.isValidObjectId(update.category)) {
                return Response.json(
                    {
                        success: false,
                        message: "شناسه دسته‌بندی معتبر نیست",
                    },
                    {
                        status: 400,
                    },
                );
            }

            const categoryDocument = await Category.findById(update.category)
                .select("_id catalogType")
                .lean();

            if (!categoryDocument) {
                return Response.json(
                    {
                        success: false,
                        message: "دسته‌بندی انتخاب‌شده پیدا نشد",
                    },
                    {
                        status: 404,
                    },
                );
            }

            update.catalogType = categoryDocument.catalogType === "shop" ? "shop" : "cafe";
        }

        if (update.slug) {
            const duplicateProduct = await Product.exists({
                _id: {
                    $ne: product._id,
                },

                slug: update.slug,
            });

            if (duplicateProduct) {
                return Response.json(
                    {
                        success: false,
                        message: "محصولی با این اسلاگ قبلاً ثبت شده است",
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        product.set(update);

        if (product.status === "published" && !product.image?.trim()) {
            return Response.json(
                {
                    success: false,
                    message: "برای انتشار محصول باید تصویر اصلی انتخاب شود",
                },
                {
                    status: 400,
                },
            );
        }

        await product.save();

        await product.populate({
            path: "category",
            select: "title slug image description isActive",
        });

        return Response.json(
            {
                success: true,
                message: "محصول با موفقیت ویرایش شد",
                data: product,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        return createErrorResponse(error, "ویرایش محصول انجام نشد");
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

        if (!id?.trim()) {
            return Response.json(
                {
                    success: false,
                    message: "شناسه محصول الزامی است",
                },
                {
                    status: 400,
                },
            );
        }

        const product = await Product.findOne(createProductFilter(id));

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

        await Product.findByIdAndDelete(id);

        return Response.json(
            {
                success: true,
                message: "محصول با موفقیت حذف شد",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        return createErrorResponse(error, "بایگانی محصول انجام نشد");
    }
}
