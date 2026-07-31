import localFont from "next/font/local";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

const pelak = localFont({
    src: [
        {
            path: "./fonts/Pelak-light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "./fonts/Pelak-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/Pelak-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/Pelak-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/Pelak-Black.woff2",
            weight: "900",
            style: "normal",
        },
    ],
    variable: "--font-pelak",
    display: "swap",
    fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata = {
    title: {
        default: "MMD Coffee | ممد کافی",
        template: "%s | MMD Coffee",
    },

    description: "سفارش آنلاین قهوه، نوشیدنی، دسر و محصولات کافه از ممد کافی",

    keywords: ["MMD Coffee", "ممد کافی", "کافه", "قهوه", "سفارش آنلاین قهوه", "نوشیدنی", "دسر"],
};

export default function RootLayout({ children }) {
    return (
        <html lang="fa" dir="rtl">
            <body className={`${pelak.className} ${pelak.variable}`}>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
