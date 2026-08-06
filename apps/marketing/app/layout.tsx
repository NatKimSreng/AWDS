import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoKhmer = Noto_Sans_Khmer({
  variable: "--font-noto-khmer",
  subsets: ["khmer"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AngkorWatDayTour — Book Tours, Guides & Transport in Siem Reap",
  description:
    "Discover sunrise Angkor Wat tours, local guides, tuktuk drivers, taxis, and photographers in Siem Reap. Book instantly on the AngkorWatDayTour app.",
  openGraph: {
    title: "AngkorWatDayTour — Book Tours in Siem Reap",
    description: "Tuktuks, taxis, guides, and photographers — book local experiences in Siem Reap.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${notoKhmer.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">{children}</body>
    </html>
  );
}
