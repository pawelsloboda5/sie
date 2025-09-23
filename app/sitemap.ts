import type { MetadataRoute } from 'next'
import { US_CITIES } from '@/lib/city-data'

// NOTE: This is a minimal sitemap that we will expand with child sitemaps
// for providers, city/service pages, and blog as we add those routes.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // Core pages
  const coreRoutes: string[] = [
    '/',
    '/app',
    '/providers',
    '/cities',
    '/services',
    '/compare',
    '/copilot',
  ]

  // Comparison pages
  const compareRoutes: string[] = [
    '/compare/vs-zocdoc',
    '/compare/vs-goodrx',
    '/compare/vs-castlight',
  ]

  // Service pages (dedicated + dynamic catch-all slugs)
  const serviceSlugs = [
    'primary-care',
    'mental-health',
    'dental-care',
    'urgent-care',
    'womens-health',
    'vision-care',
    'pediatrics',
    'lab-tests',
    'pharmacy',
    'specialty-care',
    'home-health',
    'telehealth',
  ]
  const serviceRoutes = serviceSlugs.map((s) => `/services/${s}`)

  // City pages from our source of truth
  const cityRoutes = US_CITIES.map((c) => `/cities/${c.slug}`)

  // Find-care landing pages currently implemented
  const findCareRoutes = ['/find-care/new-york', '/find-care/los-angeles', '/find-care/chicago']

  const allRoutes = [
    ...coreRoutes,
    ...compareRoutes,
    ...serviceRoutes,
    ...cityRoutes,
    ...findCareRoutes,
  ]

  return allRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : route.startsWith('/cities/') ? 0.8 : 0.7,
  }))
}


