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

const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!mongoUrl) {
    console.error("❌ MONGO_URL / MONGODB_URI پیدا نشد.");
    process.exit(1);
}

const navigation = [
    { title: "خانه", href: "/", children: [] },
    {
        title: "منو",
        href: "/menu",
        children: [
            { title: "همه منوی کافه", description: "نوشیدنی، دسر و آیتم‌های آماده", href: "/menu" },
            { title: "نوشیدنی‌های گرم", description: "اسپرسو، لاته، کاپوچینو و بیشتر", href: "/menu?category=hot-drinks" },
            { title: "نوشیدنی‌های سرد", description: "آیس کافی، کلدبرو و نوشیدنی سرد", href: "/menu?category=cold-drinks" },
            { title: "دسر و شیرینی", description: "آیتم‌های شیرین کنار قهوه", href: "/menu?category=desserts" },
        ],
    },
    {
        title: "فروشگاه",
        href: "/shop",
        children: [
            { title: "همه محصولات فروشگاه", description: "دانه قهوه، ابزار و اکسسوری", href: "/shop" },
            { title: "دانه قهوه", description: "دانه و بلندهای تازه‌برشت", href: "/shop?category=coffee-beans" },
            { title: "ابزار دم‌آوری", description: "V60، فرنچ پرس، آسیاب و ابزار", href: "/shop?category=brewing-tools" },
            { title: "اکسسوری", description: "ماگ، تامبلر و لوازم جانبی", href: "/shop?category=accessories" },
        ],
    },
    { title: "مقالات", href: "/blog", children: [] },
    { title: "درباره ما", href: "/about", children: [] },
    { title: "تماس با ما", href: "/contact", children: [] },
];

const content = {
    key: "main",
    navigation,
    home: {
        hero: {
            eyebrow: "پیشنهادهای محبوب ممد کافی",
            title: "هر روزت را با یک فنجان خوب شروع کن",
            titlePrefix: "هر روزت را با یک",
            highlightTitle: "فنجان خوب",
            titleSuffix: "شروع کن",
            description: "در ممد کافی، هر نوشیدنی و محصول با انتخاب دقیق و توجه به جزئیات آماده می‌شود؛ از اولین جرعه تا آخرین لحظه.",
            brandLabel: "MMD COFFEE",
            preparationLabel: "زمان آماده‌سازی",
            intensityLabel: "پروفایل طعمی",
            popularLabel: "پیشنهاد محبوب امروز",
            refreshTitle: "نمایش سه پیشنهاد تازه",
            rotationHint: "از میان محبوب‌ترین محصولات، سه پیشنهاد تازه برایت انتخاب می‌شود.",
            trustPoints: ["دانه تازه‌برشت", "آماده‌سازی حرفه‌ای", "سفارش سریع و آسان"],
            primaryActionTitle: "مشاهده منوی ممد کافی",
            primaryActionHref: "/menu",
            secondaryActionTitle: "فروشگاه قهوه",
            secondaryActionHref: "/shop",
        },
        categories: {
            eyebrow: "دسته‌بندی‌ها",
            title: "سریع‌تر به انتخابت برس",
        },
        popular: {
            eyebrow: "انتخاب‌های پرطرفدار",
            title: "محبوب‌های ممد کافی",
            description: "محصولات بر اساس فروش، امتیاز و محبوبیت واقعی مرتب می‌شوند.",
        },
        cafePopular: {
            eyebrow: "انتخاب مشتری‌های کافه",
            title: "پرطرفدارهای کافه",
            description: "نوشیدنی‌ها و خوراکی‌هایی که بیشتر از همه در کافه سفارش داده می‌شوند.",
            linkTitle: "مشاهده منوی کافه",
        },
        shopPopular: {
            eyebrow: "برای قهوه‌دوست‌ها",
            title: "پرطرفدارهای فروشگاه",
            description: "دانه قهوه، ابزار دم‌آوری و اکسسوری‌های محبوب فروشگاه.",
            linkTitle: "مشاهده فروشگاه",
        },
        latestArticles: {
            eyebrow: "مجله ممد کافی",
            title: "جدیدترین مقالات",
            description: "راهنمای قهوه، دم‌آوری و انتخاب بهتر؛ مستقیم از مقالات منتشرشده سایت.",
            linkTitle: "همه مقالات",
        },
        personalized: {
            eyebrow: "پیشنهاد برای تو",
            personalizedTitle: "براساس سلیقه تو",
            fallbackTitle: "منتخب ممد کافی",
            personalizedDescription: "علاقه‌مندی‌ها، خریدها و تعامل‌های تو روی این پیشنهادها اثر می‌گذارند.",
            fallbackDescription: "با استفاده بیشتر از سایت، پیشنهادهای تو شخصی‌تر می‌شوند.",
        },
    },
    about: {
        eyebrow: "درباره ممد کافی",
        title: "هر فنجان، شروع یک تجربه تازه",
        description: "ممد کافی جایی برای تجربه قهوه خوب، انتخاب آگاهانه و لحظه‌های ساده اما ماندگار است.",
        storyEyebrow: "داستان ما",
        storyTitle: "از علاقه به قهوه تا یک تجربه کامل",
        storyDescription: "ممد کافی با یک ایده ساده شکل گرفت: دسترسی به قهوه باکیفیت نباید پیچیده باشد. منوی کافه، فروشگاه دانه و تجهیزات و تجربه سفارش آنلاین را در یک مسیر یکپارچه کنار هم قرار دادیم.",
        valuesEyebrow: "ارزش‌های ما",
        valuesTitle: "چیزی فراتر از یک سفارش",
        stats: [
            { icon: "users", value: "+۱۰۰۰", label: "مشتری همراه" },
            { icon: "star", value: "۴.۹", label: "میانگین رضایت" },
            { icon: "coffee", value: "+۳۰", label: "انتخاب متنوع" },
            { icon: "heart", value: "هر روز", label: "با عشق و دقت" },
        ],
        values: [
            { icon: "coffee", title: "کیفیت بدون میان‌بر", description: "از انتخاب دانه تا سرو نهایی، کیفیت مهم‌ترین معیار تصمیم‌گیری ماست." },
            { icon: "heart", title: "تجربه انسانی", description: "قهوه فقط یک محصول نیست؛ فرصتی برای مکث، گفت‌وگو و ساختن خاطره است." },
            { icon: "shield", title: "اعتماد و شفافیت", description: "قیمت، موجودی، وضعیت سفارش و پاسخ‌گویی را شفاف و قابل پیگیری نگه می‌داریم." },
        ],
    },
    contact: {
        eyebrow: "تماس با ما",
        title: "از شنیدن صدایت خوشحال می‌شویم",
        description: "برای پیگیری سفارش، سؤال درباره محصولات یا پیشنهاد و انتقاد، از راه‌های ارتباطی ممد کافی استفاده کن.",
    },
    footer: {
        description: "ممد کافی؛ قهوه، نوشیدنی و ابزارهایی برای ساختن یک تجربه بهتر از قهوه.",
        copyright: "© MMD Coffee. همه حقوق محفوظ است.",
        groups: [
            {
                title: "کافه و فروشگاه",
                links: [
                    { title: "منوی کافه", href: "/menu" },
                    { title: "فروشگاه", href: "/shop" },
                    { title: "مقالات", href: "/blog" },
                ],
            },
            {
                title: "ممد کافی",
                links: [
                    { title: "درباره ما", href: "/about" },
                    { title: "تماس با ما", href: "/contact" },
                ],
            },
        ],
    },
};

await mongoose.connect(mongoUrl);
try {
    const collection = mongoose.connection.collection("sitecontents");
    await collection.updateOne(
        { key: "main" },
        { $set: { ...content, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
    );
    console.log("✅ محتوای عمومی سایت داخل MongoDB ثبت/به‌روزرسانی شد.");
} finally {
    await mongoose.disconnect();
}
