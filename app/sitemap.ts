import type { MetadataRoute } from 'next'

// NOTE: This is a minimal sitemap that we will expand with child sitemaps
// for providers, city/service pages, and blog as we add those routes.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

// Core public routes available today
  const routes: string[] = [
    '/',
    '/app',
    '/providers',
    '/services',
    '/resources',
    // child sitemaps (treat as URLs for discovery)
    '/sitemaps/providers',
    '/sitemaps/providers/index',
    '/sitemaps/cities-services',
    '/sitemaps/blog',
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: route === '/' ? 1 : 0.7,
  }))
}


