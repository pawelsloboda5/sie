import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Db, type Document } from 'mongodb'
import type { Provider as ProviderType, Service as ServiceType } from '@/lib/types/copilot'

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'sie-db'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function getDatabase(): Promise<Db> {
  if (cachedDb) return cachedDb
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI)
    await cachedClient.connect()
  }
  cachedDb = cachedClient.db(MONGODB_DB)
  return cachedDb
}

// Haversine distance in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function normalizeName(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nameRaw: string = (body?.name || '').toString().trim()
    const location: { latitude?: number; longitude?: number } | undefined = body?.location
    const limit: number = Math.min(Number(body?.limit || 3), 5)

    if (!nameRaw) {
      return NextResponse.json({ providers: [] })
    }

    const name = nameRaw
    const db = await getDatabase()
    const collection = db.collection('prices-only')

    // Build a permissive regex query to gather candidates
    const tokens = normalizeName(name).split(' ').filter(Boolean)
    const ors = tokens.length
      ? tokens.map((t) => ({ name: { $regex: new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }))
      : [{ name: { $regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }]

    const pipeline: Document[] = [
      { $match: { $or: ors } } as Document,
      { $project: { source: 0 } } as Document,
      { $limit: 200 } as Document
    ]

    type Service = ServiceType & { embedding?: number[] }
    type ProviderDbDoc = Omit<ProviderType, '_id'> & { _id: string | Document; services?: Service[] }

    const candidates = await collection.aggregate(pipeline).toArray() as unknown as ProviderDbDoc[]

    // Score candidates by name similarity and distance
    type Scored = ProviderType & { __score: number }
    const qNorm = normalizeName(name)
    const qTokens = new Set(qNorm.split(' ').filter(Boolean))
    const scored: Scored[] = candidates.map((doc) => {
      const p: ProviderType = {
        _id: String(doc._id as string),
        name: doc.name,
        category: doc.category,
        phone: doc.phone,
        website: doc.website,
        email: doc.email,
        bookingUrl: doc.bookingUrl,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        address: (doc as unknown as { address?: string }).address,
        addressLine: doc.addressLine,
        city: doc.city,
        state: doc.state,
        postalCode: doc.postalCode,
        location: doc.location as ProviderType['location'],
        services: (doc.services as ServiceType[] | undefined) || [],
        insurance: doc.insurance,
        telehealth: doc.telehealth
      }

      // Name similarity
      const n = normalizeName(p.name)
      const nTokens = new Set(n.split(' ').filter(Boolean))
      const overlap = [...qTokens].filter((t) => nTokens.has(t)).length
      const ratio = overlap / Math.max(1, qTokens.size)
      const contiguousBonus = n.includes(qNorm) ? 0.5 : 0

      // Distance bonus (closer is better)
      let distBonus = 0
      if (location && p.location?.coordinates) {
        const [lon, lat] = p.location.coordinates
        const miles = calculateDistance(location.latitude as number, location.longitude as number, lat, lon)
        p.distance = miles
        distBonus = Math.max(0, 0.15 - Math.min(miles, 50) / 50 * 0.15)
      }

      const score = ratio + contiguousBonus + distBonus
      return { ...(p as ProviderType), __score: score }
    })

    scored.sort((a, b) => (b.__score - a.__score))

    // Sanitize embeddings from services
    const top = scored.slice(0, limit).map((p) => ({
      ...p,
      services: Array.isArray(p.services)
        ? (p.services as (Service | ServiceType)[]).map((s) => {
            const { embedding: _embedding, ...svc } = (s as Service)
            void _embedding
            return (svc as ServiceType)
          })
        : p.services
    }))

    return NextResponse.json({ providers: top })
  } catch (error) {
    console.error('Provider-by-name error:', error)
    return NextResponse.json({ providers: [] }, { status: 200 })
  }
}


