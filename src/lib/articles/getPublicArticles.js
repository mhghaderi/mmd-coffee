import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";

import Article from "@/models/Article";
import User from "@/models/User";

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export async function getPublicArticles(rawSearchParams = {}) {
    await connectToDB();

    const page = Math.max(Number.parseInt(rawSearchParams.page || "1", 10), 1);
    const limit = 9;
    const tag = typeof rawSearchParams.tag === "string" ? rawSearchParams.tag.trim().toLowerCase() : "";

    const query = {
        status: "published",
        publishedAt: {
            $lte: new Date(),
        },
    };

    if (tag) {
        query.tags = tag;
    }

    const total = await Article.countDocuments(query);
    const pages = total === 0 ? 0 : Math.ceil(total / limit);
    const safePage = pages > 0 ? Math.min(page, pages) : 1;

    const articles = await Article.find(query)
        .select(
            "title slug excerpt coverImage coverImageAlt author publishedAt tags readingTime isFeatured viewsCount",
        )
        .populate({
            path: "author",
            select: "name avatar",
        })
        .sort({
            isFeatured: -1,
            publishedAt: -1,
            _id: -1,
        })
        .skip((safePage - 1) * limit)
        .limit(limit)
        .lean();

    return {
        articles: articles.map(serialize),
        tag,
        pagination: {
            page: safePage,
            total,
            pages,
            hasPreviousPage: safePage > 1,
            hasNextPage: safePage < pages,
        },
    };
}

export async function getPublicArticle(identifier) {
    await connectToDB();

    const filter = mongoose.isValidObjectId(identifier)
        ? {
              _id: identifier,
          }
        : {
              slug: identifier.trim().toLowerCase(),
          };

    const article = await Article.findOne({
        ...filter,
        status: "published",
        publishedAt: {
            $lte: new Date(),
        },
    })
        .populate({
            path: "author",
            select: "name avatar",
        })
        .lean();

    return article ? serialize(article) : null;
}
