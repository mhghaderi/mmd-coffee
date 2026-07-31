export const productCategories = [
    {
        id: "all",
        title: "همه محصولات",
        shortTitle: "همه",
        description: "تمام پیشنهادهای ممد کافی",
    },
    {
        id: "hot-drinks",
        title: "نوشیدنی‌های گرم",
        shortTitle: "گرم",
        description: "قهوه‌ها و نوشیدنی‌های گرم",
    },
    {
        id: "cold-drinks",
        title: "نوشیدنی‌های سرد",
        shortTitle: "سرد",
        description: "نوشیدنی‌های خنک و تازه",
    },
    {
        id: "desserts",
        title: "دسر و شیرینی",
        shortTitle: "دسر",
        description: "دسرها و شیرینی‌های تازه",
    },
    {
        id: "coffee-beans",
        title: "دانه قهوه",
        shortTitle: "دانه قهوه",
        description: "دانه‌های تازه‌برشت‌شده",
    },
];

export const products = [
    {
        id: "espresso",
        slug: "espresso",
        name: "اسپرسو",
        englishName: "Espresso",
        category: "hot-drinks",

        shortDescription: "پرقدرت و اصیل",
        description: "اسپرسویی با عطر عمیق، بافت غلیظ و طعمی متعادل؛ مناسب شروع یک روز پرانرژی.",

        price: 85000,
        discountPercent: 0,

        preparationTime: "۵ دقیقه",
        intensity: "شدت بالا",

        rating: 4.9,
        reviewsCount: 128,
        popularityScore: 98,

        image: "/images/product/espresso-cutout.webp",

        isAvailable: true,
        isNew: false,

        accent: "#d99b62",
        gradient: "linear-gradient(145deg, #3f291f 0%, #211612 55%, #130d0b 100%)",
    },

    {
        id: "latte",
        slug: "cafe-latte",
        name: "کافه لاته",
        englishName: "Caffè Latte",
        category: "hot-drinks",

        shortDescription: "نرم و متعادل",
        description: "ترکیبی لطیف از اسپرسوی تازه و شیر گرم با بافتی مخملی و طعمی آرام.",

        price: 145000,
        discountPercent: 10,

        preparationTime: "۸ دقیقه",
        intensity: "شدت متوسط",

        rating: 4.8,
        reviewsCount: 94,
        popularityScore: 95,

        image: "/images/product/latte-cutout.webp",

        isAvailable: true,
        isNew: false,

        accent: "#e7c29b",
        gradient: "linear-gradient(145deg, #72503a 0%, #3c291f 55%, #201510 100%)",
    },

    {
        id: "cold-brew",
        slug: "cold-brew",
        name: "کلد برو",
        englishName: "Cold Brew",
        category: "cold-drinks",

        shortDescription: "خنک و متفاوت",
        description: "قهوه‌ای خنک با عصاره‌گیری طولانی، اسیدیته کمتر و طعمی شفاف و متفاوت.",

        price: 165000,
        discountPercent: 0,

        preparationTime: "آماده سرو",
        intensity: "شدت ملایم",

        rating: 4.7,
        reviewsCount: 76,
        popularityScore: 91,

        image: "/images/product/cold-brew-cutout.webp",

        isAvailable: true,
        isNew: true,

        accent: "#c8a47c",
        gradient: "linear-gradient(145deg, #504237 0%, #29211c 55%, #15110f 100%)",
    },

    {
        id: "mocha",
        slug: "cafe-mocha",
        name: "کافه موکا",
        englishName: "Caffè Mocha",
        category: "hot-drinks",

        shortDescription: "شیرین و شکلاتی",
        description: "ترکیبی جذاب از اسپرسو، شیر و شکلات برای دوست‌داران طعم‌های شیرین.",

        price: 155000,
        discountPercent: 0,

        preparationTime: "۹ دقیقه",
        intensity: "شدت متوسط",

        rating: 4.8,
        reviewsCount: 87,
        popularityScore: 89,

        image: "/images/product/mocha-cutout.webp",

        isAvailable: true,
        isNew: false,

        accent: "#d6a779",
        gradient: "linear-gradient(145deg, #5b3525 0%, #321d17 55%, #170e0b 100%)",
    },

    {
        id: "caramel-macchiato",
        slug: "caramel-macchiato",
        name: "کارامل ماکیاتو",
        englishName: "Caramel Macchiato",
        category: "hot-drinks",

        shortDescription: "لطیف و کاراملی",
        description: "ترکیب اسپرسو، شیر و رایحه کارامل؛ یک انتخاب لطیف و پرطرفدار.",

        price: 175000,
        discountPercent: 15,

        preparationTime: "۸ دقیقه",
        intensity: "شدت متوسط",

        rating: 4.9,
        reviewsCount: 113,
        popularityScore: 93,

        image: "/images/product/caramel-macchiato-cutout.webp",

        isAvailable: true,
        isNew: false,

        accent: "#e0a464",
        gradient: "linear-gradient(145deg, #74492c 0%, #3d291d 55%, #1e140f 100%)",
    },

    {
        id: "affogato",
        slug: "affogato",
        name: "آفوگاتو",
        englishName: "Affogato",
        category: "desserts",

        shortDescription: "خاص و متفاوت",
        description: "ترکیب اسپرسوی داغ با بستنی سرد؛ تضادی جذاب برای یک تجربه متفاوت.",

        price: 135000,
        discountPercent: 0,

        preparationTime: "۶ دقیقه",
        intensity: "شدت متوسط",

        rating: 4.7,
        reviewsCount: 61,
        popularityScore: 86,

        image: "/images/product/affogato-cutout.webp",

        isAvailable: true,
        isNew: true,

        accent: "#ead0a8",
        gradient: "linear-gradient(145deg, #604633 0%, #33261e 55%, #17110e 100%)",
    },
];

export function getPopularProducts(limit = 8) {
    return [...products]
        .filter((product) => product.isAvailable)
        .sort(
            (firstProduct, secondProduct) =>
                secondProduct.popularityScore - firstProduct.popularityScore,
        )
        .slice(0, limit);
}
