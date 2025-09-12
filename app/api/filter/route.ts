import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

// Types based on our data schema
interface FilterRequest {
  filters: {
    freeOnly?: boolean
    acceptsUninsured?: boolean
    acceptsMedicaid?: boolean
    acceptsMedicare?: boolean
    ssnRequired?: boolean
    telehealthAvailable?: boolean
    insuranceProviders?: string[]
    serviceCategories?: string[]
    maxDistance?: number
  }
  location?: {
    latitude: number
    longitude: number
  }
  limit?: number
}

interface FilterConditions {
  [key: string]: boolean | string[] | { $in: string[] }
}

interface ServiceResult {
  _id: string
  provider_id: string
  name: string
  category: string
  description: string
  is_free: boolean
  is_discounted: boolean
  price_info: string
  searchScore?: number
}

interface ProviderResult {
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
  distance?: number
  searchScore?: number
  total_services?: number  // Add this line
  free_services?: number   // Add this line
}

// MongoDB connection - fresh connection each time
async function getMongoClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set')
  }
  
  // Fresh MongoDB client with optimized settings for Azure Cosmos DB
  const client = new MongoClient(uri, {
    maxPoolSize: 5, // Reduced pool size for better connection management
    serverSelectionTimeoutMS: 8000, // Further reduced timeout for filter operations
    socketTimeoutMS: 8000, // Further reduced timeout
    connectTimeoutMS: 8000, // Further reduced timeout
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true, // Automatically retry write operations
  })
  
  await client.connect()
  const db = client.db('sie-db')
  
  return { client, db }
}

// Helper function to calculate distance (client-side for better performance)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function extractLatLon(coords?: [number, number]): { lat: number; lon: number } | undefined {
  if (!Array.isArray(coords) || coords.length !== 2) return undefined
  const a = coords[0]
  const b = coords[1]
  // Standard GeoJSON [lon, lat]
  if (Math.abs(b) <= 90 && Math.abs(a) <= 180) return { lat: b, lon: a }
  // If accidentally stored as [lat, lon]
  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lon: b }
  return undefined
}

// Build provider filter conditions
function buildProviderFilters(filters: FilterRequest['filters']): FilterConditions {
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

// Build service filter conditions
function buildServiceFilters(filters: FilterRequest['filters']): FilterConditions {
  const matchConditions: FilterConditions = {}
  
  if (filters.freeOnly) {
    matchConditions.is_free = true
  }
  
  if (filters.serviceCategories && filters.serviceCategories.length > 0) {
    matchConditions.category = { $in: filters.serviceCategories }
  }

  return matchConditions
}

// OPTIMIZED: Filter providers with simplified query
async function filterProviders(
  db: ReturnType<MongoClient['db']>,
  filters: FilterRequest['filters'],
  location?: { latitude: number, longitude: number },
  limit: number = 20
) {
  const providerFilters = buildProviderFilters(filters)
  const providersCollection = db.collection('providers')
  
  try {
    // Use simpler find operation instead of complex aggregation
    const query = { ...providerFilters }
    
    // If location filtering is needed, we'll do it client-side for better performance
    const results = await providersCollection.find(query, {
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
        insurance_providers: 1,
        total_services: 1,
        free_services: 1
      }
    })
    .sort({ free_services: -1, rating: -1, name: 1 }) // Use indexed sort
    .limit(limit * 2) // Get more results for distance filtering
    .toArray()

    // Apply distance filtering client-side (much faster)
    let filteredResults = results.map((result) => ({
      ...result,
      _id: result._id.toString(),
      searchScore: (result.rating * 20) + (result.free_services * 100) + (result.total_services * 10),
      distance: location ? (() => {
        const ll = extractLatLon(result.location?.coordinates as [number, number] | undefined)
        return ll ? calculateDistance(location.latitude, location.longitude, ll.lat, ll.lon) : undefined
      })() : undefined
    }))

    // Filter by distance if specified
    // Strict: with a user location, require a calculable distance and enforce maxDistance
    if (location && typeof filters.maxDistance === 'number') {
      filteredResults = filteredResults.filter(provider => 
        typeof provider.distance === 'number' && provider.distance <= filters.maxDistance!
      )
    }

    // Return limited results
    return filteredResults.slice(0, limit)
    
  } catch (error) {
    console.error('Provider filter error:', error)
    return []
  }
}

// OPTIMIZED: Filter services with simplified query
async function filterServices(
  db: ReturnType<MongoClient['db']>,
  filters: FilterRequest['filters'],
  limit: number = 30
) {
  const serviceFilters = buildServiceFilters(filters)
  const servicesCollection = db.collection('services')
  
  try {
    // Use simpler find operation
    const query = { ...serviceFilters }
    
    const results = await servicesCollection.find(query, {
      projection: {
        _id: 1,
        provider_id: 1,
        name: 1,
        category: 1,
        description: 1,
        is_free: 1,
        is_discounted: 1,
        price_info: 1
      }
    })
    .sort({ is_free: -1, is_discounted: -1, name: 1 }) // Simple sort
    .limit(limit)
    .toArray()
    
    return results.map((result) => ({
      ...result,
      _id: result._id.toString(),
      provider_id: result.provider_id.toString(),
      searchScore: result.is_free ? 100 : (result.is_discounted ? 75 : 50)
    }))
  } catch (error) {
    console.error('Service filter error:', error)
    return []
  }
}

// Get provider details for services
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
        }
      }
    ).toArray()

    const providerMap = new Map()
    providers.forEach(provider => {
      providerMap.set(provider._id.toString(), {
        ...provider,
        _id: provider._id.toString()
      })
    })

    return providerMap
  } catch (error) {
    console.error('Provider details lookup error:', error)
    return new Map()
  }
}

// OPTIMIZED: Main filter function with timeouts
async function performFilterSearch(
  filters: FilterRequest['filters'],
  location?: { latitude: number, longitude: number },
  limit: number = 20
) {
  const { client, db } = await getMongoClient()
  
  try {
    // Run provider and service filters in parallel with shorter timeouts
    const [providerResults, serviceResults] = await Promise.allSettled([
      Promise.race([
        filterProviders(db, filters, location, limit),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Provider filter timeout')), 8000) // Reduced timeout
        )
      ]),
      Promise.race([
        filterServices(db, filters, Math.ceil(limit * 1.5)),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Service filter timeout')), 8000) // Reduced timeout
        )
      ])
    ])

    let providers: ProviderResult[] = []
    let services: (ServiceResult & { provider?: ProviderResult | null })[] = []
    let relevantServices: ServiceResult[] = [] // Keep track of filter-matched services

    // Handle provider results
    if (providerResults.status === 'fulfilled') {
      providers = (providerResults.value || []) as ProviderResult[]
    } else {
      console.error('Provider filter failed:', providerResults.reason)
    }

    // Handle service results and get associated provider details
    if (serviceResults.status === 'fulfilled') {
      const rawServices = (serviceResults.value || []) as ServiceResult[]
      relevantServices = rawServices // Store for featured service logic
      services = rawServices

      // Get unique provider IDs from services
      const serviceProviderIds = [...new Set(rawServices.map((s: ServiceResult) => s.provider_id))] as string[]
      
      if (serviceProviderIds.length > 0) {
        // Get provider details for services
        const providerDetailsMap = await getProviderDetails(db, serviceProviderIds)
        
        // Attach provider details to services
        services = rawServices.map((service: ServiceResult) => ({
          ...service,
          provider: providerDetailsMap.get(service.provider_id) || null
        })) as (ServiceResult & { provider?: ProviderResult | null })[]

        // Add service providers to main provider list if not already present
        const existingProviderIds = new Set(providers.map(p => p._id.toString()))
        let additionalProviders = Array.from(providerDetailsMap.values())
          .filter(provider => !existingProviderIds.has(provider._id.toString())) as ProviderResult[]

        // Compute distance for additional providers and apply strict distance filter
        if (location && typeof filters.maxDistance === 'number') {
          additionalProviders = additionalProviders.map((p) => {
            const lat = p.location?.coordinates?.[1]
            const lon = p.location?.coordinates?.[0]
            if (typeof lat === 'number' && typeof lon === 'number') {
              return {
                ...p,
                distance: calculateDistance(location.latitude, location.longitude, lat, lon)
              } as ProviderResult
            }
            return p as ProviderResult
          }).filter(p => typeof p.distance === 'number' && p.distance <= filters.maxDistance!)
        }

        // Respect limit after merging
        providers = [...providers, ...additionalProviders].slice(0, limit) as ProviderResult[]
      }
    } else {
      console.error('Service filter failed:', serviceResults.reason)
    }

    // CRITICAL FIX: Always fetch ALL services for ALL providers in the final results
    if (providers.length > 0) {
      console.log(`Fetching ALL services for ${providers.length} providers`)
      
      try {
        const allProviderServices = await db.collection('services').find(
          { 
            provider_id: { 
              $in: providers.map(p => new ObjectId(p._id)) 
            } 
          },
          {
            projection: {
              _id: 1,
              provider_id: 1,
              name: 1,
              category: 1,
              description: 1,
              is_free: 1,
              is_discounted: 1,
              price_info: 1
            }
          }
        ).toArray()

        // Convert all services to the proper format
        services = allProviderServices.map(service => ({
          _id: service._id.toString(),
          provider_id: service.provider_id.toString(),
          name: service.name,
          category: service.category,
          description: service.description,
          is_free: service.is_free,
          is_discounted: service.is_discounted,
          price_info: service.price_info,
          // For services that matched the filter search, use their search score
          // For other services, use a base score
          searchScore: relevantServices.find(rs => rs._id === service._id.toString())?.searchScore || 0.1
        }))

        console.log(`Fetched ${services.length} total services for all providers`)

        // CRITICAL: If freeOnly filter is enabled, remove providers that have NO free services
        if (filters.freeOnly) {
          const providersWithFreeServices = new Set<string>()
          services.forEach(service => {
            if (service.is_free) {
              providersWithFreeServices.add(service.provider_id)
            }
          })
          
          // Filter out providers that have no free services
          const originalProviderCount = providers.length
          providers = providers.filter(provider => 
            providersWithFreeServices.has(provider._id.toString())
          )
          
          // Also filter services to only include those from remaining providers
          const remainingProviderIds = new Set(providers.map(p => p._id.toString()))
          services = services.filter(service => 
            remainingProviderIds.has(service.provider_id)
          )
          
          console.log(`FreeOnly filter: Removed ${originalProviderCount - providers.length} providers with no free services`)
          console.log(`Final results: ${providers.length} providers, ${services.filter(s => s.is_free).length} free services`)
        }
      } catch (error) {
        console.error('Error fetching all services for providers:', error)
        // Fallback to empty services array
        services = []
      }
    }

    // ENHANCED SCORING: Favor providers with more services and amazing bonuses for free services
    if (providers.length > 0 && services.length > 0) {
      providers = providers.map(provider => {
        const providerServices = services.filter(s => s.provider_id.toString() === provider._id.toString())
        const freeServices = providerServices.filter(s => s.is_free)
        const totalServiceCount = providerServices.length
        
        let enhancedScore = provider.searchScore || 0
        
        // Use indexed fields for faster calculations
        const providerFreeServices = provider.free_services || 0
        const providerTotalServices = provider.total_services || 0
        
        // AMAZING BONUS for free services (using indexed field)
        if (providerFreeServices > 0) {
          enhancedScore *= (1 + providerFreeServices * 5) // 500% boost per free service!
          enhancedScore += providerFreeServices * 100 // Additional flat bonus
        }
        
        // MAJOR BONUS for total service count (using indexed field)
        if (providerTotalServices > 0) {
          enhancedScore *= (1 + Math.log(providerTotalServices + 1) * 0.5) // Logarithmic scaling for service count
          enhancedScore += providerTotalServices * 10 // Flat bonus per service
        }
        
        // SUPER BONUS for providers that are primarily free service focused
        const freeServiceRatio = totalServiceCount > 0 ? freeServices.length / totalServiceCount : 0
        if (freeServiceRatio > 0.5) { // More than 50% free services
          enhancedScore *= 3 // Triple the score!
        } else if (freeServiceRatio > 0.25) { // More than 25% free services
          enhancedScore *= 2 // Double the score!
        }
        
        // RELEVANCE BONUS: Boost based on average service search scores for filter-matched services
        const relevantProviderServices = providerServices.filter(s => (s.searchScore || 0) > 0.1)
        if (relevantProviderServices.length > 0) {
          const avgServiceScore = relevantProviderServices.reduce((sum, s) => sum + (s.searchScore || 0), 0) / relevantProviderServices.length
          enhancedScore += avgServiceScore * 20 // Amplify service relevance
        }
        
        return {
          ...provider,
          searchScore: enhancedScore
        }
      })
      
      // Sort providers by enhanced score (highest first)
      providers.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))
      
      const topProvider = providers[0]
      if (topProvider) {
        const topProviderServices = services.filter(s => s.provider_id.toString() === topProvider._id.toString())
        const topFreeServices = topProviderServices.filter(s => s.is_free)
        console.log(`Enhanced scoring completed. Top provider: ${topProvider.name} (Score: ${topProvider.searchScore}, Free: ${topFreeServices.length}, Total: ${topProviderServices.length})`)
      }
    }

    // Final strict distance enforcement in case any providers lack distance
    if (location && typeof filters.maxDistance === 'number') {
      providers = providers.map((p) => {
        if (typeof p.distance === 'number') return p
        const lat = p.location?.coordinates?.[1]
        const lon = p.location?.coordinates?.[0]
        if (typeof lat === 'number' && typeof lon === 'number') {
          return {
            ...p,
            distance: calculateDistance(location.latitude, location.longitude, lat, lon)
          } as ProviderResult
        }
        return p as ProviderResult
      }).filter(p => typeof p.distance === 'number' && p.distance <= filters.maxDistance!)
    }

    return {
      providers: providers.slice(0, limit),
      services: services // Return ALL services, don't limit them
    }
    
  } catch (error) {
    console.error('Database filter error:', error)
    throw error
  } finally {
    // Always close the connection
    try {
      await client.close()
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FilterRequest = await request.json()
    const { filters, location, limit = 20 } = body

    if (!filters || Object.keys(filters).length === 0) {
      return NextResponse.json(
        { error: 'At least one filter is required' },
        { status: 400 }
      )
    }

    console.log('Filtering with criteria:', filters)

    // If this is a provider-only filter request (no service-level constraints),
    // skip service queries entirely for speed and reliability on Cosmos/vCore
    const providerOnly = !filters?.freeOnly && !(filters?.serviceCategories && filters.serviceCategories.length > 0)

    if (providerOnly) {
      const { client, db } = await getMongoClient()
      try {
        const rawProviders = await filterProviders(db, filters, location, Math.min(limit, 6))
        const providers = rawProviders.slice(0, 6)

        // Fetch services for these providers to provide context to the AI
        const providerIds = providers.map((p) => new ObjectId(p._id))
        const svcDocs = providerIds.length
          ? await db.collection('services').find(
              { provider_id: { $in: providerIds } },
              {
                projection: {
                  _id: 1,
                  provider_id: 1,
                  name: 1,
                  category: 1,
                  description: 1,
                  is_free: 1,
                  is_discounted: 1,
                  price_info: 1
                }
              }
            ).toArray()
          : []

        const byProvider: Record<string, { _id: string; name: string; category: string; description: string; isFree: boolean; isDiscounted: boolean; priceInfoText: string }[]> = {}
        for (const s of svcDocs) {
          const pid = s.provider_id?.toString?.() || String(s.provider_id)
          const svc = {
            _id: s._id.toString(),
            name: s.name,
            category: s.category,
            description: s.description,
            isFree: !!s.is_free,
            isDiscounted: !!s.is_discounted,
            priceInfoText: s.price_info || ''
          }
          if (!byProvider[pid]) byProvider[pid] = []
          byProvider[pid].push(svc)
        }

        const enriched = providers.map((p) => ({
          ...p,
          distance: p.distance || null,
          services: byProvider[p._id] || []
        }))

        const servicesPayload = svcDocs.map((s) => ({
            _id: s._id.toString(),
            provider_id: s.provider_id.toString(),
            name: s.name,
            category: s.category,
            description: s.description,
            is_free: s.is_free,
            is_discounted: s.is_discounted,
            price_info: s.price_info
          }))

        return NextResponse.json({
          providers: enriched,
          services: servicesPayload,
          query: 'Filtered Results',
          totalResults: enriched.length,
          provider_count: enriched.length,
          service_count: servicesPayload.length,
          isFiltered: true
        })
      } finally {
        try { await client.close() } catch {}
      }
    }

    // Perform optimized filter+services search when service-level constraints are present
    const searchResults = await performFilterSearch(filters, location, limit)
    
    const { providers } = searchResults
    const { services } = searchResults
    
    console.log(`Filter completed: ${providers.length} providers, ${services.length} services`)
    
    // Log free service statistics
    const totalFreeServices = services.filter(s => s.is_free).length
    const providersWithFreeServices = providers.filter(p => 
      services.some(s => s.provider_id.toString() === p._id.toString() && s.is_free)
    ).length
    console.log(`Free services found: ${totalFreeServices}, Providers with free services: ${providersWithFreeServices}`)
    
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
      query: 'Filtered Results',
      totalResults: providers.length + services.length,
      isFiltered: true
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Filter API error:', error)
    return NextResponse.json(
      { error: 'Filter temporarily unavailable. Please try again.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 