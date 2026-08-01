import Link from "next/link";
import {
    FiArrowLeft,
    FiCoffee,
    FiHeart,
    FiShield,
    FiStar,
    FiUsers,
} from "react-icons/fi";
import getSiteSettings from "@/lib/settings/getSiteSettings";
import getSiteContent from "@/lib/settings/getSiteContent";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "درباره ما",
    description: "داستان، ارزش‌ها و تجربه ممد کافی",
};

const iconMap = {
    coffee: FiCoffee,
    heart: FiHeart,
    shield: FiShield,
    star: FiStar,
    users: FiUsers,
};

export default async function AboutPage() {
    const [settings, siteContent] = await Promise.all([
        getSiteSettings(),
        getSiteContent(),
    ]);

    const content = siteContent?.about || {};
    const stats = Array.isArray(content.stats) ? content.stats : [];
    const values = Array.isArray(content.values) ? content.values : [];

    return (
        <main>
            <section className="page-container py-10 sm:py-14">
                <div className="relative overflow-hidden rounded-[2.75rem] bg-coffee-950 px-6 py-14 text-white sm:px-10 lg:px-16 lg:py-20">
                    <div className="absolute -left-24 -top-28 size-96 rounded-full bg-caramel-500/20 blur-3xl" />
                    <div className="relative max-w-3xl">
                        <p className="text-xs font-bold text-caramel-300">
                            {content.eyebrow || `درباره ${settings.storeName}`}
                        </p>
                        <h1 className="mt-4 text-4xl font-black leading-[1.35] sm:text-6xl">
                            {content.title || settings.tagline}
                        </h1>
                        <p className="mt-6 max-w-2xl text-sm leading-8 text-white/60 sm:text-base">
                            {content.description || settings.tagline}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/menu"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-caramel-500 px-6 text-sm font-black text-white"
                            >
                                مشاهده منو <FiArrowLeft />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-6 text-sm font-black text-white"
                            >
                                ارتباط با ما
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="page-container section-spacing pt-6">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="rounded-[2.5rem] bg-caramel-100 p-8 sm:p-10">
                        <span className="flex size-16 items-center justify-center rounded-2xl bg-coffee-950 text-2xl text-caramel-300">
                            <FiCoffee />
                        </span>
                        <p className="mt-8 text-xs font-bold text-caramel-700">
                            {content.storyEyebrow || "داستان ما"}
                        </p>
                        <h2 className="mt-3 text-3xl font-black text-coffee-950">
                            {content.storyTitle}
                        </h2>
                        <p className="mt-5 text-sm leading-8 text-coffee-600">
                            {content.storyDescription}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {stats.map((item, index) => {
                            const Icon = iconMap[item.icon] || FiCoffee;
                            return (
                                <article
                                    key={`${item.label}-${index}`}
                                    className="rounded-[1.75rem] border border-coffee-100 bg-white p-6 shadow-sm"
                                >
                                    <Icon className="text-xl text-caramel-600" />
                                    <p className="mt-7 text-3xl font-black text-coffee-950">
                                        {item.value}
                                    </p>
                                    <p className="mt-2 text-xs font-bold text-coffee-400">
                                        {item.label}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {values.length > 0 && (
                <section className="page-container pb-20 sm:pb-24">
                    <div className="mb-8 text-center">
                        <p className="text-xs font-bold text-caramel-600">
                            {content.valuesEyebrow || "ارزش‌های ما"}
                        </p>
                        <h2 className="mt-3 text-3xl font-black text-coffee-950">
                            {content.valuesTitle}
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                        {values.map((value, index) => {
                            const Icon = iconMap[value.icon] || FiCoffee;
                            return (
                                <article
                                    key={`${value.title}-${index}`}
                                    className="rounded-[2rem] border border-coffee-100 bg-white p-7 shadow-sm"
                                >
                                    <span className="flex size-14 items-center justify-center rounded-2xl bg-cream-100 text-xl text-coffee-800">
                                        <Icon />
                                    </span>
                                    <h3 className="mt-6 text-lg font-black text-coffee-950">
                                        {value.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-coffee-500">
                                        {value.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}
        </main>
    );
}
