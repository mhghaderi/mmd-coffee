import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Category from "@/models/Category";
import Product from "@/models/Product";

function serializeCategory(category, productCount) {
    return {
        ...category,

        _id: category._id.toString(),

        productCount,

        archivedAt: category.archivedAt?.toISOString() || null,

        createdAt: category.createdAt?.toISOString() || null,

        updatedAt: category.updatedAt?.toISOString() || null,
    };
}

export default async function getAdminCategories() {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return null;
    }

    await connectToDB();

    const categories = await Category.find({})
        .sort({
            archivedAt: 1,
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

    const countMap = new Map(productCounts.map((item) => [item._id.toString(), item.count]));

    const serializedCategories = categories.map((category) =>
        serializeCategory(category, countMap.get(category._id.toString()) || 0),
    );

    return {
        categories: serializedCategories,

        stats: {
            total: categories.length,

            active: categories.filter((category) => !category.archivedAt && category.isActive)
                .length,

            inactive: categories.filter((category) => !category.archivedAt && !category.isActive)
                .length,

            archived: categories.filter((category) => Boolean(category.archivedAt)).length,

            assignedProducts: serializedCategories.reduce(
                (total, category) => total + category.productCount,
                0,
            ),
        },
    };
}
