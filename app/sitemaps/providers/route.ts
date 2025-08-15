import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

async function getDb() {
  const uri = process.env.COSMOS_DB_CONNECTION_STRING || process.env.MONGODB_URI
  if (!uri) throw new Error('DB connection string not set')
  const client = new MongoClient(uri)
  await client.connect()
  return { client, db: client.db(process.env.DB_NAME || 'sie-db') }
}

// Simple provider sitemap (single file). We will chunk this if count grows.
export async function GET(_req: NextRequest) {
  try {
    const { client, db } = await getDb()
    const cursor = db.collection('providers').find({}, { projection: { _id: 1, name: 1 } })
    const urls: string[] = []
    for await (const p of cursor) {
      const id = String(p._id)
      const name = String(p.name || 'provider')
      const slugBase = name.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')
      const slug = `${slugBase}-p-${id.slice(-6)}`
      urls.push(`${siteUrl}/providers/${slug}`)
    }
    await client.close()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.map(u => `<url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join('') +
      `</urlset>`

    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
  } catch (e) {
    console.error('Provider sitemap error', e)
    return new NextResponse('Service unavailable', { status: 503 })
  }
}


