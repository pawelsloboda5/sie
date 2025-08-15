import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'
const CHUNK = 5000

async function getCount() {
  const uri = process.env.COSMOS_DB_CONNECTION_STRING || process.env.MONGODB_URI
  if (!uri) throw new Error('DB connection string not set')
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(process.env.DB_NAME || 'sie-db')
  const count = await db.collection('providers').estimatedDocumentCount()
  await client.close()
  return count
}

export async function GET() {
  try {
    const count = await getCount()
    const pages = Math.max(1, Math.ceil(count / CHUNK))
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      Array.from({ length: pages }, (_, i) => `<sitemap><loc>${siteUrl}/sitemaps/providers/${i + 1}.xml</loc></sitemap>`).join('') +
      `</sitemapindex>`
    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
  } catch {
    return new NextResponse('Service unavailable', { status: 503 })
  }
}


