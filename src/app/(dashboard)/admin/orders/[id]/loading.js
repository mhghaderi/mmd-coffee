export default function OrderDetailsLoading() {
    return (
        <div className="space-y-7">
            <div className="h-28 animate-pulse rounded-[2rem] bg-white" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({
                    length: 4,
                }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-white" />
                ))}
            </div>

            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-7">
                    <div className="h-[420px] animate-pulse rounded-[1.75rem] bg-white" />

                    <div className="h-72 animate-pulse rounded-[1.75rem] bg-white" />
                </div>

                <div className="space-y-6">
                    <div className="h-72 animate-pulse rounded-[1.75rem] bg-white" />

                    <div className="h-60 animate-pulse rounded-[1.75rem] bg-white" />
                </div>
            </div>
        </div>
    );
}
