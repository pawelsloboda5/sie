import type { Metadata, Viewport } from "next"
// import { Analytics } from "@vercel/analytics/react" // Uncomment when installed
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" }
  ]
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sie2.com"),
  title: {
    default: "SIE Wellness - AI Healthcare Navigator | Find Affordable Medical Care Near You",
    template: "%s | SIE Wellness - Affordable Healthcare Finder"
  },
  description: "Free AI healthcare copilot helping you find affordable medical care. Compare prices at 3,000+ providers. Save 80% on healthcare costs. No insurance needed. Find free clinics, sliding scale therapy, cheap dental care, and low-cost urgent care near you.",
  keywords: [
    "affordable healthcare",
    "free clinics near me",
    "low cost medical care",
    "healthcare price transparency",
    "AI healthcare assistant",
    "sliding scale therapy",
    "cheap dentist",
    "uninsured medical help",
    "medicaid doctors",
    "free mental health services",
    "affordable urgent care",
    "healthcare copilot",
    "medical cost comparison",
    "find cheap doctors",
    "healthcare navigator"
  ],
  authors: [{ name: "SIE Wellness Team" }],
  creator: "SIE Wellness",
  publisher: "SIE Wellness",
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
  alternates: {
    canonical: "https://www.sie2.com",
    languages: {
      "en-US": "https://www.sie2.com",
      "es-US": "https://www.sie2.com/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.sie2.com",
    siteName: "SIE Wellness",
    title: "SIE Wellness - AI Healthcare Navigator | Save 80% on Medical Costs",
    description: "Free AI copilot finds affordable healthcare near you. Compare prices at 3,000+ verified providers. No insurance needed. Find free clinics, $20 doctor visits, $50 dental cleanings.",
    images: [
      {
        url: "https://www.sie2.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SIE Wellness - Affordable Healthcare Finder"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@siewellness",
    creator: "@siewellness",
    title: "Find Affordable Healthcare with AI | SIE Wellness",
    description: "Save 80% on medical costs. Free AI copilot compares prices at 3,000+ providers. Find free clinics, cheap dental care, sliding scale therapy near you.",
    images: ["https://www.sie2.com/twitter-card.png"],
  },
  category: "health",
  classification: "Healthcare Technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  verification: {
    google: "google-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
    "application-name": "SIE Wellness",
    "msapplication-TileColor": "#10b981",
    "msapplication-config": "/browserconfig.xml",
    "fb:app_id": "your-facebook-app-id",
    "article:author": "https://www.facebook.com/siewellness",
    "article:publisher": "https://www.facebook.com/siewellness",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.sie2.com/#organization",
              "name": "SIE Wellness",
              "alternateName": "SIE Healthcare Navigator",
              "url": "https://www.sie2.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.sie2.com/logo_560x560.png",
                "width": 560,
                "height": 560
              },
              "sameAs": [
                "https://twitter.com/siewellness",
                "https://www.facebook.com/siewellness",
                "https://www.linkedin.com/company/siewellness",
                "https://github.com/siewellness"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-SIE-WELL",
                "contactType": "customer service",
                "areaServed": "US",
                "availableLanguage": ["English", "Spanish"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              }
            })
          }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.sie2.com"
              }, {
                "@type": "ListItem",
                "position": 2,
                "name": "AI Copilot",
                "item": "https://www.sie2.com/copilot"
              }, {
                "@type": "ListItem",
                "position": 3,
                "name": "Find Providers",
                "item": "https://www.sie2.com/providers"
              }]
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {children}
        {/* <Analytics /> */}
        
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </body>
    </html>
  )
}