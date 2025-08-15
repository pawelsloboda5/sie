import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sie2.com'),
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
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9NF4TM973E"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9NF4TM973E');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
