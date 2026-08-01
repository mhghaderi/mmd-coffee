import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";
import syncProductReviewStats from "@/lib/reviews/syncProductReviewStats";

import Article from "@/models/Article";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";

const allowedTypes = ["products", "categories", "articles", "reviews"];

async function restoreItem(type, id) {
    if (type === "products") {
        return Product.findOneAndUpdate(
            { _id: id, status: "archived" },
            {
                $set: {
                    status: "draft",
                    archivedAt: null,
                    isAvailable: false,
                },
            },
            { new: true, runValidators: true },
        );
    }

    if (type === "categories") {
        return Category.findOneAndUpdate(
            { _id: id, archivedAt: { $type: "date" } },
            {
                $set: {
                    archivedAt: null,
                    isActive: false,
                },
            },
            { new: true, runValidators: true },
        );
    }

    if (type === "articles") {
        return Article.findOneAndUpdate(
            { _id: id, status: "archived" },
            {
                $set: {
                    status: "draft",
                    archivedAt: null,
                    publishedAt: null,
                    isFeatured: false,
                },
            },
            { new: true, runValidators: true },
        );
    }

    if (type === "reviews") {
        const review = await Review.findOneAndUpdate(
            { _id: id, status: "archived" },
            {
                $set: {
                    status: "pending",
                    isFeatured: false,
                    rejectionReason: "",
                    moderatedAt: null,
                    moderatedBy: null,
                },
            },
            { new: true, runValidators: true },
        );

        if (review) {
            await syncProductReviewStats(review.product);
        }

        return review;
    }

    return null;
}

async function permanentlyDeleteItem(type, id) {
    if (type === "products") {
        const usedInOrder = await Order.exists({ "items.product": id });

        if (usedInOrder) {
            return {
                conflict: "این محصول در سفارش‌های ثبت‌شده استفاده شده و برای حفظ سوابق مالی قابل حذف دائمی نیست",
            };
        }

        const product = await Product.findOne({ _id: id, status: "archived" });

        if (!product) {
            return { deleted: false };
        }

        await Review.deleteMany({ product: id });
        await product.deleteOne();

        return { deleted: true };
    }

    if (type === "categories") {
        const hasProducts = await Product.exists({ category: id });

        if (hasProducts) {
            return {
                conflict: "این دسته‌بندی هنوز به محصول متصل است؛ ابتدا محصولات آن را منتقل یا حذف کن",
            };
        }

        const result = await Category.deleteOne({ _id: id, archivedAt: { $type: "date" } });
        return { deleted: result.deletedCount > 0 };
    }

    if (type === "articles") {
        const result = await Article.deleteOne({ _id: id, status: "archived" });
        return { deleted: result.deletedCount > 0 };
    }

    if (type === "reviews") {
        const review = await Review.findOne({ _id: id, status: "archived" });

        if (!review) {
            return { deleted: false };
        }

        const productId = review.product;
        await review.deleteOne();
        await syncProductReviewStats(productId);

        return { deleted: true };
    }

    return { deleted: false };
}

export async function PATCH(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        const { type, id } = await params;

        if (!allowedTypes.includes(type) || !mongoose.isValidObjectId(id)) {
            return Response.json(
                { success: false, message: "شناسه یا نوع آیتم آرشیو معتبر نیست" },
                { status: 400 },
            );
        }

        await connectToDB();
        const item = await restoreItem(type, id);

        if (!item) {
            return Response.json(
                { success: false, message: "آیتم بایگانی‌شده پیدا نشد" },
                { status: 404 },
            );
        }

        return Response.json({
            success: true,
            message: "آیتم با موفقیت بازیابی شد",
            data: item,
        });
    } catch (error) {
        console.error("RESTORE ARCHIVE ITEM ERROR:", error);
        return Response.json(
            { success: false, message: "بازیابی آیتم انجام نشد" },
            { status: 500 },
        );
    }
}

export async function DELETE(request, { params }) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        const { type, id } = await params;

        if (!allowedTypes.includes(type) || !mongoose.isValidObjectId(id)) {
            return Response.json(
                { success: false, message: "شناسه یا نوع آیتم آرشیو معتبر نیست" },
                { status: 400 },
            );
        }

        await connectToDB();
        const result = await permanentlyDeleteItem(type, id);

        if (result.conflict) {
            return Response.json(
                { success: false, message: result.conflict },
                { status: 409 },
            );
        }

        if (!result.deleted) {
            return Response.json(
                { success: false, message: "آیتم بایگانی‌شده پیدا نشد" },
                { status: 404 },
            );
        }

        return Response.json({
            success: true,
            message: "آیتم برای همیشه حذف شد",
        });
    } catch (error) {
        console.error("DELETE ARCHIVE ITEM ERROR:", error);
        return Response.json(
            { success: false, message: "حذف دائمی آیتم انجام نشد" },
            { status: 500 },
        );
    }
}
