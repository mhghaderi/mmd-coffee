export default function AuthLayout({ children }) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-cream-50">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-48 -top-48 size-[520px] rounded-full bg-caramel-200/40 blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-52 -left-48 size-[520px] rounded-full bg-coffee-200/40 blur-3xl"
            />

            <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
                {children}
            </div>
        </main>
    );
}
