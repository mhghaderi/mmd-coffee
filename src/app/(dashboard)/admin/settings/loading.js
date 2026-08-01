export default function AdminSettingsLoading() {
    return (
        <div className="space-y-7 animate-pulse">
            <div className="h-24 rounded-[1.75rem] bg-white" />
            <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
                <div className="h-72 rounded-[1.75rem] bg-white" />
                <div className="h-[620px] rounded-[2rem] bg-white" />
            </div>
        </div>
    );
}
