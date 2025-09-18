export const runtime = 'nodejs'
export const preferredRegion = ['iad1']
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Db, type Document, type ObjectId } from 'mongodb'
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

// Helper to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      filters = {},
      location,
      limit = 20
    } = body
    
    const maxLimit = Number(process.env.COPILOT_FILTER_LIMIT || 50)
    const effectiveLimit = Math.min(limit, maxLimit)
    
    const db = await getDatabase()
    const collection = db.collection('prices-only')
    
    // Build MongoDB query from filters
    const mongoQuery: Record<string, unknown> = {}
    
    // Insurance filters
    if (filters.acceptsMedicaid) {
      mongoQuery['insurance.medicaid'] = true
    }
    if (filters.acceptsMedicare) {
      mongoQuery['insurance.medicare'] = true
    }
    if (filters.acceptsUninsured || filters.selfPayOptions) {
      mongoQuery['insurance.selfPayOptions'] = true
    }
    if (filters.paymentPlans) {
      mongoQuery['insurance.paymentPlans'] = true
    }
    
    // Insurance carriers filter
    if (filters.insuranceProviders?.length) {
      mongoQuery['insurance.majorProviders'] = {
        $elemMatch: {
          $in: filters.insuranceProviders.map((p: string) => new RegExp(p, 'i'))
        }
      }
    }
    
    // Service filters
    if (filters.freeOnly) {
      mongoQuery['services.isFree'] = true
    }
    
    if (filters.serviceCategories?.length) {
      const categoryRegex = filters.serviceCategories.map((cat: string) => new RegExp(cat, 'i'))
      mongoQuery.$or = [
        { category: { $in: categoryRegex } },
        { 'services.category': { $in: categoryRegex } },
        { 'services.name': { $in: categoryRegex } }
      ]
    }
    
    // Telehealth filter
    if (filters.telehealthAvailable) {
      mongoQuery['telehealth.available'] = true
    }
    
    // State/City filters
    if (filters.state) {
      mongoQuery.state = filters.state
    }
    if (filters.city) {
      mongoQuery.city = new RegExp(filters.city, 'i')
    }
    
    // Price range filter
    const aggregatePipeline: Document[] = [
      { $match: mongoQuery } as Document,
      { $limit: 500 } as Document // Get more initially for distance filtering
    ]
    
    // Execute query
    type Service = ServiceType
    type Provider = ProviderType
    type ServiceWithEmbedding = Service & { embedding?: number[] }
    type ProviderDbDoc = Omit<Provider, '_id'> & { _id: ObjectId | string; services?: ServiceWithEmbedding[] }

    const providers = await collection.aggregate(aggregatePipeline).toArray() as unknown as ProviderDbDoc[]
    
    // Post-process for distance and additional filtering
    type ProcessedProvider = Provider & {
      distance?: number
      minServicePrice: number | null
      hasFreeServices: boolean
      matchingServices: number
    }

    let processedProviders: ProcessedProvider[] = providers.map((doc) => {
      const provider: ProcessedProvider = {
        _id: String(doc._id),
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
        location: doc.location,
        services: (doc.services as Service[] | undefined) || [],
        insurance: doc.insurance,
        telehealth: doc.telehealth,
        minServicePrice: null,
        hasFreeServices: false,
        matchingServices: 0
      }
      
      // Calculate distance if location provided
      if (location && provider.location?.coordinates) {
        const [lon, lat] = provider.location.coordinates
        provider.distance = calculateDistance(
          location.latitude,
          location.longitude,
          lat,
          lon
        )
      }
      
      // Extract price info
      let minPrice = Number.POSITIVE_INFINITY
      let hasFreeService = false
      
      for (const service of provider.services) {
        if (service.isFree) {
          hasFreeService = true
          minPrice = 0
        } else if (service.price) {
          const price = service.price.min ?? service.price.flat ?? Number.POSITIVE_INFINITY
          if (price < minPrice) {
            minPrice = price
          }
        }
      }
      
      provider.minServicePrice = minPrice === Number.POSITIVE_INFINITY ? null : minPrice
      provider.hasFreeServices = hasFreeService
      
      // Count matching services
      provider.matchingServices = provider.services.filter((s: Service) => {
        if (filters.freeOnly && !s.isFree) return false
        if (filters.maxPrice && s.price) {
          const price = s.price.min ?? s.price.flat ?? 0
          if (price > filters.maxPrice) return false
        }
        return true
      }).length
      
      return provider
    })
    
    // Apply distance filter
    if (filters.maxDistance && location) {
      processedProviders = processedProviders.filter(
        p => p.distance !== undefined && p.distance <= filters.maxDistance
      )
    }
    
    // Apply price filters
    if (filters.maxPrice) {
      processedProviders = processedProviders.filter(
        p => p.minServicePrice !== null && p.minServicePrice <= filters.maxPrice
      )
    }
    
    // Sort by relevance
    processedProviders.sort((a, b) => {
      // First by number of matching services
      const matchDiff = (b.matchingServices || 0) - (a.matchingServices || 0)
      if (matchDiff !== 0) return matchDiff
      
      // Then by price
      const aPrice = a.minServicePrice ?? Number.POSITIVE_INFINITY
      const bPrice = b.minServicePrice ?? Number.POSITIVE_INFINITY
      const priceDiff = aPrice - bPrice
      if (Math.abs(priceDiff) > 10) return priceDiff
      
      // Then by distance
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance
      }
      
      // Finally by rating
      return (b.rating ?? 0) - (a.rating ?? 0)
    })
    
    // Limit results
    const limitedProviders: ProcessedProvider[] = processedProviders.slice(0, effectiveLimit)

    // Sanitize embeddings from services
    const sanitizedProviders = limitedProviders.map((p: ProcessedProvider) => ({
      ...p,
      services: Array.isArray(p.services)
        ? p.services.map((s: Service | ServiceWithEmbedding) => {
            const { embedding: _embedding, ...svc } = (s as ServiceWithEmbedding)
            void _embedding
            return svc as Service
          })
        : p.services
    }))
    
    return NextResponse.json({
      providers: sanitizedProviders,
      total_count: sanitizedProviders.length,
      filters_applied: filters,
      location_used: location || null
    })
  } catch (error) {
    console.error('Copilot filter error:', error)
    return NextResponse.json(
      { error: 'Filter failed', providers: [], total_count: 0 },
      { status: 500 }
    )
  }
}
