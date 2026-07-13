import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Inter, Syne, Hanken_Grotesk } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import CartDrawer from "@/components/cart/CartDrawer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OBIDI COSMETICS | Home",
  description: "Authentic beauty, no long story. Step into your confidence with unapologetic luxury designed for your skin tone.",
  icons: {
    icon: [{ url: "/assets/obidi%20logo.jpg", type: "image/jpeg" }],
    shortcut: "/assets/obidi%20logo.jpg",
    apple: "/assets/obidi%20logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${syne.variable} ${hankenGrotesk.variable} antialiased`}
      >
        <AnnouncementBar />
        <Navbar />
        <CartDrawer />
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
