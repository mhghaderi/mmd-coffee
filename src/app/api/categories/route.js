import connectToDB from "@/lib/db/connectToDB";
import Category from "@/models/Category";

export async function GET() {
    try {
        await connectToDB();

        const categories = await Category.find({}).sort({ createdAt: -1 }).lean();

        return Response.json(
            {
                success: true,
                data: categories,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("Get categories error => ", error);

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
    try {
        await connectToDB();
        const body = await request.json();

        const title = body.title?.trim();
        const slug = body.slug?.trim().toLowerCase();
        const description = body.description?.trim() || "";
        const image = body.image?.trim() || "";

        if (!title || !slug) {
            return Response.json(
                { success: false, message: "عنوان و دسته بندی الزامی هستند" },
                { status: 400 },
            );
        }

        const existingCategory = await Category.findOne({ $or: [{ title }, { slug }] });

        if (existingCategory) {
            return Response.json(
                {
                    success: false,
                    message: "دسته‌بندی با این عنوان یا اسلاگ قبلاً ثبت شده است",
                },
                {
                    status: 409,
                },
            );
        }

        const category = await Category.create({
            title,
            slug,
            description,
            image,
        });

        return Response.json(
            {
                success: true,
                message: "دسته‌بندی با موفقیت ایجاد شد",
                data: category,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("Create category error:", error);

        if (error.code === 11000) {
            return Response.json(
                {
                    success: false,
                    message: "این دسته‌بندی قبلاً ثبت شده است",
                },
                {
                    status: 409,
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
