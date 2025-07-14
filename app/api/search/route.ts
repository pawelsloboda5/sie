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

// Vector search for providers
async function searchProviders(
  queryVector: number[], 
  filters: SearchFilters = {}, 
  location?: { latitude: number, longitude: number },
  limit: number = 10
) {
  const client = await getMongoClient()
  const db = client.db('sie-db')
  const collection = db.collection<Provider>('providers')

  try {
    // Build match conditions for filtering
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

    // Note: Location filtering with $geoWithin is not supported in Cosmos DB vector search filter
    // We'll handle distance filtering in JavaScript after getting results
    
    // Build cosmosSearch object safely
    const cosmosSearch = buildCosmosSearch(
      queryVector,
      "summary_vector",
      Math.min(limit * 2, 100),
      matchConditions,
      2 // nProbes = 2 is safe for providers (numLists = 2)
    )

    // Build the aggregation pipeline with $search FIRST
    const pipeline: any[] = [
      {
        $search: {
          cosmosSearch,
          returnStoredSource: true
        }
      },
      {
        $project: {
          score: { $meta: "searchScore" },
          doc: "$$ROOT"
        }
      },
      { $limit: limit }
    ]

    const results = await collection.aggregate(pipeline).toArray()
    
    // Calculate distances and apply location filtering in JavaScript if location is provided
    if (location) {
      let resultsWithDistance = results.map((result: any) => {
        // Check if location data exists
        if (!result.doc.location || !result.doc.location.coordinates) {
          return {
            ...result,
            distance: 999999 // Set very high distance for providers without location
          }
        }
        
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          result.doc.location.coordinates[1], // latitude
          result.doc.location.coordinates[0]  // longitude
        )
        return {
          ...result,
          distance: distance
        }
      })
      
      // Filter by maximum distance if specified
      if (filters.maxDistance) {
        resultsWithDistance = resultsWithDistance.filter((result: any) => 
          result.distance <= filters.maxDistance!
        )
      }
      
      // Sort by distance first, then by search score
      resultsWithDistance.sort((a: any, b: any) => {
        if (a.distance !== b.distance) {
          return a.distance - b.distance
        }
        return b.score - a.score
      })
      
      return resultsWithDistance
    }
    
    return results
  } finally {
    await client.close()
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

// Vector search for services
async function searchServices(
  queryVector: number[], 
  filters: SearchFilters = {}, 
  limit: number = 20
) {
  const client = await getMongoClient()
  const db = client.db('sie-db')
  const collection = db.collection<Service>('services')

  try {
    // Add service-specific filters
    const matchConditions: any = {}
    
    if (filters.freeOnly) {
      matchConditions.is_free = true
    }
    
    if (filters.serviceCategories && filters.serviceCategories.length > 0) {
      matchConditions.category = { $in: filters.serviceCategories }
    }

    // Minimal cosmosSearch object - no filters, no nProbes
    const cosmosSearch = {
      vector: queryVector,
      path: "service_vector",
      k: Math.min(limit * 2, 100)
    }

    const pipeline: any[] = [
      {
        $search: {
          cosmosSearch,
          returnStoredSource: true
        }
      },
      {
        $project: {
          score: { $meta: "searchScore" },
          doc: "$$ROOT"
        }
      },
      { $limit: limit }
    ]

    const results = await collection.aggregate(pipeline).toArray()
    return results
  } finally {
    await client.close()
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

    // Generate embedding for the search query
    const queryVector = await generateEmbedding(query)

    // Search both providers and services with error handling
    let providerResults: any[] = []
    let serviceResults: any[] = []
    
    try {
      providerResults = await searchProviders(queryVector, filters, location, limit)
    } catch (error) {
      console.error('Provider search failed:', error)
      // Continue with empty results
    }
    
    try {
      serviceResults = await searchServices(queryVector, filters, Math.ceil(limit / 2))
    } catch (error) {
      console.error('Service search failed:', error)
      serviceResults = []
    }

    // For services, we need to get the provider information
    const serviceProviderIds = serviceResults.map(result => result.doc.provider_id)
    let serviceProviders: any[] = []
    
    if (serviceProviderIds.length > 0) {
      const client = await getMongoClient()
      const db = client.db('sie-db')
      const providersCollection = db.collection('providers')
      
      try {
        serviceProviders = await providersCollection.find({
          _id: { $in: serviceProviderIds }
        }).toArray()
      } finally {
        await client.close()
      }
    }

    // Combine and format results
    const results = {
      providers: providerResults.map((result: any) => ({
        ...result.doc,
        searchScore: result.score,
        distance: result.distance || null
      })),
      services: serviceResults.map((result: any) => {
        const provider = serviceProviders.find(p => p._id.toString() === result.doc.provider_id)
        return {
          ...result.doc,
          searchScore: result.score,
          provider: provider
        }
      }),
      query,
      totalResults: providerResults.length + serviceResults.length
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 