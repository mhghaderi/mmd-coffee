import connectToDB from "@/lib/db/connectToDB";
import { requireAdmin } from "@/lib/auth/session";
import SiteSettings from "@/models/SiteSettings";

const dayValues = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
];

function cleanText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanNumber(value, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return minimum;
    }

    return Math.min(Math.max(number, minimum), maximum);
}

function cleanBoolean(value, fallback = false) {
    return typeof value === "boolean" ? value : fallback;
}

function normalizeKeywords(value) {
    const source = Array.isArray(value)
        ? value
        : typeof value === "string"
          ? value.split(",")
          : [];

    return [
        ...new Set(
            source
                .map((item) => cleanText(item, 50).toLowerCase())
                .filter(Boolean),
        ),
    ].slice(0, 20);
}

function normalizeWorkingHours(value) {
    const source = Array.isArray(value) ? value : [];
    const byDay = new Map(source.map((item) => [item?.day, item]));

    return dayValues.map((day) => {
        const item = byDay.get(day) || {};
        const opensAt = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(item.opensAt || "")
            ? item.opensAt
            : "08:00";
        const closesAt = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(item.closesAt || "")
            ? item.closesAt
            : "23:00";

        return {
            day,
            isOpen: cleanBoolean(item.isOpen, true),
            opensAt,
            closesAt,
        };
    });
}

function createPayload(body, currentUser) {
    return {
        storeName: cleanText(body.storeName, 100) || "ممد کافی",
        storeEnglishName: cleanText(body.storeEnglishName, 100) || "MMD Coffee",
        tagline: cleanText(body.tagline, 180),
        logo: cleanText(body.logo, 500),
        supportEmail: cleanText(body.supportEmail, 150).toLowerCase(),
        supportPhone: cleanText(body.supportPhone, 30),
        address: cleanText(body.address, 500),

        orderSettings: {
            minOrderAmount: cleanNumber(body.orderSettings?.minOrderAmount),
            deliveryFee: cleanNumber(body.orderSettings?.deliveryFee),
            freeDeliveryThreshold: cleanNumber(body.orderSettings?.freeDeliveryThreshold),
            defaultPreparationTime: cleanNumber(body.orderSettings?.defaultPreparationTime, {
                maximum: 720,
            }),
            maxDailyOrders: cleanNumber(body.orderSettings?.maxDailyOrders, {
                maximum: 100000,
            }),
        },

        features: {
            acceptOrders: cleanBoolean(body.features?.acceptOrders, true),
            maintenanceMode: cleanBoolean(body.features?.maintenanceMode),
            reviewsEnabled: cleanBoolean(body.features?.reviewsEnabled, true),
            ticketsEnabled: cleanBoolean(body.features?.ticketsEnabled, true),
            guestCheckoutEnabled: cleanBoolean(body.features?.guestCheckoutEnabled, true),
        },

        notifications: {
            newOrderEmail: cleanBoolean(body.notifications?.newOrderEmail, true),
            newTicketEmail: cleanBoolean(body.notifications?.newTicketEmail, true),
            newReviewEmail: cleanBoolean(body.notifications?.newReviewEmail),
            lowStockEmail: cleanBoolean(body.notifications?.lowStockEmail, true),
            lowStockThreshold: cleanNumber(body.notifications?.lowStockThreshold, {
                maximum: 100000,
            }),
        },

        seo: {
            defaultTitle: cleanText(body.seo?.defaultTitle, 70),
            defaultDescription: cleanText(body.seo?.defaultDescription, 180),
            keywords: normalizeKeywords(body.seo?.keywords),
        },

        socialLinks: {
            instagram: cleanText(body.socialLinks?.instagram, 300),
            telegram: cleanText(body.socialLinks?.telegram, 300),
            whatsapp: cleanText(body.socialLinks?.whatsapp, 300),
        },

        workingHours: normalizeWorkingHours(body.workingHours),
        updatedBy: currentUser.id,
    };
}

export async function GET() {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const settings = await SiteSettings.findOneAndUpdate(
            { key: "main" },
            { $setOnInsert: { key: "main" } },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        ).lean();

        return Response.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error("GET ADMIN SETTINGS ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت تنظیمات انجام نشد",
            },
            { status: 500 },
        );
    }
}

export async function PATCH(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        await connectToDB();

        const body = await request.json();
        const payload = createPayload(body || {}, authorization.user);

        if (payload.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.supportEmail)) {
            return Response.json(
                {
                    success: false,
                    message: "ایمیل پشتیبانی معتبر نیست",
                },
                { status: 400 },
            );
        }

        const settings = await SiteSettings.findOneAndUpdate(
            { key: "main" },
            {
                $set: payload,
                $setOnInsert: { key: "main" },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            },
        ).lean();

        return Response.json({
            success: true,
            message: "تنظیمات با موفقیت ذخیره شد",
            data: settings,
        });
    } catch (error) {
        console.error("UPDATE ADMIN SETTINGS ERROR:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((item) => item.message);

            return Response.json(
                {
                    success: false,
                    message: messages[0] || "اطلاعات تنظیمات معتبر نیست",
                    errors: messages,
                },
                { status: 400 },
            );
        }

        return Response.json(
            {
                success: false,
                message: "ذخیره تنظیمات انجام نشد",
            },
            { status: 500 },
        );
    }
}
