import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIE Wellness - Free & Low-Cost Healthcare Near You",
  description: "Find accessible healthcare services in your area, regardless of insurance status. Discover free clinics, community health centers, and affordable medical care.",
  icons: {
    icon: "/logo_560x560.png",
    shortcut: "/logo_560x560.png",
    apple: "/logo_560x560.png",
  },
  openGraph: {
    title: "SIE Wellness - Free & Low-Cost Healthcare Near You",
    description: "Find accessible healthcare services in your area, regardless of insurance status. Discover free clinics, community health centers, and affordable medical care.",
    images: ["/logo_560x560.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIE Wellness - Free & Low-Cost Healthcare Near You",
    description: "Find accessible healthcare services in your area, regardless of insurance status. Discover free clinics, community health centers, and affordable medical care.",
    images: ["/logo_560x560.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo_560x560.png" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
