import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getCurrentUser, requireAdmin } from "@/lib/auth/session";

const allowedStatuses = ["draft", "published", "archived"];

const allowedSorts = {
    newest: {
        createdAt: -1,
    },

    oldest: {
        createdAt: 1,
    },

    popular: {
        popularityScore: -1,
        createdAt: -1,
    },

    rating: {
        ratingAverage: -1,
        reviewsCount: -1,
    },

    sales: {
        salesCount: -1,
    },

    "price-asc": {
        price: 1,
    },

    "price-desc": {
        price: -1,
    },
};

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value
                .filter((item) => typeof item === "string")
                .map((item) => item.trim())
                .filter(Boolean),
        ),
    ];
}

function normalizeVariants(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    const variants = value
        .filter((item) => item && typeof item === "object" && !Array.isArray(item))
        .map((item) => ({
            title: typeof item.title === "string" ? item.title.trim() : "",

            priceAdjustment: Number(item.priceAdjustment) || 0,

            isDefault: item.isDefault === true,

            isActive: typeof item.isActive === "boolean" ? item.isActive : true,
        }))
        .filter((item) => item.title);

    let defaultFound = false;

    const normalizedVariants = variants.map((variant) => {
        if (variant.isDefault && !defaultFound) {
            defaultFound = true;

            return variant;
        }

        return {
            ...variant,
            isDefault: false,
        };
    });

    if (normalizedVariants.length > 0 && !defaultFound) {
        normalizedVariants[0].isDefault = true;
    }

    return normalizedVariants;
}

function normalizeAddOns(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
            title: typeof item.title === "string" ? item.title.trim() : "",

            price: Number(item.price) || 0,

            isActive: typeof item.isActive === "boolean" ? item.isActive : true,
        }))
        .filter((item) => item.title);
}

/*
  GET /api/products

  Query parameters:

  q
  category
  status
  available
  discounted
  featured
  sort
  page
  limit
*/

export async function GET(request) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);

        const q = searchParams.get("q")?.trim() || "";
        const categoryValue = searchParams.get("category")?.trim() || "";

        const requestedStatus = searchParams.get("status")?.trim() || "";

        const sortValue = searchParams.get("sort") || "newest";

        const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);

        const limit = Math.min(
            Math.max(Number.parseInt(searchParams.get("limit") || "12", 10), 1),
            100,
        );

        const skip = (page - 1) * limit;

        const filter = {};

        if (q) {
            const safeQuery = escapeRegExp(q);
            const searchRegex = new RegExp(safeQuery, "i");

            filter.$or = [
                {
                    name: searchRegex,
                },
                {
                    englishName: searchRegex,
                },
                {
                    slug: searchRegex,
                },
                {
                    shortDescription: searchRegex,
                },
                {
                    tags: searchRegex,
                },
            ];
        }

        if (categoryValue) {
            if (mongoose.isValidObjectId(categoryValue)) {
                filter.category = categoryValue;
            } else {
                const category = await Category.findOne({
                    slug: categoryValue.toLowerCase(),
                })
                    .select("_id")
                    .lean();

                if (!category) {
                    return Response.json(
                        {
                            success: true,
                            data: [],
                            pagination: {
                                page,
                                limit,
                                total: 0,
                                pages: 0,
                                hasNextPage: false,
                                hasPreviousPage: false,
                            },
                        },
                        {
                            status: 200,
                        },
                    );
                }

                filter.category = category._id;
            }
        }
        const currentUser = await getCurrentUser();

        const isAdmin = currentUser?.role === "admin";

        if (isAdmin) {
            if (allowedStatuses.includes(requestedStatus)) {
                filter.status = requestedStatus;
            }
        } else {
            filter.status = "published";
            filter.isAvailable = true;
        }
        // if (allowedStatuses.includes(requestedStatus)) {
        //     filter.status = requestedStatus;
        // }

        if (isAdmin && searchParams.get("available") === "1") {
            filter.isAvailable = true;
        }

        if (searchParams.get("discounted") === "1") {
            filter.discountPercent = {
                $gt: 0,
            };
        }

        if (searchParams.get("featured") === "1") {
            filter.isFeatured = true;
        }

        const sort = allowedSorts[sortValue] || allowedSorts.newest;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate({
                    path: "category",
                    select: "title slug image isActive",
                })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments(filter),
        ]);

        const pages = total === 0 ? 0 : Math.ceil(total / limit);

        return Response.json(
            {
                success: true,
                data: products,

                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                    hasNextPage: page < pages,
                    hasPreviousPage: page > 1,
                },
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت محصولات انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}

/*
  POST /api/products
*/

export async function POST(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }
    try {
        await connectToDB();

        const body = await request.json();

        const name = body.name?.trim();
        const englishName = body.englishName?.trim() || "";

        const slug = body.slug?.trim().toLowerCase() || "";

        const categoryId = body.category?.trim() || "";

        const shortDescription = body.shortDescription?.trim() || "";

        const description = body.description?.trim() || "";

        const image = body.image?.trim() || "";

        const status = allowedStatuses.includes(body.status) ? body.status : "draft";

        const price = Number(body.price);

        const discountPercent =
            body.discountPercent === undefined ? 0 : Number(body.discountPercent);

        if (!name || !slug || !categoryId) {
            return Response.json(
                {
                    success: false,
                    message: "نام، اسلاگ و دسته‌بندی محصول الزامی هستند",
                },
                {
                    status: 400,
                },
            );
        }

        if (!mongoose.isValidObjectId(categoryId)) {
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

        if (!Number.isFinite(price) || price < 0) {
            return Response.json(
                {
                    success: false,
                    message: "قیمت محصول معتبر نیست",
                },
                {
                    status: 400,
                },
            );
        }

        if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
            return Response.json(
                {
                    success: false,
                    message: "درصد تخفیف باید بین صفر تا صد باشد",
                },
                {
                    status: 400,
                },
            );
        }

        const category = await Category.findById(categoryId).lean();

        if (!category) {
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

        const existingProduct = await Product.findOne({
            slug,
        })
            .select("_id")
            .lean();

        if (existingProduct) {
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

        if (status === "published" && !image) {
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

        const product = await Product.create({
            name,
            englishName,
            slug,
            category: categoryId,
            shortDescription,
            description,
            price,
            discountPercent,
            image,

            gallery: normalizeStringArray(body.gallery),

            preparationTime: Number(body.preparationTime) || 0,

            intensity: ["low", "medium", "high"].includes(body.intensity)
                ? body.intensity
                : "medium",

            ingredients: normalizeStringArray(body.ingredients),

            tags: normalizeStringArray(body.tags).map((tag) => tag.toLowerCase()),

            variants: normalizeVariants(body.variants),

            addOns: normalizeAddOns(body.addOns),

            trackStock: typeof body.trackStock === "boolean" ? body.trackStock : false,

            stock: Number(body.stock) >= 0 ? Number(body.stock) : 0,

            isAvailable: typeof body.isAvailable === "boolean" ? body.isAvailable : true,

            status,

            isFeatured: typeof body.isFeatured === "boolean" ? body.isFeatured : false,

            isNew: typeof body.isNew === "boolean" ? body.isNew : false,

            accentColor: body.accentColor?.trim() || "#c8793f",

            displayOrder: Number(body.displayOrder) || 0,

            seoTitle: body.seoTitle?.trim() || "",

            seoDescription: body.seoDescription?.trim() || "",
        });

        await product.populate({
            path: "category",
            select: "title slug image isActive",
        });

        return Response.json(
            {
                success: true,
                message: "محصول با موفقیت ایجاد شد",
                data: product,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);

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
                message: "ایجاد محصول انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
