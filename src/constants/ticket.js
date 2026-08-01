export const TICKET_STATUS = {
    OPEN: "open",
    ANSWERED: "answered",
    CUSTOMER_REPLY: "customer-reply",
    CLOSED: "closed",
};

export const TICKET_STATUS_VALUES = Object.values(TICKET_STATUS);

export const ticketStatusLabels = {
    [TICKET_STATUS.OPEN]: "باز",
    [TICKET_STATUS.ANSWERED]: "پاسخ داده‌شده",
    [TICKET_STATUS.CUSTOMER_REPLY]: "پاسخ جدید مشتری",
    [TICKET_STATUS.CLOSED]: "بسته‌شده",
};

export const ticketStatusClasses = {
    [TICKET_STATUS.OPEN]: "bg-blue-50 text-blue-700",
    [TICKET_STATUS.ANSWERED]: "bg-emerald-50 text-emerald-700",
    [TICKET_STATUS.CUSTOMER_REPLY]: "bg-amber-50 text-amber-700",
    [TICKET_STATUS.CLOSED]: "bg-coffee-100 text-coffee-600",
};

export const TICKET_PRIORITY = {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high",
    URGENT: "urgent",
};

export const TICKET_PRIORITY_VALUES = Object.values(TICKET_PRIORITY);

export const ticketPriorityLabels = {
    [TICKET_PRIORITY.LOW]: "کم",
    [TICKET_PRIORITY.NORMAL]: "عادی",
    [TICKET_PRIORITY.HIGH]: "زیاد",
    [TICKET_PRIORITY.URGENT]: "فوری",
};

export const ticketPriorityClasses = {
    [TICKET_PRIORITY.LOW]: "bg-slate-50 text-slate-600",
    [TICKET_PRIORITY.NORMAL]: "bg-blue-50 text-blue-700",
    [TICKET_PRIORITY.HIGH]: "bg-orange-50 text-orange-700",
    [TICKET_PRIORITY.URGENT]: "bg-red-50 text-red-700",
};

export const TICKET_CATEGORY = {
    ORDER: "order",
    PAYMENT: "payment",
    PRODUCT: "product",
    ACCOUNT: "account",
    TECHNICAL: "technical",
    SUGGESTION: "suggestion",
    OTHER: "other",
};

export const TICKET_CATEGORY_VALUES = Object.values(TICKET_CATEGORY);

export const ticketCategoryLabels = {
    [TICKET_CATEGORY.ORDER]: "سفارش",
    [TICKET_CATEGORY.PAYMENT]: "پرداخت",
    [TICKET_CATEGORY.PRODUCT]: "محصول",
    [TICKET_CATEGORY.ACCOUNT]: "حساب کاربری",
    [TICKET_CATEGORY.TECHNICAL]: "مشکل فنی",
    [TICKET_CATEGORY.SUGGESTION]: "پیشنهاد و انتقاد",
    [TICKET_CATEGORY.OTHER]: "سایر",
};
