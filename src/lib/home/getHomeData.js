import connectToDB from "@/lib/db/connectToDB";

import Product from "@/models/Product";
import Category from "@/models/Category";

export default async function getHomeData() {
    await connectToDB();

    const categories = await Category.aggregate([
        {
            $match: {
                isActive: true,
                archivedAt: null,
            },
        },

        {
            $lookup: {
                from: "products",

                localField: "_id",

                foreignField: "category",

                as: "products",
            },
        },

        {
            $addFields: {
                productCount: {
                    $size: "$products",
                },
            },
        },

        {
            $project: {
                title: 1,
                slug: 1,
                description: 1,
                image: 1,
                imageAlt: 1,
                accentColor: 1,
                displayOrder: 1,
                productCount: 1,
            },
        },

        {
            $sort: {
                displayOrder: 1,
            },
        },

        {
            $limit: 8,
        },
    ]);
    const popularProducts = await Product.find({
        status: "published",
        isAvailable: true,
    })
        .sort({
            popularityScore: -1,
            salesCount: -1,
            createdAt: -1,
        })
        .limit(8)
        .populate("category")
        .lean();

    const newestProducts = await Product.find({
        status: "published",
        isAvailable: true,
    })
        .sort({
            createdAt: -1,
        })
        .limit(8)
        .populate("category")
        .lean();
    
    console.log("HOME DATA =>", {
    categoriesLength: categories.length,
    popularProductsLength: popularProducts.length,
    newestProductsLength: newestProducts.length,
    categories,
    popularProducts
});

    return {
        categories,
        popularProducts,
        newestProducts,
    };
}
