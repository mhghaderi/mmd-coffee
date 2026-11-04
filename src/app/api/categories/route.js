import connectToDB from "@/lib/db/connectToDB";

import { getCurrentUser, requireAdmin } from "@/lib/auth/session";

import Category from "@/models/Category";
import Product from "@/models/Product";

function escapeRegExp(value) {
    return value.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
}

function serializeCategory(category, count = 0) {
    return {
        ...category,
        _id: category._id.toString(),
        productCount: count,
    };
}

export async function GET(request) {
    try {
        await connectToDB();

        const currentUser = await getCurrentUser();
        const isAdmin = currentUser?.role === "admin";

        const { searchParams } = new URL(request.url);

        const scope = searchParams.get("scope");
        const q = searchParams.get("q")?.trim() || "";

        const filter =
            isAdmin && scope === "admin"
                ? {}
                : {
                      archivedAt: null,
                      isActive: true,
                  };

        if (q) {
            const regex = new RegExp(escapeRegExp(q), "i");

            filter.$or = [
                {
                    title: regex,
                },
                {
                    slug: regex,
                },
                {
                    description: regex,
                },
            ];
        }

        const categories = await Category.find(filter)
            .sort({
                displayOrder: 1,
                createdAt: -1,
            })
            .lean();

        const categoryIds = categories.map((category) => category._id);

        const productCounts =
            categoryIds.length > 0
                ? await Product.aggregate([
                      {
                          $match: {
                              category: {
                                  $in: categoryIds,
                              },
                          },
                      },
                      {
                          $group: {
                              _id: "$category",
                              count: {
                                  $sum: 1,
                              },
                          },
                      },
                  ])
                : [];

        const productCountMap = new Map(
            productCounts.map((item) => [item._id.toString(), item.count]),
        );

        return Response.json({
            success: true,

            data: categories.map((category) =>
                serializeCategory(category, productCountMap.get(category._id.toString()) || 0),
            ),
        });
    } catch (error) {
        console.error("GET CATEGORIES ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت دسته‌بندی‌ها انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const body = await request.json();

        const title = typeof body.title === "string" ? body.title.trim() : "";

        const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";

        if (!title || !slug) {
            return Response.json(
                {
                    success: false,
                    message: "عنوان و اسلاگ دسته‌بندی الزامی هستند",
                },
                {
                    status: 400,
                },
            );
        }

        const duplicateCategory = await Category.exists({
            slug,
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

        const category = await Category.create({
            title,
            slug,

            description: typeof body.description === "string" ? body.description.trim() : "",

            catalogType: body.catalogType === "shop" ? "shop" : "cafe",

            image: typeof body.image === "string" ? body.image.trim() : "",

            imageAlt: typeof body.imageAlt === "string" ? body.imageAlt.trim() : "",

            accentColor: typeof body.accentColor === "string" ? body.accentColor.trim() : "#c8793f",

            displayOrder: Number.isFinite(Number(body.displayOrder))
                ? Number(body.displayOrder)
                : 0,

            isActive: typeof body.isActive === "boolean" ? body.isActive : true,

            seoTitle: typeof body.seoTitle === "string" ? body.seoTitle.trim() : "",

            seoDescription:
                typeof body.seoDescription === "string" ? body.seoDescription.trim() : "",
        });

        return Response.json(
            {
                success: true,
                message: "دسته‌بندی با موفقیت ایجاد شد",
                data: serializeCategory(category.toObject(), 0),
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("CREATE CATEGORY ERROR:", error);

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
                message: "ایجاد دسته‌بندی انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}
