import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

// Types based on our data schema
interface SearchFilters {
  freeOnly?: boolean
  acceptsUninsured?: boolean
  acceptsMedicaid?: boolean
  acceptsMedicare?: boolean
  ssnRequired?: boolean
  telehealthAvailable?: boolean
  insuranceProviders?: string[]
  maxDistance?: number
  serviceCategories?: string[]
}

interface SearchRequest {
  query: string
  location?: {
    latitude: number
    longitude: number
  }
  filters?: SearchFilters
  limit?: number
}

interface Provider {
  _id: string
  name: string
  category: string
  address: string
  phone?: string
  website?: string
  email?: string
  rating: number
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  state: string
  accepts_uninsured: boolean
  medicaid: boolean
  medicare: boolean
  ssn_required: boolean
  telehealth_available: boolean
  insurance_providers: string[]
  summary_vector: number[]
}

interface Service {
  _id: string
  provider_id: string
  name: string
  category: string
  description: string
  is_free: boolean
  is_discounted: boolean
  price_info: string
  service_vector: number[]
}

// Singleton MongoDB client with connection pooling
let cachedClient: MongoClient | null = null
let cachedDb: any = null

// Simple embedding cache to avoid repeated API calls
const embeddingCache = new Map<string, number[]>()
const CACHE_SIZE_LIMIT = 100

// MongoDB connection with optimized settings
async function getMongoClient() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set')
  }
  
  // Optimized MongoDB client options
  const client = new MongoClient(uri, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 5000, // Close sockets after 5 seconds of inactivity
    connectTimeoutMS: 5000, // Give up initial connection after 5 seconds
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true, // Automatically retry write operations
  })
  
  await client.connect()
  const db = client.db('sie-db')
  
  cachedClient = client
  cachedDb = db
  
  return { client, db }
}

// Azure OpenAI embedding generation with caching
async function generateEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cacheKey = text.toLowerCase().trim()
  if (embeddingCache.has(cacheKey)) {
    console.log('Using cached embedding for:', text)
    return embeddingCache.get(cacheKey)!
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const model = process.env.AZURE_OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'

  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI credentials not configured')
  }

  try {
    const response = await fetch(`${endpoint}/openai/deployments/${model}/embeddings?api-version=2023-05-15`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        input: text,
        model: model
      }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const embedding = data.data[0].embedding
    
    // Cache the result (with size limit)
    if (embeddingCache.size >= CACHE_SIZE_LIMIT) {
      // Remove oldest entry
      const firstKey = embeddingCache.keys().next().value as string
      embeddingCache.delete(firstKey)
    }
    embeddingCache.set(cacheKey, embedding)
    
    return embedding
  } catch (error) {
    console.error('Embedding generation failed:', error)
    // Return a zero vector as fallback
    return new Array(1536).fill(0)
  }
}

// Helper function to build cosmosSearch object safely
function buildCosmosSearch(
  vector: number[],
  path: "summary_vector" | "service_vector",
  k: number,
  matchConditions: Record<string, any>,
  nProbes?: number
) {
  const cs: any = { vector, path, k }
  if (nProbes && nProbes > 0) cs.nProbes = nProbes
  if (Object.keys(matchConditions).length) cs.filter = matchConditions
  return cs
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in miles
}

// Helper function to determine if service-level filters are active
function hasServiceFilters(filters: SearchFilters): boolean {
  return !!(filters.freeOnly || (filters.serviceCategories && filters.serviceCategories.length > 0))
}

// Helper function to build provider-level filter conditions
function buildProviderFilters(filters: SearchFilters): Record<string, any> {
  const matchConditions: any = {}
  
  if (filters.acceptsUninsured) {
    matchConditions.accepts_uninsured = true
  }
  
  if (filters.acceptsMedicaid) {
    matchConditions.medicaid = true
  }
  
  if (filters.acceptsMedicare) {
    matchConditions.medicare = true
  }
  
  if (filters.ssnRequired === false) {
    matchConditions.ssn_required = false
  }
  
  if (filters.telehealthAvailable) {
    matchConditions.telehealth_available = true
  }
  
  if (filters.insuranceProviders && filters.insuranceProviders.length > 0) {
    matchConditions.insurance_providers = { $in: filters.insuranceProviders }
  }

  return matchConditions
}

// Helper function to build service-level filter conditions
function buildServiceFilters(filters: SearchFilters): Record<string, any> {
  const matchConditions: any = {}
  
  if (filters.freeOnly) {
    matchConditions.is_free = true
  }
  
  if (filters.serviceCategories && filters.serviceCategories.length > 0) {
    matchConditions.category = { $in: filters.serviceCategories }
  }

  return matchConditions
}

// OPTIMIZED UNIFIED SEARCH: Single database connection, combined queries
async function performOptimizedSearch(
  queryVector: number[],
  filters: SearchFilters,
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  const { client, db } = await getMongoClient()
  
  try {
    console.log('Using optimized unified search strategy')
    
    const providersCollection = db.collection('providers')
    const servicesCollection = db.collection('services')
    
    // Build filter conditions
    const providerFilters = buildProviderFilters(filters)
    const serviceFilters = buildServiceFilters(filters)
    const hasServiceLevelFilters = hasServiceFilters(filters)
    
    let providers: any[] = []
    let services: any[] = []
    
    if (hasServiceLevelFilters) {
      // Service-first approach with optimized pipeline
      console.log('Using service-first strategy')
      
      const serviceResults = await servicesCollection.aggregate([
        {
          $search: {
            cosmosSearch: buildCosmosSearch(
              queryVector,
              "service_vector", 
              Math.min(limit * 2, 100), 
              serviceFilters,
              10 
            ),
            returnStoredSource: true
          }
        },
        {
          $lookup: {
            from: 'providers',
            localField: 'provider_id',
            foreignField: '_id',
            as: 'provider'
          }
        },
        {
          $unwind: '$provider'
        },
        {
          $match: Object.keys(providerFilters).length > 0 ? { 
            $and: Object.entries(providerFilters).map(([key, value]) => ({
              [`provider.${key}`]: value
            }))
          } : {}
        },
        {
          $group: {
            _id: '$provider._id',
            provider: { $first: '$provider' },
            services: { $push: '$$ROOT' },
            maxScore: { $max: { $meta: 'searchScore' } },
            freeServiceCount: { 
              $sum: { $cond: [{ $eq: ['$is_free', true] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            provider: 1,
            services: 1,
            score: '$maxScore',
            freeServiceCount: 1,
            enhancedScore: {
              $multiply: [
                '$maxScore',
                { $add: [1, { $multiply: ['$freeServiceCount', 0.3] }] }
              ]
            }
          }
        },
        {
          $sort: { enhancedScore: -1 }
        },
        {
          $limit: limit
        }
      ]).toArray()
      
      providers = serviceResults.map((result: any) => ({
        ...result.provider,
        searchScore: result.enhancedScore,
        freeServiceCount: result.freeServiceCount
      }))
      
      services = serviceResults.flatMap((result: any) => 
        result.services.map((service: any) => ({
          ...service,
          searchScore: result.score
        }))
      )
      
    } else {
      // Provider-first approach
      console.log('Using provider-first strategy')
      
      const providerResults = await providersCollection.aggregate([
        {
          $search: {
            cosmosSearch: buildCosmosSearch(
              queryVector,
              "summary_vector",
              Math.min(limit * 2, 100), 
              providerFilters,
              5 
            ),
            returnStoredSource: true
          }
        },
        {
          $project: {
            provider: '$$ROOT',
            score: { $meta: 'searchScore' }
          }
        },
        {
          $limit: limit
        }
      ]).toArray()
      
      if (providerResults.length > 0) {
        const providerIds = providerResults.map((r: any) => r.provider._id)
        
        // Get services for these providers
        services = await servicesCollection.find({
          provider_id: { $in: providerIds }
        }).toArray()
        
        providers = providerResults.map((result: any) => ({
          ...result.provider,
          searchScore: result.score
        }))
      }
    }
    
    console.log(`Found ${providers.length} providers, ${services.length} services`)
    
    return {
      providers,
      services
    }
    
  } catch (error) {
    console.error('Database search error:', error)
    throw error
  }
  // Note: Don't close client connection - reuse it
}

// Apply distance filtering and sorting
function applyLocationFiltering(
  results: any[],
  location: { latitude: number, longitude: number },
  maxDistance?: number
) {
  let resultsWithDistance = results.map((provider: any) => {
    if (!provider.location || !provider.location.coordinates) {
      return {
        ...provider,
        distance: 999999 // Set very high distance for providers without location
      }
    }
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      provider.location.coordinates[1], // latitude
      provider.location.coordinates[0]  // longitude
    )
    
    return {
      ...provider,
      distance: distance
    }
  })
  
  // Filter by maximum distance if specified
  if (maxDistance) {
    resultsWithDistance = resultsWithDistance.filter((provider: any) => 
      provider.distance <= maxDistance
    )
  }
  
  // Sort by distance first, then by score
  resultsWithDistance.sort((a: any, b: any) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance
    }
    return (b.searchScore || 0) - (a.searchScore || 0)
  })
  
  return resultsWithDistance
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()
    const { query, location, filters = {}, limit = 10 } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    console.log('Search request:', { 
      query, 
      filters, 
      location,
      hasServiceFilters: hasServiceFilters(filters)
    })

    // Generate embedding for the search query (with caching)
    const queryVector = await generateEmbedding(query)

    // Perform optimized search
    const searchResults = await performOptimizedSearch(queryVector, filters, location, limit)
    
    let { providers, services } = searchResults
    
    console.log(`Search completed: ${providers.length} providers, ${services.length} services`)

    // Apply location filtering if location is provided
    if (location) {
      providers = applyLocationFiltering(providers, location, filters.maxDistance)
    }

    // Format results
    const results = {
      providers: providers.map((provider: any) => ({
        ...provider,
        distance: provider.distance || null,
        freeServiceCount: provider.freeServiceCount || 0
      })),
      services: services.map((service: any) => ({
        ...service,
        searchScore: service.searchScore || 0
      })),
      query,
      totalResults: providers.length + services.length,
      searchStrategy: hasServiceFilters(filters) ? 'service-first' : 'provider-first'
    }

    console.log('Final results:', {
      providersCount: results.providers.length,
      servicesCount: results.services.length,
      totalResults: results.totalResults,
      strategy: results.searchStrategy
    })

    return NextResponse.json(results)

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search temporarily unavailable. Please try again.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (cachedClient) {
    await cachedClient.close()
  }
}) 