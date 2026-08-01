import Link from "next/link";
import { FiInstagram, FiMail, FiMapPin, FiPhone, FiSend } from "react-icons/fi";

const fallbackGroups = [
    {
        title: "کافه و فروشگاه",
        links: [
            { title: "منوی کافه", href: "/menu" },
            { title: "فروشگاه", href: "/shop" },
            { title: "مقالات", href: "/blog" },
        ],
    },
    {
        title: "ممد کافی",
        links: [
            { title: "درباره ما", href: "/about" },
            { title: "تماس با ما", href: "/contact" },
        ],
    },
];

function FooterLineArt() {
    return (
        <svg
            viewBox="0 0 1200 180"
            className="h-auto w-full text-white/10"
            aria-hidden="true"
            fill="none"
        >
            <path
                d="M-20 130C70 72 132 158 220 108C294 66 354 31 427 79C495 123 555 139 618 97C685 52 739 52 803 94C870 138 932 126 986 86C1051 38 1112 71 1220 114"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M376 115C394 74 424 51 459 51C493 51 524 75 543 115M414 116C416 94 434 78 459 78C483 78 501 94 504 116"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M440 49C429 31 438 18 447 7M465 49C454 27 468 17 475 4M489 54C480 36 490 24 500 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M542 80C579 77 584 118 548 124"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path d="M410 118H548" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

export default function Footer({ settings = {}, content = {} }) {
    const groups = Array.isArray(content.groups) && content.groups.length
        ? content.groups
        : fallbackGroups;
    const social = settings?.socialLinks || {};

    return (
        <footer className="relative mt-auto overflow-hidden bg-coffee-950 text-white">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-90">
                <FooterLineArt />
            </div>
            <div className="absolute -right-32 -top-32 size-80 rounded-full bg-caramel-500/10 blur-3xl" />

            <div className="page-container relative py-12 sm:py-16">
                <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
                    <div className="max-w-xl">
                        <p className="text-xs font-black tracking-[0.24em] text-caramel-300">
                            {settings.storeEnglishName || "MMD COFFEE"}
                        </p>
                        <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                            {settings.storeName || "ممد کافی"}
                        </h2>
                        <p className="mt-4 max-w-lg text-sm leading-8 text-white/55">
                            {content.description || settings.tagline || "هر فنجان، یک تجربه تازه"}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-white/60">
                            {settings.supportPhone ? (
                                <a href={`tel:${settings.supportPhone}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">
                                    <FiPhone /> {settings.supportPhone}
                                </a>
                            ) : null}
                            {settings.supportEmail ? (
                                <a href={`mailto:${settings.supportEmail}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">
                                    <FiMail /> {settings.supportEmail}
                                </a>
                            ) : null}
                            {settings.address ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                    <FiMapPin /> {settings.address}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {groups.slice(0, 2).map((group) => (
                        <div key={group.title}>
                            <h3 className="text-sm font-black text-white">{group.title}</h3>
                            <nav className="mt-4 flex flex-col gap-3">
                                {(group.links || []).map((item) => (
                                    <Link
                                        key={`${group.title}-${item.href}`}
                                        href={item.href}
                                        className="w-fit text-xs font-bold text-white/50 transition hover:text-caramel-300"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>

                <div className="relative mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] font-bold text-white/35">
                        {content.copyright || `© ${new Date().getFullYear()} MMD Coffee. همه حقوق محفوظ است.`}
                    </p>
                    <div className="flex items-center gap-2">
                        {social.instagram ? (
                            <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-caramel-300">
                                <FiInstagram />
                            </a>
                        ) : null}
                        {social.telegram ? (
                            <a href={social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram" className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-caramel-300">
                                <FiSend />
                            </a>
                        ) : null}
                    </div>
                </div>
            </div>
        </footer>
    );
}
