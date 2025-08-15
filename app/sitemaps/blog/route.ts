import { NextResponse } from 'next/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

// For now this is a placeholder sitemap. Once MDX posts exist, iterate them.
export async function GET() {
  const urls: string[] = []

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `<url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join('') +
    `</urlset>`

  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}


