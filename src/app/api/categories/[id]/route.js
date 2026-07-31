import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import Category from "@/models/Category";

// دریافت یک دسته‌بندی
export async function GET(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
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

        const category = await Category.findById(id).lean();

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

        return Response.json(
            {
                success: true,
                data: category,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("GET CATEGORY ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت دسته‌بندی انجام نشد",
                error: error.message,
            },
            {
                status: 500,
            },
        );
    }
}

// ویرایش دسته‌بندی
export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
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

        const body = await request.json();

        // فقط فیلدهای مجاز را وارد updateData می‌کنیم
        const updateData = {};

        if (typeof body.title === "string") {
            updateData.title = body.title.trim();
        }

        if (typeof body.slug === "string") {
            updateData.slug = body.slug.trim().toLowerCase();
        }

        if (typeof body.description === "string") {
            updateData.description = body.description.trim();
        }

        if (typeof body.image === "string") {
            updateData.image = body.image.trim();
        }

        if (typeof body.isActive === "boolean") {
            updateData.isActive = body.isActive;
        }

        if (Object.keys(updateData).length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "حداقل یک فیلد برای ویرایش ارسال کنید",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            ("title" in updateData && !updateData.title) ||
            ("slug" in updateData && !updateData.slug)
        ) {
            return Response.json(
                {
                    success: false,
                    message: "عنوان و اسلاگ نمی‌توانند خالی باشند",
                },
                {
                    status: 400,
                },
            );
        }

        // بررسی می‌کنیم عنوان یا اسلاگ متعلق به دسته دیگری نباشد
        const duplicateConditions = [];

        if (updateData.title) {
            duplicateConditions.push({ title: updateData.title });
        }

        if (updateData.slug) {
            duplicateConditions.push({ slug: updateData.slug });
        }

        if (duplicateConditions.length > 0) {
            const existingCategory = await Category.findOne({
                _id: { $ne: id },
                $or: duplicateConditions,
            }).lean();

            if (existingCategory) {
                return Response.json(
                    {
                        success: false,
                        message: "دسته‌بندی دیگری با این عنوان یا اسلاگ وجود دارد",
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                $set: updateData,
            },
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedCategory) {
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

        return Response.json(
            {
                success: true,
                message: "دسته‌بندی با موفقیت ویرایش شد",
                data: updatedCategory,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("UPDATE CATEGORY ERROR:", error);

        if (error.code === 11000) {
            return Response.json(
                {
                    success: false,
                    message: "عنوان یا اسلاگ تکراری است",
                },
                {
                    status: 409,
                },
            );
        }

        if (error.name === "ValidationError") {
            return Response.json(
                {
                    success: false,
                    message: "اطلاعات واردشده معتبر نیست",
                    error: error.message,
                },
                {
                    status: 400,
                },
            );
        }

        return Response.json(
            {
                success: false,
                message: "ویرایش دسته‌بندی انجام نشد",
                error: error.message,
            },
            {
                status: 500,
            },
        );
    }
}

// حذف دسته‌بندی
export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
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

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
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

        return Response.json(
            {
                success: true,
                message: "دسته‌بندی با موفقیت حذف شد",
                data: deletedCategory,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("DELETE CATEGORY ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "حذف دسته‌بندی انجام نشد",
                error: error.message,
            },
            {
                status: 500,
            },
        );
    }
}
