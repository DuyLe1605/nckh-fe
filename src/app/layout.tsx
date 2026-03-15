import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { APP_CONSTANTS } from "@/constants/app.constants";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: `${APP_CONSTANTS.APP_TITLE} | Online Auction`,
    description: "Modern realtime auction platform with role-based dashboards.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
