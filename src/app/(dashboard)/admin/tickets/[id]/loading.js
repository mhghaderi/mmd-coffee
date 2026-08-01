export default function AdminTicketLoading() {
    return (
        <div className="space-y-7">
            <div className="h-44 animate-pulse rounded-[2rem] bg-white" />
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="h-[650px] animate-pulse rounded-[1.75rem] bg-white" />
                <div className="space-y-7">
                    <div className="h-80 animate-pulse rounded-[1.75rem] bg-white" />
                    <div className="h-72 animate-pulse rounded-[1.75rem] bg-white" />
                </div>
            </div>
        </div>
    );
}
