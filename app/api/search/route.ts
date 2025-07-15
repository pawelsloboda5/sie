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

// Azure OpenAI embedding generation
async function generateEmbedding(text: string): Promise<number[]> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const model = process.env.AZURE_OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'

  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI credentials not configured')
  }

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
  })

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

// MongoDB connection
async function getMongoClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set')
  }
  
  const client = new MongoClient(uri)
  await client.connect()
  return client
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

// SERVICE-FIRST SEARCH: Use when service filters are active
async function serviceFirstSearch(
  queryVector: number[],
  filters: SearchFilters,
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  const client = await getMongoClient()
  const db = client.db('sie-db')
  
  try {
    console.log('Using service-first search strategy')
    
    // Step 1: Search services with vector search + service filters
    const serviceFilters = buildServiceFilters(filters)
    const servicesCollection = db.collection<Service>('services')
    
    const servicePipeline = [
      {
        $search: {
          cosmosSearch: buildCosmosSearch(
            queryVector,
            "service_vector", 
            100, // Get more services to find diverse providers
            serviceFilters,
            10 // Higher nProbes for services (they have more clusters)
          ),
          returnStoredSource: true
        }
      },
      {
        $group: {
          _id: "$provider_id",
          maxScore: { $max: { $meta: "searchScore" } },
          services: { $push: "$$ROOT" },
          totalServices: { $sum: 1 }
        }
      },
      {
        $sort: { maxScore: -1 }
      },
      {
        $limit: Math.min(limit * 3, 50) // Get more provider candidates
      }
    ]
    
    const serviceResults = await servicesCollection.aggregate(servicePipeline).toArray()
    console.log(`Found ${serviceResults.length} provider candidates from service search`)
    
    if (serviceResults.length === 0) {
      return { providers: [], services: [] }
    }
    
    // Step 2: Search providers with the found IDs + provider filters
    const providerIds = serviceResults.map(result => new ObjectId(result._id))
    const providerFilters = buildProviderFilters(filters)
    
    // Add provider ID filter to existing provider filters
    const combinedProviderFilters = {
      ...providerFilters,
      _id: { $in: providerIds }
    }
    
    const providersCollection = db.collection<Provider>('providers')
    const providerPipeline = [
      {
        $search: {
          cosmosSearch: buildCosmosSearch(
            queryVector,
            "summary_vector",
            Math.min(limit * 2, 100),
            combinedProviderFilters,
            2 // Lower nProbes for providers (fewer clusters)
          ),
          returnStoredSource: true
        }
      },
      {
        $project: {
          score: { $meta: "searchScore" },
          doc: "$$ROOT"
        }
      },
      {
        $limit: limit
      }
    ]
    
    const providerResults = await providersCollection.aggregate(providerPipeline).toArray()
    console.log(`Found ${providerResults.length} providers matching all filters`)
    
    // Step 3: Combine and rank results
    const combinedResults = providerResults.map((providerResult: any) => {
      const provider = providerResult.doc
      const serviceGroup = serviceResults.find(sg => sg._id.toString() === provider._id.toString())
      const services = serviceGroup ? serviceGroup.services : []
      
      // Calculate enhanced score prioritizing free services
      let enhancedScore = providerResult.score
      const freeServices = services.filter((s: any) => s.is_free)
      
      if (freeServices.length > 0) {
        enhancedScore *= (1 + freeServices.length * 0.3) // 30% boost per free service
      }
      
      return {
        ...providerResult,
        enhancedScore,
        services,
        freeServiceCount: freeServices.length
      }
    })
    
    // Sort by enhanced score (free services get priority)
    combinedResults.sort((a, b) => b.enhancedScore - a.enhancedScore)
    
    return {
      providers: combinedResults,
      services: serviceResults.flatMap(sg => sg.services)
    }
    
  } finally {
    await client.close()
  }
}

// PROVIDER-FIRST SEARCH: Use when only provider filters are active
async function providerFirstSearch(
  queryVector: number[],
  filters: SearchFilters,
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  const client = await getMongoClient()
  const db = client.db('sie-db')
  
  try {
    console.log('Using provider-first search strategy')
    
    // Step 1: Search providers with vector search + provider filters
    const providerFilters = buildProviderFilters(filters)
    const providersCollection = db.collection<Provider>('providers')
    
    const providerPipeline = [
      {
        $search: {
          cosmosSearch: buildCosmosSearch(
            queryVector,
            "summary_vector",
            Math.min(limit * 2, 100),
            providerFilters,
            2
          ),
          returnStoredSource: true
        }
      },
      {
        $project: {
          score: { $meta: "searchScore" },
          doc: "$$ROOT"
        }
      },
      {
        $limit: limit
      }
    ]
    
    const providerResults = await providersCollection.aggregate(providerPipeline).toArray()
    console.log(`Found ${providerResults.length} providers from provider search`)
    
    if (providerResults.length === 0) {
      return { providers: [], services: [] }
    }
    
    // Step 2: Get services for found providers
    const providerIds = providerResults.map((result: any) => result.doc._id)
    const servicesCollection = db.collection<Service>('services')
    
    const services = await servicesCollection.find({
      provider_id: { $in: providerIds }
    }).toArray()
    
    console.log(`Found ${services.length} services for providers`)
    
    return {
      providers: providerResults,
      services
    }
    
  } finally {
    await client.close()
  }
}

// MAIN SEARCH FUNCTION: Chooses strategy based on filters
async function performSearch(
  queryVector: number[],
  filters: SearchFilters,
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  // Choose search strategy based on filter types
  if (hasServiceFilters(filters)) {
    return await serviceFirstSearch(queryVector, filters, location, limit)
  } else {
    return await providerFirstSearch(queryVector, filters, location, limit)
  }
}

// Apply distance filtering and sorting
function applyLocationFiltering(
  results: any[],
  location: { latitude: number, longitude: number },
  maxDistance?: number
) {
  let resultsWithDistance = results.map((result: any) => {
    const provider = result.doc || result
    
    if (!provider.location || !provider.location.coordinates) {
      return {
        ...result,
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
      ...result,
      distance: distance
    }
  })
  
  // Filter by maximum distance if specified
  if (maxDistance) {
    resultsWithDistance = resultsWithDistance.filter((result: any) => 
      result.distance <= maxDistance
    )
  }
  
  // Sort by distance first, then by score
  resultsWithDistance.sort((a: any, b: any) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance
    }
    return (b.enhancedScore || b.score) - (a.enhancedScore || a.score)
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

    // Generate embedding for the search query
    const queryVector = await generateEmbedding(query)

    // Perform search using appropriate strategy
    const searchResults = await performSearch(queryVector, filters, location, limit)
    
    let { providers: providerResults, services: serviceResults } = searchResults
    
    console.log(`Search completed: ${providerResults.length} providers, ${serviceResults.length} services`)

    // Apply location filtering if location is provided
    if (location) {
      providerResults = applyLocationFiltering(providerResults, location, filters.maxDistance)
    }

    // Get provider information for services that don't have it
    let serviceProviders: any[] = []
    if (serviceResults.length > 0) {
      // If we used service-first search, we might already have provider info embedded
      const serviceProviderIds = [...new Set(serviceResults.map((result: any) => 
        result.provider_id || result.doc?.provider_id
      ))].filter(Boolean)
      
      if (serviceProviderIds.length > 0) {
        const client = await getMongoClient()
        const db = client.db('sie-db')
        const providersCollection = db.collection('providers')
        
        try {
          serviceProviders = await providersCollection.find({
            _id: { $in: serviceProviderIds.map(id => new ObjectId(id.toString())) }
          }).toArray()
        } finally {
          await client.close()
        }
      }
    }

    // Format results
    const results = {
      providers: providerResults.map((result: any) => ({
        ...result.doc || result,
        searchScore: result.enhancedScore || result.score,
        distance: result.distance || null,
        freeServiceCount: result.freeServiceCount || 0
      })),
      services: serviceResults.map((result: any) => {
        const service = result.doc || result
        const provider = serviceProviders.find(p => 
          p._id.toString() === (service.provider_id || result.provider_id)?.toString()
        )
        return {
          ...service,
          searchScore: result.score || 0,
          provider: provider
        }
      }),
      query,
      totalResults: providerResults.length + serviceResults.length,
      searchStrategy: hasServiceFilters(filters) ? 'service-first' : 'provider-first',
      filtersApplied: {
        provider: buildProviderFilters(filters),
        service: buildServiceFilters(filters)
      }
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
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 