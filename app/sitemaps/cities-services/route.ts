import { NextResponse } from 'next/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

type City = { city: string; state: string }
type Service = { slug: string }

const cities: City[] = [
  // DC metro
  { city: 'Washington', state: 'DC' },
  { city: 'Arlington', state: 'VA' },
  { city: 'Alexandria', state: 'VA' },
  { city: 'Fairfax', state: 'VA' },
  { city: 'Silver Spring', state: 'MD' },
  { city: 'Bethesda', state: 'MD' },
  { city: 'Gaithersburg', state: 'MD' },
  { city: 'Rockville', state: 'MD' },
  // Maryland
  { city: 'Baltimore', state: 'MD' },
  { city: 'Columbia', state: 'MD' },
  { city: 'Towson', state: 'MD' },
  { city: 'Annapolis', state: 'MD' },
  { city: 'Hagerstown', state: 'MD' },
  // Virginia
  { city: 'Richmond', state: 'VA' },
  { city: 'Norfolk', state: 'VA' },
  { city: 'Virginia Beach', state: 'VA' },
  { city: 'Charlottesville', state: 'VA' },
  // Georgia
  { city: 'Atlanta', state: 'GA' },
  { city: 'Decatur', state: 'GA' },
  { city: 'Marietta', state: 'GA' },
  { city: 'Savannah', state: 'GA' },
  { city: 'Augusta', state: 'GA' },
  // California
  { city: 'San Francisco', state: 'CA' },
]

// Initial high‑intent services (slugs)
const services: Service[] = [
  { slug: 'free-sti-testing' },
  { slug: 'urgent-care' },
  { slug: 'mental-health' },
  { slug: 'free-dental' },
  { slug: 'womens-health' },
  { slug: 'pregnancy-care' },
  { slug: 'community-health-centers' },
  { slug: 'vision-care' },
  { slug: 'pharmacy-low-cost' },
  { slug: 'blood-testing-labs' },
  { slug: 'immunizations' },
  { slug: 'telehealth' },
]

function slugifyCity(city: string, state: string): string {
  const c = city.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')
  return `${c}-${state.toLowerCase()}`
}

export async function GET() {
  const urls: string[] = []
  for (const s of services) {
    for (const loc of cities) {
      urls.push(`${siteUrl}/find/${s.slug}/${slugifyCity(loc.city, loc.state)}`)
    }
  }

  const now = new Date().toISOString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>\n`).join('') +
    `</urlset>`

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}


