import mongoose from "mongoose";

const navigationChildSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, required: true, maxlength: 80 },
        description: { type: String, trim: true, default: "", maxlength: 180 },
        href: { type: String, trim: true, required: true, maxlength: 300 },
    },
    { _id: false },
);

const navigationItemSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, required: true, maxlength: 80 },
        href: { type: String, trim: true, required: true, maxlength: 300 },
        children: { type: [navigationChildSchema], default: [] },
    },
    { _id: false },
);

const aboutValueSchema = new mongoose.Schema(
    {
        icon: { type: String, trim: true, default: "coffee" },
        title: { type: String, trim: true, required: true, maxlength: 120 },
        description: { type: String, trim: true, required: true, maxlength: 500 },
    },
    { _id: false },
);

const aboutStatSchema = new mongoose.Schema(
    {
        icon: { type: String, trim: true, default: "coffee" },
        value: { type: String, trim: true, required: true, maxlength: 40 },
        label: { type: String, trim: true, required: true, maxlength: 100 },
    },
    { _id: false },
);


const footerLinkSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, required: true, maxlength: 80 },
        href: { type: String, trim: true, required: true, maxlength: 300 },
    },
    { _id: false },
);

const footerGroupSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, required: true, maxlength: 100 },
        links: { type: [footerLinkSchema], default: [] },
    },
    { _id: false },
);

const siteContentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            unique: true,
            default: "main",
            immutable: true,
        },

        navigation: {
            type: [navigationItemSchema],
            default: [],
        },

        home: {
            hero: {
                eyebrow: { type: String, trim: true, default: "پیشنهادهای محبوب ممد کافی" },
                // title قدیمی را نگه می‌داریم تا داده‌های نسخه قبل سازگار بمانند.
                title: { type: String, trim: true, default: "هر روزت را با یک فنجان خوب شروع کن" },
                titlePrefix: { type: String, trim: true, default: "هر روزت را با یک" },
                highlightTitle: { type: String, trim: true, default: "فنجان خوب" },
                titleSuffix: { type: String, trim: true, default: "شروع کن" },
                description: {
                    type: String,
                    trim: true,
                    default: "در ممد کافی، هر نوشیدنی و محصول با انتخاب دقیق و توجه به جزئیات آماده می‌شود؛ از اولین جرعه تا آخرین لحظه.",
                },
                brandLabel: { type: String, trim: true, default: "MMD COFFEE" },
                preparationLabel: { type: String, trim: true, default: "زمان آماده‌سازی" },
                intensityLabel: { type: String, trim: true, default: "پروفایل طعمی" },
                popularLabel: { type: String, trim: true, default: "پیشنهاد محبوب امروز" },
                refreshTitle: { type: String, trim: true, default: "نمایش سه پیشنهاد تازه" },
                rotationHint: {
                    type: String,
                    trim: true,
                    default: "از میان محبوب‌ترین محصولات، سه پیشنهاد تازه برایت انتخاب می‌شود.",
                },
                trustPoints: {
                    type: [{ type: String, trim: true }],
                    default: ["دانه تازه‌برشت", "آماده‌سازی حرفه‌ای", "سفارش سریع و آسان"],
                },
                primaryActionTitle: { type: String, trim: true, default: "مشاهده منوی ممد کافی" },
                primaryActionHref: { type: String, trim: true, default: "/menu" },
                secondaryActionTitle: { type: String, trim: true, default: "فروشگاه قهوه" },
                secondaryActionHref: { type: String, trim: true, default: "/shop" },
            },
            categories: {
                eyebrow: { type: String, trim: true, default: "دسته‌بندی‌ها" },
                title: { type: String, trim: true, default: "سریع‌تر به انتخابت برس" },
            },
            popular: {
                eyebrow: { type: String, trim: true, default: "انتخاب‌های پرطرفدار" },
                title: { type: String, trim: true, default: "محبوب‌های ممد کافی" },
                description: {
                    type: String,
                    trim: true,
                    default: "محصولات بر اساس فروش، امتیاز و محبوبیت واقعی مرتب می‌شوند.",
                },
            },
            cafePopular: {
                eyebrow: { type: String, trim: true, default: "انتخاب مشتری‌های کافه" },
                title: { type: String, trim: true, default: "پرطرفدارهای کافه" },
                description: { type: String, trim: true, default: "نوشیدنی‌ها و خوراکی‌هایی که بیشتر از همه در کافه سفارش داده می‌شوند." },
                linkTitle: { type: String, trim: true, default: "مشاهده منوی کافه" },
            },
            shopPopular: {
                eyebrow: { type: String, trim: true, default: "برای قهوه‌دوست‌ها" },
                title: { type: String, trim: true, default: "پرطرفدارهای فروشگاه" },
                description: { type: String, trim: true, default: "دانه قهوه، ابزار دم‌آوری و اکسسوری‌های محبوب فروشگاه." },
                linkTitle: { type: String, trim: true, default: "مشاهده فروشگاه" },
            },
            latestArticles: {
                eyebrow: { type: String, trim: true, default: "مجله ممد کافی" },
                title: { type: String, trim: true, default: "جدیدترین مقالات" },
                description: { type: String, trim: true, default: "راهنمای قهوه، دم‌آوری و انتخاب بهتر؛ مستقیم از مقالات منتشرشده سایت." },
                linkTitle: { type: String, trim: true, default: "همه مقالات" },
            },
            personalized: {
                eyebrow: { type: String, trim: true, default: "پیشنهاد برای تو" },
                personalizedTitle: { type: String, trim: true, default: "براساس سلیقه تو" },
                fallbackTitle: { type: String, trim: true, default: "منتخب ممد کافی" },
                personalizedDescription: {
                    type: String,
                    trim: true,
                    default: "علاقه‌مندی‌ها، خریدها و تعامل‌های تو روی این پیشنهادها اثر می‌گذارند.",
                },
                fallbackDescription: {
                    type: String,
                    trim: true,
                    default: "با استفاده بیشتر از سایت، پیشنهادهای تو شخصی‌تر می‌شوند.",
                },
            },
        },

        about: {
            eyebrow: { type: String, trim: true, default: "درباره ممد کافی" },
            title: { type: String, trim: true, default: "هر فنجان، شروع یک تجربه تازه" },
            description: {
                type: String,
                trim: true,
                default: "ممد کافی جایی برای تجربه قهوه خوب، انتخاب آگاهانه و لحظه‌های ماندگار است.",
            },
            storyEyebrow: { type: String, trim: true, default: "داستان ما" },
            storyTitle: { type: String, trim: true, default: "از علاقه به قهوه تا یک تجربه کامل" },
            storyDescription: {
                type: String,
                trim: true,
                default: "ممد کافی با یک ایده ساده شکل گرفت: دسترسی به قهوه باکیفیت نباید پیچیده باشد. منوی کافه، فروشگاه دانه و تجهیزات و تجربه سفارش آنلاین را در یک مسیر یکپارچه کنار هم قرار دادیم.",
            },
            valuesEyebrow: { type: String, trim: true, default: "ارزش‌های ما" },
            valuesTitle: { type: String, trim: true, default: "چیزی فراتر از یک سفارش" },
            stats: { type: [aboutStatSchema], default: [] },
            values: { type: [aboutValueSchema], default: [] },
        },

        contact: {
            eyebrow: { type: String, trim: true, default: "تماس با ما" },
            title: { type: String, trim: true, default: "از شنیدن صدایت خوشحال می‌شویم" },
            description: {
                type: String,
                trim: true,
                default: "برای پیگیری سفارش، سؤال درباره محصولات یا پیشنهاد و انتقاد، از راه‌های ارتباطی ممد کافی استفاده کن.",
            },
        },

        footer: {
            description: {
                type: String,
                trim: true,
                default: "ممد کافی؛ قهوه، نوشیدنی و ابزارهایی برای ساختن یک تجربه بهتر از قهوه.",
            },
            copyright: {
                type: String,
                trim: true,
                default: "© MMD Coffee. همه حقوق محفوظ است.",
            },
            groups: { type: [footerGroupSchema], default: [] },
        },
    },
    { timestamps: true },
);

const SiteContent =
    mongoose.models.SiteContent || mongoose.model("SiteContent", siteContentSchema);

export default SiteContent;
