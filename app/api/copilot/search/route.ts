import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Db, ObjectId, type Document } from 'mongodb'
import { generateEmbedding } from '@/lib/server/embedding'
import type { Provider as ProviderType, Service as ServiceType, ServicePrice as ServicePriceType } from '@/lib/types/copilot'

// Tuneable caps
const CANDIDATE_LIMIT = Number(process.env.COPILOT_SEARCH_CANDIDATES || 400)
// Default to server-side vector search unless explicitly disabled
const ENABLE_SERVER_VECTOR = process.env.COPILOT_SERVER_VECTOR
  ? process.env.COPILOT_SERVER_VECTOR === 'true'
  : true
const VECTOR_PATH = process.env.COPILOT_VECTOR_PATH || 'embedding'
const SERVICE_COLLECTION = process.env.COPILOT_SERVICE_COLLECTION || 'prices-only-services'
const SERVICE_VECTOR_FIELD = process.env.COPILOT_SERVICE_VECTOR_FIELD || 'embedding'
const VECTOR_K = Number(process.env.COPILOT_VECTOR_K || 120)
const SERVICE_VECTOR_K = Number(process.env.COPILOT_SERVICE_VECTOR_K || 120)
const VECTOR_N_PROBES = process.env.COPILOT_VECTOR_NPROBES
  ? Number(process.env.COPILOT_VECTOR_NPROBES)
  : 2

// MongoDB connection (using same pattern as main search)
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

type Service = ServiceType
type ServicePrice = ServicePriceType
type Provider = ProviderType

// DB-specific shapes (superset of response shapes)
type ServiceWithEmbedding = Service & { embedding?: number[] }
type ProviderDbDoc = Omit<Provider, '_id'> & {
  _id: ObjectId | string
  embedding?: number[]
  distanceMeters?: number
  services?: ServiceWithEmbedding[]
}

type ServiceSearchDoc = {
  _id?: string | ObjectId
  name?: string
  category?: string
  isFree?: boolean
  price?: ServicePrice
  priceInfoText?: string
  embedding?: number[]
  providerId?: string | ObjectId
  provider_id?: string | ObjectId
  provider?: string | ObjectId
  providerID?: string | ObjectId
  provider_id_str?: string
}

type MergedEntry = {
  _id: string
  name?: string
  category?: string
  phone?: string
  website?: string
  email?: string
  bookingUrl?: string
  rating?: number
  totalReviews?: number
  addressLine?: string
  city?: string
  state?: string
  postalCode?: string
  location?: { type: string; coordinates: [number, number] }
  services?: Service[]
  insurance?: Provider['insurance']
  telehealth?: Provider['telehealth']
  distance?: number
  cheapestService?: Service
  priceRange?: { min: number; max: number }
  __sim?: number
  __score?: number
  __bestService?: Partial<Service>
}

// Helper to calculate distance using Haversine formula
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

// Extract price range from services
function extractPriceRange(services: Service[]): { min: number | null, max: number | null } {
  let minPrice: number | null = null
  let maxPrice: number | null = null
  
  for (const service of services) {
    if (service.isFree) {
      minPrice = 0
    }
    
    if (service.price) {
      if (typeof service.price.min === 'number') {
        if (minPrice === null || service.price.min < minPrice) {
          minPrice = service.price.min
        }
      }
      if (typeof service.price.flat === 'number') {
        if (minPrice === null || service.price.flat < minPrice) {
          minPrice = service.price.flat
        }
        if (maxPrice === null || service.price.flat > maxPrice) {
          maxPrice = service.price.flat
        }
      }
      if (typeof service.price.max === 'number') {
        if (maxPrice === null || service.price.max > maxPrice) {
          maxPrice = service.price.max
        }
      }
    }
  }
  
  return { min: minPrice, max: maxPrice }
}

// Find cheapest service for a provider
function findCheapestService(services: Service[]): Service | null {
  let cheapest: Service | null = null
  let lowestPrice = Number.POSITIVE_INFINITY
  
  for (const service of services) {
    if (service.isFree) {
      return service // Free is always cheapest
    }
    
    if (service.price) {
      let price: number | null = null
      
      if (typeof service.price.flat === 'number') {
        price = service.price.flat
      } else if (typeof service.price.min === 'number') {
        price = service.price.min
      }
      
      if (price !== null && price < lowestPrice) {
        lowestPrice = price
        cheapest = service
      }
    }
  }
  
  return cheapest
}

// Cosine similarity for vector reranking
function cosine(a: number[] | undefined, b: number[] | undefined): number {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) return -1
  const len = Math.min(a.length, b.length)
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < len; i++) {
    const av = a[i] as number
    const bv = b[i] as number
    dot += av * bv
    na += av * av
    nb += bv * bv
  }
  if (na === 0 || nb === 0) return -1
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

// Match services based on query terms
function matchesServiceQuery(provider: Provider, queryTerms: string[]): boolean {
  const lowerTerms = queryTerms.map(t => t.toLowerCase())
  
  // Check category - be more lenient with dental matching
  const categoryLower = provider.category.toLowerCase()
  
  // Special handling for dental queries
  if (lowerTerms.some(term => ['dental', 'dentist', 'teeth', 'tooth'].includes(term))) {
    if (categoryLower.includes('dent') || categoryLower.includes('oral')) {
      return true
    }
  }
  
  // General category matching
  if (lowerTerms.some(term => categoryLower.includes(term))) {
    return true
  }
  
  // Check services - be more strict about dental matching
  for (const service of provider.services) {
    const serviceLower = `${service.name} ${service.description || ''}`.toLowerCase()
    
    // For dental queries, require actual dental services
    if (lowerTerms.some(term => ['dental', 'dentist', 'teeth', 'tooth'].includes(term))) {
      // Only match if service actually contains dental-related terms
      if (/dent|teeth|tooth|oral|dental|gum|cavity|filling|crown|cleaning/i.test(serviceLower)) {
        return true
      }
    } else {
      // For non-dental queries, use general matching
      if (lowerTerms.some(term => serviceLower.includes(term))) {
        return true
      }
    }
  }
  
  return false
}

// Map common service terms to categories/keywords
function expandServiceTerms(terms: string[]): string[] {
  const expansions: Record<string, string[]> = {
    'mammogram': ['mammography', 'breast', 'screening', 'women'],
    'dental': ['dentist', 'teeth', 'oral', 'tooth'],
    'mental health': ['psychotherapy', 'counseling', 'therapy', 'psychiatrist', 'psychologist'],
    'sti': ['std', 'sexual health', 'hiv', 'testing'],
    'std': ['sti', 'sexual health', 'hiv', 'testing'],
    'primary care': ['family medicine', 'general practice', 'internal medicine', 'pcp'],
    'urgent care': ['walk-in', 'immediate care', 'emergency'],
    'vision': ['optometry', 'eye', 'glasses', 'contacts', 'optometrist'],
    'pharmacy': ['drug store', 'medication', 'prescription']
  }
  
  const expanded = new Set(terms)
  for (const term of terms) {
    const lowerTerm = term.toLowerCase()
    if (expansions[lowerTerm]) {
      expansions[lowerTerm].forEach(e => expanded.add(e))
    }
  }
  
  return Array.from(expanded)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      query = '', 
      location,
      filters = {},
      limit = 6
    } = body
    
    console.log('Copilot search request:', { query, filters, location })
    
    // Parse query into service terms
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean)
    const expandedTerms = expandServiceTerms(queryTerms)
    
    const db = await getDatabase()
    const collection = db.collection('prices-only')
    
    // Check if collection exists
    const collections = await db.listCollections().toArray()
    const collectionExists = collections.some(c => c.name === 'prices-only')
    if (!collectionExists) {
      console.error('Collection "prices-only" not found in database. Available collections:', collections.map(c => c.name))
      return NextResponse.json({
        error: 'Database collection not found',
        providers: [],
        provider_count: 0,
        service_count: 0,
        debug: {
          message: 'The prices-only collection does not exist in the database',
          availableCollections: collections.map(c => c.name)
        }
      }, { status: 500 })
    }
    
    // Build MongoDB query and aggregation pipeline (geo + text + filters)
    const mongoQuery: Record<string, unknown> = {}
    const aggregatePipeline: Document[] = []
    
    // Apply filters
    if (filters.acceptsMedicaid) {
      mongoQuery['insurance.medicaid'] = true
    }
    if (filters.acceptsMedicare) {
      mongoQuery['insurance.medicare'] = true
    }
    if (filters.acceptsUninsured || filters.selfPayOptions) {
      mongoQuery['insurance.selfPayOptions'] = true
    }
    if (filters.telehealthAvailable) {
      mongoQuery['telehealth.available'] = true
    }
    // Only apply strict free filter if explicitly requested with the word "free"
    // Don't filter out paid services for "low-cost" or "affordable" queries
    if (filters.freeOnly === true && query.toLowerCase().includes('free')) {
      mongoQuery['services.isFree'] = true
    }
    
    // Optional text stage (DISABLED on Cosmos by default). Enable only if your cluster supports $text in aggregation.
    const ENABLE_TEXT_MATCH = process.env.MONGO_TEXT_SEARCH_ENABLED === 'true'
    const textSearch = ENABLE_TEXT_MATCH && expandedTerms.length ? { $text: { $search: expandedTerms.join(' ') } } : null

    // Server-side vector search when enabled; otherwise geo/text pipeline
    const usedServerVector = false
    let queryEmbedding: number[] | null = null
    if (ENABLE_SERVER_VECTOR) {
      // Compute embedding for the effective query text
      const queryTextForEmbedding = (expandedTerms.length ? expandedTerms.join(' ') : query) || query
      queryEmbedding = await generateEmbedding(queryTextForEmbedding)

      // Provider-level vector pipeline (prices-only)
      const provSearchStage: Document = {
        $search: {
          cosmosSearch: {
            vector: queryEmbedding,
            path: VECTOR_PATH,
            k: VECTOR_K,
            ...(typeof VECTOR_N_PROBES === 'number' ? { nProbes: VECTOR_N_PROBES } : {})
          },
          returnStoredSource: true
        }
      }
      const provPipeline: Document[] = [provSearchStage, { $match: { ...mongoQuery } }, { $limit: CANDIDATE_LIMIT }]

      // Service-level vector pipeline (prices-only-services)
      const svcSearchStage: Document = {
        $search: {
          cosmosSearch: {
            vector: queryEmbedding,
            path: SERVICE_VECTOR_FIELD,
            k: SERVICE_VECTOR_K,
            ...(typeof VECTOR_N_PROBES === 'number' ? { nProbes: VECTOR_N_PROBES } : {})
          },
          returnStoredSource: true
        }
      }
      const svcPipeline: Document[] = [svcSearchStage, { $match: { ...mongoQuery } }, { $limit: CANDIDATE_LIMIT }]

      // Execute both searches
      const svcCollection = db.collection(SERVICE_COLLECTION)
      const [provDocs, svcDocs]: [ProviderDbDoc[], ServiceSearchDoc[]] = await Promise.all([
        collection.aggregate(provPipeline).toArray() as Promise<ProviderDbDoc[]>,
        svcCollection.aggregate(svcPipeline).toArray() as Promise<ServiceSearchDoc[]>
      ])
      console.log(`Server vector results: providers=${provDocs.length}, services=${svcDocs.length}`)

      // Merge and post-process
      const mergedMap = new Map<string, MergedEntry>()

      function ensureBase(id: string): MergedEntry {
        const base: MergedEntry = mergedMap.get(id) || {
          _id: id,
          name: undefined,
          category: undefined,
          phone: undefined,
          website: undefined,
          email: undefined,
          bookingUrl: undefined,
          rating: undefined,
          totalReviews: undefined,
          addressLine: undefined,
          city: undefined,
          state: undefined,
          postalCode: undefined,
          location: undefined as unknown as MergedEntry['location'],
          services: undefined,
          insurance: undefined,
          telehealth: undefined,
          distance: undefined,
          __sim: -1,
          __bestService: undefined
        }
        mergedMap.set(id, base)
        return base
      }

      function processProviderDoc(doc: ProviderDbDoc) {
        const id = String(doc._id as string)
        const base = ensureBase(id)
        base.name = doc.name
        base.category = doc.category
        base.phone = doc.phone
        base.website = doc.website
        base.email = doc.email
        base.bookingUrl = doc.bookingUrl
        base.rating = doc.rating
        base.totalReviews = doc.totalReviews
        base.addressLine = doc.addressLine
        base.city = doc.city
        base.state = doc.state
        base.postalCode = doc.postalCode
        base.location = doc.location
        base.services = (doc.services as Service[] | undefined) || []
        base.insurance = doc.insurance
        base.telehealth = doc.telehealth

        if (location && base.location?.coordinates) {
          const [lon, lat] = base.location.coordinates
          base.distance = calculateDistance(location.latitude, location.longitude, lat, lon)
        }
        const cheapest = findCheapestService(base.services || [])
        if (cheapest) base.cheapestService = cheapest
        const priceRange = extractPriceRange(base.services || [])
        if (priceRange.min !== null || priceRange.max !== null) {
          base.priceRange = { min: priceRange.min ?? 0, max: priceRange.max ?? Number.POSITIVE_INFINITY }
        }

        const simProv = Array.isArray(doc.embedding) && queryEmbedding ? cosine(queryEmbedding, doc.embedding) : -1
        base.__sim = Math.max(base.__sim ?? -1, simProv)
      }

      function processServiceDoc(sdoc: ServiceSearchDoc) {
        const pidRaw = sdoc.providerId || sdoc.provider_id || sdoc.provider || sdoc.providerID || sdoc.provider_id_str
        if (!pidRaw) return
        const pid = String(pidRaw)
        const base = ensureBase(pid)
        const sSim = Array.isArray(sdoc.embedding) && queryEmbedding ? cosine(queryEmbedding, sdoc.embedding) : -1
        if (sSim > (base.__sim ?? -1)) base.__sim = sSim
        base.__bestService = {
          name: sdoc.name,
          category: sdoc.category,
          isFree: !!sdoc.isFree,
          price: sdoc.price ?? undefined,
          priceInfoText: sdoc.priceInfoText ?? undefined
        }
      }

      provDocs.forEach(processProviderDoc)
      svcDocs.forEach(processServiceDoc)

      // Fetch missing provider docs to enrich entries seeded by service results
      const missingIds = Array.from(mergedMap.values())
        .filter((b) => !b.name)
        .map((b) => b._id)
      if (missingIds.length) {
        const objectIds: ObjectId[] = missingIds
          .filter((id: string) => typeof id === 'string' && id.length === 24)
          .map((id: string) => new ObjectId(id))
        const enrichDocs = objectIds.length
          ? await collection.find({ _id: { $in: objectIds } }).toArray() as unknown as ProviderDbDoc[]
          : []
        for (const doc of enrichDocs) {
          processProviderDoc(doc)
        }
      }

      // Build processedProviders from merged map
      type ReadyMerged = MergedEntry & { name: string; category: string; services: Service[] }
      let processedProviders: ReadyMerged[] = Array.from(mergedMap.values()).filter((e): e is ReadyMerged => typeof e.name === 'string' && typeof e.category === 'string' && Array.isArray(e.services))

      // Apply distance filter
      if (filters.maxDistance && location) {
        processedProviders = processedProviders.filter(p => p.distance !== undefined && (p.distance as number) <= filters.maxDistance)
      }

      // Rank by similarity blended with affordability and distance
      type Ranked = ReadyMerged & { __sim?: number; __score?: number }
      const ranked: Ranked[] = processedProviders.map((p) => ({ ...p, __score: finalScore(p, typeof p.__sim === 'number' ? (p.__sim as number) : -1) }))
      ranked.sort((a, b) => (b.__score ?? -Infinity) - (a.__score ?? -Infinity))

      // Limit and sanitize
      const limited = ranked.slice(0, limit)
      const sanitizedProviders = limited.map((p: Ranked) => {
        const { __sim: _sim, __score: _score, ...rest } = p
        void _sim; void _score
        const cleanedServices: Service[] | undefined = Array.isArray(rest.services)
          ? (rest.services as (ServiceWithEmbedding | Service)[]).map((s) => {
              const { embedding: _embedding, ...svc } = s as ServiceWithEmbedding
              void _embedding
              return svc as Service
            })
          : undefined
        return { ...rest, services: cleanedServices }
      })

      console.log(`Search results (server vector merged): returned=${sanitizedProviders.length}`)

      return NextResponse.json({
        providers: sanitizedProviders,
        provider_count: sanitizedProviders.length,
        service_count: sanitizedProviders.reduce((sum: number, p: { services?: Service[] }) => sum + (p.services?.length || 0), 0),
        total_available: ranked.length,
        search_params: { query, expanded_terms: expandedTerms, location, filters }
      })
    } else {
      // Geo-first stage if coordinates provided
      if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        const lat = Number(location.latitude)
        const lon = Number(location.longitude)
        // IMPORTANT: $geoNear must be the first stage. Do NOT combine with $text on Cosmos (unsupported).
        aggregatePipeline.push({
          $geoNear: {
            near: { type: 'Point', coordinates: [lon, lat] },
            distanceField: 'distanceMeters',
            spherical: true,
            key: 'location'
          }
        })
        aggregatePipeline.push({ $match: { ...mongoQuery } })
        console.log('Search pipeline mode:', { mode: 'geoNear+filters', textEnabled: false })
      } else {
        // Filters-only; optionally include $text if explicitly enabled (not recommended on Cosmos)
        aggregatePipeline.push({ $match: { ...mongoQuery, ...(textSearch ? textSearch : {}) } })
        console.log('Search pipeline mode:', { mode: textSearch ? 'text+filters (distance post)' : 'filters-only', textEnabled: !!textSearch })
      }
    }
    
    // Exclude provenance/noisy fields and cap candidates
    aggregatePipeline.push({ $project: { source: 0 } } as Document)
    aggregatePipeline.push({ $limit: CANDIDATE_LIMIT } as Document)
    
    // Execute query
    const providers = await collection.aggregate(aggregatePipeline).toArray() as unknown as ProviderDbDoc[]
    console.log(`Found ${providers.length} providers from database before filtering (${usedServerVector ? 'server-vector' : 'geo/text'} pipeline)`)    
    
    // Post-process: filter by service match, calculate distances, find cheapest services
    let processedProviders: Provider[] = []
    
    let skippedCount = 0
    for (const doc of providers) {
      // Skip if doesn't match service query
      if (expandedTerms.length > 0 && !matchesServiceQuery(doc as Provider, expandedTerms)) {
        skippedCount++
        continue
      }
      
      const provider: Provider = {
        _id: doc._id.toString(),
        name: doc.name,
        category: doc.category,
        phone: doc.phone,
        website: doc.website,
        email: doc.email,
        bookingUrl: doc.bookingUrl,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        addressLine: doc.addressLine,
        city: doc.city,
        state: doc.state,
        postalCode: doc.postalCode,
        location: doc.location,
        services: doc.services || [],
        insurance: doc.insurance,
        telehealth: doc.telehealth
      }
      
      // Distance from $geoNear (meters) or compute if needed
      if (typeof doc?.distanceMeters === 'number') {
        provider.distance = doc.distanceMeters / 1609.344
      } else if (location && provider.location?.coordinates) {
        const [lon, lat] = provider.location.coordinates
        provider.distance = calculateDistance(location.latitude, location.longitude, lat, lon)
      }
      
      // Find cheapest service and price range
      const cheapest = findCheapestService(provider.services)
      if (cheapest) {
        provider.cheapestService = cheapest
      }
      const priceRange = extractPriceRange(provider.services)
      if (priceRange.min !== null || priceRange.max !== null) {
        provider.priceRange = {
          min: priceRange.min ?? 0,
          max: priceRange.max ?? Number.POSITIVE_INFINITY
        }
      }
      
      processedProviders.push(provider)
    }
    
    // Apply distance filter if specified
    if (filters.maxDistance && location) {
      processedProviders = processedProviders.filter(
        p => p.distance !== undefined && p.distance <= filters.maxDistance
      )
    }
    
    // VECTOR RERANK: only if server-side vector not used
    if (!usedServerVector) {
      try {
        const embedText = (expandedTerms.length ? expandedTerms.join(' ') : query) || query
        queryEmbedding = await generateEmbedding(embedText)
      } catch (e) {
        console.error('Failed to generate query embedding:', e)
        queryEmbedding = null
      }
    }

    function finalScore(p: { services?: Service[]; distance?: number; rating?: number }, sim: number): number {
      const hasFree = p.services?.some(s => s.isFree) ? 1 : 0
      const cheapestVals = (p.services || [])
        .map(s => (typeof s.price?.flat === 'number' ? s.price!.flat : s.price?.min))
        .filter((v): v is number => typeof v === 'number')
      const cheapest = cheapestVals.length ? Math.min(...cheapestVals) : undefined
      const priceBoost = hasFree ? 0.2 : (cheapest ? Math.min(0.15, 50 / (50 + cheapest)) : 0)
      const distBoost = typeof p.distance === 'number' ? Math.max(0, 0.15 - (p.distance / 50) * 0.15) : 0
      const ratingBoost = ((p.rating || 0) / 5) * 0.1
      return 0.6 * sim + priceBoost + distBoost + ratingBoost
    }

    type Ranked = Provider & { __sim?: number; __score?: number }
    const rawById = new Map<string, ProviderDbDoc>(providers.map((d) => [String(d._id as string), d]))
    let reranked: Ranked[] = processedProviders as Ranked[]
    if (queryEmbedding) {
      reranked = processedProviders.map((p) => {
        // Access embeddings if present on raw doc references
        const raw = rawById.get(String(p._id))
        const providerEmb: number[] | undefined = Array.isArray(raw?.embedding) ? raw!.embedding : undefined
        // Best service similarity
        let serviceMax = -1
        const svcs: (ServiceWithEmbedding | Service)[] = Array.isArray(raw?.services)
          ? (raw!.services as (ServiceWithEmbedding | Service)[])
          : (Array.isArray(p.services) ? (p.services as (ServiceWithEmbedding | Service)[]) : [])
        // Prioritize a bounded set of services (free or priced first) to limit compute
        const prioritized: (ServiceWithEmbedding | Service)[] = [
          ...svcs.filter((s) => !!(s as Service).isFree),
          ...svcs.filter((s) => !(s as Service).isFree && !!(s as Service).price)
        ]
        const candidateSvcs = (prioritized.length ? prioritized : svcs).slice(0, 16)
        for (const s of candidateSvcs) {
          const sEmb: number[] | undefined = Array.isArray((s as ServiceWithEmbedding)?.embedding)
            ? (s as ServiceWithEmbedding).embedding
            : undefined
          const sim = cosine(queryEmbedding!, sEmb)
          if (sim > serviceMax) serviceMax = sim
        }
        const simProvider = cosine(queryEmbedding!, providerEmb)
        const sim = Math.max(simProvider, serviceMax)
        const score = finalScore(p, isFinite(sim) ? sim : -1)
        return { ...p, __sim: sim, __score: score }
      })
      reranked.sort((a, b) => (b.__score ?? -Infinity) - (a.__score ?? -Infinity))
    }
    
    // Limit results
    const rankedList: Ranked[] = (usedServerVector ? (processedProviders as unknown as Ranked[]) : (queryEmbedding ? reranked : (processedProviders as unknown as Ranked[])))
    const limitedProviders: Ranked[] = rankedList.slice(0, Math.min(limit, 6))
    
    console.log(`Search results: ${providers.length} total, ${skippedCount} skipped, ${processedProviders.length} matched, ${limitedProviders.length} returned`)
    
    // Count total services
    const totalServices = limitedProviders.reduce((sum, p) => sum + (p.services?.length || 0), 0)
    
    // Sanitize embeddings from response payload (provider/service level)
    const sanitizedProviders = limitedProviders.map((p) => {
      const { __sim: _sim, __score: _score, ...rest } = p as Ranked
      void _sim; void _score
      const services: Service[] | undefined = Array.isArray((rest as Provider).services)
        ? ((rest as Provider).services as (ServiceWithEmbedding | Service)[]).map((s) => {
            const { embedding: _embedding, ...svc } = s as ServiceWithEmbedding
            void _embedding
            return svc as Service
          })
        : (rest as Provider).services
      return { ...rest, services }
    })

    return NextResponse.json({
      providers: sanitizedProviders.slice(0, 6),
      provider_count: Math.min(limitedProviders.length, 6),
      service_count: totalServices,
      total_available: rankedList.length,
      search_params: {
        query: query,
        expanded_terms: expandedTerms,
        location: location,
        filters: filters
      }
    })
  } catch (error) {
    console.error('Copilot search error:', error)
    return NextResponse.json(
      { error: 'Search failed', providers: [], provider_count: 0, service_count: 0 },
      { status: 500 }
    )
  }
}
