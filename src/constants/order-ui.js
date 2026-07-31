export const orderStatusConfig = {
    pending: {
        title: "در انتظار بررسی",
        className: "bg-amber-50 text-amber-700",
    },

    confirmed: {
        title: "تأییدشده",
        className: "bg-blue-50 text-blue-700",
    },

    preparing: {
        title: "در حال آماده‌سازی",
        className: "bg-violet-50 text-violet-700",
    },

    ready: {
        title: "آماده تحویل",
        className: "bg-cyan-50 text-cyan-700",
    },

    "out-for-delivery": {
        title: "در حال ارسال",
        className: "bg-indigo-50 text-indigo-700",
    },

    completed: {
        title: "تکمیل‌شده",
        className: "bg-emerald-50 text-emerald-700",
    },

    cancelled: {
        title: "لغوشده",
        className: "bg-red-50 text-red-700",
    },
};

export const paymentStatusConfig = {
    unpaid: {
        title: "پرداخت‌نشده",
        className: "bg-amber-50 text-amber-700",
    },

    pending: {
        title: "در انتظار پرداخت",
        className: "bg-blue-50 text-blue-700",
    },

    paid: {
        title: "پرداخت‌شده",
        className: "bg-emerald-50 text-emerald-700",
    },

    failed: {
        title: "پرداخت ناموفق",
        className: "bg-red-50 text-red-700",
    },

    refunded: {
        title: "بازپرداخت‌شده",
        className: "bg-slate-100 text-slate-600",
    },
};

export const paymentMethodLabels = {
    cash: "پرداخت نقدی",
    card: "کارت‌خوان",
    online: "پرداخت آنلاین",
};

export const deliveryMethodLabels = {
    pickup: "دریافت حضوری",
    delivery: "ارسال به آدرس",
};
