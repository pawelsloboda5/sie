import type { Metadata } from 'next'
import { getServerDb } from '@/lib/server/db'
import Link from 'next/link'
import { ObjectId } from 'mongodb'

type PageProps = { params: { service: string; city: string } }

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

function titleize(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const serviceName = titleize(params.service)
  const cityName = titleize(params.city)
  const title = `Free & Low‑Cost ${serviceName} in ${cityName} | SIE Wellness`
  const description = `Find free and affordable ${serviceName} in ${cityName}. Compare hours, insurance, no‑SSN options, and directions.`
  return {
    title,
    description,
    alternates: { canonical: `/find/${params.service}/${params.city}` },
    openGraph: { title, description, url: `${siteUrl}/find/${params.service}/${params.city}`, images: [`${siteUrl}/find/${params.service}/${params.city}/opengraph-image`] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CityServicePage({ params }: PageProps) {
  const db = await getServerDb()
  const serviceKey = params.service
  const cityKey = params.city.split('-')[0] // allow state at end
  const cityRegex = new RegExp(cityKey.replace(/-/g, '.*'), 'i')

  // Query providers in city; then fetch their services filtered by category match
  const providers = await db
    .collection('providers')
    .find({ address: cityRegex }, { projection: { _id: 1, name: 1, address: 1, category: 1 } })
    .limit(50)
    .toArray()

  const ids = providers.map(p => p._id) as ObjectId[]
  const services = ids.length
    ? await db
        .collection('services')
        .find({ provider_id: { $in: ids } }, { projection: { _id: 1, provider_id: 1, name: 1, category: 1, is_free: 1 } })
        .limit(500)
        .toArray()
    : []

  const serviceName = titleize(params.service)
  const cityName = titleize(params.city)

  // JSON‑LD ItemList for providers
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${serviceName} in ${cityName}`,
    itemListElement: providers.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'}/providers/${String(p.name).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/-{2,}/g,'-').replace(/^-|-$/g,'')}-p-${String(p._id).slice(-6)}`
    }))
  }

  // Minimal FAQPage example (expands with editorial content later)
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I find free ${serviceName.toLowerCase()} in ${cityName}?`,
        acceptedAnswer: { '@type': 'Answer', text: `Use SIE Wellness to filter for providers offering free or discounted ${serviceName.toLowerCase()} in ${cityName}.` }
      },
      {
        '@type': 'Question',
        name: 'What documents should I bring?',
        acceptedAnswer: { '@type': 'Answer', text: 'Policies vary by provider. Many free services do not require SSN. Call to confirm hours and eligibility.' }
      }
    ]
  }

  return (
    <main className="container py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <h1 className="text-display-lg mb-4">{serviceName} in {cityName}</h1>

      {providers.length === 0 ? (
        <p className="text-body-base text-muted-foreground">We’re adding providers in this area. Try a nearby city.</p>
      ) : (
        <ul className="space-y-3 mb-8">
          {providers.map((p) => {
            const slug = `${String(p.name).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/-{2,}/g,'-').replace(/^-|-$/g,'')}-p-${String(p._id).slice(-6)}`
            const pServices = services.filter((s: any) => String(s.provider_id) === String(p._id))
            const freeCount = pServices.filter((s: any) => s.is_free).length
            return (
              <li key={String(p._id)} className="border rounded-md p-3">
                <Link className="underline font-semibold" href={`/providers/${slug}`}>{p.name}</Link>
                <div className="text-sm text-muted-foreground">{p.address}</div>
                <div className="text-xs mt-1">{freeCount} free services</div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}


