const priceFormatter = new Intl.NumberFormat("fa-IR");

function formatLabel(value) {
    const date = value.length === 7 ? new Date(`${value}-01T00:00:00`) : new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("fa-IR", {
        month: "short",
        day: value.length === 7 ? undefined : "numeric",
    }).format(date);
}

export default function RevenueChart({ items = [] }) {
    const maximum = Math.max(...items.map((item) => Number(item.revenue) || 0), 1);

    if (!items.length) {
        return (
            <div className="flex min-h-72 items-center justify-center rounded-2xl bg-cream-50 text-sm font-bold text-coffee-400">
                برای این بازه داده‌ای ثبت نشده است
            </div>
        );
    }

    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex min-h-72 min-w-[680px] items-end gap-2 rounded-2xl bg-cream-50 p-5">
                {items.map((item) => {
                    const height = Math.max(6, Math.round(((Number(item.revenue) || 0) / maximum) * 210));

                    return (
                        <div key={item._id} className="group flex min-w-10 flex-1 flex-col items-center justify-end">
                            <div className="mb-2 hidden whitespace-nowrap rounded-lg bg-coffee-950 px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                                {priceFormatter.format(item.revenue || 0)} تومان
                                <span className="mr-1 text-white/50">• {Number(item.orders || 0).toLocaleString("fa-IR")} سفارش</span>
                            </div>
                            <div
                                className="w-full max-w-12 rounded-t-xl bg-caramel-500 transition group-hover:bg-coffee-800"
                                style={{ height: `${height}px` }}
                            />
                            <p className="mt-2 whitespace-nowrap text-[9px] font-bold text-coffee-400">
                                {formatLabel(item._id)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
