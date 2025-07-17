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
  // Check if existing connection is still valid
  if (cachedClient && cachedDb) {
    try {
      // Test connection with a simple ping
      await cachedClient.db('admin').admin().ping()
      return { client: cachedClient, db: cachedDb }
    } catch (error) {
      console.log('Cached connection lost, reconnecting...')
      cachedClient = null
      cachedDb = null
    }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set')
  }
  
  // Optimized MongoDB client options
  const client = new MongoClient(uri, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 8000, // Reduced from 10000
    socketTimeoutMS: 8000, // Reduced from 10000
    connectTimeoutMS: 8000, // Reduced from 10000
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

// Helper function to search providers with projection to exclude vectors
async function searchProviders(
  queryVector: number[],
  db: ReturnType<MongoClient['db']>,
  filters: SearchFilters,
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  const providerFilters = buildProviderFilters(filters)
  const providersCollection = db.collection('providers')
  
  try {
    const results = await providersCollection.aggregate([
      {
        $search: {
          cosmosSearch: buildCosmosSearch(
            queryVector,
            "summary_vector",
            Math.min(limit * 2, 50),
            providerFilters,
            DEFAULT_NPROBES
          ),
          returnStoredSource: true
        }
      },
      {
        $project: {
          score: { $meta: "searchScore" },
          _id: 1,
          name: 1,
          category: 1,
          address: 1,
          phone: 1,
          website: 1,
          email: 1,
          rating: 1,
          location: 1,
          state: 1,
          accepts_uninsured: 1,
          medicaid: 1,
          medicare: 1,
          ssn_required: 1,
          telehealth_available: 1,
          insurance_providers: 1
          // Exclude summary_vector and other large fields
        }
      },
      { $limit: limit }
    ]).toArray()

    return results.map((result) => ({
      ...result,
      searchScore: result.score,
      distance: location ? calculateDistance(
        location.latitude,
        location.longitude,
        result.location?.coordinates?.[1] || 0,
        result.location?.coordinates?.[0] || 0
      ) : undefined
    }))
  } catch (error) {
    console.error('Provider search error:', error)
    return []
  }
}

// Helper function to search services with projection to exclude vectors
async function searchServices(
  queryVector: number[],
  db: ReturnType<MongoClient['db']>,
  filters: SearchFilters,
  limit: number = 20
) {
  const serviceFilters = buildServiceFilters(filters)
  const servicesCollection = db.collection('services')
  
  try {
    const results = await servicesCollection.aggregate([
      {
        $search: {
          cosmosSearch: buildCosmosSearch(
            queryVector,
            "service_vector",
            Math.min(limit * 2, 60),
            serviceFilters,
            DEFAULT_NPROBES
          ),
          returnStoredSource: true
        }
      },
      {
        $project: {
          score: { $meta: "searchScore" },
          _id: 1,
          provider_id: 1,
          name: 1,
          category: 1,
          description: 1,
          is_free: 1,
          is_discounted: 1,
          price_info: 1
          // Exclude service_vector
        }
      },
      { $limit: limit }
    ]).toArray()

    return results.map((result) => ({
      ...result,
      searchScore: result.score
    }))
  } catch (error) {
    console.error('Service search error:', error)
    return []
  }
}

// Helper function to get provider details for services (with projection)
async function getProviderDetails(
  db: ReturnType<MongoClient['db']>,
  providerIds: string[]
) {
  const providersCollection = db.collection('providers')
  
  try {
    const objectIds = providerIds.map(id => new ObjectId(id))
    const providers = await providersCollection.find(
      { _id: { $in: objectIds } },
      {
        projection: {
          _id: 1,
          name: 1,
          category: 1,
          address: 1,
          phone: 1,
          website: 1,
          email: 1,
          rating: 1,
          location: 1,
          state: 1,
          accepts_uninsured: 1,
          medicaid: 1,
          medicare: 1,
          ssn_required: 1,
          telehealth_available: 1,
          insurance_providers: 1
          // Exclude summary_vector
        }
      }
    ).toArray()

    // Create a map for quick lookup
    const providerMap = new Map()
    providers.forEach(provider => {
      providerMap.set(provider._id.toString(), provider)
    })

    return providerMap
  } catch (error) {
    console.error('Provider details lookup error:', error)
    return new Map()
  }
}

// OPTIMIZED SEARCH with parallel execution and fallback strategies
async function performOptimizedSearch(
  queryVector: number[],
  filters: SearchFilters,
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  const { db } = await getMongoClient()
  
  try {
    // Run provider and service searches in parallel with timeouts
    const [providerResults, serviceResults] = await Promise.allSettled([
      Promise.race([
        searchProviders(queryVector, db, filters, location, limit),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Provider search timeout')), 5000)
        )
      ]),
      Promise.race([
        searchServices(queryVector, db, filters, Math.ceil(limit * 1.5)),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Service search timeout')), 5000)
        )
      ])
    ])

    let providers: any[] = []
    let services: any[] = []

    // Handle provider results
    if (providerResults.status === 'fulfilled') {
      providers = providerResults.value || []
    } else {
      console.error('Provider search failed:', providerResults.reason)
    }

    // Handle service results and get associated provider details
    if (serviceResults.status === 'fulfilled') {
      const rawServices = serviceResults.value || []
      services = rawServices

      // Get unique provider IDs from services
      const serviceProviderIds = [...new Set(rawServices.map((s: any) => s.provider_id))]
      
      if (serviceProviderIds.length > 0) {
        // Get provider details for services in parallel
        const providerDetailsMap = await getProviderDetails(db, serviceProviderIds)
        
        // Attach provider details to services
        services = rawServices.map((service: any) => ({
          ...service,
          provider: providerDetailsMap.get(service.provider_id.toString()) || null
        }))

        // Add service providers to main provider list if not already present
        const existingProviderIds = new Set(providers.map(p => p._id.toString()))
        const additionalProviders = Array.from(providerDetailsMap.values())
          .filter(provider => !existingProviderIds.has(provider._id.toString()))
          .slice(0, Math.max(0, limit - providers.length))

        providers = [...providers, ...additionalProviders]
      }
    } else {
      console.error('Service search failed:', serviceResults.reason)
    }

    // Fallback if both searches failed or returned no results
    if (providers.length === 0 && services.length === 0) {
      console.log('Both searches failed, trying simple fallback')
      
      try {
        const fallbackProviders = await db.collection('providers').find(
          buildProviderFilters(filters),
          { 
            projection: {
              _id: 1, name: 1, category: 1, address: 1, phone: 1, website: 1, 
              email: 1, rating: 1, location: 1, state: 1, accepts_uninsured: 1,
              medicaid: 1, medicare: 1, ssn_required: 1, telehealth_available: 1,
              insurance_providers: 1
            },
            limit: limit 
          }
        ).toArray()

        providers = fallbackProviders.map(provider => ({
          ...provider,
          searchScore: 0.5,
          distance: location ? calculateDistance(
            location.latitude,
            location.longitude,
            provider.location?.coordinates?.[1] || 0,
            provider.location?.coordinates?.[0] || 0
          ) : undefined
        }))
      } catch (fallbackError) {
        console.error('Fallback search failed:', fallbackError)
      }
    }

    return {
      providers: providers.slice(0, limit),
      services: services.slice(0, limit * 2)
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