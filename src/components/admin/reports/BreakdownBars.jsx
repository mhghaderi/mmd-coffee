export default function BreakdownBars({ items = [], labels = {}, classes = {} }) {
    const total = items.reduce((sum, item) => sum + Number(item.count || 0), 0);

    if (!items.length) {
        return <p className="py-10 text-center text-xs font-bold text-coffee-400">داده‌ای وجود ندارد</p>;
    }

    return (
        <div className="space-y-4">
            {items.map((item) => {
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;

                return (
                    <div key={item._id || "unknown"}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                            <span className="font-black text-coffee-700">{labels[item._id] || item._id || "نامشخص"}</span>
                            <span className="font-bold text-coffee-400">
                                {Number(item.count || 0).toLocaleString("fa-IR")} ({percent.toLocaleString("fa-IR")}٪)
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-coffee-100">
                            <div
                                className={`h-full rounded-full ${classes[item._id] || "bg-caramel-500"}`}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
