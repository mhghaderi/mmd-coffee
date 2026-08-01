import mongoose from "mongoose";

const workingHourSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            required: true,
            enum: [
                "saturday",
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
            ],
        },

        isOpen: {
            type: Boolean,
            default: true,
        },

        opensAt: {
            type: String,
            trim: true,
            default: "08:00",
            match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, "ساعت شروع معتبر نیست"],
        },

        closesAt: {
            type: String,
            trim: true,
            default: "23:00",
            match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, "ساعت پایان معتبر نیست"],
        },
    },
    {
        _id: false,
    },
);

const siteSettingsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            unique: true,
            default: "main",
            immutable: true,
        },

        storeName: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "ممد کافی",
        },

        storeEnglishName: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "MMD Coffee",
        },

        tagline: {
            type: String,
            trim: true,
            maxlength: 180,
            default: "هر فنجان، یک تجربه تازه",
        },

        logo: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        supportEmail: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 150,
            default: "",
        },

        supportPhone: {
            type: String,
            trim: true,
            maxlength: 30,
            default: "",
        },

        address: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        orderSettings: {
            minOrderAmount: {
                type: Number,
                min: 0,
                default: 0,
            },

            deliveryFee: {
                type: Number,
                min: 0,
                default: 45000,
            },

            freeDeliveryThreshold: {
                type: Number,
                min: 0,
                default: 0,
            },

            defaultPreparationTime: {
                type: Number,
                min: 0,
                max: 720,
                default: 20,
            },

            maxDailyOrders: {
                type: Number,
                min: 0,
                max: 100000,
                default: 0,
            },
        },

        features: {
            acceptOrders: {
                type: Boolean,
                default: true,
            },

            maintenanceMode: {
                type: Boolean,
                default: false,
            },

            reviewsEnabled: {
                type: Boolean,
                default: true,
            },

            ticketsEnabled: {
                type: Boolean,
                default: true,
            },

            guestCheckoutEnabled: {
                type: Boolean,
                default: true,
            },
        },

        notifications: {
            newOrderEmail: {
                type: Boolean,
                default: true,
            },

            newTicketEmail: {
                type: Boolean,
                default: true,
            },

            newReviewEmail: {
                type: Boolean,
                default: false,
            },

            lowStockEmail: {
                type: Boolean,
                default: true,
            },

            lowStockThreshold: {
                type: Number,
                min: 0,
                max: 100000,
                default: 5,
            },
        },

        seo: {
            defaultTitle: {
                type: String,
                trim: true,
                maxlength: 70,
                default: "ممد کافی | سفارش آنلاین قهوه و نوشیدنی",
            },

            defaultDescription: {
                type: String,
                trim: true,
                maxlength: 180,
                default: "سفارش آنلاین قهوه، نوشیدنی و دسر از ممد کافی",
            },

            keywords: {
                type: [
                    {
                        type: String,
                        trim: true,
                        lowercase: true,
                        maxlength: 50,
                    },
                ],
                default: [],
            },
        },

        socialLinks: {
            instagram: {
                type: String,
                trim: true,
                maxlength: 300,
                default: "",
            },

            telegram: {
                type: String,
                trim: true,
                maxlength: 300,
                default: "",
            },

            whatsapp: {
                type: String,
                trim: true,
                maxlength: 300,
                default: "",
            },
        },

        workingHours: {
            type: [workingHourSchema],
            default: () => [
                { day: "saturday", isOpen: true, opensAt: "08:00", closesAt: "23:00" },
                { day: "sunday", isOpen: true, opensAt: "08:00", closesAt: "23:00" },
                { day: "monday", isOpen: true, opensAt: "08:00", closesAt: "23:00" },
                { day: "tuesday", isOpen: true, opensAt: "08:00", closesAt: "23:00" },
                { day: "wednesday", isOpen: true, opensAt: "08:00", closesAt: "23:00" },
                { day: "thursday", isOpen: true, opensAt: "08:00", closesAt: "23:00" },
                { day: "friday", isOpen: true, opensAt: "09:00", closesAt: "23:00" },
            ],
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

const SiteSettings =
    mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
