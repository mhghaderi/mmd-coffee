export default function AdminArchiveLoading() {
    return (
        <div className="space-y-7 animate-pulse">
            <div className="h-24 rounded-[1.75rem] bg-white" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 rounded-[1.5rem] bg-white" />)}
            </div>
            <div className="h-20 rounded-[1.75rem] bg-white" />
            <div className="h-[480px] rounded-[2rem] bg-white" />
        </div>
    );
}
