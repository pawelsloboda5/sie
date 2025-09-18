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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sie2.com'

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SIE Wellness",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/app?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SIE Wellness",
  url: siteUrl,
  logo: `${siteUrl}/logo_560x560.png`,
}

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
        {/* Mobile viewport: disable zoom to keep layout consistent on small screens */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
        <Script id="schema-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(websiteJsonLd)}
        </Script>
        <Script id="schema-organization" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(orgJsonLd)}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[radial-gradient(1200px_400px_at_50%_-100px,theme(colors.emerald.50),transparent)] dark:bg-[radial-gradient(1200px_400px_at_50%_-100px,theme(colors.emerald.900/30),transparent)]`}
      >
        {children}
      </body>
    </html>
  );
}
