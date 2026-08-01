import mongoose from "mongoose";

import connectToDB from "@/lib/db/connectToDB";
import { getCurrentUser } from "@/lib/auth/session";

import Article from "@/models/Article";
import User from "@/models/User";

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

export default async function getArticleFormData(identifier) {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
        return {
            authorized: false,
            article: null,
        };
    }

    await connectToDB();

    if (!identifier) {
        return {
            authorized: true,
            currentUser,
            article: null,
        };
    }

    const filter = mongoose.isValidObjectId(identifier)
        ? {
              _id: identifier,
          }
        : {
              slug: identifier.trim().toLowerCase(),
          };

    const article = await Article.findOne(filter)
        .populate({
            path: "author",
            select: "name email avatar",
        })
        .lean();

    return {
        authorized: true,
        currentUser,
        article: article ? serialize(article) : null,
    };
}
