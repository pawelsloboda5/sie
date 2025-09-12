import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getServerDb } from '@/lib/server/db'
import { extractProviderIdFromSlug } from '@/lib/utils'
import { ObjectId } from 'mongodb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Phone, MapPin, Globe, Star, Award } from 'lucide-react'
import { ClientCTAs } from '@/components/provider/ClientCTAs'

export const revalidate = 86400 // 24h ISR by default

type PageProps = { params: Promise<{ slug: string }> }

// Alternative services shown to the user as money-saving options
type AlternativeItem = {
  serviceId: ObjectId
  providerId: ObjectId
  providerName: string
  serviceName: string
  isFree?: boolean
  isDiscounted?: boolean
}

declare global {
  var __altCache: Map<string, { ts: number; data: AlternativeItem[] }> | undefined
}

async function unwrapParams<T>(p: T | Promise<T>): Promise<T> { return await p }

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

function titleCaseFromSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await unwrapParams(params)
  const name = titleCaseFromSlug(slug)
  const title = `${name} | Provider Details`

  // Build a value-forward description using nearby free/discounted services
  let description = `Learn about ${name}. Address, hours, services, and accessibility details coming soon.`

  try {
    const db = await getServerDb()

    const shortId = extractProviderIdFromSlug(slug)
    const baseSlug = slug.split('-p-')[0]
    const baseNamePattern = baseSlug.split('-').join('.*')
    const nameRegex = new RegExp(baseNamePattern, 'i')

    const candidates = await db
      .collection<{ _id: ObjectId; name: string; category?: string; state?: string; free_services?: number; free_service_names?: string[] }>('providers')
      .find({ name: nameRegex }, { projection: { name: 1, _id: 1, category: 1, state: 1, free_services: 1, free_service_names: 1 } })
      .limit(20)
      .toArray()

    const provider = candidates.find((c) => String(c._id).slice(-6).toLowerCase() === (shortId || '').toLowerCase()) || candidates[0]

    if (provider) {
      const full = await db
        .collection<{ _id: ObjectId; name: string; category?: string; state?: string; free_services?: number; free_service_names?: string[] }>('providers')
        .findOne({ _id: new ObjectId(String(provider._id)) }, { projection: { name: 1, category: 1, state: 1, free_services: 1, free_service_names: 1 } })

      const provName = full?.name || name
      const freeCount = full?.free_services ?? 0
      const freeNames = (full?.free_service_names || []).filter(Boolean)

      function truncate(s: string, n: number) { return s.length <= n ? s : s.slice(0, n - 1) + '…' }

      if (freeCount > 0) {
        const examples = freeNames.slice(0, 2).join(', ')
        const candidate = examples
          ? `${provName}: ${freeCount} free services (e.g., ${examples}). Compare low‑cost options nearby.`
          : `${provName}: ${freeCount} free services available. Compare low‑cost options nearby.`
        description = truncate(candidate, 158)
      } else {
        // Look for nearby alternatives offering free/discounted services in same category/state
        const rel = await db
          .collection<{ _id: ObjectId; name: string }>('providers')
          .find(
            { _id: { $ne: new ObjectId(String(provider._id)) }, ...(full?.category ? { category: full.category } : {}), ...(full?.state ? { state: full.state } : {}) },
            { projection: { _id: 1, name: 1 } }
          )
          .limit(10)
          .toArray()

        const relIds = rel.map((p) => p._id)
        if (relIds.length) {
          const alt = await db
            .collection<{ provider_id: ObjectId; name: string; is_free?: boolean; is_discounted?: boolean }>('services')
            .aggregate([
              { $match: { provider_id: { $in: relIds }, $or: [{ is_free: true }, { is_discounted: true }] } },
              { $project: { provider_id: 1, name: 1, is_free: 1, is_discounted: 1 } },
              { $limit: 30 },
            ])
            .toArray()

          if (alt.length) {
            const svc = alt[0]
            const altProv = rel.find((p) => String(p._id) === String(svc.provider_id))
            if (altProv) {
              const candidate = `${provName}: See nearby options — ${svc.is_free ? 'free' : 'discounted'} ${svc.name} at ${altProv.name}.`
              description = truncate(candidate, 158)
            }
          }
        }
      }
    }
  } catch {
    // Silently fall back to default description
  }

  return {
    title,
    description,
    alternates: { canonical: `/providers/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/providers/${slug}`,
      siteName: 'SIE Wellness',
      type: 'article',
      images: [`${siteUrl}/providers/${slug}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ProviderPage({ params }: PageProps) {
  const { slug } = await unwrapParams(params)
  const db = await getServerDb()
  const shortId = extractProviderIdFromSlug(slug)
  const baseSlug = slug.split('-p-')[0]
  const baseNamePattern = baseSlug.split('-').join('.*') // allow gaps between words
  const nameRegex = new RegExp(baseNamePattern, 'i')

  // Because `_id` is an ObjectId, we can't regex directly on it.
  // Strategy: pull a small candidate set by name, then match by short id suffix.
  type ProviderDoc = {
    _id: ObjectId
    name: string
    address?: string
    phone?: string
    category?: string
    languages?: string[]
    accepts_uninsured?: boolean
    medicaid?: boolean
    medicare?: boolean
    ssn_required?: boolean
    telehealth_available?: boolean
    website?: string
    location?: { coordinates?: [number, number] }
    state?: string
    total_services?: number
    free_services?: number
    free_service_ratio?: number
    summary_text?: string
    specialties?: string[]
    conditions_treated?: string[]
    service_categories?: string[]
    free_service_names?: string[]
    rating?: number
  }

  const candidates = await db
    .collection<Pick<ProviderDoc, '_id' | 'name'> & { _id: ObjectId }>('providers')
    .find({ name: nameRegex }, { projection: { name: 1, _id: 1 } })
    .limit(20)
    .toArray()

  let provider = candidates.find((c) => String(c._id).slice(-6).toLowerCase() === (shortId || '').toLowerCase())
  if (!provider) {
    // Fallback: try first candidate
    provider = candidates[0]
  }

  if (!provider) {
    return (
      <main className="container py-10">
        <h1 className="text-display-lg mb-4">Provider not found</h1>
        <Link className="underline" href="/app">Back to search</Link>
      </main>
    )
  }

  const providerIdStr = String(provider._id)

  // Re-fetch full provider doc with all fields
  const full = await db.collection<ProviderDoc>('providers').findOne(
    { _id: new ObjectId(providerIdStr) },
    { projection: { 
      name: 1, address: 1, phone: 1, category: 1, languages: 1, accepts_uninsured: 1, medicaid: 1, medicare: 1, ssn_required: 1,
      telehealth_available: 1, website: 1, location: 1, state: 1, total_services: 1, free_services: 1, free_service_ratio: 1,
      summary_text: 1, specialties: 1, conditions_treated: 1, service_categories: 1, free_service_names: 1, rating: 1
    } }
  )
  const name: string = full?.name || titleCaseFromSlug(slug)
  const address: string | undefined = full?.address
  const phone: string | undefined = full?.phone
  const category: string | undefined = full?.category
  const languages: string[] | undefined = full?.languages || []
  const acceptsUninsured: boolean | undefined = full?.accepts_uninsured
  const medicaid: boolean | undefined = full?.medicaid
  const medicare: boolean | undefined = full?.medicare
  const ssnRequired: boolean | undefined = full?.ssn_required
  const telehealth: boolean | undefined = full?.telehealth_available
  const website: string | undefined = full?.website
  const coords = full?.location?.coordinates as [number, number] | undefined
  const state: string | undefined = full?.state
  const totalServices: number | undefined = full?.total_services
  const freeServices: number | undefined = full?.free_services
  const freeRatio: number | undefined = full?.free_service_ratio
  const summaryText: string | undefined = full?.summary_text
  const specialties: string[] = full?.specialties || []
  const conditionsTreated: string[] = full?.conditions_treated || []
  const serviceCategories: string[] = full?.service_categories || []
  const freeServiceNames: string[] = full?.free_service_names || []

  // Schema.org type selection
  const schemaType = category?.toLowerCase().includes('physician') || category?.toLowerCase().includes('doctor')
    ? 'Physician'
    : category?.toLowerCase().includes('clinic') || category?.toLowerCase().includes('center')
    ? 'MedicalClinic'
    : 'LocalBusiness'

  // Build Schema.org payload
  // Attempt lightweight parsing of the postal address for richer markup
  let streetAddressOnly: string | undefined = address
  let addressLocality: string | undefined
  let addressRegion: string | undefined
  let postalCode: string | undefined
  if (address) {
    const m = address.match(/^(.+?),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})?/) // street, city, ST ZIP
    if (m) {
      streetAddressOnly = m[1]
      addressLocality = m[2]
      addressRegion = m[3]
      postalCode = m[4]
    }
  }

  const ldJson: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name,
    url: `${siteUrl}/providers/${slug}`,
    image: `${siteUrl}/logo_560x560.png`,
    priceRange: 'Free/Low-cost',
  }
  if (phone) ldJson.telephone = phone
  if (website) ldJson.sameAs = website
  if (address) ldJson.address = {
    '@type': 'PostalAddress',
    streetAddress: streetAddressOnly,
    ...(addressLocality ? { addressLocality } : {}),
    ...(addressRegion ? { addressRegion } : {}),
    ...(postalCode ? { postalCode } : {}),
  }
  if (coords && Array.isArray(coords) && coords.length === 2) {
    ldJson.geo = { '@type': 'GeoCoordinates', longitude: coords[0], latitude: coords[1] }
  }
  // aggregateRating added later after we fetch Business doc
  if (Array.isArray(specialties) && specialties.length > 0) {
    ldJson.knowsAbout = specialties
  }

  // Fetch services for this provider
  type ServiceDoc = {
    _id: ObjectId
    provider_id: ObjectId
    name: string
    category?: string
    description?: string
    is_free?: boolean
    is_discounted?: boolean
    price_info?: string
  }

  const services = await db
    .collection<ServiceDoc>('services')
    .find({ provider_id: new ObjectId(String(provider._id)) }, { projection: { name: 1, category: 1, description: 1, is_free: 1, is_discounted: 1, price_info: 1 } })
    .limit(100)
    .toArray()

  // Related providers: same category & state
  const related = await db
    .collection<Pick<ProviderDoc, '_id' | 'name' | 'address'> & { _id: ObjectId }>('providers')
    .find({ _id: { $ne: new ObjectId(String(provider._id)) }, category, ...(state ? { state } : {}) }, { projection: { _id: 1, name: 1, address: 1 } })
    .limit(6)
    .toArray()

  // Money‑saving alternatives via non‑vector query on services (prefer free/discounted)
  type AltService = { _id: ObjectId; provider_id: ObjectId; name: string; category?: string; is_free?: boolean; is_discounted?: boolean }
  let alternatives: AlternativeItem[] = []

  // Simple in-memory cache for alternatives (per process)
  const ALT_CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes
  const altCacheKey = String(provider._id)
  if (!globalThis.__altCache) {
    globalThis.__altCache = new Map<string, { ts: number; data: AlternativeItem[] }>()
  }
  const altCache: Map<string, { ts: number; data: AlternativeItem[] }> = globalThis.__altCache
  try {
    const cached = altCache.get(altCacheKey)
    if (cached && Date.now() - cached.ts < ALT_CACHE_TTL_MS) {
      alternatives = cached.data
    } else {
      // Helper: compute overlap score for relevance
      const ownTokens = new Set(
        services
          .flatMap((s) => (s.name || '').toLowerCase().split(/[^a-z0-9]+/g))
          .filter((t) => t && t.length > 3)
      )
      function nameOverlapScore(n?: string) {
        if (!n) return 0
        const tokens = n.toLowerCase().split(/[^a-z0-9]+/g)
        let score = 0
        for (const t of tokens) if (t.length > 3 && ownTokens.has(t)) score += 1
        return score
      }

      async function fetchAltFromProviders(providerQuery: Record<string, unknown>, useCategoryFilter = true) {
        const cands = await db
          .collection<Pick<ProviderDoc, '_id' | 'name'> & { _id: ObjectId }>('providers')
          .find({ _id: { $ne: new ObjectId(providerIdStr) }, ...providerQuery }, { projection: { _id: 1, name: 1 } })
          .limit(50)
          .toArray()
        const candIds = cands.map((p) => p._id)
        if (!candIds.length) return { items: [] as AltService[], map: new Map<string, { _id: ObjectId; name: string }>() }
        const categoryFilter = useCategoryFilter && Array.isArray(serviceCategories) && serviceCategories.length > 0
          ? { category: { $in: serviceCategories } }
          : {}
        const items = await db
          .collection<AltService>('services')
          .find({ provider_id: { $in: candIds }, $or: [{ is_free: true }, { is_discounted: true }], ...categoryFilter }, { projection: { _id: 1, provider_id: 1, name: 1, category: 1, is_free: 1, is_discounted: 1 } })
          .limit(100)
          .toArray()
        const map = new Map(cands.map((p) => [p._id.toString(), p]))
        return { items, map }
      }

      // Tiered fallbacks to ensure we always have results
      let altItems: AltService[] = []
      let provMap = new Map<string, { _id: ObjectId; name: string }>()

      // 1) Same category + state with category overlap
      if (category || state) {
        const { items, map } = await fetchAltFromProviders({ ...(category ? { category } : {}), ...(state ? { state } : {}), free_services: { $gt: 0 } }, true)
        altItems = items
        provMap = map
      }
      // 1b) Drop category overlap if empty
      if (altItems.length === 0 && (category || state)) {
        const { items, map } = await fetchAltFromProviders({ ...(category ? { category } : {}), ...(state ? { state } : {}), free_services: { $gt: 0 } }, false)
        altItems = items
        provMap = map
      }
      // 2) Same state only
      if (altItems.length === 0 && state) {
        const { items, map } = await fetchAltFromProviders({ state, free_services: { $gt: 0 } })
        altItems = items
        provMap = map
      }
      // 3) Same category across all states
      if (altItems.length === 0 && category) {
        const { items, map } = await fetchAltFromProviders({ category, free_services: { $gt: 0 } })
        altItems = items
        provMap = map
      }
      // 4) Global free/discounted
      if (altItems.length === 0) {
        const items = await db
          .collection<AltService>('services')
          .find({ $or: [{ is_free: true }, { is_discounted: true }] }, { projection: { _id: 1, provider_id: 1, name: 1, category: 1, is_free: 1, is_discounted: 1 } })
          .limit(100)
          .toArray()
        altItems = items.filter((s) => String(s.provider_id) !== providerIdStr)
        const ids = [...new Set(altItems.map((s) => s.provider_id.toString()))].slice(0, 50).map((id) => new ObjectId(id))
        const ps = await db
          .collection<Pick<ProviderDoc, '_id' | 'name'> & { _id: ObjectId }>('providers')
          .find({ _id: { $in: ids } }, { projection: { _id: 1, name: 1 } })
          .toArray()
        provMap = new Map(ps.map((p) => [p._id.toString(), p]))
      }

      // Rank and shape
      altItems.sort((a, b) => {
        const aFree = a.is_free ? 1 : 0
        const bFree = b.is_free ? 1 : 0
        if (aFree !== bFree) return bFree - aFree
        const aDisc = a.is_discounted ? 1 : 0
        const bDisc = b.is_discounted ? 1 : 0
        if (aDisc !== bDisc) return bDisc - aDisc
        return nameOverlapScore(b.name) - nameOverlapScore(a.name)
      })

      alternatives = altItems
        .filter((s) => provMap.has(s.provider_id.toString()))
        .slice(0, 6)
        .map((s) => ({
          serviceId: s._id,
          providerId: s.provider_id,
          providerName: provMap.get(s.provider_id.toString())!.name,
          serviceName: s.name,
          isFree: s.is_free,
          isDiscounted: s.is_discounted,
        }))

      altCache.set(altCacheKey, { ts: Date.now(), data: alternatives })
    }
  } catch (e) {
    console.error('Alternatives generation failed', e)
  }

  // Cross-reference Businesses collection by Name + Address
  type BusinessDoc = {
    [key: string]: unknown
    'Business Status'?: unknown
    'Total Reviews'?: unknown
    'Hours'?: unknown
    'Booking Links'?: unknown
    jina_description?: unknown
    insurance_accepted?: {
      major_providers?: string[]
      medicaid?: boolean
      medicare?: boolean
      self_pay_options?: boolean
      accepted_payment_methods?: string[]
      notes?: string
    }
    eligibility_requirements?:
      | string[]
      | { appointment_process?: string; required_documentation?: string[] }
  }

  const business = await db.collection<BusinessDoc>('businesses').findOne({
    Name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    Address: new RegExp(address ? address.split(',')[0].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '', 'i')
  })

  // Now that we might have review counts, add aggregateRating if available
  if (typeof full?.rating === 'number') {
    const totalReviews = business ? business['Total Reviews'] : undefined
    const reviewCountRaw = (typeof totalReviews === 'string' || typeof totalReviews === 'number') ? Number(totalReviews) : undefined
    const reviewCount = Number.isFinite(reviewCountRaw ?? NaN) ? reviewCountRaw : undefined
    ldJson.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: full.rating,
      ...(reviewCount != null ? { reviewCount } : {}),
    }
  }

  const breadcrumbLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Search', item: `${siteUrl}/app` },
      { '@type': 'ListItem', position: 2, name, item: `${siteUrl}/providers/${slug}` },
    ],
  }

  // Client CTAs are a client component imported directly

  // Group services by category to present in accordions
  const servicesByCategory = services.reduce<Record<string, typeof services>>((acc, s) => {
    const key = s.category || 'General'
    acc[key] = acc[key] || []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <main className="container py-8 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* Alternatives Offer ItemList for rich results */}
      {alternatives.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: `Money-saving alternatives for ${name}`,
              itemListElement: alternatives.slice(0, 3).map((alt, idx) => {
                const altSlug = `${String(alt.providerName).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/-{2,}/g,'-').replace(/^-|-$/g,'')}-p-${String(alt.providerId).slice(-6)}`
                return {
                  '@type': 'ListItem',
                  position: idx + 1,
                  item: {
                    '@type': 'Offer',
                    price: alt.isFree ? 0 : undefined,
                    priceCurrency: 'USD',
                    itemOffered: {
                      '@type': 'Service',
                      name: alt.serviceName,
                      provider: {
                        '@type': schemaType,
                        name: alt.providerName,
                        url: `${siteUrl}/providers/${altSlug}`,
                      },
                    },
                  },
                }
              }),
            }),
          }}
        />
      )}
      {/* Services ItemList schema for better enrichment */}
      {services.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: services.map((s, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                item: {
                  '@type': 'Service',
                  name: s.name,
                  ...(s.description ? { description: s.description } : {}),
                  ...(s.category ? { serviceType: s.category } : {}),
                  offers: (s.is_free || s.is_discounted) ? {
                    '@type': 'Offer',
                    price: s.is_free ? 0 : undefined,
                    priceCurrency: 'USD',
                  } : undefined,
                  provider: {
                    '@type': schemaType,
                    name,
                    url: `${siteUrl}/providers/${slug}`,
                  },
                },
              })),
            }),
          }}
        />
      )}

      {/* Breadcrumbs */}
      <nav className="text-sm mb-3 text-muted-foreground">
        <Link className="hover:underline" href="/app">Search</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Hero / Identity */}
      <section className="relative mb-6">
        <div className="rounded-2xl border bg-white/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Image src="/logo_560x560.png" alt="SIE Wellness" width={56} height={56} className="rounded-lg ring-1 ring-border" />
              <div>
                <h1 className="text-display-lg leading-tight tracking-tight">{name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {category && <Badge variant="secondary" className="text-xs">{category}</Badge>}
                  {typeof full?.rating === 'number' && (
                    <span className="inline-flex items-center gap-1 text-amber-600 text-sm"><Star className="h-4 w-4 fill-amber-500" /> {full.rating.toFixed(1)}</span>
                  )}
                  {typeof freeServices === 'number' && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-sm"><Award className="h-4 w-4" /> {freeServices} free</span>
                  )}
                </div>
                {address && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> {address}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {alternatives.length > 0 && (
        <section className="mb-6">
          <div className="rounded-xl border bg-emerald-50/60 p-4">
            <h2 className="text-h4 mb-2">Money‑saving alternatives nearby</h2>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {alternatives.slice(0, 3).map((alt) => {
                const altSlug = `${String(alt.providerName).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/-{2,}/g,'-').replace(/^-|-$/g,'')}-p-${String(alt.providerId).slice(-6)}`
                return (
                  <li key={String(alt.serviceId)}>
                    <Link className="underline" href={`/providers/${altSlug}`}>{alt.providerName}</Link>: {alt.isFree ? 'free' : alt.isDiscounted ? 'discounted' : ''} {alt.serviceName}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {summaryText && (
                <section className="mb-6">
                  <h2 className="text-h3 mb-2">Overview</h2>
                  <p className="text-body-base text-foreground/90">{summaryText}</p>
                </section>
              )}

              <section className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border bg-card/60 p-3">
                    <div className="text-sm text-muted-foreground">Rating</div>
                    <div className="text-xl font-semibold inline-flex items-center gap-1">{full?.rating ?? '—'}{typeof full?.rating === 'number' && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}</div>
                  </div>
                  <div className="rounded-xl border bg-card/60 p-3">
                    <div className="text-sm text-muted-foreground">Total services</div>
                    <div className="text-xl font-semibold">{totalServices ?? '—'}</div>
                  </div>
                  <div className="rounded-xl border bg-card/60 p-3">
                    <div className="text-sm text-muted-foreground">Free services</div>
                    <div className="text-xl font-semibold">{freeServices ?? '—'}</div>
                  </div>
                  <div className="rounded-xl border bg-card/60 p-3">
                    <div className="text-sm text-muted-foreground">Free ratio</div>
                    <div className="text-xl font-semibold">{freeRatio != null ? `${(freeRatio * 100).toFixed(0)}%` : '—'}</div>
                  </div>
                </div>
              </section>

              {specialties.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-h3 mb-2">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((sp) => (
                      <span key={sp} className="px-2 py-1 text-sm border rounded-md bg-muted/40">{sp}</span>
                    ))}
                  </div>
                </section>
              )}

              {conditionsTreated.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-h3 mb-2">Conditions Treated</h2>
                  <div className="flex flex-wrap gap-2">
                    {conditionsTreated.map((c) => (
                      <span key={c} className="px-2 py-1 text-sm border rounded-md">{c}</span>
                    ))}
                  </div>
                </section>
              )}

              {serviceCategories.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-h3 mb-2">Service Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {serviceCategories.map((sc) => (
                      <span key={sc} className="px-2 py-1 text-sm border rounded-md bg-primary/5 border-primary/20">{sc}</span>
                    ))}
                  </div>
                </section>
              )}

              {freeServiceNames.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-h3 mb-3">Featured Free Services</h2>
                  <ul className="list-disc pl-6">
                    {freeServiceNames.map((n) => (
                      <li key={n} className="text-sm">{n}</li>
                    ))}
                  </ul>
                </section>
              )}
            </TabsContent>

            <TabsContent value="services" className="mt-4">
              {services.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(servicesByCategory).map(([cat, list]) => (
                    <div key={cat} className="rounded-xl border bg-card/60">
                      <div className="px-4 py-3 border-b">
                        <h3 className="text-h4">{cat}</h3>
                      </div>
                      <Accordion type="single" collapsible className="divide-y">
                        {list.map((s) => (
                          <AccordionItem key={String(s._id)} value={String(s._id)}>
                            <AccordionTrigger className="px-4">
                              <div>
                                <div className="font-semibold">{s.name}</div>
                                {(s.is_free || s.is_discounted) && (
                                  <div className="text-xs mt-1 text-muted-foreground">{s.is_free ? 'Free' : s.is_discounted ? 'Discounted' : ''}</div>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4">
                              {s.description && <div className="text-sm mb-2">{s.description}</div>}
                              {s.price_info && <div className="text-sm text-muted-foreground">{s.price_info}</div>}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No services listed.</p>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {business ? (
                <section className="mb-6">
                  <h2 className="text-h3 mb-3">More Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Boolean(business['Business Status']) && (
                      <div className="rounded-md border p-3">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="font-semibold">{String(business['Business Status'])}</div>
                      </div>
                    )}
                    {Boolean(business['Total Reviews']) && (
                      <div className="rounded-md border p-3">
                        <div className="text-sm text-muted-foreground">Reviews</div>
                        <div className="font-semibold">{String(business['Total Reviews'])}</div>
                      </div>
                    )}
                    {Boolean(business['Hours']) && (
                      <div className="rounded-md border p-3 md:col-span-2">
                        <div className="text-sm text-muted-foreground">Hours</div>
                        <div className="whitespace-pre-wrap text-sm">{String(business['Hours'])}</div>
                      </div>
                    )}
                    {Boolean(business['Booking Links']) && (
                      <div className="rounded-md border p-3">
                        <div className="text-sm text-muted-foreground">Booking</div>
                        <a className="underline" href={String(business['Booking Links'])} target="_blank" rel="noopener noreferrer">Schedule online</a>
                      </div>
                    )}
                    {Boolean(business.jina_description) && (
                      <div className="rounded-md border p-3 md:col-span-2">
                        <div className="text-sm text-muted-foreground">About</div>
                        <div className="text-sm">{String(business.jina_description)}</div>
                      </div>
                    )}
                  </div>

                  {business.insurance_accepted && (
                    <div className="mt-4 rounded-md border p-3">
                      <h3 className="text-h4 mb-2">Insurance & Payment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {Array.isArray(business.insurance_accepted.major_providers) && business.insurance_accepted.major_providers.length > 0 && (
                          <div>
                            <div className="text-muted-foreground">Major providers</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {business.insurance_accepted.major_providers.map((i: string) => (
                                <span key={i} className="px-2 py-0.5 border rounded-md">{i}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-muted-foreground">Medicaid</div>
                          <div className="font-medium">{business.insurance_accepted.medicaid ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Medicare</div>
                          <div className="font-medium">{business.insurance_accepted.medicare ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Self-pay</div>
                          <div className="font-medium">{business.insurance_accepted.self_pay_options ? 'Yes' : 'No'}</div>
                        </div>
                        {Array.isArray(business.insurance_accepted.accepted_payment_methods) && business.insurance_accepted.accepted_payment_methods.length > 0 && (
                          <div className="md:col-span-2">
                            <div className="text-muted-foreground">Accepted payment methods</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {business.insurance_accepted.accepted_payment_methods.map((m: string) => (
                                <span key={m} className="px-2 py-0.5 border rounded-md">{m}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {business.insurance_accepted.notes && (
                          <div className="md:col-span-2">
                            <div className="text-muted-foreground">Notes</div>
                            <div>{business.insurance_accepted.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {Array.isArray(business.eligibility_requirements) || business.eligibility_requirements ? (
                    <div className="mt-4 rounded-md border p-3">
                      <h3 className="text-h4 mb-2">Eligibility</h3>
                      {Array.isArray(business.eligibility_requirements) ? (
                        <ul className="list-disc pl-6 text-sm">
                          {business.eligibility_requirements.map((e: string) => (
                            <li key={e}>{e}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm">
                          {business.eligibility_requirements?.appointment_process && (
                            <p className="mb-1"><span className="font-medium">Appointments:</span> {business.eligibility_requirements.appointment_process}</p>
                          )}
                          {Array.isArray(business.eligibility_requirements.required_documentation) && (
                            <p className="mb-1"><span className="font-medium">Documentation:</span> {business.eligibility_requirements.required_documentation.join(', ')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </section>
              ) : (
                <p className="text-sm text-muted-foreground">Business details not available.</p>
              )}
            </TabsContent>
          </Tabs>

          {related.length > 0 && (
            <section className="mb-10">
              <h2 className="text-h3 mb-3">Related providers</h2>
              <ul className="space-y-2">
                {related.map((rp) => {
                  const slug = `${String(rp.name).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/-{2,}/g,'-').replace(/^-|-$/g,'')}-p-${String(rp._id).slice(-6)}`
                  return (
                    <li key={String(rp._id)}>
                      <Link className="underline" href={`/providers/${slug}`}>{rp.name}</Link>
                      {rp.address && <span className="text-sm text-muted-foreground"> — {rp.address}</span>}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border bg-card/50 p-5 lg:sticky lg:top-24 space-y-4">
            <h3 className="text-h4">Contact</h3>
            <div className="grid grid-cols-1 gap-2">
              {phone && (
                <Button asChild className="w-full">
                  <a href={`tel:${phone}`}><Phone className="mr-2" /> Call</a>
                </Button>
              )}
              {address && (
                <Button asChild variant="outline" className="w-full">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`} target="_blank" rel="noopener noreferrer"><MapPin className="mr-2" /> Directions</a>
                </Button>
              )}
              {website && (
                <Button asChild variant="outline" className="w-full">
                  <a href={website} target="_blank" rel="noopener noreferrer"><Globe className="mr-2" /> Website</a>
                </Button>
              )}
              <div className="flex items-center gap-2 pt-1">
                <ClientCTAs
                  providerId={String(provider._id)}
                  name={name}
                  address={address}
                  phone={phone}
                  category={category}
                  compact
                />
              </div>
            </div>

            {address && (
              <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-2">Address</div>
                <div className="text-sm mb-2">{address}</div>
                <div className="rounded-lg overflow-hidden border">
                  <iframe
                    title="Map"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-48"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`}
                  />
                </div>
              </div>
            )}

            {languages && languages.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground">Languages</div>
                <div className="text-sm">{languages.join(', ')}</div>
              </div>
            )}
            <div className="pt-2">
              <div className="text-sm text-muted-foreground mb-2">Accessibility & Coverage</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {acceptsUninsured && <li>Accepts uninsured</li>}
                {medicaid && <li>Accepts Medicaid</li>}
                {medicare && <li>Accepts Medicare</li>}
                {ssnRequired === false && <li>No SSN required</li>}
                {telehealth && <li>Telehealth available</li>}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-4">
          <Link className="underline" href="/app">Back to search</Link>
          <a className="underline text-muted-foreground" href={`mailto:support@siewellness.org?subject=Update for ${encodeURIComponent(name)}`}>Report an issue</a>
        </div>
      </div>

      {/* Mobile sticky actions */}
      <div className="md:hidden fixed bottom-4 inset-x-0 px-4">
        <div className="mx-auto max-w-screen-sm rounded-xl border bg-background/90 backdrop-blur p-2 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            {phone && (
              <Button asChild className="flex-1 h-10"><a href={`tel:${phone}`}><Phone className="mr-1" /> Call</a></Button>
            )}
            <ClientCTAs
              providerId={String(provider._id)}
              name={name}
              address={address}
              phone={phone}
              category={category}
              compact
            />
          </div>
        </div>
      </div>
    </main>
  )
}


