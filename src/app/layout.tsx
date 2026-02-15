import type { Metadata, Viewport } from "next";
import { Teko, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppInit } from "@/components/layout/AppInit";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Combat Zone Companion",
  description: "Unofficial Companion App for Cyberpunk Red: Combat Zone",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <body
        className={`${teko.variable} ${rajdhani.variable} ${shareTechMono.variable} antialiased min-h-screen bg-background text-foreground pb-20 font-body`}
      >
        <AppInit />
        {/* Scanline overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-10 scanlines" />
        <main className="container mx-auto px-4 py-4 min-h-screen">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
