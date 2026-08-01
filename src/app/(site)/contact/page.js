import Link from "next/link";
import {
    FiClock,
    FiInstagram,
    FiMail,
    FiMapPin,
    FiPhone,
    FiSend,
} from "react-icons/fi";
import ContactForm from "@/components/contact/ContactForm";
import getSiteSettings from "@/lib/settings/getSiteSettings";
import getSiteContent from "@/lib/settings/getSiteContent";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "تماس با ما",
    description: "راه‌های ارتباط و پشتیبانی ممد کافی",
};

const dayTitles = {
    saturday: "شنبه",
    sunday: "یکشنبه",
    monday: "دوشنبه",
    tuesday: "سه‌شنبه",
    wednesday: "چهارشنبه",
    thursday: "پنج‌شنبه",
    friday: "جمعه",
};

export default async function ContactPage() {
    const [settings, siteContent] = await Promise.all([
        getSiteSettings(),
        getSiteContent(),
    ]);
    const content = siteContent?.contact || {};

    return (
        <main className="page-container py-10 sm:py-14">
            <section className="mb-8 rounded-[2.5rem] bg-coffee-950 px-6 py-12 text-white sm:px-10">
                <p className="text-xs font-bold text-caramel-300">
                    {content.eyebrow || "تماس با ما"}
                </p>
                <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                    {content.title}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-white/60">
                    {content.description}
                </p>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="space-y-5">
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        {[
                            {
                                icon: FiPhone,
                                title: "تلفن پشتیبانی",
                                value: settings.supportPhone || "در تنظیمات ثبت نشده",
                                href: settings.supportPhone ? `tel:${settings.supportPhone}` : null,
                            },
                            {
                                icon: FiMail,
                                title: "ایمیل",
                                value: settings.supportEmail || "در تنظیمات ثبت نشده",
                                href: settings.supportEmail ? `mailto:${settings.supportEmail}` : null,
                            },
                            {
                                icon: FiMapPin,
                                title: "آدرس",
                                value: settings.address || "آدرس فروشگاه در تنظیمات ثبت نشده است.",
                                href: null,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            const card = (
                                <article className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm">
                                    <span className="flex size-12 items-center justify-center rounded-xl bg-cream-100 text-coffee-800">
                                        <Icon />
                                    </span>
                                    <p className="mt-5 text-xs font-bold text-coffee-400">{item.title}</p>
                                    <p className="mt-2 text-sm font-black leading-7 text-coffee-950" dir={item.href ? "ltr" : undefined}>
                                        {item.value}
                                    </p>
                                </article>
                            );
                            return item.href ? <a key={item.title} href={item.href}>{card}</a> : <div key={item.title}>{card}</div>;
                        })}
                    </section>

                    <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex size-12 items-center justify-center rounded-xl bg-cream-100 text-coffee-800"><FiClock /></span>
                            <div>
                                <h2 className="text-sm font-black text-coffee-950">ساعات کاری</h2>
                                <p className="mt-1 text-xs text-coffee-400">زمان پاسخ‌گویی و فعالیت مجموعه</p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-2">
                            {(settings.workingHours || []).map((item) => (
                                <div key={item.day} className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3 text-xs">
                                    <span className="font-bold text-coffee-600">{dayTitles[item.day]}</span>
                                    <span className={item.isOpen ? "font-black text-coffee-900" : "font-black text-danger"}>
                                        {item.isOpen ? `${item.opensAt} تا ${item.closesAt}` : "تعطیل"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-wrap gap-2">
                        {settings.socialLinks?.instagram && (
                            <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-coffee-700 shadow-sm">
                                <FiInstagram /> اینستاگرام
                            </a>
                        )}
                        {settings.socialLinks?.telegram && (
                            <a href={settings.socialLinks.telegram} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-coffee-700 shadow-sm">
                                <FiSend /> تلگرام
                            </a>
                        )}
                        <Link href="/user/tickets" className="inline-flex h-11 items-center rounded-xl bg-coffee-900 px-4 text-xs font-black text-white">
                            پیگیری تیکت‌ها
                        </Link>
                    </section>
                </div>

                <div className="self-start">
                    <ContactForm />
                </div>
            </div>
        </main>
    );
}
