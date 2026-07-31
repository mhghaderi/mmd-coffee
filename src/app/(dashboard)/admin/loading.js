export default function AdminLoading() {
    return (
        <div className="space-y-8">
            <div className="h-52 animate-pulse rounded-[2rem] bg-coffee-200/60" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({
                    length: 8,
                }).map((_, index) => (
                    <div key={index} className="h-36 animate-pulse rounded-[1.5rem] bg-white" />
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="h-[440px] animate-pulse rounded-[2rem] bg-white" />

                <div className="h-[340px] animate-pulse rounded-[2rem] bg-white" />
            </div>
        </div>
    );
}
