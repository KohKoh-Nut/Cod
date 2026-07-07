import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/style/globals.css";
import NavBar from "@/modules/NavBar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Cod",
    description: "Code Our Dream",
    icons: {
        icon: [
            { url: "/Cod/icon.svg?v=2", type: "image/svg+xml" },
            { url: "/Cod/icon.png?v=2", type: "image/png", sizes: "512x512" },
        ],
        apple: [
            { url: "/Cod/apple-icon.png?v=2", sizes: "180x180", type: "image/png" },
        ],
    },
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        >
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
                />
            </head>
            <body className="h-full flex flex-col">
                {/* Global Navigation Bar */}
                <NavBar />
                {/* Main Page Content */}
                {children}
            </body>
        </html>
    );
}