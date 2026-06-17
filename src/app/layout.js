import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import AOSInit from "@/utils/aos";
import ScrollToTop from "@/utils/ScrollToTop";

const pelak = localFont({
    src: [
        {
            path: "../../public/fonts/pelak/Pelak-light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "../../public/fonts/pelak/Pelak-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../../public/fonts/pelak/Pelak-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../../public/fonts/pelak/Pelak-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "../../public/fonts/pelak/Pelak-Black.woff2",
            weight: "900",
            style: "normal",
        },
    ],
    variable: "--font-pelak",
    // weight: "300 400 500 700 900",
});

export const metadata = {
    title: "فروشگاه اینترنتی ممد کافی | صفحه اصلی",
    description: "صفحه اصلی فروشگاه اینترنتی ممد کافی | فروش بهترین قهوه ها",
    icons: "/images/fav-icon.png",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fa" dir="ltr">
            <body>
                <AOSInit />

                {children}

                <ScrollToTop />
            </body>
        </html>
    );
}
