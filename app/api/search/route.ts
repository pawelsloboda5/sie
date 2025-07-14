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
  const apiKey = process.env.AZURE_OPENAI_KEY
  const model = process.env.AZURE_OPENAI_MODEL || 'text-embedding-3-large'

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
  const db = client.db()
  const collection = db.collection<Provider>('providers')

  try {
    // Build the aggregation pipeline
    const pipeline: any[] = [
      {
        $search: {
          cosmosSearch: {
            vector: queryVector,
            path: "summary_vector",
            k: Math.min(limit * 2, 100), // Get more results for filtering
            nProbes: 2
          },
          returnStoredSource: true
        }
      }
    ]

    // Add filters
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

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions })
    }

    // Add location-based filtering if coordinates provided
    if (location && filters.maxDistance) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [location.longitude, location.latitude]
          },
          distanceField: "distance",
          maxDistance: filters.maxDistance * 1609.34, // Convert miles to meters
          spherical: true
        }
      })
    }

    // Project the results with search score
    pipeline.push({
      $project: {
        score: { $meta: "searchScore" },
        doc: "$$ROOT",
        distance: { $ifNull: ["$distance", null] }
      }
    })

    // Limit results
    pipeline.push({ $limit: limit })

    const results = await collection.aggregate(pipeline).toArray()
    return results
  } finally {
    await client.close()
  }
}

// Vector search for services
async function searchServices(
  queryVector: number[], 
  filters: SearchFilters = {}, 
  limit: number = 20
) {
  const client = await getMongoClient()
  const db = client.db()
  const collection = db.collection<Service>('services')

  try {
    const pipeline: any[] = [
      {
        $search: {
          cosmosSearch: {
            vector: queryVector,
            path: "service_vector",
            k: Math.min(limit * 2, 100),
            nProbes: 3
          },
          returnStoredSource: true
        }
      }
    ]

    // Add service-specific filters
    const matchConditions: any = {}
    
    if (filters.freeOnly) {
      matchConditions.is_free = true
    }
    
    if (filters.serviceCategories && filters.serviceCategories.length > 0) {
      matchConditions.category = { $in: filters.serviceCategories }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions })
    }

    pipeline.push({
      $project: {
        score: { $meta: "searchScore" },
        doc: "$$ROOT"
      }
    })

    pipeline.push({ $limit: limit })

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

    // Search both providers and services
    const [providerResults, serviceResults] = await Promise.all([
      searchProviders(queryVector, filters, location, limit),
      searchServices(queryVector, filters, Math.ceil(limit / 2))
    ])

    // For services, we need to get the provider information
    const serviceProviderIds = serviceResults.map(result => result.doc.provider_id)
    let serviceProviders: any[] = []
    
    if (serviceProviderIds.length > 0) {
      const client = await getMongoClient()
      const db = client.db()
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
      providers: providerResults.map(result => ({
        ...result.doc,
        searchScore: result.score,
        distance: result.distance
      })),
      services: serviceResults.map(result => {
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