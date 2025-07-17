import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

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



interface AggregationResult {
  _id: string
  provider: {
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
      coordinates: [number, number]
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
  services: Array<{
    _id: string
    provider_id: string
    name: string
    category: string
    description: string
    is_free: boolean
    is_discounted: boolean
    price_info: string
    service_vector: number[]
  }>
  baseScore: number
}

interface FilterConditions {
  [key: string]: boolean | { $in: string[] }
}

// Singleton MongoDB client with connection pooling
let cachedClient: MongoClient | null = null
let cachedDb: ReturnType<MongoClient['db']> | null = null

// Simple embedding cache to avoid repeated API calls
const embeddingCache = new Map<string, number[]>()
const CACHE_SIZE_LIMIT = 100

// Query result cache to avoid repeated database hits
const queryCache = new Map<string, { data: unknown; timestamp: number }>()
const QUERY_CACHE_SIZE_LIMIT = 50
const QUERY_CACHE_TTL = 30000 // 30 seconds

const DEFAULT_NPROBES = parseInt(process.env.COSMOS_NPROBES ?? "10") // Higher nProbes for better recall

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
    serverSelectionTimeoutMS: 10000, // Increased from 5000
    socketTimeoutMS: 10000, // Increased from 5000
    connectTimeoutMS: 10000, // Increased from 5000
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
      signal: AbortSignal.timeout(3000) // 3 second timeout
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
  matchConditions: FilterConditions,
  nProbes?: number
) {
  const cs: Record<string, unknown> = { vector, path, k }
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

// Helper function to calculate cosine similarity between two vectors
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// SIMPLIFIED: Service relevance first, simple scoring
function calculateRelevanceScore(
  baseScore: number, 
  services: Array<{
    service_vector?: number[]
    is_free: boolean
    is_discounted: boolean
  }>, 
  queryVector: number[],
  minRelevanceThreshold: number = 0.3, // Much lower threshold
  distance?: number
): number {
  // If provider has no services, return very low score
  if (!services || services.length === 0) {
    return 0.01
  }
  
  // Find the most relevant service - this should drive the score
  let maxServiceRelevance = 0
  let bestServiceIsFree = false
  let bestServiceIsDiscounted = false
  
  for (const service of services) {
    if (service.service_vector && service.service_vector.length > 0) {
      const serviceRelevance = calculateCosineSimilarity(queryVector, service.service_vector)
      
      if (serviceRelevance > maxServiceRelevance && serviceRelevance >= minRelevanceThreshold) {
        maxServiceRelevance = serviceRelevance
        bestServiceIsFree = service.is_free
        bestServiceIsDiscounted = service.is_discounted
      }
    }
  }
  
  // If no relevant services, return low score
  if (maxServiceRelevance === 0) {
    return 0.05
  }
  
  // SIMPLIFIED SCORING: Start with the best service relevance
  let finalScore = maxServiceRelevance
  
  // Small bonus for free/discounted services (but relevance is still king)
  if (bestServiceIsFree) {
    finalScore += 0.1 // Small bonus for free
  } else if (bestServiceIsDiscounted) {
    finalScore += 0.05 // Smaller bonus for discounted
  }
  
  // Light distance penalty
  if (distance !== undefined && distance > 0) {
    const distancePenalty = Math.exp(-distance / 20) // Lighter penalty
    finalScore *= distancePenalty
  }
  
  return finalScore
}

// Helper function to build provider-level filter conditions
function buildProviderFilters(filters: SearchFilters): FilterConditions {
  const matchConditions: FilterConditions = {}
  
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
function buildServiceFilters(filters: SearchFilters): FilterConditions {
  const matchConditions: FilterConditions = {}
  
  if (filters.freeOnly) {
    matchConditions.is_free = true
  }
  
  if (filters.serviceCategories && filters.serviceCategories.length > 0) {
    matchConditions.category = { $in: filters.serviceCategories }
  }

  return matchConditions
}

// SIMPLIFIED SEARCH with fallback strategies
async function performOptimizedSearch(
  queryVector: number[],
  filters: SearchFilters,
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  const { db } = await getMongoClient()
  
  try {
    const providersCollection = db.collection('providers')
    const servicesCollection = db.collection('services')
    
    // Build filter conditions
    const providerFilters = buildProviderFilters(filters)
    const serviceFilters = buildServiceFilters(filters)
    
    let providers: Array<{
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
        coordinates: [number, number]
      }
      state: string
      accepts_uninsured: boolean
      medicaid: boolean
      medicare: boolean
      ssn_required: boolean
      telehealth_available: boolean
      insurance_providers: string[]
      searchScore: number
      distance?: number
      serviceCount: number
    }> = []
    let services: Array<{
      _id: string
      provider_id: string
      name: string
      category: string
      description: string
      is_free: boolean
      is_discounted: boolean
      price_info: string
      service_vector?: number[]
      searchScore: number
    }> = []
    
    // Try service-first approach with timeout
    try {
      const serviceResults = await Promise.race([
        servicesCollection.aggregate([
          {
            $search: {
              cosmosSearch: buildCosmosSearch(
                queryVector,
                "service_vector", 
                Math.min(limit * 2, 30), // Reduced for better performance
                serviceFilters,
                DEFAULT_NPROBES // Configurable nProbes for balanced recall/perf
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
              maxScore: { $max: { $meta: 'searchScore' } }
            }
          },
          {
            $project: {
              provider: 1,
              services: 1,
              baseScore: '$maxScore'
            }
          }
        ]).toArray(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 4000)
        )
      ]) as AggregationResult[]
    
    // Apply relevance-first scoring in JavaScript  
    const scoredResults = serviceResults.map((result: AggregationResult) => {
      // Calculate distance if location provided
      let distance: number | undefined
      if (location && result.provider.location?.coordinates) {
        distance = calculateDistance(
          location.latitude,
          location.longitude,
          result.provider.location.coordinates[1], // latitude
          result.provider.location.coordinates[0]  // longitude
        )
      }
      
      const relevanceScore = calculateRelevanceScore(
        result.baseScore, 
        result.services, 
        queryVector,
        0.3, // Much lower threshold for better recall
        distance
      )
      
      return {
        ...result,
        finalScore: relevanceScore,
        distance: distance,
        serviceCount: result.services.length
      }
    })
    
    // Filter out providers with very low relevance scores or no services
    const filteredResults = scoredResults.filter((result) => {
      return result.finalScore > 0.05 && result.serviceCount > 0
    })
    
    // Sort by relevance-first score and limit
    filteredResults.sort((a, b) => b.finalScore - a.finalScore)
    const topResults = filteredResults.slice(0, limit)
    
    providers = topResults.map((result) => ({
      ...result.provider,
      searchScore: result.finalScore,
      distance: result.distance,
      serviceCount: result.serviceCount
    }))
    
    const allServices = topResults.flatMap((result) => 
      result.services.map((service) => ({
        ...service,
        searchScore: calculateCosineSimilarity(queryVector, service.service_vector || [])
      }))
    )
    services = allServices
    
    } catch {
      console.log('Service search timed out, falling back to simple provider search')
      
      // Fallback: Simple provider search without complex aggregation
      const simpleProviders = await providersCollection.find(
        providerFilters,
        { limit: limit * 2 }
      ).toArray()
      
      if (simpleProviders.length > 0) {
        const providerIds = simpleProviders.map((p) => p._id)
        const simpleServices = await servicesCollection.find({
          provider_id: { $in: providerIds }
        }).toArray()
        
        // Simple scoring without complex aggregation
        providers = simpleProviders.slice(0, limit).map((provider) => ({
          _id: provider._id.toString(),
          name: provider.name,
          category: provider.category,
          address: provider.address,
          phone: provider.phone,
          website: provider.website,
          email: provider.email,
          rating: provider.rating,
          location: provider.location,
          state: provider.state,
          accepts_uninsured: provider.accepts_uninsured,
          medicaid: provider.medicaid,
          medicare: provider.medicare,
          ssn_required: provider.ssn_required,
          telehealth_available: provider.telehealth_available,
          insurance_providers: provider.insurance_providers,
          searchScore: 0.5, // Default score
          distance: location ? calculateDistance(
            location.latitude,
            location.longitude,
            provider.location?.coordinates?.[1] || 0,
            provider.location?.coordinates?.[0] || 0
          ) : undefined,
          serviceCount: 1
        }))
        
        services = simpleServices.map(service => ({
          _id: service._id.toString(),
          provider_id: service.provider_id.toString(),
          name: service.name,
          category: service.category,
          description: service.description,
          is_free: service.is_free,
          is_discounted: service.is_discounted,
          price_info: service.price_info,
          service_vector: service.service_vector,
          searchScore: 0.5
        }))
      }
    }
    
    return {
      providers,
      services
    }
    
  } catch (error) {
    console.error('Database search error:', error)
    throw error
  }
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

    // Create cache key for this specific query
    const cacheKey = JSON.stringify({ query, filters, location, limit })
    
    // Check cache first
    const cached = queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < QUERY_CACHE_TTL) {
      console.log('Returning cached results')
      return NextResponse.json(cached.data)
    }

    // Generate embedding for the search query (with caching)
    const queryVector = await generateEmbedding(query)

    // Perform optimized search
    const searchResults = await performOptimizedSearch(queryVector, filters, location, limit)
    
    let { providers } = searchResults
    const { services } = searchResults
    
    console.log(`Search completed: ${providers.length} providers, ${services.length} services`)

    // Apply distance filtering if maxDistance is specified
    if (location && filters.maxDistance) {
      providers = providers.filter((provider) => 
        !provider.distance || provider.distance <= filters.maxDistance!
      )
    }

    // Format results
    const results = {
      providers: providers.map((provider) => ({
        ...provider,
        distance: provider.distance || null
      })),
      services: services.map((service) => ({
        ...service,
        searchScore: service.searchScore || 0
      })),
      query,
      totalResults: providers.length + services.length
    }

    // Cache the results
    if (queryCache.size >= QUERY_CACHE_SIZE_LIMIT) {
      // Remove oldest entry
      const firstKey = queryCache.keys().next().value as string
      queryCache.delete(firstKey)
    }
    queryCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
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