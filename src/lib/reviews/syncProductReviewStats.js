import mongoose from "mongoose";

import Product from "@/models/Product";
import Review from "@/models/Review";

export default async function syncProductReviewStats(productId) {
    if (!mongoose.isValidObjectId(productId)) {
        return;
    }

    const result = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId),
                status: "approved",
            },
        },
        {
            $group: {
                _id: "$product",
                reviewsCount: {
                    $sum: 1,
                },
                ratingAverage: {
                    $avg: "$rating",
                },
            },
        },
    ]);

    const stats = result[0] || {
        reviewsCount: 0,
        ratingAverage: 0,
    };

    await Product.updateOne(
        {
            _id: productId,
        },
        {
            $set: {
                reviewsCount: Number(stats.reviewsCount || 0),
                ratingAverage: Number(Number(stats.ratingAverage || 0).toFixed(2)),
            },
        },
    );
}
