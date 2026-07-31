export const ORDER_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    READY: "ready",
    OUT_FOR_DELIVERY: "out-for-delivery",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const PAYMENT_METHOD = {
    CASH: "cash",
    CARD: "card",
    ONLINE: "online",
};

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);

export const PAYMENT_STATUS = {
    UNPAID: "unpaid",
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
};

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

export const DELIVERY_METHOD = {
    PICKUP: "pickup",
    DELIVERY: "delivery",
};

export const DELIVERY_METHOD_VALUES = Object.values(DELIVERY_METHOD);

export const MAX_ORDER_LINES = 30;
export const MAX_ITEM_QUANTITY = 20;
export const MAX_ADD_ONS_PER_ITEM = 10;
