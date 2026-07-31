import connectToDB from "@/lib/db/connectToDB";

import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET() {
    try {
        await connectToDB();

        const products = await Product.find({}).limit(3).lean();

        const categories = await Category.find({}).limit(3).lean();

        return Response.json({
            products,
            categories,
        });
    } catch (error) {
        console.log(error);

        return Response.json(
            {
                error: error.message,
            },
            {
                status: 500,
            },
        );
    }
}
