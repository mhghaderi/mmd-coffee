import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectToDB from "@/lib/db/connectToDB";

import User from "@/models/User";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Article from "@/models/Article";
import Review from "@/models/Review";
import Ticket from "@/models/Ticket";
import Order from "@/models/Order";
import syncProductReviewStats from "@/lib/reviews/syncProductReviewStats";

import {
    seedCategories,
    seedUsers,
    seedProductsData,
    seedArticlesData,
    seedReviewsData,
    seedTicketsData,
} from "@/data/seedData";

export const dynamic = "force-dynamic";

export async function GET(request) {
    return handleSeed(request);
}

export async function POST(request) {
    return handleSeed(request);
}

async function handleSeed(request) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const clean = searchParams.get("clean") === "true";

        if (clean) {
            await Promise.all([
                User.deleteMany(),
                Category.deleteMany(),
                Product.deleteMany(),
                Article.deleteMany(),
                Review.deleteMany(),
                Ticket.deleteMany(),
                Order.deleteMany(),
            ]);
        }

        const userMap = new Map();
        for (const u of seedUsers) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                user = await User.create({
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role,
                    phone: u.phone,
                    isActive: true,
                    emailVerified: true,
                });
            }
            userMap.set(u.email, user);
        }

        const adminUser = userMap.get("admin@mmdcoffee.com");
        const saraUser = userMap.get("sara@gmail.com");
        const aliUser = userMap.get("ali@gmail.com");
        const rezaUser = userMap.get("reza@gmail.com");

        const categoryMap = new Map();
        for (const cat of seedCategories) {
            let category = await Category.findOne({ slug: cat.slug });
            if (!category) {
                category = await Category.create(cat);
            }
            categoryMap.set(cat.slug, category);
        }

        const productMap = new Map();
        for (const p of seedProductsData) {
            const category = categoryMap.get(p.categorySlug);
            let product = await Product.findOne({ slug: p.slug });
            if (!product) {
                product = await Product.create({
                    name: p.name,
                    englishName: p.englishName,
                    slug: p.slug,
                    category: category?._id,
                    catalogType: p.catalogType,
                    shortDescription: p.shortDescription,
                    description: p.description,
                    price: p.price,
                    discountPercent: p.discountPercent,
                    image: p.image,
                    gallery: [p.image],
                    isAvailable: p.isAvailable,
                    status: "published",
                    isFeatured: p.isFeatured,
                    isNew: p.isNew,
                    ratingAverage: p.ratingAverage,
                    reviewsCount: p.reviewsCount,
                    salesCount: p.salesCount,
                    stock: p.stock,
                });
            }
            productMap.set(p.slug, product);
        }

        for (const a of seedArticlesData) {
            let article = await Article.findOne({ slug: a.slug });
            if (!article) {
                await Article.create({
                    title: a.title,
                    slug: a.slug,
                    excerpt: a.excerpt,
                    content: a.content,
                    coverImage: a.coverImage,
                    author: adminUser?._id,
                    status: "published",
                    publishedAt: new Date(Date.now() - 3 * 86400000),
                    readingTime: a.readingTime,
                    tags: a.tags,
                    isFeatured: a.isFeatured,
                    viewsCount: Math.floor(80 + Math.random() * 200),
                });
            }
        }

        for (const r of seedReviewsData) {
            const product = productMap.get(r.productSlug);
            const user = userMap.get(r.authorEmail);
            if (product) {
                const existingReview = await Review.findOne({
                    product: product._id,
                    "author.email": r.authorEmail,
                });
                if (!existingReview) {
                    await Review.create({
                        product: product._id,
                        user: user?._id || null,
                        author: {
                            name: r.authorName,
                            email: r.authorEmail,
                        },
                        rating: r.rating,
                        title: r.title,
                        content: r.content,
                        status: "approved",
                        isVerifiedPurchase: r.isVerifiedPurchase,
                        adminReply: r.adminReply || "",
                        repliedAt: r.adminReply ? new Date() : null,
                    });
                    await syncProductReviewStats(product._id);
                }
            }
        }

        for (const t of seedTicketsData) {
            const user = userMap.get(t.userEmail);
            let ticket = await Ticket.findOne({ ticketNumber: t.ticketNumber });
            if (!ticket && user) {
                const now = new Date();
                await Ticket.create({
                    ticketNumber: t.ticketNumber,
                    user: user._id,
                    subject: t.subject,
                    category: t.category || "other",
                    priority: t.priority || "normal",
                    status: t.status || "open",
                    message: t.message,
                    adminReply: t.adminReply || "",
                    repliedAt: t.adminReply ? now : null,
                });
            }
        }

        const latte = productMap.get("cafe-latte");
        const ethiopia = productMap.get("ethiopia-yirgacheffe-beans-250g");
        const chemex = productMap.get("chemex-6-cup");
        const cheesecake = productMap.get("new-york-cheesecake");
        const coldbrew = productMap.get("cold-brew-nitro");

        const sampleOrders = [
            {
                orderNumber: "MMD-1001",
                user: saraUser?._id,
                customer: {
                    fullName: saraUser?.name || "سارا راد",
                    email: saraUser?.email || "sara@gmail.com",
                    phone: saraUser?.phone || "09122222222",
                },
                items: [
                    {
                        product: latte?._id,
                        name: latte?.name || "کافه لاته آرت",
                        slug: latte?.slug || "cafe-latte",
                        quantity: 2,
                        basePrice: latte?.price || 75000,
                        discountPercent: 10,
                        discountedBasePrice: 67500,
                        unitPrice: 67500,
                        lineTotal: 135000,
                    },
                    {
                        product: cheesecake?._id,
                        name: cheesecake?.name || "چیزکیک نیویورکی",
                        slug: cheesecake?.slug || "new-york-cheesecake",
                        quantity: 1,
                        basePrice: cheesecake?.price || 110000,
                        discountPercent: 0,
                        discountedBasePrice: 110000,
                        unitPrice: 110000,
                        lineTotal: 110000,
                    },
                ],
                delivery: {
                    method: "delivery",
                    province: "تهران",
                    city: "تهران",
                    addressLine: "خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۲",
                },
                pricing: {
                    subtotal: 245000,
                    deliveryFee: 25000,
                    discountAmount: 0,
                    total: 270000,
                    priceUnit: "toman",
                },
                payment: {
                    method: "online",
                    status: "paid",
                    transactionId: "TXN-881234",
                    paidAt: new Date(Date.now() - 5 * 86400000),
                },
                status: "completed",
                catalogType: "cafe",
                fulfillmentType: "delivery",
                createdAt: new Date(Date.now() - 5 * 86400000),
            },
            {
                orderNumber: "MMD-1002",
                user: aliUser?._id,
                customer: {
                    fullName: aliUser?.name || "علی اکبری",
                    email: aliUser?.email || "ali@gmail.com",
                    phone: aliUser?.phone || "09123333333",
                },
                items: [
                    {
                        product: ethiopia?._id,
                        name: ethiopia?.name || "دانه قهوه اتیوپی",
                        slug: ethiopia?.slug || "ethiopia-yirgacheffe-beans-250g",
                        quantity: 1,
                        basePrice: ethiopia?.price || 290000,
                        discountPercent: 5,
                        discountedBasePrice: 275500,
                        unitPrice: 275500,
                        lineTotal: 275500,
                    },
                    {
                        product: chemex?._id,
                        name: chemex?.name || "کمکس ۶ کاپ",
                        slug: chemex?.slug || "chemex-6-cup",
                        quantity: 1,
                        basePrice: chemex?.price || 780000,
                        discountPercent: 0,
                        discountedBasePrice: 780000,
                        unitPrice: 780000,
                        lineTotal: 780000,
                    },
                ],
                delivery: {
                    method: "delivery",
                    province: "تهران",
                    city: "تهران",
                    addressLine: "خیابان سعادت آباد، سرو غربی، کوچه هفتم",
                },
                pricing: {
                    subtotal: 1055500,
                    deliveryFee: 0,
                    discountAmount: 0,
                    total: 1055500,
                    priceUnit: "toman",
                },
                payment: {
                    method: "online",
                    status: "paid",
                    transactionId: "TXN-881235",
                    paidAt: new Date(Date.now() - 2 * 86400000),
                },
                status: "completed",
                catalogType: "shop",
                fulfillmentType: "delivery",
                createdAt: new Date(Date.now() - 2 * 86400000),
            },
            {
                orderNumber: "MMD-1003",
                user: rezaUser?._id,
                customer: {
                    fullName: rezaUser?.name || "رضا میرزایی",
                    email: rezaUser?.email || "reza@gmail.com",
                    phone: rezaUser?.phone || "09124444444",
                },
                items: [
                    {
                        product: coldbrew?._id,
                        name: coldbrew?.name || "کلد برو نیترو",
                        slug: coldbrew?.slug || "cold-brew-nitro",
                        quantity: 2,
                        basePrice: coldbrew?.price || 90000,
                        discountPercent: 0,
                        discountedBasePrice: 90000,
                        unitPrice: 90000,
                        lineTotal: 180000,
                    },
                ],
                delivery: {
                    method: "pickup",
                    addressLine: "تحویل حضوری در شعبه اصلی کافه",
                },
                pricing: {
                    subtotal: 180000,
                    deliveryFee: 0,
                    discountAmount: 0,
                    total: 180000,
                    priceUnit: "toman",
                },
                payment: {
                    method: "card_on_delivery",
                    status: "paid",
                    paidAt: new Date(Date.now() - 1 * 86400000),
                },
                status: "completed",
                catalogType: "cafe",
                fulfillmentType: "pickup",
                createdAt: new Date(Date.now() - 1 * 86400000),
            },
            {
                orderNumber: "MMD-1004",
                user: saraUser?._id,
                customer: {
                    fullName: saraUser?.name || "سارا راد",
                    email: saraUser?.email || "sara@gmail.com",
                    phone: saraUser?.phone || "09122222222",
                },
                items: [
                    {
                        product: latte?._id,
                        name: latte?.name || "کافه لاته آرت",
                        slug: latte?.slug || "cafe-latte",
                        quantity: 1,
                        basePrice: latte?.price || 75000,
                        discountPercent: 10,
                        discountedBasePrice: 67500,
                        unitPrice: 67500,
                        lineTotal: 67500,
                    },
                ],
                delivery: {
                    method: "dine_in",
                    addressLine: "میز شماره ۴ داخل کافه",
                },
                pricing: {
                    subtotal: 67500,
                    deliveryFee: 0,
                    discountAmount: 0,
                    total: 67500,
                    priceUnit: "toman",
                },
                payment: {
                    method: "cash",
                    status: "pending",
                },
                status: "preparing",
                catalogType: "cafe",
                fulfillmentType: "dine_in",
                tableNumber: "۴",
                createdAt: new Date(),
            },
        ];

        for (const orderData of sampleOrders) {
            const exists = await Order.findOne({ orderNumber: orderData.orderNumber });
            if (!exists) {
                await Order.create(orderData);
            }
        }

        const counts = {
            users: await User.countDocuments(),
            categories: await Category.countDocuments(),
            products: await Product.countDocuments(),
            articles: await Article.countDocuments(),
            reviews: await Review.countDocuments(),
            tickets: await Ticket.countDocuments(),
            orders: await Order.countDocuments(),
        };

        return Response.json({
            success: true,
            message: "اطلاعات فیک و اولیه با موفقیت وارد دیتابیس شدند",
            summary: counts,
            testAccounts: [
                { role: "مدیر سیستم (Admin)", email: "admin@mmdcoffee.com", password: "admin" },
                { role: "کاربر عادی (User)", email: "sara@gmail.com", password: "1234" },
                { role: "کاربر عادی (User)", email: "ali@gmail.com", password: "1234" },
                { role: "کاربر عادی (User)", email: "reza@gmail.com", password: "1234" },
            ],
        });
    } catch (error) {
        console.error("SEED DATABASE ERROR:", error);
        return Response.json(
            {
                success: false,
                message: "ایمپورت اطلاعات فیک با خطا مواجه شد",
                error: error.message,
            },
            { status: 500 },
        );
    }
}
