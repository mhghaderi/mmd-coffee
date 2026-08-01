export default function AdminArticlesLoading() {
    return (
        <div className="space-y-7">
            <div className="h-28 animate-pulse rounded-[2rem] bg-white" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-white" />)}
            </div>
            <div className="h-20 animate-pulse rounded-[1.75rem] bg-white" />
            <div className="h-[520px] animate-pulse rounded-[1.75rem] bg-white" />
        </div>
    );
}
