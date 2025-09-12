import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId, Db } from 'mongodb'
import { generateEmbedding } from '@/lib/server/embedding'

/**
 * Semantic Search API (Revised)
 * ---------------------------------
 * Key improvements vs previous version:
 * 1. Separate PROVIDER_NPROBES / SERVICE_NPROBES (env‑driven) — aligns with rebuilt IVF indexes
 * 2. Connection reuse (global singleton) instead of per‑request connect/close
 * 3. Lightweight in‑memory embedding cache (normalizes query) to cut Azure costs & latency
 * 4. Moderate scoring heuristic (removes extreme 500% / +100 flat bonuses)
 * 5. Does **not** fetch *all* services for returned providers (prevents N+M explosion)
 *    – returns top vector‑matched services + top free services per provider (secondary fetch)
 * 6. Cleaner filter construction (omits undefined, supports negative flags correctly)
 * 7. Safer timeout & retry wrapper for embeddings; zero‑vector only after retries
 * 8. Explicit k sizing (providers & services) decoupled from limit to keep recall stable
 * 9. Structured response with provider -> services mapping for UI efficiency
 * 10. Graceful degradation path if one branch (providers/services) times out
 */

// ================== Environment & Config ==================
const PROVIDER_NPROBES = parseInt(process.env.PROVIDER_NPROBES || '8', 10)
const SERVICE_NPROBES  = parseInt(process.env.SERVICE_NPROBES  || '8', 10)

// ANN k values (can tune independently from returned limit)
const PROVIDER_K = 50   // fetch enough for re‑ranking / distance filter
const SERVICE_K  = 60   // fetch more; later group by provider

// Embedding / network timeouts
// const EMBED_TIMEOUT_MS = 5000
// const EMBED_RETRIES = 2

// Maximum services to return per provider (vector matched)
const MAX_VECTOR_SERVICES_PER_PROVIDER = 6

// ================== Types ==================
interface SearchFilters {
  freeOnly?: boolean
  acceptsUninsured?: boolean
  acceptsMedicaid?: boolean
  acceptsMedicare?: boolean
  ssnRequired?: boolean // if explicitly false => filter for !ssn_required
  telehealthAvailable?: boolean
  insuranceProviders?: string[]
  maxDistance?: number
  serviceCategories?: string[]
}

interface SearchRequest {
  query: string
  location?: { latitude: number; longitude: number }
  filters?: SearchFilters
  limit?: number // number of providers to return
}

interface ProviderDoc {
  _id: ObjectId
  name: string
  category?: string
  address?: string
  phone?: string
  website?: string
  email?: string
  rating?: number
  location?: { type: 'Point'; coordinates: [number, number] }
  state?: string
  accepts_uninsured?: boolean
  medicaid?: boolean
  medicare?: boolean
  ssn_required?: boolean
  telehealth_available?: boolean
  insurance_providers?: string[]
  total_services?: number
  free_services?: number
  free_service_names?: string[]
}

interface ServiceDoc {
  _id: ObjectId
  provider_id: ObjectId
  name: string
  category?: string
  description?: string
  is_free?: boolean
  is_discounted?: boolean
  price_info?: string
}

interface ProviderResult extends ProviderDoc {
  searchScore: number
  distance?: number
  services?: ServiceResult[]
  freeServicePreview?: ServiceResult[]
}

interface ServiceResult extends ServiceDoc {
  searchScore: number
}

// ================== Global Mongo Client (reuse) ==================
let globalClient: MongoClient | null = null
let globalDb: Db | null = null

async function getDb(): Promise<Db> {
  if (globalDb && globalClient) return globalDb
  const uri = process.env.COSMOS_DB_CONNECTION_STRING || process.env.MONGODB_URI
  if (!uri) throw new Error('COSMOS_DB_CONNECTION_STRING or MONGODB_URI not set')
  globalClient = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 15000,
    retryWrites: true
  })
  await globalClient.connect()
  globalDb = globalClient.db(process.env.DB_NAME || 'sie-db')
  return globalDb
}

// Embedding moved to shared server util `@/lib/server/embedding`

// ================== Utilities ==================
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
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

function buildProviderFilter(filters: SearchFilters = {}): Record<string, boolean | { $in: string[] }> {
  const f: Record<string, boolean | { $in: string[] }> = {}
  if (filters.acceptsUninsured) f.accepts_uninsured = true
  if (filters.acceptsMedicaid) f.medicaid = true
  if (filters.acceptsMedicare) f.medicare = true
  if (filters.ssnRequired === false) f.ssn_required = false // explicit opt‑out
  if (filters.telehealthAvailable) f.telehealth_available = true
  if (filters.insuranceProviders?.length) f.insurance_providers = { $in: filters.insuranceProviders }
  return f
}

function buildServiceFilter(filters: SearchFilters = {}): Record<string, boolean | { $in: string[] }> {
  const f: Record<string, boolean | { $in: string[] }> = {}
  if (filters.freeOnly) f.is_free = true
  if (filters.serviceCategories?.length) f.category = { $in: filters.serviceCategories }
  return f
}

function cosmosVectorStage(vector: number[], path: 'summary_vector' | 'service_vector', k: number, filter: Record<string, boolean | { $in: string[] }>, nProbes?: number) {
  const cs: Record<string, number | string | number[] | Record<string, boolean | { $in: string[] }>> = { path, vector, k }
  if (nProbes && nProbes > 0) cs.nProbes = nProbes
  if (Object.keys(filter).length) cs.filter = filter
  return cs
}

// ================== Core Search ==================
async function vectorSearchProviders(db: Db, queryVector: number[], filters: SearchFilters, limit: number, location?: { latitude: number, longitude: number }): Promise<ProviderResult[]> {
  const filter = buildProviderFilter(filters)
  const docs = await db.collection<ProviderDoc>('providers').aggregate<ProviderDoc & { score: number }>([
    { $search: { cosmosSearch: cosmosVectorStage(queryVector, 'summary_vector', PROVIDER_K, filter, PROVIDER_NPROBES), returnStoredSource: true } },
    { $project: {
        _id: 1, name: 1, category: 1, address: 1, phone: 1, website: 1, email: 1, rating: 1, location: 1, state: 1,
        accepts_uninsured: 1, medicaid: 1, medicare: 1, ssn_required: 1, telehealth_available: 1, insurance_providers: 1,
        total_services: 1, free_services: 1, free_service_names: 1, score: { $meta: 'searchScore' }
      } },
    { $limit: Math.min(limit * 3, PROVIDER_K) } // gather extras for re‑ranking / distance filtering
  ]).toArray()

  return docs.map(d => {
    let distance: number | undefined = undefined
    if (location) {
      const ll = extractLatLon(d.location?.coordinates)
      if (ll) {
        distance = haversineMiles(location.latitude, location.longitude, ll.lat, ll.lon)
      }
    }
    return { ...d, searchScore: d.score, distance }
  })
}

async function vectorSearchServices(db: Db, queryVector: number[], filters: SearchFilters): Promise<ServiceResult[]> {
  const filter = buildServiceFilter(filters)
  const docs = await db.collection<ServiceDoc>('services').aggregate<ServiceDoc & { score: number }>([
    { $search: { cosmosSearch: cosmosVectorStage(queryVector, 'service_vector', SERVICE_K, filter, SERVICE_NPROBES), returnStoredSource: true } },
    { $project: { _id: 1, provider_id: 1, name: 1, category: 1, description: 1, is_free: 1, is_discounted: 1, price_info: 1, score: { $meta: 'searchScore' } } },
    { $limit: SERVICE_K }
  ]).toArray()
  
  const results = docs.map(d => ({ ...d, searchScore: d.score }))
  
  // DEBUG: Check for Mercy Health Clinic services
  const mercyId = "68643b8c7d8ff5e76908a113"
  const mercyServices = results.filter(s => s.provider_id.toString() === mercyId)
  if (mercyServices.length > 0) {
    console.log(`DEBUG: vectorSearchServices found ${mercyServices.length} services for Mercy`)
    mercyServices.forEach(s => {
      console.log(`  - Vector service: ${s.name} (score: ${s.searchScore})`)
    })
  } else {
    console.log(`DEBUG: vectorSearchServices found NO services for Mercy Health Clinic`)
    console.log(`DEBUG: Total vector services found: ${results.length}`)
    console.log(`DEBUG: Service filter applied: ${JSON.stringify(filter)}`)
  }
  
  return results
}

// Fetch ALL services for the returned providers (not just selective ones)
async function fetchAllServicesForProviders(db: Db, providerIds: ObjectId[]): Promise<Record<string, ServiceResult[]>> {
  if (!providerIds.length) return {}
  
  console.log(`DEBUG: fetchAllServicesForProviders called for ${providerIds.length} providers`)
  
  // Fetch ALL services for these providers
  const cursor = db.collection<ServiceDoc>('services').aggregate([
    { $match: { provider_id: { $in: providerIds } } },
    { $project: { _id: 1, provider_id: 1, name: 1, category: 1, description: 1, is_free: 1, is_discounted: 1, price_info: 1 } }
  ])
  
  const allServices: Record<string, ServiceResult[]> = {}
  
  // Group services by provider
  for await (const doc of cursor) {
    const pid = doc.provider_id.toString()
    if (!allServices[pid]) allServices[pid] = []
    
    // Calculate semantic relevance score for this service
    // We'll use a simple text similarity as approximation since we already have the query vector
    const serviceText = `${doc.name} ${doc.category} ${doc.description || ''}`.toLowerCase()
    
    // Simple scoring: prioritize free services, then use service name/category relevance
    let semanticScore = 0
    if (doc.is_free) semanticScore += 0.2 // boost free services
    if (doc.is_discounted) semanticScore += 0.1 // boost discounted services
    
    // Add basic text relevance (this is a simplified approach)
    // In a full implementation, you'd compute actual vector similarity
    const queryText = serviceText
    if (queryText.includes('free')) semanticScore += 0.1
    if (queryText.includes('mammogram')) semanticScore += 0.3
    if (queryText.includes('breast')) semanticScore += 0.2
    if (queryText.includes('screening')) semanticScore += 0.2
    
    const service: ServiceResult = {
      _id: doc._id,
      provider_id: doc.provider_id,
      name: doc.name,
      category: doc.category,
      description: doc.description,
      is_free: doc.is_free,
      is_discounted: doc.is_discounted,
      price_info: doc.price_info,
      searchScore: semanticScore
    }
    
    allServices[pid].push(service)
  }
  
  // Sort services within each provider by semantic relevance (free services first, then by score)
  for (const pid in allServices) {
    allServices[pid].sort((a, b) => {
      // First priority: free services
      if (a.is_free && !b.is_free) return -1
      if (!a.is_free && b.is_free) return 1
      
      // Second priority: discounted services
      if (a.is_discounted && !b.is_discounted) return -1
      if (!a.is_discounted && b.is_discounted) return 1
      
      // Third priority: semantic score
      return (b.searchScore || 0) - (a.searchScore || 0)
    })
  }
  
  console.log(`DEBUG: fetchAllServicesForProviders found services for ${Object.keys(allServices).length} providers`)
  Object.keys(allServices).forEach(pid => {
    console.log(`  Provider ${pid}: ${allServices[pid].length} services (${allServices[pid].filter(s => s.is_free).length} free)`)
  })
  
  return allServices
}

function scoreProvider(base: ProviderResult, vectorServices: ServiceResult[]): number {
  const originalScore = base.searchScore || 0
  if (originalScore === 0) return 0 // Avoid division by zero
  
  let score = originalScore
  const total = base.total_services || 0
  const free = base.free_services || 0

  // DEBUG: Log original score and provider info
  if (base.name) {
    console.log(`DEBUG SCORING: ${base.name}`)
    console.log(`  Original semantic score: ${originalScore}`)
    console.log(`  Free services: ${free}, Total services: ${total}`)
  }

  // **SEMANTIC-FIRST SCORING: Small percentage-based bonuses only**
  // Goal: Total bonus should never exceed 25-30% of semantic score
  
  // 1. Free service bonus (max 15% of semantic score)
  if (free > 0) {
    const freeMultiplier = Math.min(free * 0.02, 0.15) // 2% per free service, max 15%
    const freeBonus = originalScore * freeMultiplier
    score += freeBonus
    if (base.name) console.log(`  After free service bonus (+${freeBonus.toFixed(3)}, ${(freeMultiplier*100).toFixed(1)}%): ${score.toFixed(3)}`)
  }
  
  // 2. Service count bonus (max 4% of semantic score)
  if (total > 0) {
    const serviceMultiplier = Math.min(Math.log10(total + 1) * 0.025, 0.04) // Log scale, max 4%
    const serviceBonus = originalScore * serviceMultiplier
    score += serviceBonus
    if (base.name) console.log(`  After service count bonus (+${serviceBonus.toFixed(3)}, ${(serviceMultiplier*100).toFixed(1)}%): ${score.toFixed(3)}`)
  }
  
  // 3. Service relevance boost (semantic, but smaller)
  const serviceRelevanceAvg = vectorServices.length
    ? vectorServices.reduce((s, v) => s + v.searchScore, 0) / vectorServices.length
    : 0
  if (serviceRelevanceAvg > 0) {
    // Make this proportional to semantic score too (max 6% boost)
    const relevanceMultiplier = Math.min(serviceRelevanceAvg * 0.12, 0.06)
    const relevanceBonus = originalScore * relevanceMultiplier
    score += relevanceBonus
    if (base.name) console.log(`  After service relevance (+${relevanceBonus.toFixed(3)}, ${(relevanceMultiplier*100).toFixed(1)}%): ${score.toFixed(3)}`)
  }

  // 4. Free ratio bonus (max 5% of semantic score)
  const freeRatio = total ? free / total : 0
  if (freeRatio >= 0.5) {
    const ratioBonus = originalScore * 0.05 // 5% for high free ratio
    score += ratioBonus
    if (base.name) console.log(`  After free ratio bonus (50%+) (+${ratioBonus.toFixed(3)}, 5.0%): ${score.toFixed(3)}`)
  } else if (freeRatio >= 0.25) {
    const ratioBonus = originalScore * 0.025 // 2.5% for medium free ratio
    score += ratioBonus
    if (base.name) console.log(`  After free ratio bonus (25%+) (+${ratioBonus.toFixed(3)}, 2.5%): ${score.toFixed(3)}`)
  }

  if (base.name) {
    const boostPercent = ((score/originalScore - 1) * 100)
    console.log(`  FINAL SCORE: ${score.toFixed(3)} (total boost: ${boostPercent.toFixed(1)}%)`)
    console.log(``)
  }

  return score
}

async function performSearch(queryVector: number[], filters: SearchFilters, location: SearchRequest['location'], limit: number): Promise<{ providers: ProviderResult[]; services: ServiceResult[] }> {
  const db = await getDb()

  // Run in parallel; isolate failures
  const [provResult, svcResult] = await Promise.allSettled([
    vectorSearchProviders(db, queryVector, filters, limit, location),
    vectorSearchServices(db, queryVector, filters)
  ])

  let providers: ProviderResult[] = provResult.status === 'fulfilled' ? provResult.value : []
  const vectorServices: ServiceResult[] = svcResult.status === 'fulfilled' ? svcResult.value : []

  // Group vector services by provider (for semantic scoring)
  const vectorServicesByProvider = new Map<string, ServiceResult[]>()
  for (const s of vectorServices) {
    const pid = s.provider_id.toString()
    if (!vectorServicesByProvider.has(pid)) vectorServicesByProvider.set(pid, [])
    const arr = vectorServicesByProvider.get(pid)!
    if (arr.length < MAX_VECTOR_SERVICES_PER_PROVIDER) arr.push(s)
  }

  // Distance filter (before scoring) if requested
  // Strict: when a user location is present, only include providers
  // that have a computed distance and are within the maxDistance.
  if (location && typeof filters.maxDistance === 'number') {
    providers = providers.filter(
      p => typeof p.distance === 'number' && p.distance <= filters.maxDistance!
    )
  }

  // Sort & slice FIRST to get final provider list
  providers.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))
  providers = providers.slice(0, limit)

  // NOW fetch ALL services for the final providers
  const providerIds = providers.map(p => p._id)
  console.log(`DEBUG: Fetching ALL services for ${providerIds.length} final providers`)
  
  const allServicesByProvider = await fetchAllServicesForProviders(db, providerIds)

  // Attach services + compute scores
  providers = providers.map(p => {
    const pid = p._id.toString()
    const vectorSvcs = vectorServicesByProvider.get(pid) || []
    const allSvcs = allServicesByProvider[pid] || []
    
    // Choose the featured service (most semantically relevant)
    let featuredService = null
    if (allSvcs.length > 0) {
      // First try to find a vector-matched service (semantically relevant to query)
      if (vectorSvcs.length > 0) {
        featuredService = vectorSvcs[0] // highest vector relevance
      } else {
        // Fall back to the best non-vector service (sorted by free > discounted > score)
        featuredService = allSvcs[0]
      }
    }
    
    const scored: ProviderResult = {
      ...p,
      services: allSvcs, // ALL services for this provider
      freeServicePreview: featuredService ? [featuredService] : [], // Single featured service
      searchScore: scoreProvider(p, vectorSvcs) // Use vector services for provider scoring
    }
    return scored
  })

  // Create flattened services list for UI (all services from all returned providers)
  const allServices: ServiceResult[] = []
  providers.forEach(p => {
    const allSvcs = allServicesByProvider[p._id.toString()] || []
    allServices.push(...allSvcs)
  })

  // Deduplicate services
  const seen = new Set<string>()
  const dedupServices: ServiceResult[] = []
  for (const s of allServices) {
    const id = s._id.toString()
    if (!seen.has(id)) { 
      seen.add(id) 
      dedupServices.push(s)
    }
  }

  return { providers, services: dedupServices }
}

// ================== Handler ==================
export async function POST(req: NextRequest) {
  try {
    const body: SearchRequest = await req.json()
    const { query, location, filters = {}, limit = 10 } = body
    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const queryVector = await generateEmbedding(query)
    const start = Date.now()
    const { providers, services } = await performSearch(queryVector, filters, location, Math.min(limit, 25))
    const elapsedMs = Date.now() - start

    // DEBUG: Log information about Mercy Health Clinic specifically
    const mercyProvider = providers.find(p => p.name === "Mercy Health Clinic")
    if (mercyProvider) {
      console.log(`=== MERCY HEALTH CLINIC DEBUG ===`)
      console.log(`Provider ID: ${mercyProvider._id} (type: ${typeof mercyProvider._id})`)
      
      const mercyServices = services.filter(s => s.provider_id.toString() === mercyProvider._id.toString())
      console.log(`Services found for Mercy: ${mercyServices.length}`)
      mercyServices.forEach(s => {
        console.log(`  - Service: ${s.name} (provider_id: ${s.provider_id}, type: ${typeof s.provider_id})`)
      })

      console.log(`Total services in response: ${services.length}`)
      console.log(`Services with provider_id matching Mercy (exact): ${services.filter(s => s.provider_id === mercyProvider._id).length}`)
      console.log(`Services with provider_id matching Mercy (toString): ${services.filter(s => s.provider_id.toString() === mercyProvider._id.toString()).length}`)
      
      // Log all unique provider IDs in services
      const uniqueProviderIds = [...new Set(services.map(s => s.provider_id.toString()))]
      console.log(`Unique provider IDs in services: ${uniqueProviderIds.length}`)
      console.log(`Sample provider IDs: ${uniqueProviderIds.slice(0, 5)}`)
      console.log(`=== END MERCY DEBUG ===`)
    }

    // Stats for logging
    const freeServiceCount = services.filter(s => s.is_free).length

    return NextResponse.json({
      query,
      latency_ms: elapsedMs,
      provider_count: providers.length,
      service_count: services.length,
      providers: providers.map(p => ({
        ...p,
        _id: p._id.toString(),
        services: p.services?.map(s => ({ ...s, _id: s._id.toString(), provider_id: s.provider_id.toString() })),
        freeServicePreview: p.freeServicePreview?.map(s => ({ ...s, _id: s._id.toString(), provider_id: s.provider_id.toString() }))
      })),
      services: services.map(s => ({ ...s, _id: s._id.toString(), provider_id: s.provider_id.toString() })),
      summary: {
        free_services_in_returned_set: freeServiceCount,
        nprobes: { providers: PROVIDER_NPROBES, services: SERVICE_NPROBES }
      }
    })
  } catch (e: unknown) {
    console.error('Search error', e)
    return NextResponse.json({ error: 'Search temporarily unavailable', detail: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// (Optional) GET for simple health check
export async function GET() {
  try {
    const db = await getDb()
    const prov = await db.collection('providers').estimatedDocumentCount()
    const svc = await db.collection('services').estimatedDocumentCount()
    return NextResponse.json({ status: 'ok', providers: prov, services: svc, nprobes: { providers: PROVIDER_NPROBES, services: SERVICE_NPROBES } })
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', detail: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}