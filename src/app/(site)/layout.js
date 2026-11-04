import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import getSiteSettings from "@/lib/settings/getSiteSettings";
import getSiteContent from "@/lib/settings/getSiteContent";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    const settings = await getSiteSettings();

    return {
        title: {
            default: settings?.seo?.defaultTitle || "MMD Coffee | ممد کافی",
            template: `%s | ${settings?.storeEnglishName || "MMD Coffee"}`,
        },
        description:
            settings?.seo?.defaultDescription ||
            "سفارش آنلاین قهوه، نوشیدنی، دسر و محصولات کافه از ممد کافی",
        keywords: settings?.seo?.keywords || [],
    };
}

export default async function SiteLayout({ children }) {
    const [settings, content] = await Promise.all([
        getSiteSettings(),
        getSiteContent(),
    ]);

    if (settings?.features?.maintenanceMode) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-cream-50 p-5">
                <section className="w-full max-w-xl rounded-[2.5rem] border border-coffee-100 bg-white p-8 text-center shadow-[0_25px_80px_rgba(48,32,26,0.12)] sm:p-12">
                    <span className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-coffee-950 text-3xl text-caramel-300">
                        ☕
                    </span>
                    <p className="mt-7 text-xs font-bold text-caramel-600">
                        {settings.storeEnglishName}
                    </p>
                    <h1 className="mt-3 text-3xl font-black text-coffee-950">خیلی زود برمی‌گردیم</h1>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-coffee-500">
                        فروشگاه برای انجام به‌روزرسانی کوتاه‌مدت موقتاً در دسترس نیست.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-cream-50">
            <Navbar
                navigationItems={content?.navigation || []}
                brand={{
                    logo: settings?.logo || "",
                    storeName: settings?.storeName || "",
                    storeEnglishName: settings?.storeEnglishName || "",
                }}
            />
            <main className="flex-1">{children}</main>
            <Footer settings={settings || {} } content={content?.footer || {} } />
        </div>
    );
}
