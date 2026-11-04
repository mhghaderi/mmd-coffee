import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from "@/constants/order";

export function getAllowedOrderStatuses() {
    return ORDER_STATUS_VALUES;
}

export function canChangeOrderStatus({ nextStatus }) {
    return ORDER_STATUS_VALUES.includes(nextStatus);
}

export function getAllowedPaymentStatuses() {
    return PAYMENT_STATUS_VALUES;
}

export function canChangePaymentStatus({ nextStatus }) {
    return PAYMENT_STATUS_VALUES.includes(nextStatus);
}
