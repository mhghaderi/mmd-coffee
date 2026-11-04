import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import mongoose from "mongoose";

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const separator = line.indexOf("=");
        if (separator === -1) continue;
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const mongoUrl =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    "mongodb://127.0.0.1:27017/mmd-coffee";

await mongoose.connect(mongoUrl);
const db = mongoose.connection.db;

const now = new Date();

async function run() {
    const usersCol = db.collection("users");
    const productsCol = db.collection("products");
    const articlesCol = db.collection("articles");
    const reviewsCol = db.collection("reviews");
    const ticketsCol = db.collection("tickets");
    const ordersCol = db.collection("orders");

    const admin = await usersCol.findOne({ role: "admin" });
    const user1 = await usersCol.findOne({ email: "user1@mmdcoffee.test" });
    const user2 = await usersCol.findOne({ email: "user2@mmdcoffee.test" });
    const user3 = await usersCol.findOne({ email: "user3@mmdcoffee.test" });

    const articles = [
        {
            title: "راهنمای جامع انتخاب و خرید دانه قهوه تازه",
            slug: "buying-fresh-coffee-beans-guide",
            excerpt: "چطور از روی تاریخ برشت، ارتفاع کشت و روش فرآوری، بهترین دانه قهوه را برای ذائقه خود انتخاب کنیم؟",
            content: "قهوه یکی از پیچیده‌ترین نوشیدنی‌های جهان است و بخش عمده کیفیت طعم آن به تازگی دانه بستگی دارد. در هنگام خرید قهوه به تاریخ برشتگی، نژاد و اسیدیته توجه کنید.",
            coverImage: "/images/blog/buying-guide.svg",
            author: admin?._id || new mongoose.Types.ObjectId(),
            status: "published",
            publishedAt: new Date(Date.now() - 3 * 86400000),
            readingTime: 4,
            tags: ["قهوه", "آموزش", "دانه قهوه"],
            isFeatured: true,
            viewsCount: 140,
            createdAt: now,
            updatedAt: now,
        },
        {
            title: "عربیکا در برابر روبوستا؛ کدام دانه مناسب شماست؟",
            slug: "arabica-vs-robusta-differences",
            excerpt: "بررسی تفاوت‌های کلیدی از نظر عطر، میزان کافئین، ترشی، تلخی و کرمای فنجان نهایی.",
            content: "دو گونه اصلی تجاری قهوه در جهان عربیکا و روبوستا هستند. عربیکا لطیف و معطر است، در حالی که روبوستا کافئین بالا و کرمای بسیار غلیظی دارد.",
            coverImage: "/images/blog/arabica-robusta.svg",
            author: admin?._id || new mongoose.Types.ObjectId(),
            status: "published",
            publishedAt: new Date(Date.now() - 5 * 86400000),
            readingTime: 5,
            tags: ["عربیکا", "روبوستا", "آموزش"],
            isFeatured: true,
            viewsCount: 110,
            createdAt: now,
            updatedAt: now,
        },
        {
            title: "آموزش دم‌آوری بی‌نقص قهوه با فرنچ‌پرس",
            slug: "how-to-brew-with-french-press",
            excerpt: "روش استاندارد و نسبت آب به قهوه برای داشتن یک فنجان زلال، پربادی و خوش‌عطر با ابزار فرنچ‌پرس.",
            content: "فرنچ‌پرس یکی از محبوب‌ترین ابزارهای غوطه‌وری قهوه است. برای هر ۱۵ گرم پودر درشت، ۲۵۰ میلی‌لیتر آب ۹۳ درجه نیاز است و ۴ دقیقه زمان استراحت.",
            coverImage: "/images/blog/french-press.svg",
            author: admin?._id || new mongoose.Types.ObjectId(),
            status: "published",
            publishedAt: new Date(Date.now() - 7 * 86400000),
            readingTime: 3,
            tags: ["فرنچ پرس", "دم آوری"],
            isFeatured: false,
            viewsCount: 85,
            createdAt: now,
            updatedAt: now,
        },
    ];

    for (const a of articles) {
        await articlesCol.updateOne({ slug: a.slug }, { $set: a }, { upsert: true });
    }
    console.log(`✅ ${articles.length} مقاله آموزشی ثبت شد.`);

    const espresso = await productsCol.findOne({ slug: "espresso" });
    const latte = await productsCol.findOne({ slug: "cafe-latte" });
    const beans = await productsCol.findOne({ slug: "mmd-house-blend" });

    const reviews = [
        {
            product: latte?._id,
            user: user1?._id || null,
            author: { name: "سارا راد", email: user1?.email || "user1@mmdcoffee.test" },
            rating: 5,
            title: "آرت لاته بی‌نظیر بود",
            content: "بافت شیر خیلی نرم و مخملی بود و تلخی اسپرسو اصلاً گلو رو نمی‌زد. حتماً پیشنهاد می‌کنم.",
            status: "approved",
            isVerifiedPurchase: true,
            adminReply: "نوش جان سارا عزیز! از توجهت به کیفیت بافت شیر سپاسگزاریم.", repliedAt: now,
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: now,
        },
        {
            product: beans?._id,
            user: user2?._id || null,
            author: { name: "علی اکبری", email: user2?.email || "user2@mmdcoffee.test" },
            rating: 5,
            title: "عطر و کرمای فوق‌العاده",
            content: "با دستگاه خانگی عصاره‌گیری کردم؛ کرمای فندقی ضخیم و پس‌مزه شکلاتی عالی داشت. رُست تازه بود.",
            status: "approved",
            isVerifiedPurchase: true,
            adminReply: "خوشحالیم که تجربه اسپرسوی شما عالی بوده علی عزیز.", repliedAt: now,
            createdAt: new Date(Date.now() - 1 * 86400000),
            updatedAt: now,
        },
        {
            product: espresso?._id,
            user: user3?._id || null,
            author: { name: "رضا میرزایی", email: user3?.email || "user3@mmdcoffee.test" },
            rating: 5,
            title: "عصاره‌گیری استاندارد",
            content: "اسیدیته کاملاً به اندازه و بالانس بود. یکی از بهترین اسپرسوهای کافه‌های تهران.",
            status: "approved",
            isVerifiedPurchase: true,
            adminReply: null,
            createdAt: now,
            updatedAt: now,
        },
    ];

    for (const r of reviews) {
        if (r.product) {
            await reviewsCol.updateOne({ product: r.product, "author.email": r.author.email }, { $set: r }, { upsert: true });
        }
    }
    console.log(`✅ ${reviews.length} نظر مشتری ثبت شد.`);

    const tickets = [
        {
            ticketNumber: "TKT-100001",
            user: user1?._id,
            subject: "سؤال در مورد درجه آسیاب دانه قهوه",
            category: "product",
            priority: "normal",
            status: "answered",
            message: "سلام وقت بخیر، این دانه برای موکاپات هم مناسبه؟",
            adminReply: "درود بر شما، بله کاملاً مناسبه و درجه آسیاب متوسط رو انتخاب بفرمایید.",
            repliedAt: now,
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: now,
        },
        {
            ticketNumber: "TKT-100002",
            user: user2?._id,
            subject: "پیگیری ارسال سفارش فروشگاه",
            category: "order",
            priority: "high",
            status: "closed",
            message: "سلام، کد رهگیری پستی رو لطف می‌کنید؟",
            adminReply: "سلام، کد پیگیری تیپاکس پیامک شد و فردا تحویل داده می‌شود.",
            repliedAt: now,
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: now,
        },
    ];

    for (const t of tickets) {
        if (t.user) {
            await ticketsCol.updateOne({ ticketNumber: t.ticketNumber }, { $set: t }, { upsert: true });
        }
    }
    console.log(`✅ ${tickets.length} تیکت پشتیبانی ثبت شد.`);

    const sampleOrders = [
        {
            orderNumber: "MMD-1001",
            user: user1?._id,
            customer: { fullName: "سارا راد", email: user1?.email || "user1@mmdcoffee.test", phone: "09121111111" },
            items: [
                {
                    product: latte?._id,
                    name: latte?.name || "کافه لاته",
                    slug: latte?.slug || "cafe-latte",
                    quantity: 2,
                    basePrice: latte?.price || 155000,
                    discountPercent: 0,
                    discountedBasePrice: latte?.price || 155000,
                    unitPrice: latte?.price || 155000,
                    lineTotal: (latte?.price || 155000) * 2,
                },
            ],
            delivery: { method: "delivery", province: "تهران", city: "تهران", addressLine: "خیابان ولیعصر، روبروی پارک ملت" },
            pricing: { subtotal: 310000, deliveryFee: 25000, discountAmount: 0, total: 335000, priceUnit: "toman" },
            payment: { method: "online", status: "paid", transactionId: "TXN-881234", paidAt: new Date(Date.now() - 4 * 86400000) },
            status: "completed",
            catalogType: "cafe",
            fulfillmentType: "delivery",
            createdAt: new Date(Date.now() - 4 * 86400000),
            updatedAt: new Date(Date.now() - 4 * 86400000),
        },
        {
            orderNumber: "MMD-1002",
            user: user2?._id,
            customer: { fullName: "علی اکبری", email: user2?.email || "user2@mmdcoffee.test", phone: "09122222222" },
            items: [
                {
                    product: beans?._id,
                    name: beans?.name || "بلند اختصاصی ممد کافی",
                    slug: beans?.slug || "mmd-house-blend",
                    quantity: 1,
                    basePrice: beans?.price || 485000,
                    discountPercent: 10,
                    discountedBasePrice: 436500,
                    unitPrice: 436500,
                    lineTotal: 436500,
                },
            ],
            delivery: { method: "delivery", province: "تهران", city: "تهران", addressLine: "خیابان سعادت آباد، میدان کاج" },
            pricing: { subtotal: 436500, deliveryFee: 30000, discountAmount: 0, total: 466500, priceUnit: "toman" },
            payment: { method: "online", status: "paid", transactionId: "TXN-881235", paidAt: new Date(Date.now() - 2 * 86400000) },
            status: "completed",
            catalogType: "shop",
            fulfillmentType: "delivery",
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
            orderNumber: "MMD-1003",
            user: user3?._id,
            customer: { fullName: "رضا میرزایی", email: user3?.email || "user3@mmdcoffee.test", phone: "09123333333" },
            items: [
                {
                    product: espresso?._id,
                    name: espresso?.name || "اسپرسو",
                    slug: espresso?.slug || "espresso",
                    quantity: 1,
                    basePrice: espresso?.price || 85000,
                    discountPercent: 0,
                    discountedBasePrice: 85000,
                    unitPrice: 85000,
                    lineTotal: 85000,
                },
            ],
            delivery: { method: "dine_in", addressLine: "میز شماره ۵" },
            pricing: { subtotal: 85000, deliveryFee: 0, discountAmount: 0, total: 85000, priceUnit: "toman" },
            payment: { method: "cash", status: "pending" },
            status: "preparing",
            catalogType: "cafe",
            fulfillmentType: "dine_in",
            tableNumber: "۵",
            createdAt: now,
            updatedAt: now,
        },
    ];

    for (const o of sampleOrders) {
        await ordersCol.updateOne({ orderNumber: o.orderNumber }, { $set: o }, { upsert: true });
    }
    console.log(`✅ ${sampleOrders.length} سفارش نمونه برای فعال شدن گزارش‌ها و نمودارها ثبت شد.`);
}

run()
    .catch((err) => {
        console.error("❌ خطا در ثبت اطلاعات تکمیلی:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
