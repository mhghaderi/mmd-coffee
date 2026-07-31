import { DELIVERY_METHOD, ORDER_STATUS, PAYMENT_STATUS } from "@/constants/order";

const statusTransitions = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],

    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],

    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],

    [ORDER_STATUS.READY]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.COMPLETED],

    [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.COMPLETED],

    [ORDER_STATUS.COMPLETED]: [],

    [ORDER_STATUS.CANCELLED]: [],
};

const paymentTransitions = {
    [PAYMENT_STATUS.UNPAID]: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID, PAYMENT_STATUS.FAILED],

    [PAYMENT_STATUS.PENDING]: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.FAILED],

    [PAYMENT_STATUS.FAILED]: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID],

    [PAYMENT_STATUS.PAID]: [PAYMENT_STATUS.REFUNDED],

    [PAYMENT_STATUS.REFUNDED]: [],
};

export function getAllowedOrderStatuses({ currentStatus, deliveryMethod }) {
    const allowedStatuses = [...(statusTransitions[currentStatus] || [])];

    if (deliveryMethod === DELIVERY_METHOD.PICKUP) {
        return allowedStatuses.filter((status) => status !== ORDER_STATUS.OUT_FOR_DELIVERY);
    }

    return allowedStatuses;
}

export function canChangeOrderStatus({ currentStatus, nextStatus, deliveryMethod }) {
    return getAllowedOrderStatuses({
        currentStatus,
        deliveryMethod,
    }).includes(nextStatus);
}

export function getAllowedPaymentStatuses(currentStatus) {
    return [...(paymentTransitions[currentStatus] || [])];
}

export function canChangePaymentStatus({ currentStatus, nextStatus }) {
    return getAllowedPaymentStatuses(currentStatus).includes(nextStatus);
}
