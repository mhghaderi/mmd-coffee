export const REVIEW_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

export const REVIEW_STATUS_VALUES = Object.values(REVIEW_STATUS);

export const reviewStatusLabels = {
    [REVIEW_STATUS.PENDING]: "در انتظار بررسی",
    [REVIEW_STATUS.APPROVED]: "تأییدشده",
    [REVIEW_STATUS.REJECTED]: "ردشده",
};

export const reviewStatusClasses = {
    [REVIEW_STATUS.PENDING]: "bg-amber-50 text-amber-700",
    [REVIEW_STATUS.APPROVED]: "bg-emerald-50 text-emerald-700",
    [REVIEW_STATUS.REJECTED]: "bg-red-50 text-red-700",
};
