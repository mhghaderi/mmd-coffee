export const ARTICLE_STATUS = {
    DRAFT: "draft",
    PUBLISHED: "published",
};

export const ARTICLE_STATUS_VALUES = Object.values(ARTICLE_STATUS);

export const articleStatusLabels = {
    [ARTICLE_STATUS.DRAFT]: "پیش‌نویس",
    [ARTICLE_STATUS.PUBLISHED]: "منتشرشده",
};

export const articleStatusClasses = {
    [ARTICLE_STATUS.DRAFT]: "bg-amber-50 text-amber-700",
    [ARTICLE_STATUS.PUBLISHED]: "bg-emerald-50 text-emerald-700",
};
