import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import mongoose from "mongoose";

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const root = process.cwd();
loadEnvironmentFile(path.join(root, ".env.local"));
loadEnvironmentFile(path.join(root, ".env"));

if (!process.env.MONGO_URL) {
  throw new Error("MONGO_URL در .env.local یا .env تعریف نشده است.");
}

const now = new Date();

const categories = [
  { title: "قهوه گرم", slug: "hot-drinks", catalogType: "cafe", description: "اسپرسو، امریکانو، لاته و نوشیدنی‌های گرم قهوه", accentColor: "#8b5e3c", displayOrder: 10 },
  { title: "نوشیدنی سرد", slug: "cold-drinks", catalogType: "cafe", description: "آیس‌کافی، کلدبرو و نوشیدنی‌های خنک", accentColor: "#648c88", displayOrder: 20 },
  { title: "چای و دمنوش", slug: "tea-and-infusions", catalogType: "cafe", description: "چای، ماسالا و دمنوش‌های تازه", accentColor: "#8c7551", displayOrder: 30 },
  { title: "دسر", slug: "desserts", catalogType: "cafe", description: "کیک و دسر مناسب کنار قهوه", accentColor: "#b77862", displayOrder: 40 },
  { title: "بیکری", slug: "bakery", catalogType: "cafe", description: "کروسان و خوراکی‌های تازه کافه", accentColor: "#c29562", displayOrder: 50 },

  { title: "دانه قهوه", slug: "coffee-beans", catalogType: "shop", description: "دانه و بلندهای تازه‌برشت برای خانه", accentColor: "#6d4532", displayOrder: 110 },
  { title: "ابزار دم‌آوری", slug: "brewing-tools", catalogType: "shop", description: "ابزارهای دم‌آوری خانگی و حرفه‌ای", accentColor: "#bd7845", displayOrder: 120 },
  { title: "ماگ و اکسسوری", slug: "accessories", catalogType: "shop", description: "ماگ، تامبلر و لوازم جانبی قهوه", accentColor: "#526e67", displayOrder: 130 },
  { title: "باکس هدیه", slug: "gift-boxes", catalogType: "shop", description: "پک‌های هدیه برای دوستداران قهوه", accentColor: "#88483d", displayOrder: 140 },
];

const v = (title, priceAdjustment = 0, isDefault = false) => ({ title, priceAdjustment, isDefault, isActive: true });
const a = (title, price = 0) => ({ title, price, isActive: true });

const cafe = (data) => ({
  catalogType: "cafe",
  trackStock: false,
  stock: 999,
  preparationTime: 8,
  variants: [],
  addOns: [],
  discountPercent: 0,
  ratingAverage: 4.6,
  reviewsCount: 10,
  salesCount: 30,
  popularityScore: 60,
  isFeatured: false,
  isNew: false,
  ...data,
});

const shop = (data) => ({
  catalogType: "shop",
  trackStock: true,
  stock: 20,
  preparationTime: 0,
  variants: [],
  addOns: [],
  discountPercent: 0,
  ratingAverage: 4.6,
  reviewsCount: 8,
  salesCount: 20,
  popularityScore: 55,
  isFeatured: false,
  isNew: false,
  ...data,
});

const products = [
  cafe({ categorySlug: "hot-drinks", name: "اسپرسو", englishName: "Espresso", slug: "espresso", shortDescription: "شات اسپرسوی متعادل با کرمای غلیظ", description: "اسپرسوی ممد کافی با بلند اختصاصی، شیرینی طبیعی و پس‌مزه شکلاتی.", price: 85000, image: "/images/products/cafe/espresso.webp", intensity: "high", ingredients: ["قهوه تازه آسیاب‌شده"], variants: [v("سینگل",0,true),v("دبل",45000)], addOns: [a("شات اضافه",45000)], preparationTime: 5, isFeatured: true, salesCount: 420, popularityScore: 100, ratingAverage: 4.9, reviewsCount: 96, displayOrder: 10 }),
  cafe({ categorySlug: "hot-drinks", name: "آمریکانو", englishName: "Americano", slug: "americano", shortDescription: "اسپرسو و آب داغ؛ ساده، خوش‌عطر و شفاف", description: "آمریکانوی کلاسیک با اسپرسوی تازه و نسبت متعادل آب.", price: 105000, image: "/images/products/cafe/americano.webp", intensity: "high", ingredients: ["اسپرسو","آب داغ"], variants: [v("متوسط",0,true),v("بزرگ",35000)], addOns: [a("شات اضافه",45000)], preparationTime: 5, salesCount: 310, popularityScore: 94, ratingAverage: 4.8, reviewsCount: 70, displayOrder: 20 }),
  cafe({ categorySlug: "hot-drinks", name: "کافه لاته", englishName: "Cafe Latte", slug: "cafe-latte", shortDescription: "اسپرسو با شیر بخارداده و فوم لطیف", description: "لاته نرم و متعادل با امکان انتخاب شیر و سیروپ.", price: 155000, image: "/images/products/cafe/cafe-latte.webp", intensity: "medium", ingredients: ["اسپرسو","شیر"], variants: [v("متوسط",0,true),v("بزرگ",45000)], addOns: [a("شات اضافه",45000),a("شیر بدون لاکتوز",30000),a("سیروپ وانیل",25000)], preparationTime: 8, isFeatured: true, salesCount: 390, popularityScore: 99, ratingAverage: 4.9, reviewsCount: 104, displayOrder: 30 }),
  cafe({ categorySlug: "hot-drinks", name: "کاپوچینو", englishName: "Cappuccino", slug: "cappuccino", shortDescription: "اسپرسو، شیر و فوم حجیم با تعادل کلاسیک", description: "کاپوچینوی کلاسیک با بافت فوم یکدست.", price: 145000, image: "/images/products/cafe/cappuccino.webp", intensity: "medium", ingredients: ["اسپرسو","شیر","فوم شیر"], addOns: [a("دارچین",0),a("شات اضافه",45000)], preparationTime: 8, salesCount: 280, popularityScore: 91, ratingAverage: 4.8, reviewsCount: 64, displayOrder: 40 }),
  cafe({ categorySlug: "hot-drinks", name: "موکا", englishName: "Mocha", slug: "mocha", shortDescription: "اسپرسو، شکلات و شیر برای طعمی شیرین و قهوه‌ای", description: "موکای گرم با سس شکلات و اسپرسوی تازه.", price: 175000, image: "/images/products/cafe/mocha.webp", intensity: "medium", ingredients: ["اسپرسو","شیر","شکلات"], variants: [v("متوسط",0,true),v("بزرگ",45000)], addOns: [a("شات اضافه",45000),a("خامه",25000)], preparationTime: 9, salesCount: 230, popularityScore: 86, ratingAverage: 4.7, reviewsCount: 51, displayOrder: 50 }),
  cafe({ categorySlug: "hot-drinks", name: "فلت وایت", englishName: "Flat White", slug: "flat-white", shortDescription: "دبل اسپرسو و شیر میکروفوم با طعم قهوه برجسته", description: "فلت وایت با نسبت قهوه بیشتر و بافت شیر ابریشمی.", price: 165000, image: "/images/products/cafe/flat-white.webp", intensity: "high", ingredients: ["دبل اسپرسو","شیر"], preparationTime: 8, isNew: true, salesCount: 155, popularityScore: 82, ratingAverage: 4.8, reviewsCount: 31, displayOrder: 60 }),

  cafe({ categorySlug: "cold-drinks", name: "آیس لاته", englishName: "Iced Latte", slug: "iced-latte", shortDescription: "اسپرسو، شیر سرد و یخ؛ سبک و خنک", description: "آیس لاته با اسپرسوی تازه و شیر سرد.", price: 165000, image: "/images/products/cafe/iced-latte.webp", intensity: "medium", ingredients: ["اسپرسو","شیر","یخ"], variants: [v("متوسط",0,true),v("بزرگ",45000)], addOns: [a("سیروپ وانیل",25000),a("شات اضافه",45000)], preparationTime: 7, isFeatured: true, salesCount: 350, popularityScore: 97, ratingAverage: 4.9, reviewsCount: 81, displayOrder: 70 }),
  cafe({ categorySlug: "cold-drinks", name: "آیس آمریکانو", englishName: "Iced Americano", slug: "iced-americano", shortDescription: "اسپرسو با آب سرد و یخ؛ پرانرژی و شفاف", description: "آیس آمریکانوی ساده و پرطعم.", price: 120000, image: "/images/products/cafe/iced-americano.webp", intensity: "high", ingredients: ["اسپرسو","آب","یخ"], addOns: [a("شات اضافه",45000)], preparationTime: 5, salesCount: 260, popularityScore: 90, ratingAverage: 4.7, reviewsCount: 48, displayOrder: 80 }),
  cafe({ categorySlug: "cold-drinks", name: "کلد برو", englishName: "Cold Brew", slug: "cold-brew", shortDescription: "عصاره‌گیری سرد طولانی با شیرینی طبیعی و تلخی کم", description: "کلدبروی ۱۸ ساعته با بدنه نرم و کافئین مناسب.", price: 155000, image: "/images/products/cafe/cold-brew.webp", intensity: "high", ingredients: ["قهوه کلدبرو","یخ"], addOns: [a("تونیک",35000)], preparationTime: 3, isFeatured: true, salesCount: 240, popularityScore: 93, ratingAverage: 4.9, reviewsCount: 59, displayOrder: 90 }),
  cafe({ categorySlug: "cold-drinks", name: "آیس موکا", englishName: "Iced Mocha", slug: "iced-mocha", shortDescription: "شکلات، اسپرسو، شیر سرد و یخ", description: "آیس موکای شکلاتی و متعادل.", price: 185000, image: "/images/products/cafe/iced-mocha.webp", intensity: "medium", ingredients: ["اسپرسو","شیر","شکلات","یخ"], addOns: [a("خامه",25000),a("شات اضافه",45000)], preparationTime: 8, salesCount: 185, popularityScore: 84, ratingAverage: 4.7, reviewsCount: 43, displayOrder: 100 }),

  cafe({ categorySlug: "tea-and-infusions", name: "چای ماسالا", englishName: "Masala Chai", slug: "masala-chai", shortDescription: "چای ادویه‌ای گرم با شیر و عطر دارچین", description: "ماسالای گرم با ادویه‌های معطر و شیر.", price: 135000, image: "/images/products/cafe/masala-chai.webp", intensity: "medium", ingredients: ["چای","شیر","ادویه ماسالا"], addOns: [a("شیر بدون لاکتوز",30000)], preparationTime: 8, salesCount: 190, popularityScore: 83, ratingAverage: 4.7, reviewsCount: 42, displayOrder: 110 }),
  cafe({ categorySlug: "tea-and-infusions", name: "چای سبز و لیمو", englishName: "Green Tea & Lemon", slug: "green-tea-lemon", shortDescription: "چای سبز سبک با لیموی تازه", description: "نوشیدنی گرم سبک و معطر.", price: 105000, image: "/images/products/cafe/green-tea-lemon.webp", intensity: "low", ingredients: ["چای سبز","لیمو"], preparationTime: 7, salesCount: 95, popularityScore: 68, ratingAverage: 4.5, reviewsCount: 22, displayOrder: 120 }),
  cafe({ categorySlug: "tea-and-infusions", name: "دمنوش به‌لیمو", englishName: "Lemon Verbena Infusion", slug: "lemon-verbena-infusion", shortDescription: "دمنوش آرام و خوش‌عطر به‌لیمو", description: "دمنوش تازه به‌لیمو با عطر طبیعی.", price: 110000, image: "/images/products/cafe/lemon-verbena.webp", intensity: "low", ingredients: ["به‌لیمو","آب داغ"], preparationTime: 9, salesCount: 80, popularityScore: 64, ratingAverage: 4.5, reviewsCount: 17, displayOrder: 130 }),

  cafe({ categorySlug: "desserts", name: "چیزکیک سن سباستین", englishName: "San Sebastian Cheesecake", slug: "san-sebastian-cheesecake", shortDescription: "چیزکیک کرمی با رویه کاراملی", description: "یک برش چیزکیک سن سباستین تازه.", price: 195000, image: "/images/products/cafe/san-sebastian-cheesecake.webp", intensity: "low", ingredients: ["پنیر خامه‌ای","تخم‌مرغ","خامه"], preparationTime: 4, isFeatured: true, salesCount: 225, popularityScore: 92, ratingAverage: 4.9, reviewsCount: 73, displayOrder: 140 }),
  cafe({ categorySlug: "desserts", name: "براونی شکلاتی", englishName: "Chocolate Brownie", slug: "chocolate-brownie", shortDescription: "براونی فاجی با شکلات تلخ", description: "براونی شکلاتی مرطوب و غلیظ.", price: 145000, image: "/images/products/cafe/chocolate-brownie.webp", intensity: "low", ingredients: ["شکلات","کاکائو","کره"], addOns: [a("اسکوپ بستنی",45000)], preparationTime: 4, salesCount: 180, popularityScore: 85, ratingAverage: 4.8, reviewsCount: 49, displayOrder: 150 }),
  cafe({ categorySlug: "desserts", name: "تیرامیسو", englishName: "Tiramisu", slug: "tiramisu", shortDescription: "دسر ایتالیایی با قهوه، ماسکارپونه و کاکائو", description: "تیرامیسوی روز با قهوه تازه.", price: 185000, image: "/images/products/cafe/tiramisu.webp", intensity: "low", ingredients: ["قهوه","ماسکارپونه","کاکائو"], preparationTime: 3, isNew: true, salesCount: 145, popularityScore: 80, ratingAverage: 4.8, reviewsCount: 36, displayOrder: 160 }),
  cafe({ categorySlug: "bakery", name: "کروسان کره‌ای", englishName: "Butter Croissant", slug: "butter-croissant", shortDescription: "کروسان لایه‌ای و تازه با کره", description: "کروسان تازه مناسب صبحانه و کنار قهوه.", price: 115000, image: "/images/products/cafe/butter-croissant.webp", intensity: "low", ingredients: ["آرد","کره","خمیرمایه"], addOns: [a("مربا",25000),a("شکلات",30000)], preparationTime: 4, salesCount: 165, popularityScore: 79, ratingAverage: 4.7, reviewsCount: 35, displayOrder: 170 }),
  cafe({ categorySlug: "bakery", name: "کروسان بادام", englishName: "Almond Croissant", slug: "almond-croissant", shortDescription: "کروسان با کرم بادام و خلال بادام", description: "کروسان بادام شیرین و ترد.", price: 145000, image: "/images/products/cafe/almond-croissant.webp", intensity: "low", ingredients: ["آرد","کره","بادام"], preparationTime: 4, isNew: true, salesCount: 120, popularityScore: 75, ratingAverage: 4.8, reviewsCount: 28, displayOrder: 180 }),

  shop({ categorySlug: "coffee-beans", name: "بلند اختصاصی ممد کافی", englishName: "MMD House Blend", slug: "mmd-house-blend", shortDescription: "ترکیب اختصاصی مناسب اسپرسو با کرمای بالا", description: "بلند روزانه ممد کافی با نت‌های شکلات، آجیل و کارامل.", price: 485000, image: "/images/products/shop/mmd-house-blend.webp", intensity: "high", ingredients: ["عربیکا و روبوستا","برشت متوسط رو به تیره"], variants: [v("۲۵۰ گرم",0,true),v("۵۰۰ گرم",420000),v("۱ کیلوگرم",1240000)], stock: 64, isFeatured: true, discountPercent: 10, salesCount: 350, popularityScore: 100, ratingAverage: 4.9, reviewsCount: 83, displayOrder: 210 }),
  shop({ categorySlug: "coffee-beans", name: "قهوه اتیوپی گوجی", englishName: "Ethiopia Guji", slug: "ethiopia-guji-coffee", shortDescription: "میوه‌ای و گلی؛ مناسب روش‌های دمی", description: "عربیکای اتیوپی با نت مرکبات، گل و هلو.", price: 690000, image: "/images/products/shop/ethiopia-guji.webp", intensity: "medium", ingredients: ["۱۰۰٪ عربیکا","برشت متوسط","فرآوری شسته"], variants: [v("۲۵۰ گرم",0,true),v("۵۰۰ گرم",610000)], stock: 30, isFeatured: true, isNew: true, salesCount: 165, popularityScore: 91, ratingAverage: 4.8, reviewsCount: 45, displayOrder: 220 }),
  shop({ categorySlug: "coffee-beans", name: "قهوه برزیل سانتوس", englishName: "Brazil Santos", slug: "brazil-santos-coffee", shortDescription: "شکلاتی و آجیلی؛ انتخاب مطمئن برای اسپرسو", description: "بدنه خوب، اسیدیته کم و نت فندق و شکلات.", price: 545000, image: "/images/products/shop/brazil-santos.webp", intensity: "high", ingredients: ["۱۰۰٪ عربیکا","برشت متوسط رو به تیره"], variants: [v("۲۵۰ گرم",0,true),v("۵۰۰ گرم",485000)], stock: 45, salesCount: 210, popularityScore: 95, ratingAverage: 4.8, reviewsCount: 52, displayOrder: 230 }),
  shop({ categorySlug: "coffee-beans", name: "قهوه کلمبیا سوپریمو", englishName: "Colombia Supremo", slug: "colombia-supremo-coffee", shortDescription: "متعادل با شیرینی کاراملی و میوه قرمز", description: "دانه کلمبیا برای اسپرسو و دم‌آوری دستی.", price: 625000, image: "/images/products/shop/colombia-supremo.webp", intensity: "medium", ingredients: ["۱۰۰٪ عربیکا","برشت متوسط"], variants: [v("۲۵۰ گرم",0,true),v("۵۰۰ گرم",555000)], stock: 27, discountPercent: 5, salesCount: 130, popularityScore: 84, ratingAverage: 4.7, reviewsCount: 33, displayOrder: 240 }),

  shop({ categorySlug: "brewing-tools", name: "دریپر V60 سرامیکی", englishName: "Ceramic V60 Dripper", slug: "ceramic-v60-dripper", shortDescription: "دریپر سایز ۰۲ برای دم‌آوری دقیق و شفاف", description: "دریپر سرامیکی با شیارهای مارپیچ و حفظ مناسب دما.", price: 890000, image: "/images/products/shop/ceramic-v60.webp", ingredients: ["سرامیک","سایز ۰۲"], stock: 18, isFeatured: true, isNew: true, salesCount: 95, popularityScore: 82, ratingAverage: 4.8, reviewsCount: 29, displayOrder: 250 }),
  shop({ categorySlug: "brewing-tools", name: "فرنچ پرس ۶۰۰ میلی‌لیتر", englishName: "French Press 600ml", slug: "french-press-600ml", shortDescription: "فرنچ پرس شیشه‌ای با فیلتر استیل", description: "مناسب قهوه و دمنوش برای استفاده روزانه.", price: 1150000, image: "/images/products/shop/french-press.webp", ingredients: ["شیشه مقاوم","فیلتر استیل"], stock: 14, salesCount: 76, popularityScore: 73, ratingAverage: 4.6, reviewsCount: 20, displayOrder: 260 }),
  shop({ categorySlug: "brewing-tools", name: "آسیاب دستی قهوه", englishName: "Manual Coffee Grinder", slug: "manual-coffee-grinder", shortDescription: "آسیاب دستی با درجه قابل تنظیم", description: "مناسب اسپرسو تا فرنچ پرس، جمع‌وجور و قابل حمل.", price: 1980000, image: "/images/products/shop/manual-grinder.webp", ingredients: ["تیغه استیل","بدنه آلومینیوم"], stock: 12, discountPercent: 8, isFeatured: true, salesCount: 88, popularityScore: 85, ratingAverage: 4.8, reviewsCount: 26, displayOrder: 270 }),
  shop({ categorySlug: "brewing-tools", name: "کتل گردن‌غازی", englishName: "Gooseneck Kettle", slug: "gooseneck-kettle", shortDescription: "کتل با خروجی کنترل‌شده برای پوراور", description: "کتل استیل مناسب V60 و روش‌های دم‌آوری دستی.", price: 2350000, image: "/images/products/shop/gooseneck-kettle.webp", ingredients: ["استیل ضدزنگ","ظرفیت ۸۰۰ میلی‌لیتر"], stock: 10, isNew: true, salesCount: 45, popularityScore: 70, ratingAverage: 4.7, reviewsCount: 13, displayOrder: 280 }),

  shop({ categorySlug: "accessories", name: "ماگ سرامیکی ممد کافی", englishName: "MMD Ceramic Mug", slug: "mmd-ceramic-mug", shortDescription: "ماگ مینیمال سرامیکی با لوگوی ممد کافی", description: "ماگ روزمره با لعاب مات و ظرفیت مناسب.", price: 690000, image: "/images/products/shop/ceramic-mug.webp", ingredients: ["سرامیک","۳۵۰ میلی‌لیتر"], variants: [v("کرم",0,true),v("ذغالی",0)], stock: 35, isFeatured: true, salesCount: 102, popularityScore: 86, ratingAverage: 4.8, reviewsCount: 31, displayOrder: 290 }),
  shop({ categorySlug: "accessories", name: "تامبلر سفری", englishName: "Travel Tumbler", slug: "travel-tumbler", shortDescription: "تامبلر دوجداره برای نوشیدنی گرم و سرد", description: "درب ضدنشت و بدنه دوجداره مناسب رفت‌وآمد روزانه.", price: 1250000, image: "/images/products/shop/travel-tumbler.webp", ingredients: ["استیل دوجداره","۴۵۰ میلی‌لیتر"], variants: [v("مشکی",0,true),v("سفید",0)], stock: 24, discountPercent: 5, salesCount: 84, popularityScore: 80, ratingAverage: 4.7, reviewsCount: 23, displayOrder: 300 }),
  shop({ categorySlug: "accessories", name: "فیلتر کاغذی V60 بسته ۱۰۰ عددی", englishName: "V60 Paper Filters", slug: "v60-paper-filters-100", shortDescription: "فیلتر سفید سایز ۰۲ برای V60", description: "بسته ۱۰۰ عددی فیلتر مناسب دریپر V60 سایز ۰۲.", price: 420000, image: "/images/products/shop/v60-filters.webp", ingredients: ["۱۰۰ عدد","سایز ۰۲"], stock: 55, salesCount: 115, popularityScore: 79, ratingAverage: 4.7, reviewsCount: 21, displayOrder: 310 }),

  shop({ categorySlug: "gift-boxes", name: "باکس هدیه قهوه کلاسیک", englishName: "Classic Coffee Gift Box", slug: "classic-coffee-gift-box", shortDescription: "دانه قهوه، ماگ و کارت هدیه در یک بسته", description: "پک هدیه آماده برای دوستداران قهوه.", price: 1890000, image: "/images/products/shop/classic-gift-box.webp", ingredients: ["قهوه ۲۵۰ گرم","ماگ","کارت هدیه"], addOns: [a("کارت دست‌نویس",70000),a("بسته‌بندی ویژه",120000)], stock: 16, isFeatured: true, isNew: true, salesCount: 64, popularityScore: 88, ratingAverage: 4.9, reviewsCount: 19, displayOrder: 320 }),
];

function withSubdocumentIds(items = []) {
  return items.map((item) => ({ _id: new mongoose.Types.ObjectId(), ...item }));
}

function localImagePath(webPath) {
  return path.join(root, "public", webPath.replace(/^\//, ""));
}

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection.db;
  const categoriesCollection = db.collection("categories");
  const productsCollection = db.collection("products");
  const categoryIds = new Map();

  for (const category of categories) {
    const current = await categoriesCollection.findOne({ slug: category.slug });
    const id = current?._id || new mongoose.Types.ObjectId();
    categoryIds.set(category.slug, id);
    await categoriesCollection.updateOne(
      { slug: category.slug },
      {
        $set: { ...category, image: "", imageAlt: category.title, isActive: true, archivedAt: null, updatedAt: now },
        $setOnInsert: { _id: id, createdAt: now },
      },
      { upsert: true },
    );
  }

  const missingImages = [];

  for (const template of products) {
    const { categorySlug, catalogType, ...product } = template;
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`دسته ${categorySlug} پیدا نشد.`);

    if (!fs.existsSync(localImagePath(product.image))) missingImages.push(product.image);

    const current = await productsCollection.findOne({ slug: product.slug });
    const variants = current?.variants?.length ? current.variants : withSubdocumentIds(product.variants || []);
    const addOns = current?.addOns?.length ? current.addOns : withSubdocumentIds(product.addOns || []);

    await productsCollection.updateOne(
      { slug: product.slug },
      {
        $set: {
          ...product,
          category: categoryId,
          variants,
          addOns,
          gallery: product.gallery || [],
          trackStock: catalogType === "shop",
          stock: catalogType === "shop" ? Math.max(0, Number(product.stock) || 0) : 999,
          preparationTime: catalogType === "cafe" ? Math.max(1, Number(product.preparationTime) || 5) : 0,
          isAvailable: true,
          status: "published",
          archivedAt: null,
          viewsCount: current?.viewsCount || 0,
          wishlistCount: current?.wishlistCount || 0,
          seoTitle: product.name,
          seoDescription: product.shortDescription,
          updatedAt: now,
        },
        $setOnInsert: { _id: current?._id || new mongoose.Types.ObjectId(), createdAt: now },
      },
      { upsert: true },
    );
  }

  console.log(`✅ ${categories.filter((item) => item.catalogType === "cafe").length} دسته کافه آماده شد.`);
  console.log(`✅ ${categories.filter((item) => item.catalogType === "shop").length} دسته فروشگاه آماده شد.`);
  console.log(`✅ ${products.filter((item) => item.catalogType === "cafe").length} آیتم منوی کافه آماده شد.`);
  console.log(`✅ ${products.filter((item) => item.catalogType === "shop").length} محصول فروشگاهی آماده شد.`);
  console.log("✅ داده‌ها بر اساس slug آپدیت/ایجاد شدند؛ داده دیگری حذف نشد.");

  if (missingImages.length) {
    console.log("\n⚠️ این عکس‌ها هنوز داخل public پیدا نشدند. فایل واقعی را دقیقاً در این مسیرها قرار بده:");
    missingImages.forEach((image) => console.log(`   ${image}`));
  } else {
    console.log("✅ همه عکس‌های واقعی مورد انتظار پیدا شدند.");
  }
}

run()
  .catch((error) => {
    console.error("❌ خطای seed کاتالوگ:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
