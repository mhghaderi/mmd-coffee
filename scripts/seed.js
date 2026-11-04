

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        envContent.split("\n").forEach((line) => {
            const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
            if (match && !process.env[match[1]]) {
                process.env[match[1]] = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
            }
        });
    }
} catch (e) 

const mongoUri =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/mmd-coffee";

async function main() {
    console.log("در حال اتصال به پایگاه داده:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("اتصال با موفقیت برقرار شد!");

    const isClean = process.argv.includes("--clean");

    const db = mongoose.connection.db;

    if (isClean) {
        console.log("پاک‌سازی کالکشن‌های قبلی...");
        const collections = ["users", "categories", "products", "articles", "reviews", "tickets", "orders"];
        for (const col of collections) {
            try {
                await db.collection(col).deleteMany();
            } catch (err) 
        }
    }

    console.log("شروع ایمپورت اطلاعات اولیه...");

    const usersCol = db.collection("users");
    const adminPassword = await bcrypt.hash("admin", 10);
    const userPassword = await bcrypt.hash("1234", 10);

    const usersToInsert = [
        {
            name: "مدیر ممد کافی",
            email: "admin@mmdcoffee.com",
            password: adminPassword,
            role: "admin",
            phone: "09121111111",
            avatar: "",
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "سارا راد",
            email: "sara@gmail.com",
            password: userPassword,
            role: "user",
            phone: "09122222222",
            avatar: "",
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "علی اکبری",
            email: "ali@gmail.com",
            password: userPassword,
            role: "user",
            phone: "09123333333",
            avatar: "",
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "رضا میرزایی",
            email: "reza@gmail.com",
            password: userPassword,
            role: "user",
            phone: "09124444444",
            avatar: "",
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    for (const u of usersToInsert) {
        await usersCol.updateOne({ email: u.email }, { $setOnInsert: u }, { upsert: true });
    }
    const adminUser = await usersCol.findOne({ email: "admin@mmdcoffee.com" });
    const saraUser = await usersCol.findOne({ email: "sara@gmail.com" });
    const aliUser = await usersCol.findOne({ email: "ali@gmail.com" });
    const rezaUser = await usersCol.findOne({ email: "reza@gmail.com" });
    console.log("کاربران ایجاد شدند.");

    const categoriesCol = db.collection("categories");
    const categoriesToInsert = [
        {
            title: "نوشیدنی‌های گرم",
            slug: "hot-drinks",
            catalogType: "cafe",
            description: "انواع اسپرسو، قهوه‌های دمی و نوشیدنی‌های گرم بر پایه شیر تازه",
            image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
            accentColor: "#c8793f",
            displayOrder: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            title: "نوشیدنی‌های سرد",
            slug: "cold-drinks",
            catalogType: "cafe",
            description: "نوشیدنی‌های خنک، آیس‌کافی‌ها و کلدبروهای تازه‌دم",
            image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
            accentColor: "#3b82f6",
            displayOrder: 2,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            title: "دانه قهوه تخصصی",
            slug: "coffee-beans",
            catalogType: "shop",
            description: "دانه‌های تازه‌برشت با نژاد ۱۰۰٪ عربیکا از خاستگاه‌های معتبر جهانی",
            image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80",
            accentColor: "#78350f",
            displayOrder: 3,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            title: "ابزار دم‌آوری",
            slug: "brewing-tools",
            catalogType: "shop",
            description: "تجهیزات و اکسسوری‌های حرفه‌ای عصاره‌گیری قهوه در خانه و کافه",
            image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
            accentColor: "#475569",
            displayOrder: 4,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            title: "کیک و دسر",
            slug: "desserts",
            catalogType: "cafe",
            description: "دسرها، کرواسان‌ها و کیک‌های روزپخت برای همراهی با فنجان قهوه",
            image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=600&q=80",
            accentColor: "#eab308",
            displayOrder: 5,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    for (const c of categoriesToInsert) {
        await categoriesCol.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
    }
    const catHot = await categoriesCol.findOne({ slug: "hot-drinks" });
    const catCold = await categoriesCol.findOne({ slug: "cold-drinks" });
    const catBeans = await categoriesCol.findOne({ slug: "coffee-beans" });
    const catTools = await categoriesCol.findOne({ slug: "brewing-tools" });
    const catDesserts = await categoriesCol.findOne({ slug: "desserts" });
    console.log("دسته‌بندی‌ها ایجاد شدند.");

    const productsCol = db.collection("products");
    const productsToInsert = [
        {
            name: "اسپرسو سینگل",
            englishName: "Single Espresso",
            slug: "single-espresso",
            category: catHot._id,
            catalogType: "cafe",
            shortDescription: "عصاره خالص و غلیظ قهوه ۱۰۰٪ عربیکا با کرمای مخملی و طلایی",
            description: "اسپرسو با دانه دست‌چین اتیوپی و کلمبیا با اسیدیته دلنشین و بادی متوسط.",
            price: 45000,
            discountPercent: 0,
            image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: false,
            ratingAverage: 4.8,
            reviewsCount: 12,
            salesCount: 140,
            stock: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "کافه لاته آرت",
            englishName: "Cafe Latte",
            slug: "cafe-latte",
            category: catHot._id,
            catalogType: "cafe",
            shortDescription: "ترکیب متعادل دبل اسپرسو با شیر بخار داده شده مخملی",
            description: "کافه لاته با شیر تازه فوم‌گرفته‌شده و یک شات دبل اسپرسو با بافت ابریشمی.",
            price: 75000,
            discountPercent: 10,
            image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: true,
            ratingAverage: 4.9,
            reviewsCount: 28,
            salesCount: 215,
            stock: 45,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "کاپوچینو ایتالیایی",
            englishName: "Cappuccino",
            slug: "cappuccino",
            category: catHot._id,
            catalogType: "cafe",
            shortDescription: "ترکیب کلاسیک اسپرسو، شیر بخار داده شده و فوم متراکم شیر",
            description: "کاپوچینو با فوم حجیم و پودر کاکائو هلندی، مناسب علاقه‌مندان به ترکیب غلیظ قهوه و شیر.",
            price: 70000,
            discountPercent: 0,
            image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: true,
            ratingAverage: 4.7,
            reviewsCount: 19,
            salesCount: 180,
            stock: 40,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "کلد برو نیترو",
            englishName: "Cold Brew Nitro",
            slug: "cold-brew-nitro",
            category: catCold._id,
            catalogType: "cafe",
            shortDescription: "عصاره‌گیری سرد ۱۸ ساعته با بافت مخملی و کافئین بالا",
            description: "قهوه سرد‌دم غوطه‌ور در آب یخ به مدت ۱۸ ساعت، بدون اسیدیته تند با نت‌های شکلات تلخ.",
            price: 90000,
            discountPercent: 0,
            image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: true,
            ratingAverage: 4.9,
            reviewsCount: 22,
            salesCount: 175,
            stock: 30,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "چیزکیک نیویورکی سنتی",
            englishName: "New York Cheesecake",
            slug: "new-york-cheesecake",
            category: catDesserts._id,
            catalogType: "cafe",
            shortDescription: "بافت خامه‌ای غنی با پایه بیسکویت ترد کره‌ای",
            description: "پخته‌شده روزانه با پنیر ماسکارپونه و خامه طبیعی، مکمل بی‌نظیر انواع قهوه دمی.",
            price: 110000,
            discountPercent: 0,
            image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: true,
            ratingAverage: 4.9,
            reviewsCount: 31,
            salesCount: 190,
            stock: 25,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "دانه قهوه اتیوپی یرگاچف (۲۵۰ گرمی)",
            englishName: "Ethiopia Yirgacheffe Beans 250g",
            slug: "ethiopia-yirgacheffe-beans-250g",
            category: catBeans._id,
            catalogType: "shop",
            shortDescription: "نژاد عربیکا ۱۰۰٪ با نت‌های گلی یاس، ترنج و زردآلو",
            description: "خاستگاه بلندمرتبه یرگاچف با فرآوری شسته و رُست مدیوم، انتخابی ایده‌آل برای کمکس و V60.",
            price: 290000,
            discountPercent: 5,
            image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: true,
            ratingAverage: 4.9,
            reviewsCount: 35,
            salesCount: 240,
            stock: 60,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "دانه قهوه کلمبیا سوپریمو (۲۵۰ گرمی)",
            englishName: "Colombia Supremo Beans 250g",
            slug: "colombia-supremo-beans-250g",
            category: catBeans._id,
            catalogType: "shop",
            shortDescription: "بادی مخملی، اسیدیته ملایم مرکباتی با پایان شیرین شکلاتی",
            description: "دانه‌های درشت گرید سوپریمو کلمبیا با برشتگی شکلاتی متوازن، مناسب اسپرسو و دمی.",
            price: 260000,
            discountPercent: 0,
            image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: true,
            ratingAverage: 4.8,
            reviewsCount: 24,
            salesCount: 195,
            stock: 55,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "کمکس ۶ کاپ شیشه‌ای دست‌ساز",
            englishName: "Chemex 6-Cup Glass Dripper",
            slug: "chemex-6-cup",
            category: catTools._id,
            catalogType: "shop",
            shortDescription: "ابزار کلاسیک دم‌آوری قهوه شفاف با طراحی ارگونومیک چوبی",
            description: "ساخته شده از شیشه پیرکس بوروسیلیکات ضد حرارت همراه با طوقه چوبی طبیعی و بند چرمی.",
            price: 780000,
            discountPercent: 0,
            image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
            gallery: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"],
            isAvailable: true,
            status: "published",
            isFeatured: true,
            ratingAverage: 4.9,
            reviewsCount: 17,
            salesCount: 80,
            stock: 20,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    for (const p of productsToInsert) {
        await productsCol.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true });
    }
    const prodLatte = await productsCol.findOne({ slug: "cafe-latte" });
    const prodEthiopia = await productsCol.findOne({ slug: "ethiopia-yirgacheffe-beans-250g" });
    const prodCheesecake = await productsCol.findOne({ slug: "new-york-cheesecake" });
    console.log("محصولات ایجاد شدند.");

    const articlesCol = db.collection("articles");
    const articlesToInsert = [
        {
            title: "راهنمای جامع انتخاب و خرید دانه قهوه تازه",
            slug: "buying-fresh-coffee-beans-guide",
            excerpt: "چطور از روی تاریخ برشت، ارتفاع کشت و روش فرآوری، بهترین دانه قهوه را انتخاب کنیم؟",
            content: "قهوه یکی از پیچیده‌ترین نوشیدنی‌های جهان است و بخش عمده کیفیت طعم آن به تازگی دانه بستگی دارد. تاریخ برشتگی، نژاد و فرآوری مهم‌ترین فاکتورها هستند.",
            coverImage: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
            author: adminUser._id,
            status: "published",
            publishedAt: new Date(Date.now() - 3 * 86400000),
            readingTime: 4,
            tags: ["قهوه", "آموزش", "راهنمای خرید"],
            isFeatured: true,
            viewsCount: 120,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            title: "عربیکا در برابر روبوستا؛ کدام دانه مناسب شماست؟",
            slug: "arabica-vs-robusta-differences",
            excerpt: "بررسی تفاوت‌های کلیدی از نظر عطر، میزان کافئین، ترشی و کرمای فنجان نهایی.",
            content: "دو گونه اصلی تجاری قهوه در جهان عربیکا و روبوستا هستند. عربیکا لطیف و معطر و روبوستا پرکافئین و تلخ با کرمای غلیظ است.",
            coverImage: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
            author: adminUser._id,
            status: "published",
            publishedAt: new Date(Date.now() - 5 * 86400000),
            readingTime: 5,
            tags: ["عربیکا", "روبوستا"],
            isFeatured: true,
            viewsCount: 95,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    for (const a of articlesToInsert) {
        await articlesCol.updateOne({ slug: a.slug }, { $setOnInsert: a }, { upsert: true });
    }
    console.log("مقالات ایجاد شدند.");

    const reviewsCol = db.collection("reviews");
    const reviewsToInsert = [
        {
            product: prodLatte._id,
            user: saraUser._id,
            author: { name: saraUser.name, email: saraUser.email },
            rating: 5,
            title: "آرت لاته بی‌نظیر بود",
            content: "بافت شیر خیلی نرم و مخملی بود و تلخی اسپرسو اصلاً گلو رو نمی‌زد. حتماً پیشنهاد می‌کنم.",
            status: "approved",
            isVerifiedPurchase: true,
            adminReply: { message: "نوش جان سارا عزیز! سپاس از نظرتان.", repliedBy: adminUser._id, repliedAt: new Date() },
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(),
        },
        {
            product: prodEthiopia._id,
            user: aliUser._id,
            author: { name: aliUser.name, email: aliUser.email },
            rating: 5,
            title: "عطر یاس و مرکبات فوق‌العاده",
            content: "با کمکس دم کردم و یکی از شفاف‌ترین فنجان‌های قهوه‌ای بود که تا حالا خوردم.",
            status: "approved",
            isVerifiedPurchase: true,
            adminReply: { message: "خوشحالیم که تجربه کمکس شما عالی بوده است.", repliedBy: adminUser._id, repliedAt: new Date() },
            createdAt: new Date(Date.now() - 1 * 86400000),
            updatedAt: new Date(),
        },
    ];

    for (const r of reviewsToInsert) {
        await reviewsCol.updateOne({ product: r.product, "author.email": r.author.email }, { $setOnInsert: r }, { upsert: true });
    }
    console.log("نظرات ایجاد شدند.");

    const ticketsCol = db.collection("tickets");
    const ticketsToInsert = [
        {
            ticketNumber: "TKT-100001",
            user: saraUser._id,
            subject: "سؤال در مورد درجه آسیاب دانه اتیوپی",
            category: "product",
            priority: "normal",
            status: "answered",
            
            messages: [
                {
                    sender: saraUser._id,
                    senderRole: "user",
                    message: "سلام وقت بخیر، این دانه برای موکاپات هم مناسبه؟",
                    createdAt: new Date(Date.now() - 86400000),
                },
                {
                    sender: adminUser._id,
                    senderRole: "admin",
                    message: "درود بر شما سارا عزیز، بله کاملاً مناسبه و درجه آسیاب متوسط رو انتخاب بفرمایید.",
                    createdAt: new Date(),
                },
            ],
            lastMessageAt: new Date(),
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(),
        },
        {
            ticketNumber: "TKT-100002",
            user: aliUser._id,
            subject: "پیگیری سفارش کمکس ۶ کاپ",
            category: "order",
            priority: "high",
            status: "closed",
            
            messages: [
                {
                    sender: aliUser._id,
                    senderRole: "user",
                    message: "سلام، کد رهگیری تیپاکس برام ارسال نشده بود.",
                    createdAt: new Date(Date.now() - 2 * 86400000),
                },
                {
                    sender: adminUser._id,
                    senderRole: "admin",
                    message: "سلام علی جان، کد پیگیری پیامک شد و فردا تحویل شما خواهد شد.",
                    createdAt: new Date(Date.now() - 86400000),
                },
            ],
            lastMessageAt: new Date(Date.now() - 86400000),
            closedAt: new Date(),
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(),
        },
    ];

    for (const t of ticketsToInsert) {
        await ticketsCol.updateOne({ ticketNumber: t.ticketNumber }, { $setOnInsert: t }, { upsert: true });
    }
    console.log("تیکت‌ها ایجاد شدند.");

    const ordersCol = db.collection("orders");
    const ordersToInsert = [
        {
            orderNumber: "MMD-1001",
            user: saraUser._id,
            customer: { fullName: saraUser.name, email: saraUser.email, phone: saraUser.phone },
            items: [
                {
                    product: prodLatte._id,
                    name: prodLatte.name,
                    slug: prodLatte.slug,
                    quantity: 2,
                    basePrice: 75000,
                    discountPercent: 10,
                    discountedBasePrice: 67500,
                    unitPrice: 67500,
                    lineTotal: 135000,
                },
                {
                    product: prodCheesecake._id,
                    name: prodCheesecake.name,
                    slug: prodCheesecake.slug,
                    quantity: 1,
                    basePrice: 110000,
                    discountPercent: 0,
                    discountedBasePrice: 110000,
                    unitPrice: 110000,
                    lineTotal: 110000,
                },
            ],
            delivery: { method: "delivery", province: "تهران", city: "تهران", addressLine: "خیابان ولیعصر، نرسیده به ونک" },
            pricing: { subtotal: 245000, deliveryFee: 25000, discountAmount: 0, total: 270000, priceUnit: "toman" },
            payment: { method: "online", status: "paid", transactionId: "TXN-881234", paidAt: new Date(Date.now() - 4 * 86400000) },
            status: "completed",
            catalogType: "cafe",
            fulfillmentType: "delivery",
            createdAt: new Date(Date.now() - 4 * 86400000),
            updatedAt: new Date(Date.now() - 4 * 86400000),
        },
        {
            orderNumber: "MMD-1002",
            user: aliUser._id,
            customer: { fullName: aliUser.name, email: aliUser.email, phone: aliUser.phone },
            items: [
                {
                    product: prodEthiopia._id,
                    name: prodEthiopia.name,
                    slug: prodEthiopia.slug,
                    quantity: 1,
                    basePrice: 290000,
                    discountPercent: 5,
                    discountedBasePrice: 275500,
                    unitPrice: 275500,
                    lineTotal: 275500,
                },
            ],
            delivery: { method: "delivery", province: "تهران", city: "تهران", addressLine: "خیابان سعادت آباد، سرو غربی" },
            pricing: { subtotal: 275500, deliveryFee: 25000, discountAmount: 0, total: 300500, priceUnit: "toman" },
            payment: { method: "online", status: "paid", transactionId: "TXN-881235", paidAt: new Date(Date.now() - 2 * 86400000) },
            status: "completed",
            catalogType: "shop",
            fulfillmentType: "delivery",
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
            orderNumber: "MMD-1003",
            user: rezaUser._id,
            customer: { fullName: rezaUser.name, email: rezaUser.email, phone: rezaUser.phone },
            items: [
                {
                    product: prodLatte._id,
                    name: prodLatte.name,
                    slug: prodLatte.slug,
                    quantity: 1,
                    basePrice: 75000,
                    discountPercent: 10,
                    discountedBasePrice: 67500,
                    unitPrice: 67500,
                    lineTotal: 67500,
                },
            ],
            delivery: { method: "dine_in", addressLine: "میز شماره ۴ داخل کافه" },
            pricing: { subtotal: 67500, deliveryFee: 0, discountAmount: 0, total: 67500, priceUnit: "toman" },
            payment: { method: "cash", status: "pending" },
            status: "preparing",
            catalogType: "cafe",
            fulfillmentType: "dine_in",
            tableNumber: "۴",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    for (const o of ordersToInsert) {
        await ordersCol.updateOne({ orderNumber: o.orderNumber }, { $setOnInsert: o }, { upsert: true });
    }
    console.log("سفارش‌ها ایجاد شدند.");

    console.log("====================================================");
    console.log("ایمپورت با موفقیت به پایان رسید!");
    console.log("اکانت‌های تستی:");
    console.log("ادمین: admin@mmdcoffee.com | رمز: admin");
    console.log("کاربر عادی ۱: sara@gmail.com | رمز: 1234");
    console.log("کاربر عادی ۲: ali@gmail.com | رمز: 1234");
    console.log("کاربر عادی ۳: reza@gmail.com | رمز: 1234");
    console.log("====================================================");

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("خطا در اجرای اسکریپت seed:", err);
    process.exit(1);
});
