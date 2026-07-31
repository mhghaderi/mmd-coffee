export default function MenuLoading() {
    return (
        <main className="page-container py-10 sm:py-14">
            <section className="mb-8">
                <div className="h-4 w-28 animate-pulse rounded-full bg-caramel-100" />

                <div className="mt-4 h-11 max-w-md animate-pulse rounded-2xl bg-coffee-100" />

                <div className="mt-4 h-5 max-w-xl animate-pulse rounded-xl bg-coffee-100" />
            </section>

            <div className="h-32 animate-pulse rounded-[1.75rem] bg-white" />

            <div className="mt-7 grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
                <div className="hidden h-[460px] animate-pulse rounded-[1.75rem] bg-white lg:block" />

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({
                        length: 9,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[390px] animate-pulse rounded-[1.75rem] bg-white"
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
