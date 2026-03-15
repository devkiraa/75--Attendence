import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "75 attendance calculator",
  description: "Find out the number of days you can bunk while still maintaining 75% attendance or the number of days you should attend to attain your goal.",
  keywords: ["75 attendance calculator", "attendance tracker", "college attendance", "bunk calculator", "75% attendance", "student tools", "attendance goal", "skip classes calculator"],
  authors: [{ name: "Kiran" }],
  creator: "Kiran",
  publisher: "devkiraa",
  openGraph: {
    title: "75 Attendance Calculator",
    description: "Calculate how many days you can safely skip while maintaining your college attendance goal.",
    siteName: "75attendance Calculator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "75 Attendance Calculator",
    description: "Calculate how many classes you can skip while staying safe.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
