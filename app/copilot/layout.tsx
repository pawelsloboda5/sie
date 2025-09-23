import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Healthcare Copilot | Find Affordable Medical Care Instantly',
  description: 'Talk to our AI healthcare copilot to find affordable doctors, dentists, therapists, and medical care near you. Free clinics, sliding scale fees, no insurance needed.',
  keywords: [
    'AI healthcare assistant',
    'find affordable doctors',
    'healthcare copilot',
    'free medical clinics',
    'cheap healthcare',
    'medical care without insurance',
    'sliding scale healthcare',
    'affordable dentist',
    'cheap therapy',
    'healthcare price comparison',
    'find doctors near me',
    'medical cost transparency'
  ],
  openGraph: {
    title: 'AI Healthcare Copilot - Find Affordable Care Instantly',
    description: 'Chat with our AI to find affordable healthcare providers, free clinics, and transparent pricing near you.',
    url: 'https://www.sie2.com/copilot',
    siteName: 'SIE Wellness',
    type: 'website',
    images: [
      {
        url: 'https://www.sie2.com/logo_560x560.png',
        width: 560,
        height: 560,
        alt: 'SIE Wellness AI Healthcare Copilot'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Healthcare Copilot - Find Affordable Care',
    description: 'Chat with our AI to find affordable healthcare providers and free clinics near you.',
    images: ['https://www.sie2.com/logo_560x560.png']
  },
  alternates: {
    canonical: 'https://www.sie2.com/copilot'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function CopilotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* JSON-LD Schema for AI Healthcare Assistant */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SIE Wellness AI Healthcare Copilot",
            "description": "AI-powered healthcare assistant that helps users find affordable medical care, free clinics, and transparent pricing",
            "url": "https://www.sie2.com/copilot",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "Find affordable healthcare providers",
              "Free clinic locator",
              "Healthcare price comparison",
              "AI-powered medical care assistant",
              "Sliding scale provider search",
              "Uninsured patient resources"
            ],
            "creator": {
              "@type": "Organization",
              "name": "SIE Wellness",
              "url": "https://www.sie2.com"
            }
          })
        }}
      />

      {/* FAQ Schema for Healthcare Copilot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does the AI healthcare copilot work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply chat with our AI about your healthcare needs. Tell us what type of care you're looking for, your location, and any budget constraints. The AI will instantly find affordable providers, free clinics, and transparent pricing options near you."
                }
              },
              {
                "@type": "Question", 
                "name": "Can I find free healthcare with the copilot?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Our AI specializes in finding free clinics, community health centers, and sliding scale providers. Just mention you need free or low-cost care and we'll prioritize those options."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need insurance to use this service?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No insurance required! Our copilot helps find providers that accept uninsured patients, offer cash-pay discounts, and provide sliding scale fees based on income."
                }
              },
              {
                "@type": "Question",
                "name": "What types of healthcare can the copilot help me find?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The copilot can help find primary care doctors, dentists, mental health therapists, urgent care clinics, specialists, lab testing, prescription assistance, and more - all with transparent, affordable pricing."
                }
              }
            ]
          })
        }}
      />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI Healthcare Copilot",
            "url": "https://www.sie2.com/copilot",
            "description": "Chat with AI to find affordable healthcare providers and free medical clinics",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript",
            "softwareVersion": "2.0",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization", 
              "name": "SIE Wellness"
            }
          })
        }}
      />
      
      {children}
    </>
  )
}
