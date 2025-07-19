import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId, Db } from 'mongodb'

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
const EMBED_TIMEOUT_MS = 5000
const EMBED_RETRIES = 2

// Maximum services to return per provider (vector matched)
const MAX_VECTOR_SERVICES_PER_PROVIDER = 6
// Additional top free services per provider (not in vector top) via metadata query
const MAX_FREE_SERVICES_PER_PROVIDER = 4

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
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')
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

// ================== Embedding (with simple cache) ==================
const embedCache = new Map<string, number[]>()

function normalizeQuery(q: string) {
  return q.trim().toLowerCase().replace(/\s+/g, ' ')
}

async function generateEmbedding(text: string): Promise<number[]> {
  const key = normalizeQuery(text)
  const cached = embedCache.get(key)
  if (cached) return cached

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const model = process.env.AZURE_OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
  if (!endpoint || !apiKey) throw new Error('Azure OpenAI credentials not configured')

  const url = `${endpoint}/openai/deployments/${model}/embeddings?api-version=2023-05-15`
  for (let attempt = 0; attempt <= EMBED_RETRIES; attempt++) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), EMBED_TIMEOUT_MS)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({ input: text, model }),
        signal: ctrl.signal
      })
      clearTimeout(t)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
      const emb = data.data[0].embedding as number[]
      if (Array.isArray(emb) && emb.length === 1536) {
        embedCache.set(key, emb)
        // LRU trim (simple) if >500 entries
        if (embedCache.size > 500) {
          const first = embedCache.keys().next().value
            ; (first) && embedCache.delete(first)
        }
        return emb
      }
      throw new Error('Invalid embedding payload')
    } catch (e) {
      if (attempt === EMBED_RETRIES) {
        console.error('Embedding failed, returning zero vector:', e)
        return new Array(1536).fill(0)
      }
      await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
    }
  }
  return new Array(1536).fill(0)
}

// ================== Utilities ==================
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function buildProviderFilter(filters: SearchFilters = {}): Record<string, any> {
  const f: Record<string, any> = {}
  if (filters.acceptsUninsured) f.accepts_uninsured = true
  if (filters.acceptsMedicaid) f.medicaid = true
  if (filters.acceptsMedicare) f.medicare = true
  if (filters.ssnRequired === false) f.ssn_required = false // explicit opt‑out
  if (filters.telehealthAvailable) f.telehealth_available = true
  if (filters.insuranceProviders?.length) f.insurance_providers = { $in: filters.insuranceProviders }
  return f
}

function buildServiceFilter(filters: SearchFilters = {}): Record<string, any> {
  const f: Record<string, any> = {}
  if (filters.freeOnly) f.is_free = true
  if (filters.serviceCategories?.length) f.category = { $in: filters.serviceCategories }
  return f
}

function cosmosVectorStage(vector: number[], path: 'summary_vector' | 'service_vector', k: number, filter: Record<string, any>, nProbes?: number) {
  const cs: Record<string, any> = { path, vector, k }
  if (nProbes && nProbes > 0) cs.nProbes = nProbes
  if (Object.keys(filter).length) cs.filter = filter
  return cs
}

// ================== Core Search ==================
async function vectorSearchProviders(db: Db, queryVector: number[], filters: SearchFilters, limit: number, location?: { latitude: number, longitude: number }): Promise<ProviderResult[]> {
  const filter = buildProviderFilter(filters)
  const docs = await db.collection<ProviderDoc>('providers').aggregate<any>([
    { $search: { cosmosSearch: cosmosVectorStage(queryVector, 'summary_vector', PROVIDER_K, filter, PROVIDER_NPROBES), returnStoredSource: true } },
    { $project: {
        _id: 1, name: 1, category: 1, address: 1, phone: 1, website: 1, email: 1, rating: 1, location: 1, state: 1,
        accepts_uninsured: 1, medicaid: 1, medicare: 1, ssn_required: 1, telehealth_available: 1, insurance_providers: 1,
        total_services: 1, free_services: 1, free_service_names: 1, score: { $meta: 'searchScore' }
      } },
    { $limit: Math.min(limit * 3, PROVIDER_K) } // gather extras for re‑ranking / distance filtering
  ]).toArray()

  return docs.map(d => {
    const distance = (location && d.location?.coordinates)
      ? haversineMiles(location.latitude, location.longitude, d.location.coordinates[1], d.location.coordinates[0])
      : undefined
    return { ...d, searchScore: d.score, distance }
  })
}

async function vectorSearchServices(db: Db, queryVector: number[], filters: SearchFilters): Promise<ServiceResult[]> {
  const filter = buildServiceFilter(filters)
  const docs = await db.collection<ServiceDoc>('services').aggregate<any>([
    { $search: { cosmosSearch: cosmosVectorStage(queryVector, 'service_vector', SERVICE_K, filter, SERVICE_NPROBES), returnStoredSource: true } },
    { $project: { _id: 1, provider_id: 1, name: 1, category: 1, description: 1, is_free: 1, is_discounted: 1, price_info: 1, score: { $meta: 'searchScore' } } },
    { $limit: SERVICE_K }
  ]).toArray()
  return docs.map(d => ({ ...d, searchScore: d.score }))
}

// Fetch additional free services for providers (not necessarily vector top) to enrich result cards
async function fetchSupplementalFreeServices(db: Db, providerIds: ObjectId[], existingServiceIds: Set<string>): Promise<Record<string, ServiceResult[]>> {
  if (!providerIds.length) return {}
  const cursor = db.collection<ServiceDoc>('services').aggregate([
    { $match: { provider_id: { $in: providerIds }, is_free: true } },
    { $project: { _id: 1, provider_id: 1, name: 1, category: 1, description: 1, is_free: 1, is_discounted: 1, price_info: 1 } },
    { $limit: providerIds.length * (MAX_FREE_SERVICES_PER_PROVIDER + 2) } // coarse upper bound
  ])
  const map: Record<string, ServiceResult[]> = {}
  for await (const doc of cursor) {
    const pid = doc.provider_id.toString()
    if (existingServiceIds.has(doc._id.toString())) continue // skip already present vector matches
    if (!map[pid]) map[pid] = []
    if (map[pid].length < MAX_FREE_SERVICES_PER_PROVIDER) {
      const svc: ServiceResult = {
        _id: doc._id,
        provider_id: doc.provider_id,
        name: doc.name,
        category: doc.category,
        description: doc.description,
        is_free: doc.is_free,
        is_discounted: doc.is_discounted,
        price_info: doc.price_info,
        searchScore: 0.0
      }
      map[pid].push(svc)
    }
  }
  return map
}

function scoreProvider(base: ProviderResult, vectorServices: ServiceResult[]): number {
  let score = base.searchScore || 0
  const total = base.total_services || 0
  const free = base.free_services || 0

  // Mild boosts (avoid runaway inflation)
  if (free > 0) {
    // Factor + additive lightweight
    score *= 1 + Math.min(free, 10) * 0.05 // up to +50%
    score += Math.min(free, 10) * 0.5
  }
  if (total > 0) {
    score *= 1 + Math.log10(total + 1) * 0.15
  }
  const serviceRelevanceAvg = vectorServices.length
    ? vectorServices.reduce((s, v) => s + v.searchScore, 0) / vectorServices.length
    : 0
  score += serviceRelevanceAvg * 2 // modest amplification of per‑service relevance

  const freeRatio = total ? free / total : 0
  if (freeRatio >= 0.5) score *= 1.15
  else if (freeRatio >= 0.25) score *= 1.07

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
  let services: ServiceResult[] = svcResult.status === 'fulfilled' ? svcResult.value : []

  // Group services by provider
  const servicesByProvider = new Map<string, ServiceResult[]>()
  for (const s of services) {
    const pid = s.provider_id.toString()
    if (!servicesByProvider.has(pid)) servicesByProvider.set(pid, [])
    const arr = servicesByProvider.get(pid)!
    if (arr.length < MAX_VECTOR_SERVICES_PER_PROVIDER) arr.push(s)
  }

  // Distance filter (before scoring) if requested
  if (location && filters.maxDistance) {
    providers = providers.filter(p => !p.distance || p.distance <= filters.maxDistance!)
  }

  // Supplemental free services (non‑vector) to enrich cards
  const providerIds = providers.slice(0, limit).map(p => p._id)
  const existingSvcIds = new Set(services.map(s => s._id.toString()))
  const supplemental = await fetchSupplementalFreeServices(db, providerIds, existingSvcIds)

  // Attach services + compute scores
  providers = providers.map(p => {
    const pid = p._id.toString()
    const vecSvcs = servicesByProvider.get(pid) || []
    const freeExtras = supplemental[pid] || []
    const scored: ProviderResult = {
      ...p,
      services: vecSvcs,
      freeServicePreview: freeExtras,
      searchScore: scoreProvider(p, vecSvcs)
    }
    return scored
  })

  // Sort & slice
  providers.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))
  providers = providers.slice(0, limit)

  // Filter services list to only those belonging to returned providers (flatten vector‑matched + free extras)
  const providerSet = new Set(providers.map(p => p._id.toString()))
  const returnedServices: ServiceResult[] = []
  providers.forEach(p => {
    p.services?.forEach(s => returnedServices.push(s))
    p.freeServicePreview?.forEach(s => returnedServices.push(s))
  })
  // Deduplicate
  const seen = new Set<string>()
  const dedup: ServiceResult[] = []
  for (const s of returnedServices) {
    const id = s._id.toString()
    if (!seen.has(id)) { seen.add(id); dedup.push(s) }
  }

  return { providers, services: dedup }
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
  } catch (e: any) {
    console.error('Search error', e)
    return NextResponse.json({ error: 'Search temporarily unavailable', detail: e?.message }, { status: 500 })
  }
}

// (Optional) GET for simple health check
export async function GET() {
  try {
    const db = await getDb()
    const prov = await db.collection('providers').estimatedDocumentCount()
    const svc = await db.collection('services').estimatedDocumentCount()
    return NextResponse.json({ status: 'ok', providers: prov, services: svc, nprobes: { providers: PROVIDER_NPROBES, services: SERVICE_NPROBES } })
  } catch (e: any) {
    return NextResponse.json({ status: 'error', detail: e?.message }, { status: 500 })
  }
}
