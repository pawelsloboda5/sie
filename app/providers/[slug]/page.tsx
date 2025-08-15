import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerDb } from '@/lib/server/db'
import { extractProviderIdFromSlug } from '@/lib/utils'
import { ObjectId } from 'mongodb'

export const revalidate = 86400 // 24h ISR by default

type PageProps = { params: Promise<{ slug: string }> }

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
  const description = `Learn about ${name}. Address, hours, services, and accessibility details coming soon.`

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

  // Re-fetch full provider doc with all fields
  const full = await db.collection<ProviderDoc>('providers').findOne({ _id: new ObjectId(String(provider._id)) })
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

  const ldJson: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name,
    url: `${siteUrl}/providers/${slug}`,
  }
  if (phone) ldJson.telephone = phone
  if (website) ldJson.sameAs = website
  if (address) ldJson.address = { '@type': 'PostalAddress', streetAddress: address }
  if (coords && Array.isArray(coords) && coords.length === 2) {
    ldJson.geo = { '@type': 'GeoCoordinates', longitude: coords[0], latitude: coords[1] }
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

  return (
    <main className="container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      {/* Breadcrumbs */}
      <nav className="text-sm mb-4 text-muted-foreground">
        <Link className="hover:underline" href="/app">Search</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      <h1 className="text-display-lg mb-2">{name}</h1>
      {category && <p className="text-body-base text-muted-foreground mb-2">{category}</p>}
      {address && (
        <p className="text-body-base mb-2">{address}</p>
      )}
      <div className="space-x-4 mb-6">
        {phone && <a className="underline" href={`tel:${phone}`}>Call</a>}
        {website && <a className="underline" href={website} target="_blank" rel="noopener noreferrer">Visit Website</a>}
      </div>

      {/* Overview summary */}
      {summaryText && (
        <section className="mb-8">
          <h2 className="text-h3 mb-2">Overview</h2>
          <p className="text-body-base text-foreground/90">{summaryText}</p>
        </section>
      )}

      {/* Quick stats */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-md p-3">
            <div className="text-sm text-muted-foreground">Rating</div>
            <div className="text-xl font-semibold">{full?.rating ?? '—'}</div>
          </div>
          <div className="border rounded-md p-3">
            <div className="text-sm text-muted-foreground">Total services</div>
            <div className="text-xl font-semibold">{totalServices ?? '—'}</div>
          </div>
          <div className="border rounded-md p-3">
            <div className="text-sm text-muted-foreground">Free services</div>
            <div className="text-xl font-semibold">{freeServices ?? '—'}</div>
          </div>
          <div className="border rounded-md p-3">
            <div className="text-sm text-muted-foreground">Free ratio</div>
            <div className="text-xl font-semibold">{freeRatio != null ? `${(freeRatio * 100).toFixed(0)}%` : '—'}</div>
          </div>
        </div>
      </section>

      <ul className="text-sm text-muted-foreground space-y-1 mb-8">
        {acceptsUninsured && <li>Accepts uninsured</li>}
        {medicaid && <li>Accepts Medicaid</li>}
        {medicare && <li>Accepts Medicare</li>}
        {ssnRequired === false && <li>No SSN required</li>}
        {telehealth && <li>Telehealth available</li>}
        {languages && languages.length > 0 && <li>Languages: {languages.join(', ')}</li>}
      </ul>

      {/* Specialties */}
      {specialties.length > 0 && (
        <section className="mb-8">
          <h2 className="text-h3 mb-2">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {specialties.map((sp) => (
              <span key={sp} className="px-2 py-1 text-sm border rounded-md bg-muted/40">{sp}</span>
            ))}
          </div>
        </section>
      )}

      {/* Conditions Treated */}
      {conditionsTreated.length > 0 && (
        <section className="mb-8">
          <h2 className="text-h3 mb-2">Conditions Treated</h2>
          <div className="flex flex-wrap gap-2">
            {conditionsTreated.map((c) => (
              <span key={c} className="px-2 py-1 text-sm border rounded-md">{c}</span>
            ))}
          </div>
        </section>
      )}

      {/* Service categories */}
      {serviceCategories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-h3 mb-2">Service Categories</h2>
          <div className="flex flex-wrap gap-2">
            {serviceCategories.map((sc) => (
              <span key={sc} className="px-2 py-1 text-sm border rounded-md bg-primary/5 border-primary/20">{sc}</span>
            ))}
          </div>
        </section>
      )}

      {/* Featured free services */}
      {freeServiceNames.length > 0 && (
        <section className="mb-10">
          <h2 className="text-h3 mb-3">Featured Free Services</h2>
          <ul className="list-disc pl-6">
            {freeServiceNames.map((n) => (
              <li key={n} className="text-sm">{n}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Services list */}
      {services.length > 0 && (
        <section className="mb-10">
          <h2 className="text-h3 mb-3">Services</h2>
          <ul className="space-y-2">
            {services.map((s) => (
              <li key={String(s._id)} className="border rounded-md p-3">
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.category}</div>
                {s.description && <div className="text-sm mt-1">{s.description}</div>}
                {(s.is_free || s.is_discounted) && (
                  <div className="text-xs mt-1">{s.is_free ? 'Free' : s.is_discounted ? 'Discounted' : ''}</div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Business (pre-processed) supplemental info */}
      {business ? (
        <section className="mb-10">
          <h2 className="text-h3 mb-3">More Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Boolean(business['Business Status']) && (
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-semibold">{String(business['Business Status'])}</div>
              </div>
            )}
            {Boolean(business['Total Reviews']) && (
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Reviews</div>
                <div className="font-semibold">{String(business['Total Reviews'])}</div>
              </div>
            )}
            {Boolean(business['Hours']) && (
              <div className="border rounded-md p-3 md:col-span-2">
                <div className="text-sm text-muted-foreground">Hours</div>
                <div className="whitespace-pre-wrap text-sm">{String(business['Hours'])}</div>
              </div>
            )}
            {Boolean(business['Booking Links']) && (
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Booking</div>
                <a className="underline" href={String(business['Booking Links'])} target="_blank" rel="noopener noreferrer">Schedule online</a>
              </div>
            )}
            {Boolean(business.jina_description) && (
              <div className="border rounded-md p-3 md:col-span-2">
                <div className="text-sm text-muted-foreground">About</div>
                <div className="text-sm">{String(business.jina_description)}</div>
              </div>
            )}
          </div>
          {/* Insurance & Payments */}
          {business.insurance_accepted && (
            <div className="mt-4 border rounded-md p-3">
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
          {/* Eligibility */}
          {Array.isArray(business.eligibility_requirements) || business.eligibility_requirements ? (
            <div className="mt-4 border rounded-md p-3">
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
      ) : null}

      {/* Related providers */}
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

      <Link className="underline" href="/app">Back to search</Link>
    </main>
  )
}


