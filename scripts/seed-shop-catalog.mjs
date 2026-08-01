import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import mongoose from "mongoose";

function loadEnvironmentFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const content = fs.readFileSync(filePath, "utf8");

    content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
            return;
        }

        const separatorIndex = trimmed.indexOf("=");

        if (separatorIndex < 1) {
            return;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (!process.env[key]) {
            process.env[key] = value;
        }
    });
}

const projectRoot = process.cwd();
loadEnvironmentFile(path.join(projectRoot, ".env.local"));
loadEnvironmentFile(path.join(projectRoot, ".env"));

if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL در .env.local یا .env تعریف نشده است.");
}

const now = new Date();

const categories = [
    {
        title: "دانه قهوه",
        slug: "coffee-beans",
        description: "دانه‌های تازه‌برشت برای اسپرسو و روش‌های دمی",
        image: "/images/shop/category-coffee-beans.svg",
        imageAlt: "دسته‌بندی دانه قهوه",
        accentColor: "#8e5b3d",
        displayOrder: 10,
    },
    {
        title: "ابزار دم‌آوری",
        slug: "brewing-tools",
        description: "ابزارهای کاربردی برای دم‌آوری حرفه‌ای در خانه",
        image: "/images/shop/category-brewing-tools.svg",
        imageAlt: "دسته‌بندی ابزار دم‌آوری",
        accentColor: "#c8793f",
        displayOrder: 20,
    },
    {
        title: "ماگ و اکسسوری",
        slug: "accessories",
        description: "ماگ، تامبلر و لوازم جانبی دوست‌داشتنی قهوه",
        image: "/images/shop/category-accessories.svg",
        imageAlt: "دسته‌بندی اکسسوری قهوه",
        accentColor: "#48615a",
        displayOrder: 30,
    },
    {
        title: "باکس هدیه",
        slug: "gift-boxes",
        description: "بسته‌های هدیه آماده برای دوستداران قهوه",
        image: "/images/shop/category-gift-boxes.svg",
        imageAlt: "دسته‌بندی باکس هدیه قهوه",
        accentColor: "#8b3f35",
        displayOrder: 40,
    },
];

const productTemplates = [
    {
        categorySlug: "coffee-beans",
        name: "قهوه اتیوپی گوجی",
        englishName: "Ethiopia Guji",
        slug: "ethiopia-guji-coffee",
        shortDescription: "قهوه‌ای میوه‌ای با رایحه گل، مرکبات و شیرینی طبیعی",
        description: "قهوه اتیوپی گوجی با برشت متوسط، اسیدیته شفاف و نت‌های گل، مرکبات و هلو؛ مناسب V60، کمکس و اروپرس.",
        price: 690000,
        discountPercent: 8,
        image: "/images/shop/ethiopia-guji.svg",
        intensity: "medium",
        ingredients: ["۱۰۰٪ عربیکا", "برشت متوسط", "فرآوری شسته"],
        tags: ["arabica", "ethiopia", "filter"],
        variants: [
            { title: "۲۵۰ گرم", priceAdjustment: 0, isDefault: true, isActive: true },
            { title: "۵۰۰ گرم", priceAdjustment: 610000, isDefault: false, isActive: true },
        ],
        stock: 32,
        isFeatured: true,
        isNew: true,
        accentColor: "#d08b55",
        ratingAverage: 4.8,
        reviewsCount: 24,
        salesCount: 89,
        popularityScore: 96,
        displayOrder: 10,
    },
    {
        categorySlug: "coffee-beans",
        name: "قهوه برزیل سانتوس",
        englishName: "Brazil Santos",
        slug: "brazil-santos-coffee",
        shortDescription: "بدنه شکلاتی و متعادل، مناسب اسپرسو روزانه",
        description: "دانه قهوه برزیل سانتوس با نت‌های شکلات تلخ، فندق و کارامل؛ انتخابی مطمئن برای اسپرسو و نوشیدنی‌های بر پایه شیر.",
        price: 545000,
        discountPercent: 0,
        image: "/images/shop/brazil-santos.svg",
        intensity: "high",
        ingredients: ["۱۰۰٪ عربیکا", "برشت متوسط رو به تیره", "فرآوری طبیعی"],
        tags: ["arabica", "brazil", "espresso"],
        variants: [
            { title: "۲۵۰ گرم", priceAdjustment: 0, isDefault: true, isActive: true },
            { title: "۵۰۰ گرم", priceAdjustment: 485000, isDefault: false, isActive: true },
        ],
        stock: 48,
        isFeatured: true,
        isNew: false,
        accentColor: "#8e5b3d",
        ratingAverage: 4.7,
        reviewsCount: 39,
        salesCount: 141,
        popularityScore: 98,
        displayOrder: 20,
    },
    {
        categorySlug: "coffee-beans",
        name: "قهوه کلمبیا سوپریمو",
        englishName: "Colombia Supremo",
        slug: "colombia-supremo-coffee",
        shortDescription: "متعادل، شیرین و خوش‌عطر با نت کارامل و میوه قرمز",
        description: "کلمبیا سوپریمو با بدنه نرم، شیرینی کاراملی و اسیدیته متعادل، مناسب اسپرسو، موکاپات و روش‌های دمی.",
        price: 625000,
        discountPercent: 5,
        image: "/images/shop/colombia-supremo.svg",
        intensity: "medium",
        ingredients: ["۱۰۰٪ عربیکا", "برشت متوسط", "فرآوری شسته"],
        tags: ["arabica", "colombia", "balanced"],
        variants: [
            { title: "۲۵۰ گرم", priceAdjustment: 0, isDefault: true, isActive: true },
            { title: "۵۰۰ گرم", priceAdjustment: 555000, isDefault: false, isActive: true },
        ],
        stock: 26,
        isFeatured: false,
        isNew: true,
        accentColor: "#c39a62",
        ratingAverage: 4.6,
        reviewsCount: 18,
        salesCount: 67,
        popularityScore: 82,
        displayOrder: 30,
    },
    {
        categorySlug: "coffee-beans",
        name: "بلند اختصاصی ممد کافی",
        englishName: "MMD House Blend",
        slug: "mmd-house-blend",
        shortDescription: "ترکیب اختصاصی با کرمای بالا و طعم شکلات و آجیل",
        description: "بلند اختصاصی ممد کافی برای یک اسپرسوی متعادل و پرکرما طراحی شده و در ترکیب با شیر نیز شخصیت طعمی خود را حفظ می‌کند.",
        price: 485000,
        discountPercent: 12,
        image: "/images/shop/house-blend.svg",
        intensity: "high",
        ingredients: ["عربیکا و روبوستا", "برشت متوسط رو به تیره", "مناسب اسپرسو"],
        tags: ["blend", "espresso", "house"],
        variants: [
            { title: "۲۵۰ گرم", priceAdjustment: 0, isDefault: true, isActive: true },
            { title: "۵۰۰ گرم", priceAdjustment: 420000, isDefault: false, isActive: true },
            { title: "۱ کیلوگرم", priceAdjustment: 1240000, isDefault: false, isActive: true },
        ],
        stock: 64,
        isFeatured: true,
        isNew: false,
        accentColor: "#5c3828",
        ratingAverage: 4.9,
        reviewsCount: 71,
        salesCount: 232,
        popularityScore: 100,
        displayOrder: 40,
    },
    {
        categorySlug: "brewing-tools",
        name: "دریپر V60 سرامیکی",
        englishName: "Ceramic V60 Dripper",
        slug: "ceramic-v60-dripper",
        shortDescription: "دریپر سرامیکی سایز ۰۲ برای دم‌آوری شفاف و کنترل‌شده",
        description: "دریپر سرامیکی V60 با حفظ دمای مناسب و شیارهای مارپیچ، برای یک عصاره‌گیری یکنواخت و حرفه‌ای در خانه.",
        price: 890000,
        discountPercent: 0,
        image: "/images/shop/v60-dripper.svg",
        intensity: "medium",
        ingredients: ["سرامیک مقاوم", "سایز ۰۲", "مناسب ۱ تا ۴ فنجان"],
        tags: ["v60", "brewing", "ceramic"],
        variants: [],
        stock: 18,
        isFeatured: true,
        isNew: true,
        accentColor: "#d9b48f",
        ratingAverage: 4.7,
        reviewsCount: 16,
        salesCount: 43,
        popularityScore: 78,
        displayOrder: 50,
    },
    {
        categorySlug: "brewing-tools",
        name: "فرنچ پرس ۶۰۰ میلی‌لیتر",
        englishName: "French Press 600ml",
        slug: "french-press-600ml",
        shortDescription: "فرنچ پرس شیشه‌ای مقاوم برای قهوه و دمنوش",
        description: "فرنچ پرس ۶۰۰ میلی‌لیتری با فیلتر استیل، بدنه مقاوم و طراحی مینیمال؛ مناسب استفاده روزمره در خانه و محل کار.",
        price: 1150000,
        discountPercent: 7,
        image: "/images/shop/french-press.svg",
        intensity: "medium",
        ingredients: ["شیشه مقاوم", "فیلتر استیل", "ظرفیت ۶۰۰ میلی‌لیتر"],
        tags: ["french-press", "brewing", "tea"],
        variants: [],
        stock: 14,
        isFeatured: false,
        isNew: false,
        accentColor: "#98725a",
        ratingAverage: 4.5,
        reviewsCount: 11,
        salesCount: 38,
        popularityScore: 68,
        displayOrder: 60,
    },
    {
        categorySlug: "brewing-tools",
        name: "آسیاب دستی قهوه",
        englishName: "Manual Coffee Grinder",
        slug: "manual-coffee-grinder",
        shortDescription: "آسیاب دستی با درجه قابل تنظیم و تیغه استیل",
        description: "آسیاب دستی جمع‌وجور با تنظیم درجه آسیاب از اسپرسو تا فرنچ پرس، مناسب سفر و دم‌آوری روزانه.",
        price: 1980000,
        discountPercent: 10,
        image: "/images/shop/manual-grinder.svg",
        intensity: "medium",
        ingredients: ["تیغه استیل", "درجه قابل تنظیم", "بدنه آلومینیومی"],
        tags: ["grinder", "manual", "brewing"],
        variants: [],
        stock: 9,
        isFeatured: true,
        isNew: true,
        accentColor: "#725342",
        ratingAverage: 4.8,
        reviewsCount: 28,
        salesCount: 57,
        popularityScore: 88,
        displayOrder: 70,
    },
    {
        categorySlug: "accessories",
        name: "ماگ سرامیکی ممد کافی",
        englishName: "MMD Ceramic Mug",
        slug: "mmd-ceramic-mug",
        shortDescription: "ماگ مینیمال ۳۵۰ میلی‌لیتری با لعاب مات",
        description: "ماگ سرامیکی اختصاصی ممد کافی با لعاب مات و دسته خوش‌دست، مناسب قهوه، چای و نوشیدنی‌های گرم.",
        price: 495000,
        discountPercent: 0,
        image: "/images/shop/ceramic-mug.svg",
        intensity: "medium",
        ingredients: ["سرامیک", "ظرفیت ۳۵۰ میلی‌لیتر", "قابل شست‌وشو"],
        tags: ["mug", "ceramic", "accessory"],
        variants: [
            { title: "کرم", priceAdjustment: 0, isDefault: true, isActive: true },
            { title: "قهوه‌ای", priceAdjustment: 0, isDefault: false, isActive: true },
        ],
        stock: 36,
        isFeatured: false,
        isNew: true,
        accentColor: "#c8793f",
        ratingAverage: 4.6,
        reviewsCount: 22,
        salesCount: 73,
        popularityScore: 75,
        displayOrder: 80,
    },
    {
        categorySlug: "accessories",
        name: "تامبلر دوجداره سفری",
        englishName: "Double Wall Travel Tumbler",
        slug: "double-wall-travel-tumbler",
        shortDescription: "تامبلر ضدنشت برای حفظ دمای نوشیدنی در مسیر",
        description: "تامبلر دوجداره با درپوش ضدنشت و بدنه مقاوم، مناسب خودرو، محل کار و سفرهای روزانه.",
        price: 1250000,
        discountPercent: 6,
        image: "/images/shop/travel-tumbler.svg",
        intensity: "medium",
        ingredients: ["دوجداره", "ضدنشت", "ظرفیت ۴۵۰ میلی‌لیتر"],
        tags: ["tumbler", "travel", "accessory"],
        variants: [
            { title: "سبز تیره", priceAdjustment: 0, isDefault: true, isActive: true },
            { title: "کرم", priceAdjustment: 0, isDefault: false, isActive: true },
        ],
        stock: 21,
        isFeatured: true,
        isNew: false,
        accentColor: "#364842",
        ratingAverage: 4.7,
        reviewsCount: 31,
        salesCount: 81,
        popularityScore: 84,
        displayOrder: 90,
    },
    {
        categorySlug: "gift-boxes",
        name: "باکس هدیه عاشقان قهوه",
        englishName: "Coffee Lovers Gift Box",
        slug: "coffee-lovers-gift-box",
        shortDescription: "یک هدیه کامل شامل قهوه، ماگ و کارت اختصاصی",
        description: "باکس هدیه ممد کافی شامل ۲۵۰ گرم بلند اختصاصی، ماگ سرامیکی، کارت هدیه و بسته‌بندی ویژه است.",
        price: 1590000,
        discountPercent: 9,
        image: "/images/shop/coffee-gift-box.svg",
        intensity: "medium",
        ingredients: ["قهوه ۲۵۰ گرمی", "ماگ سرامیکی", "کارت هدیه"],
        tags: ["gift", "coffee", "box"],
        variants: [],
        addOns: [
            { title: "کارت تبریک دست‌نویس", price: 70000, isActive: true },
            { title: "بسته‌بندی ویژه", price: 120000, isActive: true },
        ],
        stock: 12,
        isFeatured: true,
        isNew: true,
        accentColor: "#8b3f35",
        ratingAverage: 4.9,
        reviewsCount: 14,
        salesCount: 44,
        popularityScore: 91,
        displayOrder: 100,
    },
];

function withSubdocumentIds(items = []) {
    return items.map((item) => ({
        _id: new mongoose.Types.ObjectId(),
        ...item,
    }));
}

async function run() {
    await mongoose.connect(process.env.MONGO_URL);

    const database = mongoose.connection.db;
    const categoriesCollection = database.collection("categories");
    const productsCollection = database.collection("products");

    const categoryIds = new Map();

    for (const category of categories) {
        const current = await categoriesCollection.findOne({ slug: category.slug });
        const categoryId = current?._id || new mongoose.Types.ObjectId();

        categoryIds.set(category.slug, categoryId);

        await categoriesCollection.updateOne(
            { slug: category.slug },
            {
                $set: {
                    ...category,
                    isActive: true,
                    archivedAt: null,
                    updatedAt: now,
                },
                $setOnInsert: {
                    _id: categoryId,
                    createdAt: now,
                },
            },
            { upsert: true },
        );
    }

    for (const template of productTemplates) {
        const { categorySlug, ...product } = template;
        const categoryId = categoryIds.get(categorySlug);
        const current = await productsCollection.findOne({ slug: product.slug });

        const variants = current?.variants?.length
            ? current.variants
            : withSubdocumentIds(product.variants || []);

        const addOns = current?.addOns?.length
            ? current.addOns
            : withSubdocumentIds(product.addOns || []);

        await productsCollection.updateOne(
            { slug: product.slug },
            {
                $set: {
                    ...product,
                    category: categoryId,
                    variants,
                    addOns,
                    gallery: product.gallery || [],
                    preparationTime: 0,
                    trackStock: true,
                    isAvailable: true,
                    status: "published",
                    archivedAt: null,
                    viewsCount: current?.viewsCount || 0,
                    wishlistCount: current?.wishlistCount || 0,
                    seoTitle: product.name,
                    seoDescription: product.shortDescription,
                    updatedAt: now,
                },
                $setOnInsert: {
                    _id: new mongoose.Types.ObjectId(),
                    createdAt: now,
                },
            },
            { upsert: true },
        );
    }

    console.log(`✅ ${categories.length} دسته فروشگاهی آماده شد.`);
    console.log(`✅ ${productTemplates.length} محصول فروشگاهی آماده شد.`);
    console.log("مسیر فروشگاه: http://localhost:3000/shop");
}

run()
    .catch((error) => {
        console.error("❌ خطا در ساخت داده‌های فروشگاه:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
