export default function ShopLoading() {
    return (
        <main className="page-container py-10 sm:py-14">
            <div className="h-64 animate-pulse rounded-[2.25rem] bg-coffee-100" />
            <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="hidden h-[620px] animate-pulse rounded-[1.75rem] bg-white lg:block" />
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-[430px] animate-pulse rounded-[1.75rem] bg-white" />
                    ))}
                </div>
            </div>
        </main>
    );
}
