import { FiCheckCircle, FiClock, FiCreditCard, FiUser } from "react-icons/fi";

import { orderStatusConfig, paymentStatusConfig } from "@/constants/order-ui";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function getHistoryConfig(type, status) {
    if (type === "payment") {
        return (
            paymentStatusConfig[status] || {
                title: status,
                className: "bg-slate-100 text-slate-600",
            }
        );
    }

    return (
        orderStatusConfig[status] || {
            title: status,
            className: "bg-slate-100 text-slate-600",
        }
    );
}

export default function OrderHistory({ history = [], type = "order", emptyMessage }) {
    if (!history.length) {
        return (
            <div className="rounded-2xl border border-dashed border-coffee-200 bg-cream-50 px-5 py-10 text-center">
                {type === "payment" ? (
                    <FiCreditCard className="mx-auto text-2xl text-coffee-300" />
                ) : (
                    <FiClock className="mx-auto text-2xl text-coffee-300" />
                )}

                <p className="mt-3 text-sm font-bold text-coffee-500">
                    {emptyMessage || "هنوز تاریخچه‌ای ثبت نشده است"}
                </p>
            </div>
        );
    }

    const sortedHistory = [...history].sort(
        (first, second) =>
            new Date(first.changedAt).getTime() - new Date(second.changedAt).getTime(),
    );

    return (
        <ol className="relative space-y-0">
            {sortedHistory.map((item, index) => {
                const config = getHistoryConfig(type, item.status);

                const isLast = index === sortedHistory.length - 1;

                return (
                    <li
                        key={item._id || `${item.status}-${item.changedAt}-${index}`}
                        className="relative flex gap-4 pb-7 last:pb-0"
                    >
                        {!isLast && (
                            <span
                                aria-hidden="true"
                                className="absolute right-[19px] top-10 h-[calc(100%-24px)] w-px bg-coffee-100"
                            />
                        )}

                        <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-coffee-900 text-white shadow-sm">
                            <FiCheckCircle className="text-current" />
                        </span>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span
                                    className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold ${config.className}`}
                                >
                                    {config.title}
                                </span>

                                <time className="text-[10px] text-coffee-400">
                                    {dateFormatter.format(new Date(item.changedAt))}
                                </time>
                            </div>

                            {item.note && (
                                <p className="mt-3 text-xs leading-7 text-coffee-600">
                                    {item.note}
                                </p>
                            )}

                            <div className="mt-2 flex items-center gap-2 text-[10px] text-coffee-400">
                                <FiUser />

                                <span>{item.changedBy?.name || "سیستم ممد کافی"}</span>

                                {item.changedBy?.role === "admin" && (
                                    <span className="rounded-full bg-caramel-50 px-2 py-0.5 font-bold text-caramel-700">
                                        مدیر
                                    </span>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
