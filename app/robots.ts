import type { MetadataRoute } from 'next'

// Uses NEXT_PUBLIC_SITE_URL if provided, falls back to production hostname
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // We never want crawlers hitting API routes directly
        disallow: ['/api/', '/api/*'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}


