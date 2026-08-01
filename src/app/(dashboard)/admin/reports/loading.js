export default function AdminReportsLoading() {
    return (
        <div className="space-y-7 animate-pulse">
            <div className="h-24 rounded-[1.75rem] bg-white" />
            <div className="h-24 rounded-[1.75rem] bg-white" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 rounded-[1.5rem] bg-white" />)}
            </div>
            <div className="h-[420px] rounded-[2rem] bg-white" />
        </div>
    );
}
