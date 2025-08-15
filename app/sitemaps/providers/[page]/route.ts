import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'
const CHUNK = 5000

async function getDb() {
  const uri = process.env.COSMOS_DB_CONNECTION_STRING || process.env.MONGODB_URI
  if (!uri) throw new Error('DB connection string not set')
  const client = new MongoClient(uri)
  await client.connect()
  return { client, db: client.db(process.env.DB_NAME || 'sie-db') }
}

function slugify(name: string, id: ObjectId) {
  const base = name.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')
  return `${base}-p-${String(id).slice(-6)}`
}

export async function GET(req: NextRequest, { params }: { params: { page: string } }) {
  try {
    const pageNum = Math.max(1, parseInt(Array.isArray(params.page) ? params.page[0] : params.page, 10) || 1)
    const skip = (pageNum - 1) * CHUNK
    const { client, db } = await getDb()
    const cursor = db.collection('providers').find({}, { projection: { _id: 1, name: 1 } }).skip(skip).limit(CHUNK)
    const urls: string[] = []
    for await (const p of cursor) {
      const slug = slugify(String(p.name || 'provider'), p._id as ObjectId)
      urls.push(`${siteUrl}/providers/${slug}`)
    }
    await client.close()

    const xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n` +
      `<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">` +
      urls.map(u => `<url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join('') +
      `</urlset>`
    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
  } catch (e) {
    console.error('Provider chunk sitemap error', e)
    return new NextResponse('Service unavailable', { status: 503 })
  }
}


