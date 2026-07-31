import Navbar from "@/components/layout/Navbar";

export default function SiteLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-cream-50">
            <Navbar />

            <main className="flex-1">{children}</main>
        </div>
    );
}
