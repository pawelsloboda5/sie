export const runtime = 'edge'
export const preferredRegion = ['iad1']
import { NextRequest, NextResponse } from 'next/server'
import type { Provider, Service, SearchFilters, Coordinates, SearchResponse, FilterResponse, GeoForwardResult, GeoReverseResult, SummarizeResult } from '@/lib/types/copilot'

type Message = { role: 'user' | 'assistant' | 'system' | 'tool'; content: string; name?: string }

type UserState = {
  service_terms: string[] | null
  free_only: boolean | null
  accepts_medicaid: boolean | null
  accepts_uninsured: boolean | null
  insurance_providers: string[] | null
  location_text: string | null
  // Extended filter signals
  accepts_medicare?: boolean | null
  telehealth_available?: boolean | null
  ssn_required?: boolean | null
}

// ===== Intent & Ranking Types =====
type Intent = 'ProviderProfile' | 'Compare' | 'ExplainCoverage' | 'Summarize'
type ComparatorFlavor = 'cheapest' | 'closest' | 'best' | 'mostFree'
type PriceSample = { name: string; price: number }
type PriceStat = { min?: number; max?: number; samples: PriceSample[] }

// ===== Data Shapes (aligned with copilot/search and copilot/filter) =====
// Types moved to '@/lib/types/copilot'

// DEV-ONLY inline configuration for local testing
// Remove DEV_INLINE; use env vars for production
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || ''
const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY || ''
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_CHAT_MODEL || 'gpt-4.1'
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-04-01-preview'
const RESULT_LIMIT = Number(process.env.COPILOT_RESULT_LIMIT || 4)

// Resolve base URL for server-to-server calls (prod-safe)
const SELF_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
  'http://localhost:3001'

if (process.env.LOG_ENV === '1') {
  console.log('ENV_DIAG', {
    hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
    hasKey: !!process.env.AZURE_OPENAI_API_KEY,
    model: process.env.AZURE_OPENAI_CHAT_MODEL,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    vercelEnv: process.env.VERCEL_ENV,
  })
}

// Structured output schema for Responses API (kept for documentation/prompting blocks where needed)
const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    answer: { type: 'string' },
    selected_provider_ids: { type: 'array', items: { type: 'string' }, default: [] }
  },
  required: ['answer', 'selected_provider_ids']
} as const

// Safe helpers for Azure Responses API parsing
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function safeExtractAzureText(data: unknown): string {
  if (!isObject(data)) return ''
  // Direct field
  if (typeof data.output_text === 'string') return data.output_text
  // output.text
  if (isObject(data.output) && typeof (data.output as Record<string, unknown>).text === 'string') {
    return (data.output as Record<string, unknown>).text as string
  }
  // output array variant
  const out = data.output as unknown
  if (Array.isArray(out)) {
    const parts: string[] = []
    for (const item of out) {
      if (isObject(item) && Array.isArray(item.content)) {
        for (const c of item.content as unknown[]) {
          if (isObject(c) && typeof c.text === 'string') parts.push(c.text)
        }
      }
    }
    if (parts.length) return parts.join('\n')
  }
  // choices fallback (ChatCompletions-like)
  if (Array.isArray(data.choices)) {
    const first = data.choices[0]
    if (isObject(first) && isObject(first.message) && typeof first.message.content === 'string') {
      return first.message.content
    }
  }
  return ''
}

// ===== Conversation State Extraction (service, affordability, insurance, location) =====
const STATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    service_terms: { type: ['array', 'null'], items: { type: 'string' } },
    free_only: { type: ['boolean', 'null'] },
    accepts_medicaid: { type: ['boolean', 'null'] },
    accepts_uninsured: { type: ['boolean', 'null'] },
    insurance_providers: { type: ['array', 'null'], items: { type: 'string' } },
    location_text: { type: ['string', 'null'] },
    accepts_medicare: { type: ['boolean', 'null'] },
    telehealth_available: { type: ['boolean', 'null'] },
    ssn_required: { type: ['boolean', 'null'] }
  },
  required: ['service_terms', 'free_only', 'accepts_medicaid', 'accepts_uninsured', 'insurance_providers', 'location_text', 'accepts_medicare', 'telehealth_available', 'ssn_required']
} as const

// Router schema for LLM decision (no tool execution here; server will run tools)
const ROUTER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    route: { type: 'string', enum: ['filter_only', 'service_search', 'hybrid', 'provider_profile'] },
    // optional normalized query for service search
    service_query: { type: ['string', 'null'] },
    // optional provider name when the user asks about a specific provider
    provider_name: { type: ['string', 'null'] },
    // filters extracted from the prompt
    filters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        freeOnly: { type: ['boolean', 'null'] },
        acceptsUninsured: { type: ['boolean', 'null'] },
        acceptsMedicaid: { type: ['boolean', 'null'] },
        acceptsMedicare: { type: ['boolean', 'null'] },
        ssnRequired: { type: ['boolean', 'null'] },
        telehealthAvailable: { type: ['boolean', 'null'] },
        insuranceProviders: { type: ['array', 'null'], items: { type: 'string' } },
        serviceCategories: { type: ['array', 'null'], items: { type: 'string' } }
      }
    }
  },
  required: ['route']
} as const

async function routeWithLLM(question: string, state: UserState): Promise<{
  route: 'filter_only' | 'service_search' | 'hybrid' | 'provider_profile'
  service_query?: string | null
  provider_name?: string | null
  filters?: SearchFilters
} | null> {
  try {
    const url = `${AZURE_ENDPOINT}/openai/responses?api-version=${AZURE_API_VERSION}`
    const input = [
      { role: 'user' as const, content: [{ type: 'input_text' as const, text: `QUESTION: ${question}` }] },
      { role: 'assistant' as const, content: [{ type: 'output_text' as const, text: `STATE_JSON: ${JSON.stringify(state)}` }] }
    ]
    const instructions = `Decide the retrieval route for a healthcare search system. Return only JSON per schema.

Rules:
- If the question is filter-only (e.g., mentions SSN/no SSN; Medicaid/Medicare; uninsured/self-pay; specific carriers like Cigna, Aetna, UHC, BCBS) and does not clearly ask for a service, choose route = "filter_only" and set filters accordingly.
- If the question clearly asks for a service (e.g., dental, mammogram, STI testing, therapy, primary care, vision, pharmacy) choose route = "service_search" and set service_query to the normalized service phrase. Include any affordability/insurance filters.
- If both service intent and filter constraints are present, choose route = "hybrid" and set service_query plus filters.
- If the question is clearly about a specific provider by name (e.g., "Tell me more about Hopeful Core Therapy"), choose route = "provider_profile" and set provider_name to the provider’s name string. Do not invent insuranceProviders here.
- Keep JSON concise. Do NOT explain.`

    const body = {
      model: AZURE_DEPLOYMENT,
      instructions,
      input,
      tools: [],
      tool_choice: 'none',
      text: { format: { type: 'json_schema', name: 'copilot_router', schema: ROUTER_SCHEMA, strict: true } },
      max_output_tokens: 150
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': AZURE_KEY as string },
      body: JSON.stringify(body)
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = safeExtractAzureText(data)
    if (!text || typeof text !== 'string') return null
    try {
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object') return null
      return parsed
    } catch {
      return null
    }
  } catch {
    return null
  }
}

function decideRouteFallback(question: string, state: UserState): {
  route: 'filter_only' | 'service_search' | 'hybrid'
  service_query?: string | null
} {
  const s = String(question || '').toLowerCase()
  const hasService = Array.isArray(state.service_terms) && state.service_terms.length > 0
  const mentionsFilterOnly = /(\bssn\b|no\s*ssn|medicaid|medicare|uninsured|self\s*pay|self-pay|insurance|cigna|aetna|uhc|united|kaiser|anthem|bcbs|blue\s*(cross|shield))/i.test(s)

  if (!hasService && mentionsFilterOnly) return { route: 'filter_only' }
  if (hasService && mentionsFilterOnly) return { route: 'hybrid', service_query: state.service_terms!.join(' ') }
  return { route: 'service_search', service_query: hasService ? state.service_terms!.join(' ') : question }
}

function mergeState(prev: Partial<UserState> | undefined, next: UserState): UserState {
  return {
    service_terms: Array.isArray(next?.service_terms) && next.service_terms.length
      ? next.service_terms
      : (Array.isArray(prev?.service_terms) && prev!.service_terms!.length ? prev!.service_terms! : null),
    free_only: typeof next?.free_only === 'boolean' ? next.free_only : (typeof prev?.free_only === 'boolean' ? prev!.free_only! : null),
    accepts_medicaid: typeof next?.accepts_medicaid === 'boolean' ? next.accepts_medicaid : (typeof prev?.accepts_medicaid === 'boolean' ? prev!.accepts_medicaid! : null),
    accepts_uninsured: typeof next?.accepts_uninsured === 'boolean' ? next.accepts_uninsured : (typeof prev?.accepts_uninsured === 'boolean' ? prev!.accepts_uninsured! : null),
    insurance_providers: (Array.isArray(next?.insurance_providers) && next.insurance_providers.length)
      ? next.insurance_providers
      : ((Array.isArray(prev?.insurance_providers) && prev!.insurance_providers!.length) ? prev!.insurance_providers! : null),
    location_text: typeof next?.location_text === 'string' && next.location_text?.trim() ? next.location_text : (prev?.location_text || null),
    accepts_medicare: typeof next?.accepts_medicare === 'boolean' ? next.accepts_medicare : (typeof prev?.accepts_medicare === 'boolean' ? prev!.accepts_medicare! : null),
    telehealth_available: typeof next?.telehealth_available === 'boolean' ? next.telehealth_available : (typeof prev?.telehealth_available === 'boolean' ? prev!.telehealth_available! : null),
    ssn_required: typeof next?.ssn_required === 'boolean' ? next.ssn_required : (typeof prev?.ssn_required === 'boolean' ? prev!.ssn_required! : null)
  }
}

// Minimal heuristic extraction as a safety net if the model returns nulls
function heuristicFromText(text: string): Partial<UserState> {
  const lc = (text || '').toLowerCase()
  const serviceTerms: string[] = []
  // Do not infer service terms heuristically; rely on model and context instead

  const freeOnly = /(free|no\s*cost)/.test(lc) ? true : undefined
  const acceptsMedicaid = /\bmedicaid\b/.test(lc) ? true : undefined
  const acceptsMedicare = /\bmedicare\b/.test(lc) ? true : undefined
  const acceptsUninsured = /(uninsured|no\s*insurance|without\s*insurance|don'?t\s*have\s*insurance)/.test(lc) ? true : undefined
  const telehealth = /(telehealth|virtual\s+visit|video\s+visit|online\s+appointment)/.test(lc) ? true : undefined
  // SSN detection
  let ssnRequired: boolean | undefined
  if (/(no\s*ssn|without\s*ssn|don'?t\s*require\s*ssn|ssn\s*(not\s*)?required|no\s*social\s*security)/.test(lc)) ssnRequired = false
  else if (/(require\s*ssn|ssn\s*required)/.test(lc)) ssnRequired = true

  let locationText: string | undefined
  const locMatch = lc.match(/\bin\s+([a-zA-Z\s]+)$/)
  if (locMatch && locMatch[1]) {
    locationText = locMatch[1].trim()
  } else if (/\bdc\b|washington\s*dc/.test(lc)) {
    locationText = 'Washington, DC'
  }

  const carrierMap: Record<string, string> = {
    'cigna': 'Cigna',
    'aetna': 'Aetna',
    'anthem': 'Anthem',
    'blue cross': 'Blue Cross Blue Shield',
    'blue shield': 'Blue Cross Blue Shield',
    'bcbs': 'Blue Cross Blue Shield',
    'bluechoice': 'BCBS BlueChoice',
    'carefirst': 'CareFirst',
    'united healthcare': 'United Healthcare',
    'unitedhealthcare': 'United Healthcare',
    'uhc': 'United Healthcare',
    'kaiser': 'Kaiser Permanente',
    'humana': 'Humana'
  }
  const carriers: string[] = []
  for (const key in carrierMap) {
    if (lc.includes(key)) {
      const canon = carrierMap[key]
      if (!carriers.includes(canon)) carriers.push(canon)
    }
  }

  const partial: Partial<UserState> = {}
  if (serviceTerms.length) partial.service_terms = serviceTerms
  if (typeof freeOnly === 'boolean') partial.free_only = freeOnly
  if (typeof acceptsMedicaid === 'boolean') partial.accepts_medicaid = acceptsMedicaid
  if (typeof acceptsMedicare === 'boolean') partial.accepts_medicare = acceptsMedicare
  if (typeof acceptsUninsured === 'boolean') partial.accepts_uninsured = acceptsUninsured
  if (typeof telehealth === 'boolean') partial.telehealth_available = telehealth
  if (carriers.length) partial.insurance_providers = carriers
  if (locationText) partial.location_text = locationText
  if (typeof ssnRequired === 'boolean') partial.ssn_required = ssnRequired
  return partial
}

// Natural fallback—focus on variety of prices and services
function naturalFallback(state: UserState, providers: Provider[], selectedIds: string[], requestedQuery: string): string {
  const byId = new Map<string, Provider>(providers.map((p) => [String(p._id || p.id), p]))
  const sel: Provider[] = selectedIds.map(id => byId.get(id) as Provider | undefined).filter((p): p is Provider => Boolean(p)).slice(0, 6)

  const lines: string[] = []
  const qTokens = String(requestedQuery || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && t.length >= 3 && !['which','one','ones','those','these','offer','offers','has','have','do','does','the','and','or','for','with','near','from','that','this','list','of','in','on','me','my','please','can','you'].includes(t))
  const matchesQuery = (s: Service) => {
    const blob = `${String(s?.name || '')} ${String(s?.category || '')} ${String(s?.description || '')}`.toLowerCase()
    return qTokens.some((t) => blob.includes(t))
  }
  const toPrice = (s: Service | undefined) => {
    if (!s) return null
    const info = priceInfoFromService(s)
    return info.text
  }

  // TL;DR opener first
  const serviceType = (qTokens.length ? qTokens.join(' ') : (state.service_terms?.join(' ') || 'care'))
  const tldr = `TL;DR: Found ${sel.length} ${serviceType} options near you.`
  lines.push(tldr)

  for (const p of sel) {
    const services: Service[] = Array.isArray(p?.services) ? p.services : []
    // Prefer a service that matches the query tokens, and a second notable service
    const primary = services.find((s) => matchesQuery(s))
    const fallbackPaid = services.find((s) => !s?.isFree && s?.price && (s.price.flat || s.price.min))
    const fallbackFree = services.find((s) => s?.isFree)
    const secondary = primary && fallbackFree && fallbackFree !== primary ? fallbackFree : (primary && fallbackPaid && fallbackPaid !== primary ? fallbackPaid : (fallbackPaid || fallbackFree))
    const distStr = typeof p?.distance === 'number' ? `${p.distance.toFixed(1)} mi` : ''

    // Provider header
    lines.push(`**${p.name}**`)

    // Services bullet
    const svcParts: string[] = []
    if (primary) {
      const pr = toPrice(primary)
      svcParts.push(`${String(primary.name || 'service')}${pr ? ` ${pr}` : ''}`.trim())
    } else if (fallbackFree || fallbackPaid) {
      const s = fallbackFree || fallbackPaid!
      const pr = toPrice(s)
      svcParts.push(`${String(s.name || 'service')}${pr ? ` ${pr}` : ''}`.trim())
    }
    if (secondary && secondary !== primary) {
      const pr2 = toPrice(secondary)
      svcParts.push(`${String(secondary.name || 'service')}${pr2 ? ` ${pr2}` : ''}`.trim())
    }
    if (svcParts.length) lines.push(`- Services: ${svcParts.join(', ')}`)

    // Features bullet (2–3 items)
    const features: string[] = []
    if (p.insurance?.selfPayOptions) features.push('Self-pay')
    if (p.insurance?.medicaid) features.push('Medicaid')
    if (p.insurance?.medicare) features.push('Medicare')
    // Include up to one carrier mention if available
    if (Array.isArray(p.insurance?.majorProviders) && p.insurance!.majorProviders!.length && features.length < 3) {
      const firstCarrier = String(p.insurance!.majorProviders![0])
      if (firstCarrier) features.push(firstCarrier)
    }
    if (distStr && features.length < 3) features.push(distStr)
    if (p.telehealth?.available && features.length < 3) features.push('Telehealth')
    if (features.length) lines.push(`- Features: ${features.slice(0, 3).join(' • ')}`)
  }

  // Top Pick spotlight (short and optional)
  let spotlight = ''
  if (sel.length > 0) {
    const top = sel[0]
    const services: Service[] = Array.isArray(top?.services) ? top.services : []
    const bestFree = services.find((s) => s?.isFree)
    const bestPaid = services.find((s) => !s?.isFree && s?.price && (s.price.flat || s.price.min))
    const priceStr = bestPaid ? toPrice(bestPaid) : null
    const dist = typeof top?.distance === 'number' ? `${top.distance.toFixed(1)} miles away` : undefined
    const accepts: string[] = []
    if (top?.insurance?.selfPayOptions) accepts.push('self-pay')
    if (top?.insurance?.medicaid) accepts.push('Medicaid')
    if (top?.insurance?.medicare) accepts.push('Medicare')
    const acceptsStr = accepts.length ? ` Accepts ${accepts.join(', ')}.` : ''
    const freeStr = bestFree ? ` Offers FREE ${String(bestFree.name || 'services')}.` : ''
    const paidStr = bestPaid ? ` ${String(bestPaid.name || 'service')} ${priceStr ? priceStr : ''}.` : ''
    const ratingStr = typeof top?.rating === 'number' ? ` Rated ${top.rating.toFixed(1)}★.` : ''
    const where = top?.addressLine || (top?.city && top?.state ? `${top.city}, ${top.state}` : '')
    spotlight = `\n\nTop Pick: ${top.name}${where ? ` — ${where}` : ''}${dist ? ` (${dist})` : ''}.${freeStr}${paidStr}${acceptsStr}${ratingStr}`
  }

  return `${lines.join('\n')}${spotlight}`
}

function normalizeName(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function findProviderByName(query: string, providers: Provider[]): Provider | null {
  const q = normalizeName(query)
  if (!q) return null
  
  // Common phrasings
  const patterns = [
    /tell\s+me\s+(?:more\s+)?about\s+(.+)/,
    /what\s+(?:services\s+)?(?:do|does)\s+(.+?)\s+(?:offer|provide|have)/,
    /info(?:rmation)?\s+(?:on|about)\s+(.+)/,
    /details?\s+(?:about|on)\s+(.+)/,
    /services\s+at\s+(.+)/,
    /(.+?)\s+services/,
    /(.+?)\s+clinic/,
    /(.+?)\s+center/
  ]
  
  let nameHint = q
  for (const pat of patterns) {
    const m = q.match(pat)
    if (m?.[1]) { 
      nameHint = m[1].trim()
      break
    }
  }
  
  const candidates = providers.map((p) => ({ p, n: normalizeName(String(p.name || '')) }))
  
  // Exact substring match
  const exact = candidates.find(c => nameHint && c.n.includes(nameHint))
  if (exact) return exact.p
  
  // Token overlap (fuzzy matching)
  const qTokens = new Set(nameHint.split(' ').filter(Boolean).filter(t => t !== 'the' && t.length > 1))
  let best: Provider | null = null
  let bestScore = 0
  
  for (const c of candidates) {
    const t = new Set(c.n.split(' ').filter(Boolean).filter(x => x !== 'the' && x.length > 1))
    const overlap = [...qTokens].filter(x => t.has(x)).length
    const score = overlap / Math.max(1, qTokens.size)
    if (score > bestScore) { 
      best = c.p
      bestScore = score
    }
  }
  
  return bestScore >= 0.5 ? best : null
}
// Removed unused helpers: summarizeProviderServices, selectProvidersFromContextByService, pickProvidersByState

async function extractStateFromConversation(messages: Message[], prev?: Partial<UserState>): Promise<UserState> {
  const url = `${AZURE_ENDPOINT}/openai/responses?api-version=${AZURE_API_VERSION}`
  const input = [
    ...messages
      .filter((m) => m && m.content && m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' || m.role === 'tool' ? 'assistant' : m.role,
        content: [{ type: m.role === 'assistant' || m.role === 'tool' ? 'output_text' : 'input_text', text: m.content }],
        name: m.name
      })),
    ...(prev ? [{ role: 'assistant' as const, content: [{ type: 'output_text' as const, text: `CURRENT_STATE_JSON:\n${JSON.stringify(prev)}` }] }] : [])
  ]
  const body = {
    model: AZURE_DEPLOYMENT,
    instructions:
      'Extract persistent user state from the conversation. Identify service_terms (e.g., mammogram, STI testing), free_only, accepts_medicaid, accepts_uninsured, accepts_medicare, telehealth_available, ssn_required, insurance_providers (carrier names like Cigna, Aetna, United Healthcare, Blue Cross), and location_text if mentioned (e.g., DC, Minneapolis). Carry forward previous service_terms on follow-ups unless user changes the topic. Return strict JSON per schema.',
    input,
    tools: [],
    tool_choice: 'none',
    text: { format: { type: 'json_schema', name: 'copilot_state', schema: STATE_SCHEMA, strict: true } },
    max_output_tokens: 200
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': AZURE_KEY as string },
      body: JSON.stringify(body)
    })
    if (!res.ok) return { service_terms: null, free_only: null, accepts_medicaid: null, accepts_uninsured: null, insurance_providers: null, location_text: null, accepts_medicare: null, telehealth_available: null, ssn_required: null }
    const data = await res.json()
    const text = safeExtractAzureText(data) || (isObject(data) && typeof (data as Record<string, unknown>).content === 'string' ? (data as Record<string, unknown>).content as string : '')
    const parsed = JSON.parse(text)
    return parsed
  } catch {
    return { service_terms: null, free_only: null, accepts_medicaid: null, accepts_uninsured: null, insurance_providers: null, location_text: null, accepts_medicare: null, telehealth_available: null, ssn_required: null }
  }
}

// ===== Price extraction helpers (avoid minute/time hallucinations) =====
function extractDollarAmounts(raw?: string): number[] {
  if (typeof raw !== 'string') return []
  const matches = raw.match(/\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/g) || []
  return matches
    .map((m) => Number(m.replace(/[^0-9.]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 100000)
}

function priceInfoFromService(s: Service): { text: string | null; numeric: number | null } {
  if (!s) return { text: null, numeric: null }
  if (s.isFree) return { text: 'FREE', numeric: 0 }
  const raw = (s as unknown as { price?: { raw?: string } }).price?.raw
  const dollars = extractDollarAmounts(raw)
  if (dollars.length) {
    const min = Math.min(...dollars)
    const max = Math.max(...dollars)
    return { text: min === max ? `$${min}` : `$${min}-${max}`, numeric: min }
  }
  // Fallbacks only if clearly numeric price fields exist
  if (typeof s?.price?.flat === 'number') return { text: `$${s.price.flat}`, numeric: s.price.flat }
  if (typeof s?.price?.min === 'number' && typeof s?.price?.max === 'number') {
    const min = s.price.min
    const max = s.price.max
    // Guard against common minute markers by requiring reasonable spread and values
    if (min > 0 && max > 0 && max >= min && max <= 100000) {
      return { text: min === max ? `$${min}` : `$${min}-${max}`, numeric: min }
    }
  }
  if (typeof s?.price?.min === 'number') {
    const min = s.price.min
    if (min > 0 && min <= 100000) return { text: `from $${min}`, numeric: min }
  }
  return { text: null, numeric: null }
}

function collectPriceStats(services: Service[]): PriceStat {
  const samples: PriceSample[] = []
  for (const s of Array.isArray(services) ? services : []) {
    const info = priceInfoFromService(s)
    if (info.numeric !== null) samples.push({ name: s?.name || 'Service', price: info.numeric })
  }
  if (!samples.length) return { samples: [] }
  const values = samples.map(x => x.price)
  return { min: Math.min(...values), max: Math.max(...values), samples }
}

type SummarizerServicePreview = { name?: string; isFree: boolean; isDiscounted: boolean; price_info: string | null }
type SummarizerProviderContext = {
  id: string
  name?: string
  rating: number | null
  address?: string
  distance: number | null
  distance_bucket: 'near' | 'farther' | null
  accepts_uninsured: boolean
  medicaid: boolean
  medicare: boolean
  free_services: number
  total_services: number
  insurance_providers: string[]
  carrier_matches: string[]
  carrier_match_count: number
  price_min: number | null
  price_max: number | null
  price_samples: PriceSample[]
  notable_services: SummarizerServicePreview[]
  priced_services: SummarizerServicePreview[]
  affordable_services: SummarizerServicePreview[]
}
type SummarizerContext = { providers: SummarizerProviderContext[]; summary: { provider_count: number; carriers_asked: string[]; carriers_match_count: number; uninsured_count: number; medicaid_count: number; free_service_totals: number } }

function buildSummarizerContext(providers: Provider[], state: UserState): SummarizerContext {
  const distanceBucket = (mi?: number) => {
    if (typeof mi !== 'number' || Number.isNaN(mi)) return null
    if (mi <= 5) return 'near'
    if (mi <= 15) return 'near'
    if (mi <= 50) return 'farther'
    return null
  }
  const asked = (state.insurance_providers || []).map((c) => (c || '').toLowerCase())

  const ctxProviders: SummarizerProviderContext[] = providers.slice(0, 6).map((p) => {
    const services: Service[] = Array.isArray(p.services) ? p.services : []
    
    // Sort services to show a mix of free and priced
    const sorted = [...services].sort((a, b) => {
      // We want a mix, not just free services first
      const aHasGoodPrice = !!a?.price && ((typeof a.price.flat === 'number' && a.price.flat < 200) || (typeof a.price.min === 'number' && a.price.min < 200))
      const bHasGoodPrice = !!b?.price && ((typeof b.price.flat === 'number' && b.price.flat < 200) || (typeof b.price.min === 'number' && b.price.min < 200))
      const aScore = (a?.isFree ? 2 : 0) + (aHasGoodPrice ? 1.5 : 0) + (a?.isDiscounted ? 1 : 0)
      const bScore = (b?.isFree ? 2 : 0) + (bHasGoodPrice ? 1.5 : 0) + (b?.isDiscounted ? 1 : 0)
      return bScore - aScore
    })
    const priced: SummarizerServicePreview[] = services
      .map((s) => ({ 
        name: s?.name, 
        price_info: priceInfoFromService(s).text,
        isFree: !!s?.isFree, 
        isDiscounted: !!s?.isDiscounted 
      }))
      .filter((s) => !!s.price_info)
      .slice(0, 8)
          // Include both free and affordable paid services
          const affordableFree = services.filter((s) => s?.isFree).slice(0, 2)
          const affordablePaid = services
            .filter((s) => !s?.isFree && (s?.isDiscounted || (typeof s?.price?.min === 'number' && s.price!.min! < 200)))
            .slice(0, 6)
          const affordable: SummarizerServicePreview[] = [...affordableFree, ...affordablePaid]
            .map((s) => ({ 
              name: s?.name, 
              isFree: !!s?.isFree, 
              isDiscounted: !!s?.isDiscounted, 
              price_info: priceInfoFromService(s).text 
            }))
            .slice(0, 8)
          // Get a mix of free and priced services for variety
          const freeServices = sorted.filter((s) => s?.isFree).slice(0, 1)
          const pricedServices = sorted.filter((s) => !s?.isFree && s?.price).slice(0, 3)
          const mixedServices = [...freeServices, ...pricedServices].slice(0, 4)
          
          const notable: SummarizerServicePreview[] = mixedServices.map((s) => ({ 
        name: s?.name, 
        isFree: !!s?.isFree, 
        isDiscounted: !!s?.isDiscounted, 
        price_info: priceInfoFromService(s).text 
      }))
          const carrierMatches: string[] = Array.isArray(p.insurance?.majorProviders)
      ? p.insurance!.majorProviders!.filter((ip: string) => asked.includes((ip || '').toLowerCase())).slice(0, 3)
      : []
    const priceStats = collectPriceStats(services)
    return {
      id: String(p._id || p.id),
      name: p.name,
      rating: p.rating ?? null,
      address: p.address,
      distance: p.distance ?? null,
      distance_bucket: distanceBucket(p.distance) as 'near' | 'farther' | null,
      accepts_uninsured: !!p.insurance?.selfPayOptions,
      medicaid: !!p.insurance?.medicaid,
      medicare: !!p.insurance?.medicare,
      free_services: (Array.isArray(p.services) ? p.services : []).filter((s) => s.isFree).length ?? 0,
      total_services: Array.isArray(p.services) ? p.services.length : 0,
      insurance_providers: Array.isArray(p.insurance?.majorProviders) ? p.insurance!.majorProviders!.slice(0, 10) : [],
      carrier_matches: carrierMatches,
      carrier_match_count: carrierMatches.length,
      price_min: priceStats.min ?? null,
      price_max: priceStats.max ?? null,
      price_samples: priceStats.samples.slice(0, 6),
      notable_services: notable,
      priced_services: priced,
      affordable_services: affordable
    }
  })

  const summary = {
    provider_count: providers.length,
    carriers_asked: state.insurance_providers || [],
    carriers_match_count: ctxProviders.filter((p) => (p.carrier_matches || []).length > 0).length,
    uninsured_count: providers.filter((p) => p.insurance?.selfPayOptions).length,
    medicaid_count: providers.filter((p) => p.insurance?.medicaid).length,
    free_service_totals: ctxProviders.reduce((sum: number, p) => sum + (p.free_services || 0), 0)
  }

  return { providers: ctxProviders, summary }
}

async function summarizeWithSearchContext(
  question: string,
  effectiveQuery: string,
  state: UserState,
  searchJson: { providers?: Provider[]; focus_provider_id?: string | null },
  mode: Intent,
  flavor?: ComparatorFlavor
): Promise<SummarizeResult> {
  const url = `${AZURE_ENDPOINT}/openai/responses?api-version=${AZURE_API_VERSION}`
  const providers: Provider[] = Array.isArray(searchJson?.providers) ? searchJson.providers as Provider[] : []
  const full = buildSummarizerContext(providers, state)
  
  // Attach rich focus provider if present
  let focusProvider: Provider | null = null
  if (searchJson && typeof searchJson.focus_provider_id === 'string') {
    focusProvider = providers.find((p) => String(p._id || p.id) === String(searchJson.focus_provider_id)) || null
    
    // Debug what we're sending to the LLM
    if (focusProvider) {
      console.log(`Sending focus provider to LLM: ${focusProvider.name} with ${focusProvider.services?.length || 0} services`)
    }
  }
  const context = { ...full, focus_provider: focusProvider || null }

  const input = [
    { role: 'user', content: [{ type: 'input_text', text: `Question: ${question}` }] },
    { role: 'assistant', content: [{ type: 'output_text', text: `EFFECTIVE_QUERY: ${effectiveQuery}` }] },
    { role: 'assistant', content: [{ type: 'output_text', text: `STATE_JSON:\n${JSON.stringify(state)}` }] },
    { role: 'assistant', content: [{ type: 'output_text', text: `MODE: ${mode}${flavor ? ` (${flavor})` : ''}` }] },
    { role: 'assistant', content: [{ type: 'output_text', text: `FULL_SEARCH_CONTEXT:\n${JSON.stringify(context)}` }] }
  ]

  // Light style hint (varies with query/state) to keep outputs natural
  const STYLE_HINTS = [
    'Keep tone warm and encouraging.',
    'Keep tone practical and direct.',
    'Keep tone reassuring and simple.',
    'Keep tone upbeat and action-oriented.'
  ]
  const seedStr = `${question}|${JSON.stringify(state || {})}`
  const styleHash = Math.abs(seedStr.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0))
  const styleHint = STYLE_HINTS[styleHash % STYLE_HINTS.length]

  // Keep multi-provider concise; allow richer single-provider profiles
  const SUM_TOKENS = providers.length > 1
    ? Number(process.env.COPILOT_SUMMARY_TOKENS_MULTI || 450)
    : Number(process.env.COPILOT_SUMMARY_TOKENS || 800)
  const body = {
    model: AZURE_DEPLOYMENT,
    instructions: `You are SIE Wellness Copilot, a friendly healthcare assistant helping people find affordable care.

Question: ${question}
Mode: ${mode}
Available: ${providers.length} providers
${focusProvider ? `Focus: ${focusProvider.name}` : ''}
Tone: ${styleHint}


${providers.length === 1 ? `
SINGLE PROVIDER PROFILE - Write a detailed, helpful response about ${providers[0].name}:
- Start with: "${providers[0].name} offers..."
- List 3-4 specific services with exact prices (mix of free and paid)
- Mention location and distance if available
- Note insurance acceptance naturally
- Do NOT include calls-to-action or contact instructions. Do NOT print phone numbers, emails, or URLs.` : `
WRITE A CONCISE, SCANNABLE ANSWER:

1) Start with one TL;DR sentence summarizing count and affordability (e.g., "TL;DR: Found 5 therapy options under $60 within 10 miles").
2) For each provider (3–6 total), format exactly like this:
   **Provider Name**
   - Services: list the service that best matches the user’s request first (e.g., "individual therapy from $45"), then 1 other notable service with price or "Free consult" if present.
   - Features: include 2–3 items from [Self-pay, Medicaid/Medicare or top 1–2 carriers, Telehealth, distance like "6.1 mi"]. Avoid more than 3 features.
3) End with a short Top Pick mini-spotlight (2–3 sentences) explaining why it’s best (price/free options/distance/insurance), with 2–3 concrete services+prices.

CRITICAL REQUIREMENTS:
- Services must be directly related to the user’s request; always show a concrete price or "Free".
- Keep bullets compact; no paragraphs inside bullets.
- Ground strictly in FULL_SEARCH_CONTEXT; no invented claims.
- No calls-to-action; do not print phone numbers, emails, or URLs.
- If key info is missing (e.g., location), append one short clarifying question.`}

Return JSON:
- "answer": your TL;DR + bullets + optional Top Pick mini-spotlight
- "selected_provider_ids": Array of ALL provider IDs mentioned`,
    input,
    tools: [],
    tool_choice: 'none',
    text: { format: { type: 'json_schema', name: 'copilot_response', schema: RESPONSE_SCHEMA, strict: true } },
    max_output_tokens: SUM_TOKENS
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': AZURE_KEY as string },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('Azure Responses API error:', res.status, detail)
    
    // Return a simple fallback if Azure fails
    if (providers.length === 1) {
      const p = providers[0]
      return {
        answer: `${p.name} is located at ${p.address || 'address not available'}. They offer ${p.services?.length || 'various'} services${p.free_services ? ` including ${p.free_services} free options` : ''}. ${p.accepts_uninsured ? 'They accept uninsured patients.' : ''} Contact details are available on the provider card.`,
        selected_provider_ids: [String(p._id || p.id)]
      }
    }
    return { answer: undefined }
  }

  const data = await res.json()
  console.log('Azure Responses API raw response:', JSON.stringify(data).slice(0, 500))
  const textCandidate = safeExtractAzureText(data)

  if (!textCandidate) {
    console.error('No text output from Azure:', data)
    return { answer: undefined }
  }

  try {
    const parsed = JSON.parse(textCandidate)
    console.log('Parsed LLM response:', JSON.stringify(parsed).slice(0, 300))
    return parsed
  } catch {
    console.error('Failed to parse LLM JSON:', textCandidate.slice(0, 200))
    return { answer: typeof textCandidate === 'string' ? textCandidate : undefined }
  }
}

type ExecReturn = GeoForwardResult | GeoReverseResult | SearchResponse | FilterResponse | { providers: Provider[] } | { error: string }
async function execTool(name: 'geo_forward', args: { q: string; country?: string }): Promise<GeoForwardResult>
async function execTool(name: 'geo_reverse', args: { lat: number; lon: number }): Promise<GeoReverseResult>
async function execTool(name: 'search_providers', args: { query: string; location?: Coordinates; filters?: SearchFilters; limit?: number }): Promise<SearchResponse>
async function execTool(name: 'filter_providers', args: { filters?: SearchFilters; location?: Coordinates; limit?: number }): Promise<FilterResponse>
async function execTool(name: 'provider_by_name', args: { name: string; location?: Coordinates; limit?: number }): Promise<{ providers: Provider[] }>
async function execTool(name: string, args: unknown): Promise<ExecReturn> {
  try {
    if (name === 'geo_forward') {
      const base = SELF_BASE_URL
      const a = args as { q: string; country?: string }
      const r = await fetch(`${base}/api/geo/forward?q=${encodeURIComponent(a.q)}${a.country ? `&country=${encodeURIComponent(a.country)}` : ''}`, { cache: 'no-store' })
      return await r.json() as GeoForwardResult
    }
    if (name === 'geo_reverse') {
      const base = SELF_BASE_URL
      const a = args as { lat: number; lon: number }
      const r = await fetch(`${base}/api/geo/reverse?lat=${encodeURIComponent(a.lat)}&lon=${encodeURIComponent(a.lon)}`, { cache: 'no-store' })
      return await r.json() as GeoReverseResult
    }
    if (name === 'search_providers') {
      const base = SELF_BASE_URL
      // Use copilot-specific search endpoint for prices-only collection
      const r = await fetch(`${base}/api/copilot/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: (args as { query: string }).query,
          location: (args as { location?: Coordinates }).location,
          filters: (args as { filters?: SearchFilters }).filters || {},
          limit: Math.min(((args as { limit?: number }).limit || 10), 15)
        })
      })
      return await r.json() as SearchResponse
    }
    if (name === 'filter_providers') {
      const base = SELF_BASE_URL
      // Use regular filter endpoint over providers collection
      const r = await fetch(`${base}/api/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: (args as { filters?: SearchFilters }).filters || {},
          location: (args as { location?: Coordinates }).location,
          limit: Math.min(((args as { limit?: number }).limit || 10), 20)
        })
      })
      return await r.json() as FilterResponse
    }
    if (name === 'provider_by_name') {
      const base = SELF_BASE_URL
      const a = args as { name: string; location?: Coordinates; limit?: number }
      const r = await fetch(`${base}/api/copilot/provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: a.name,
          location: a.location,
          limit: Math.min(a.limit || 3, 5)
        })
      })
      const data = await r.json() as { providers: Provider[] }
      return data
    }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
  return { error: 'unknown_tool' }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query: string = (body?.query || '').toString()
    const conversation: Message[] = Array.isArray(body?.conversation) ? body.conversation as Message[] : []
    const prevState: Partial<UserState> | undefined = body?.state && typeof body.state === 'object' ? body.state as Partial<UserState> : undefined
    const userLocation: Coordinates | undefined = body?.location as Coordinates | undefined
    const contextProviders: Provider[] | undefined = Array.isArray(body?.contextProviders) ? (body.contextProviders as Provider[]) : undefined

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const messages: Message[] = [...conversation.filter(Boolean), { role: 'user', content: query }]

    // 1) Extract user state and apply heuristics
    const extracted = await extractStateFromConversation(messages, prevState)
    const heur = heuristicFromText(query)
    const merged = mergeState(prevState, extracted)
    const userState: UserState = mergeState(merged, {
      service_terms: Array.isArray(heur.service_terms) && heur.service_terms.length ? heur.service_terms : null,
      free_only: typeof heur.free_only === 'boolean' ? heur.free_only : null,
      accepts_medicaid: typeof heur.accepts_medicaid === 'boolean' ? heur.accepts_medicaid : null,
      accepts_uninsured: typeof heur.accepts_uninsured === 'boolean' ? heur.accepts_uninsured : null,
      insurance_providers: Array.isArray(heur.insurance_providers) && heur.insurance_providers.length ? heur.insurance_providers : null,
      location_text: heur.location_text || null,
      accepts_medicare: typeof heur.accepts_medicare === 'boolean' ? heur.accepts_medicare : null,
      telehealth_available: typeof heur.telehealth_available === 'boolean' ? heur.telehealth_available : null,
      ssn_required: typeof heur.ssn_required === 'boolean' ? heur.ssn_required : null
    })

    // 2) Use provided location or geocode if we have a location hint
    let derivedLocation: { latitude: number; longitude: number } | undefined
    
    // Prefer user-provided location over text-based geocoding
    if (userLocation) {
      derivedLocation = userLocation
    } else if (userState?.location_text) {
      const geo = await execTool('geo_forward', { q: userState.location_text, country: 'us' })
      if (geo?.ok && typeof geo.latitude === 'number' && typeof geo.longitude === 'number') {
        derivedLocation = { latitude: geo.latitude, longitude: geo.longitude }
      }
    }

    // 3) Build effective query & filters  
    const effectiveQuery = Array.isArray(userState?.service_terms) && userState.service_terms.length
      ? userState.service_terms.join(' ')
      : query

    const filtersFromState: SearchFilters = {
      acceptsMedicaid: userState.accepts_medicaid || undefined,
      acceptsUninsured: userState.accepts_uninsured || undefined,
      acceptsMedicare: userState.accepts_medicare || undefined,
      telehealthAvailable: userState.telehealth_available || undefined,
      ssnRequired: typeof userState.ssn_required === 'boolean' ? userState.ssn_required : undefined,
      freeOnly: userState.free_only || undefined,
      insuranceProviders: Array.isArray(userState.insurance_providers) && userState.insurance_providers.length ? userState.insurance_providers : undefined
    }

    // 4) Decide routing: filter_only vs service_search vs hybrid
    let routeDecision = await routeWithLLM(query, userState)
    if (!routeDecision) {
      routeDecision = decideRouteFallback(query, userState)
    }

    // Normalize filters from decision + state
    const decidedFilters = {
      ...filtersFromState,
      ...(routeDecision?.filters || {})
    }

    // Sanitize LLM-injected carriers: only allow carriers explicitly requested by the user
    const askedCarriers = Array.isArray(userState.insurance_providers) && userState.insurance_providers.length
      ? userState.insurance_providers
      : undefined
    if (decidedFilters.insuranceProviders) {
      if (!askedCarriers || askedCarriers.length === 0) {
        // Drop carriers suggested by LLM if user didn't ask
        delete decidedFilters.insuranceProviders
        console.log('Sanitized carriers: removed LLM-suggested insuranceProviders since user did not specify any')
      } else {
        // Force carriers to exactly what user asked
        decidedFilters.insuranceProviders = askedCarriers
        console.log('Sanitized carriers: enforcing user-specified insuranceProviders', askedCarriers)
      }
    }

    // Ensure filter_only never sends an empty filters object (avoid 400)
    if (routeDecision?.route === 'filter_only') {
      const hasAny = decidedFilters && Object.values(decidedFilters).some(v => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
      if (!hasAny) {
        // Derive minimum viable filter from text/state for SSN or affordability hints
        if (typeof userState.ssn_required === 'boolean') {
          decidedFilters.ssnRequired = userState.ssn_required
        } else {
          // Default safe assumption for the common "no SSN" query
          if (/no\s*ssn|without\s*ssn|ssn\s*(not\s*)?required/i.test(query)) decidedFilters.ssnRequired = false
        }
        if (typeof userState.accepts_medicaid === 'boolean') decidedFilters.acceptsMedicaid = userState.accepts_medicaid
        if (typeof userState.accepts_medicare === 'boolean') decidedFilters.acceptsMedicare = userState.accepts_medicare
        if (typeof userState.accepts_uninsured === 'boolean') decidedFilters.acceptsUninsured = userState.accepts_uninsured
        if (typeof userState.telehealth_available === 'boolean') decidedFilters.telehealthAvailable = userState.telehealth_available
      }
    }

    const decidedQuery = (routeDecision?.service_query && routeDecision.service_query.trim()) || effectiveQuery

    // If router indicates provider profile, try to resolve provider from prior context first
    let profileDirectProvider: Provider | null = null
    if (routeDecision?.route === 'provider_profile') {
      const providerHint = (routeDecision as { provider_name?: string | null })?.provider_name || null
      if (Array.isArray(contextProviders) && contextProviders.length) {
        const foundFromContext = findProviderByName(providerHint || query, contextProviders)
        if (foundFromContext) {
          profileDirectProvider = foundFromContext
          console.log('Provider profile resolved from contextProviders:', { name: profileDirectProvider.name })
        }
      }
      // Fallback to DB by name if not found in context
      if (!profileDirectProvider) {
        const fetched = await execTool('provider_by_name', { name: providerHint || query, location: derivedLocation, limit: 1 }) as unknown as { providers?: Provider[] }
        if (Array.isArray(fetched?.providers) && fetched.providers.length) {
          profileDirectProvider = fetched.providers[0]!
          console.log('Provider profile fetched by name from DB:', { name: profileDirectProvider.name })
        } else {
          console.log('Provider profile not found by name; will continue without direct provider')
        }
      }
    }

    // 5) Execute retrieval according to route
    let searchResponse: SearchResponse | FilterResponse | null = null
    if (routeDecision?.route === 'filter_only') {
      // Pure filter pass
      searchResponse = await execTool('filter_providers', {
        filters: decidedFilters,
        location: derivedLocation,
        limit: 12
      })
    } else if (routeDecision?.route === 'provider_profile') {
      // Skip large search; we'll summarize the single provider if available, otherwise do a light fallback search
      if (!profileDirectProvider) {
        // Light fallback search to provide some options if name lookup failed
        searchResponse = await execTool('search_providers', {
          query: decidedQuery,
          location: derivedLocation,
          filters: decidedFilters,
          limit: 6
        })
      } else {
        searchResponse = { providers: [profileDirectProvider], provider_count: 1, service_count: Array.isArray(profileDirectProvider.services) ? profileDirectProvider.services.length : 0 }
      }
    } else if (routeDecision?.route === 'service_search' || routeDecision?.route === 'hybrid') {
      searchResponse = await execTool('search_providers', {
        query: decidedQuery,
        location: derivedLocation,
        filters: decidedFilters,
        limit: RESULT_LIMIT
      })
      // If sparse results and we are hybrid, try filter-only fallback once
      if (routeDecision?.route === 'hybrid') {
        const provCount = Array.isArray(searchResponse?.providers) ? searchResponse.providers.length : 0
        if (provCount < 3) {
          const fallback = await execTool('filter_providers', {
            filters: decidedFilters,
            location: derivedLocation,
            limit: 12
          })
          if (Array.isArray(fallback?.providers) && fallback.providers.length >= provCount) {
            searchResponse = fallback
          }
        }
      }
    } else {
      // Safety: default to service search
      searchResponse = await execTool('search_providers', {
        query: decidedQuery,
        location: derivedLocation,
        filters: decidedFilters,
        limit: RESULT_LIMIT
      })
    }

    const providers: Provider[] = Array.isArray(searchResponse?.providers) ? (searchResponse!.providers as Provider[]).slice(0, RESULT_LIMIT) : []

    // 5) If they asked a referential follow-up like "which of those ..." and we have prior providers,
    // try to satisfy from context first by matching service tokens. Only if no matches are found,
    // we will proceed with the regular flow.
    let refinedProviders: Provider[] = providers
    if (/\b(those|them|the\s+ones)\b/i.test(query) && Array.isArray(contextProviders) && contextProviders.length) {
      // Just use the context providers directly; let the LLM inspect their services
      refinedProviders = contextProviders.slice(0, 6)
    }

    // Carrier constraints from state
    if (Array.isArray(userState.insurance_providers) && userState.insurance_providers.length) {
      const asked = userState.insurance_providers.map((c) => (c || '').toLowerCase())
      const hasCarrier = (p: Provider) => Array.isArray(p.insurance?.majorProviders) && p.insurance!.majorProviders!.some((x: string) => asked.includes((x || '').toLowerCase()))
      const carrierMatches = providers.filter(hasCarrier)
      if (carrierMatches.length === 0) {
        const filtered = await execTool('filter_providers', {
          filters: {
            insuranceProviders: userState.insurance_providers,
            freeOnly: userState.free_only || undefined,
            acceptsUninsured: userState.accepts_uninsured || undefined,
            acceptsMedicaid: userState.accepts_medicaid || undefined
          },
          location: derivedLocation,
          limit: 12
        })
        refinedProviders = Array.isArray(filtered?.providers) ? filtered.providers : providers
      } else {
        refinedProviders = carrierMatches
      }
    }

    // 6) Intent detection & ranking
    const intentDetected: Intent = (function detectIntent(q: string): Intent {
      const s = String(q || '').toLowerCase()
      if (/(what|which).*services.*(do|does)|\bhours\b|\bcost at\b|\bphone for\b|\baddress of\b/.test(s)) return 'ProviderProfile'
      if (/accepts?.*\b(cigna|aetna|medicaid|uninsured|medicare|uhc|united|bcbs|blue\s?cross)\b/.test(s)) return 'ProviderProfile'
      if (/\b(cheapest|lowest|affordable|cost|price|closest|near( me)?|distance|miles|mi\b|km\b|best|top|highest rated|most free|free only)\b/.test(s)) return 'Compare'
      if (/\b(medicaid|medicare|cigna|aetna|kaiser|uhc|united|bcbs|blue\s?cross)\b.*\b(cover|coverage|copay|network|in[-\s]?network)\b/.test(s)) return 'ExplainCoverage'
      return 'Summarize'
    })(query)

    const flavor: ComparatorFlavor | undefined = intentDetected === 'Compare'
      ? (function comparatorFlavor(q: string): ComparatorFlavor {
          const s = String(q || '').toLowerCase()
          if (/cheapest|lowest|affordable|cost|price/.test(s)) return 'cheapest'
          if (/closest|near( me)?|distance|miles|mi\b|km\b/.test(s)) return 'closest'
          if (/most free|free only|no cost|sliding scale/.test(s)) return 'mostFree'
          return 'best'
        })(query)
      : undefined

    type ProviderWithPrice = Provider & { __price: PriceStat }
    const withPrice: ProviderWithPrice[] = refinedProviders.map((p) => ({ ...p, __price: collectPriceStats(Array.isArray(p.services) ? (p.services as Service[]) : []) }))

    function hasCarrierMatch(p: Provider, asked: string[]): boolean {
      return Array.isArray(p.insurance?.majorProviders) && p.insurance!.majorProviders!.some((x: string) => asked.includes((x || '').toLowerCase()))
    }

    function rankForQuery(intent: Intent, providersIn: ProviderWithPrice[], state: UserState, f?: ComparatorFlavor): ProviderWithPrice[] {
      const arr = [...providersIn]
      const asked = (state.insurance_providers || []).map((c) => (c || '').toLowerCase())
      const distanceAsc = (a: ProviderWithPrice, b: ProviderWithPrice) => (typeof a.distance === 'number' && typeof b.distance === 'number') ? (a.distance - b.distance) : 0
      const ratingDesc = (a: ProviderWithPrice, b: ProviderWithPrice) => (Number(b.rating || 0) - Number(a.rating || 0))
      const freeDesc = (a: ProviderWithPrice, b: ProviderWithPrice) => (Number(b.free_services || 0) - Number(a.free_services || 0))
      const priceMinAsc = (a: ProviderWithPrice, b: ProviderWithPrice) => {
        const av = typeof a.__price?.min === 'number' ? a.__price.min as number : Number.POSITIVE_INFINITY
        const bv = typeof b.__price?.min === 'number' ? b.__price.min as number : Number.POSITIVE_INFINITY
        return av - bv
      }

      if (intent === 'Compare') {
        switch (f) {
          case 'cheapest':
            arr.sort((a, b) => priceMinAsc(a, b) || freeDesc(a, b) || ratingDesc(a, b) || distanceAsc(a, b))
            break
          case 'closest':
            arr.sort((a, b) => distanceAsc(a, b) || freeDesc(a, b) || ratingDesc(a, b) || priceMinAsc(a, b))
            break
          case 'mostFree':
            arr.sort((a, b) => freeDesc(a, b) || distanceAsc(a, b) || ratingDesc(a, b) || priceMinAsc(a, b))
            break
          case 'best':
          default:
            arr.sort((a, b) => ratingDesc(a, b) || freeDesc(a, b) || priceMinAsc(a, b) || distanceAsc(a, b))
            break
        }
        return arr
      }

      // Summarize / ExplainCoverage: nudge carrier matches to top (stable partition)
      if (asked.length) {
        const matched = arr.filter(p => hasCarrierMatch(p, asked))
        const others = arr.filter(p => !hasCarrierMatch(p, asked))
        return [...matched, ...others]
      }
      return arr
    }

    // If user refers to previous list, prefer context providers; LLM will reason over their services
    const refersToPrevious = /\b(those|them|the\s+ones)\b/i.test(query)
    const baseForRanking: ProviderWithPrice[] = (refersToPrevious && Array.isArray(contextProviders) && contextProviders.length)
      ? (withPrice.length ? withPrice.filter((p) => contextProviders.some((c) => String(c._id || c.id) === String(p._id || p.id))) : (contextProviders as unknown as ProviderWithPrice[]))
      : withPrice

    const rankedProviders: ProviderWithPrice[] = rankForQuery(intentDetected, baseForRanking, userState, flavor).slice(0, RESULT_LIMIT)

    // 7) Summarize with search context (provider-profile aware)
    const directProvider = profileDirectProvider || findProviderByName(query, (Array.isArray(contextProviders) && contextProviders.length ? (contextProviders as Provider[]) : (rankedProviders as Provider[])))
    
    // If asking about a specific provider, focus ONLY on that provider
    const providersForLLM: Provider[] = directProvider 
      ? [directProvider]
      : (rankedProviders as Provider[]).slice(0, RESULT_LIMIT)
    
    // If the router selected filter_only, skip the Azure summarizer entirely
    // and rely on the deterministic fallback text.
    const summary: SummarizeResult = routeDecision?.route === 'filter_only'
      ? { answer: undefined, selected_provider_ids: undefined }
      : await summarizeWithSearchContext(
          query,
          effectiveQuery,
          userState,
          {
            ...(searchResponse || {}),
            providers: providersForLLM,
            focus_provider_id: directProvider ? String(directProvider._id || directProvider.id) : null
          },
          directProvider ? 'ProviderProfile' : intentDetected,
          flavor
        )

    // If model didn't select IDs, choose deterministically
    let selectedIds: string[] | undefined = Array.isArray(summary?.selected_provider_ids) ? summary!.selected_provider_ids! : undefined
    if ((!selectedIds || selectedIds.length === 0) && rankedProviders.length) {
      if (directProvider) {
        // For provider profile, only select that one provider
        selectedIds = [String(directProvider._id || directProvider.id)]
      } else {
        // Filter providers to only those matching the service terms
        let filteredProviders = rankedProviders
        if (userState.service_terms?.some(term => /dental|dentist/.test(term.toLowerCase()))) {
          // For dental queries, only select actual dental providers
          filteredProviders = rankedProviders.filter((p) => 
            /dent|oral/i.test(p.category) || 
            (Array.isArray(p.services) ? p.services : []).some((s: Service) => /dent|teeth|tooth|oral|gum|cavity|filling|crown|cleaning/i.test(s.name))
          )
        }
        
        // Always try to return up to 6 providers with variety
        const maxProviders = 6
        
        // Ensure we get a mix of free and priced services
        const withFree = filteredProviders.filter((p) => 
          (Array.isArray(p.services) ? p.services : []).some((s) => s.isFree)
        )
        const withPriced = filteredProviders.filter((p) => 
          (Array.isArray(p.services) ? p.services : []).some((s) => !s.isFree && s.price && (s.price.flat || s.price.min))
        )
        
        // Select providers to ensure variety
        const selectedSet = new Set<string>()
        
        // Add up to 2 providers with free services
        withFree.slice(0, 2).forEach((p) => {
          selectedSet.add(String(p._id || p.id))
        })
        
        // Add up to 4 providers with priced services
        withPriced.slice(0, 4).forEach((p) => {
          selectedSet.add(String(p._id || p.id))
        })
        
        // Fill remaining spots with any providers
        if (selectedSet.size < maxProviders) {
          filteredProviders
            .filter((p) => !selectedSet.has(String(p._id || p.id)))
            .slice(0, maxProviders - selectedSet.size)
            .forEach((p) => {
              selectedSet.add(String(p._id || p.id))
            })
        }
        
        selectedIds = Array.from(selectedSet)
      }
    }

    // Use LLM answer if available, otherwise generate a provider-specific fallback
    let answerText: string
    if (summary?.answer && typeof summary.answer === 'string' && summary.answer.trim()) {
      // Keep model output as-is; our prompt now requests bullet lines + 2–3 sentence summary
      answerText = summary.answer
    } else if (directProvider) {
      // Generate a provider-specific response if LLM failed (no calls-to-action)
      const p = directProvider
      const services: Service[] = Array.isArray(p.services) ? p.services : []
      const freeServices = services.filter((s) => s.isFree)
      const lines: string[] = []
      
      lines.push(`**${p.name}**`)
      if (p.addressLine) lines.push(`📍 ${p.addressLine}`)
      else if (p.city && p.state) lines.push(`📍 ${p.city}, ${p.state}`)
      // No phone/email/URL in fallback; keep contact in provider card only
      if (p.insurance?.selfPayOptions) lines.push(`✅ Accepts self-pay patients`)
      if (p.insurance?.medicaid) lines.push(`✅ Accepts Medicaid`)
      if (p.insurance?.medicare) lines.push(`✅ Accepts Medicare`)
      
      if (services.length > 0) {
        lines.push('')
        lines.push(`They offer ${services.length} services${freeServices.length > 0 ? ` including ${freeServices.length} free option${freeServices.length > 1 ? 's' : ''}` : ''}:`)
        
        // List up to 5 services sorted by price
        const sortedServices = [...services].sort((a, b) => {
          if (a?.isFree && !b?.isFree) return -1
          if (!a?.isFree && b?.isFree) return 1
          const aPrice = (typeof a?.price?.min === 'number' ? a.price!.min! : (typeof a?.price?.flat === 'number' ? a.price!.flat! : 1000))
          const bPrice = (typeof b?.price?.min === 'number' ? b.price!.min! : (typeof b?.price?.flat === 'number' ? b.price!.flat! : 1000))
          return aPrice - bPrice
        })
        
        const topServices = sortedServices.slice(0, 5)
        topServices.forEach((s) => {
          let priceStr = ''
          if (s.isFree) {
            priceStr = 'FREE'
          } else if (s.price) {
            if (s.price.flat) priceStr = `$${s.price.flat}`
            else if (s.price.min && s.price.max) priceStr = `$${s.price.min}-${s.price.max}`
            else if (s.price.min) priceStr = `from $${s.price.min}`
          }
          lines.push(`• ${s.name}${priceStr ? ` - ${priceStr}` : ''}`)
        })
        
        if (services.length > 5) {
          lines.push(`...and ${services.length - 5} more services`)
        }
      } else {
        lines.push('No specific service listings available. See provider card for details.')
      }
      
      answerText = lines.join('\n')
    } else {
      answerText = naturalFallback(userState, rankedProviders, selectedIds || [], query)
    }

    // Reorder providers according to selected ids, but if a direct provider is present, return ONLY that provider
    let finalProviders: Provider[] = rankedProviders as Provider[]
    if (directProvider) {
      finalProviders = [directProvider]
      console.log('Final providers set to single direct provider:', { name: directProvider.name })
    } else if (Array.isArray(selectedIds) && selectedIds.length) {
      const byId = new Map<string, Provider>((rankedProviders as Provider[]).map((p) => [String(p._id || p.id), p]))
      const picked = selectedIds.map((id) => byId.get(String(id))).filter((p): p is Provider => Boolean(p))
      if (picked.length) finalProviders = picked
      
      // Log what was selected for debugging
      console.log('Selected providers:', picked.map(p => ({ 
        name: p.name, 
        category: p.category,
        hasDentalServices: (Array.isArray(p.services) ? p.services : []).some((s: Service) => /dent|teeth|tooth|oral|gum|cavity|filling|crown|cleaning/i.test(s.name))
      })))
    }

    const updatedConversation: Message[] = [...messages, { role: 'assistant', content: answerText }]

    // Compute debug counts with sensible fallbacks when upstream doesn't provide them
    const sr = searchResponse
    const debugProviderCount = directProvider
      ? 1
      : (sr && 'provider_count' in (sr as SearchResponse)
        ? ((sr as SearchResponse).provider_count ?? finalProviders.length)
        : (sr && 'total_count' in (sr as FilterResponse) ? ((sr as FilterResponse).total_count ?? finalProviders.length) : finalProviders.length))
    let debugServiceCount: number | undefined = sr && 'service_count' in (sr as SearchResponse) ? (sr as SearchResponse).service_count : undefined
    if (typeof debugServiceCount !== 'number' || Number.isNaN(debugServiceCount)) {
      try {
        debugServiceCount = Array.isArray(finalProviders)
          ? finalProviders.reduce((sum: number, p: Provider) => sum + (Array.isArray(p?.services) ? p.services.length : 0), 0)
          : 0
      } catch { debugServiceCount = 0 }
    }

    return NextResponse.json({
      answer: answerText,
      follow_up_question: summary?.follow_up_question || null,
      providers: finalProviders,
      state: userState,
      debug: {
        effective_query: effectiveQuery,
        filters_used: decidedFilters,
        location_used: derivedLocation || null,
        selected_provider_ids: selectedIds || null,
        intent: directProvider ? 'ProviderProfile' : intentDetected,
        route_mode: routeDecision?.route || 'service_search',
        comparator_flavor: flavor || null,
        provider_count: debugProviderCount,
        service_count: debugServiceCount
      },
      conversation: updatedConversation.map((m: Message) => ({ role: m.role, content: m.content, name: m.name })).slice(-40)
    })
  } catch (e: unknown) {
    console.error('Copilot API error', e)
    return NextResponse.json(
      { answer: 'I had trouble generating an answer. Here are some providers you can explore.', providers: [], conversation: [] },
      { status: 200 }
    )
  }
}
