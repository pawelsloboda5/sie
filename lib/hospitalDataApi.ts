// Public Medicare Hospital Cost Data API Integration
// API Endpoint: https://34-239-131-85.sslip.io/api/v1/ask?explain=false
// No authentication required; CORS configured for www.sie2.com and localhost

// Always use production API endpoint (it's public and has CORS for localhost)
// Using /ask endpoint with template matching for better data quality (vs /query)
// Only use custom endpoint if explicitly set via env var
const API_URL = process.env.NEXT_PUBLIC_HOSPITAL_API_URL || 
  'https://34-239-131-85.sslip.io/api/v1/ask?explain=false'

export type HospitalDataRecord = {
  provider_name: string
  provider_state?: string
  provider_city?: string
  average_covered_charges?: number | string
  average_total_payments?: number | string
  average_medicare_payments?: number | string
  drg_description?: string
  total_discharges?: number | string
  rating?: number | string
  provider_zip_code?: string
}

export type HospitalDataResponse = {
  success: boolean
  data: HospitalDataRecord[]
  sql?: string
  count: number
  message: string
  error?: string
  // Additional fields from /ask endpoint
  template_used?: number
  confidence_score?: number
  execution_time_ms?: number
  // Original raw API payload for consumers that want exact schema (sql_query/results)
  raw?: Record<string, unknown>
}

/**
 * Query public Medicare hospital cost data using the /ask endpoint
 * @param question Natural language question about hospital costs
 * @param limit Maximum results to return (default: 10) - Note: /ask endpoint may return more
 * @returns Structured hospital provider data with costs and locations
 */
export async function queryHospitalData(
  question: string, 
  limit = 10
): Promise<HospitalDataResponse> {
  if (!question?.trim()) {
    return {
      success: false,
      data: [],
      count: 0,
      message: 'Question is required',
      error: 'Empty question provided'
    }
  }

  try {
    console.log('Hospital API call:', { url: API_URL, question: question.trim() })
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        question: question.trim(),
        use_template_matching: true  // Use battle-tested templates for better results
      }),
      // Timeout after 15 seconds
      signal: AbortSignal.timeout(15000)
    })
    
    console.log('Hospital API response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      return {
        success: false,
        data: [],
        count: 0,
        message: `API error: ${response.status} ${response.statusText}`,
        error: errorText || `HTTP ${response.status}`
      }
    }

    const rawResult = await response.json() as Record<string, unknown>

    // Validate response structure
    if (!rawResult || typeof rawResult !== 'object') {
      return {
        success: false,
        data: [],
        count: 0,
        message: 'Invalid API response format',
        error: 'Response is not a valid object'
      }
    }

    // /ask endpoint returns 'results' field, not 'data'
    const results = Array.isArray(rawResult.results) ? rawResult.results as HospitalDataRecord[] : []
    const sqlQuery = rawResult.sql_query as string | undefined
    const success = rawResult.success !== false
    const templateUsed = rawResult.template_used as number | undefined
    const confidenceScore = rawResult.confidence_score as number | undefined
    const executionTimeMs = rawResult.execution_time_ms as number | undefined

    // Check for API-specific error messages (template/RAG errors)
    const message = rawResult.message as string | undefined
    if (message && /no matching template|rag is disabled|template.*not found/i.test(message)) {
      console.warn('Hospital API template/RAG error:', message)
      return {
        success: false,
        data: [],
        count: 0,
        message: 'Hospital cost data is temporarily unavailable. The public Medicare data API is experiencing issues. Please try searching for local healthcare providers instead, or try again later.',
        error: message
      }
    }

    // Log template matching info for debugging
    if (templateUsed !== undefined && confidenceScore !== undefined) {
      console.log(`Hospital API: template=${templateUsed}, confidence=${confidenceScore.toFixed(2)}, time=${executionTimeMs}ms`)
    }

    return {
      success,
      data: results.slice(0, limit),  // Respect the limit parameter
      sql: sqlQuery,
      count: results.length,
      message: message || (results.length ? 'Query successful' : 'No results found'),
      template_used: templateUsed,
      confidence_score: confidenceScore,
      execution_time_ms: executionTimeMs,
      raw: rawResult
    }

  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError'
    const message = isTimeout 
      ? 'Request timeout - hospital API did not respond in time'
      : error instanceof Error 
        ? error.message 
        : 'Unknown error occurred'

    console.error('Hospital data API error:', error)

    return {
      success: false,
      data: [],
      count: 0,
      message: `Failed to fetch hospital data: ${message}`,
      error: message
    }
  }
}

/**
 * Fetch the raw JSON response from the public Medicare Hospital /ask endpoint.
 * Returns the API payload as-is (including sql_query, results, template_used, etc.).
 */
export async function queryHospitalDataRaw(
  question: string
): Promise<Record<string, unknown>> {
  if (!question?.trim()) {
    return { success: false, results: [], sql_query: null, message: 'Question is required', error: 'Empty question provided' }
  }
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        question: question.trim(),
        use_template_matching: true
      }),
      signal: AbortSignal.timeout(15000)
    })
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      return { success: false, results: [], sql_query: null, message: `API error: ${response.status} ${response.statusText}`, error: errorText || `HTTP ${response.status}` }
    }
    const raw = await response.json() as Record<string, unknown>
    return raw
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError'
    const message = isTimeout ? 'Request timeout - hospital API did not respond in time' : (error instanceof Error ? error.message : 'Unknown error occurred')
    return { success: false, results: [], sql_query: null, message: `Failed to fetch hospital data: ${message}`, error: message }
  }
}

/**
 * Format hospital cost for display
 */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(/,/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function formatHospitalCost(cost: number | string | undefined | null): string {
  const n = toNumber(cost)
  if (n === null) return 'N/A'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format hospital data response into a readable summary
 */
export function formatHospitalSummary(response: HospitalDataResponse): string {
  // Handle API errors with helpful message
  if (!response.success) {
    if (response.error && /template|rag/i.test(response.error)) {
      return `**Hospital Cost Data Temporarily Unavailable**

The public Medicare hospital cost API is currently experiencing technical issues (template matching/RAG system disabled).

**What you can do:**
1. Search for local healthcare providers instead by asking about specific services (e.g., "physical therapy near me", "affordable dentists")
2. Try the hospital query again in a few minutes
3. Check the API status at: https://34-239-131-85.sslip.io/docs

*Note: Our local provider search is still working perfectly for outpatient care, clinics, therapy, dental, and other healthcare services.*`
    }
    return response.message || 'No hospital cost data found for this query.'
  }
  
  if (!response.data.length) {
    return response.message || 'No hospital cost data found for this query.'
  }

  // Keep the message concise; detailed data will render in a dedicated table UI
  const sorted = [...response.data].sort((a, b) => {
    const av = toNumber(a.average_covered_charges)
    const bv = toNumber(b.average_covered_charges)
    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1
    return av - bv
  })
  const cheapest = sorted[0]
  const cheapestCost = cheapest ? formatHospitalCost(cheapest.average_covered_charges) : 'N/A'

  const parts: string[] = []
  parts.push(`Found ${response.count} hospitals with Medicare cost data.`)
  if (cheapest) {
    parts.push(`Lowest average covered charges: ${cheapest.provider_name} in ${cheapest.provider_city || ''}${cheapest.provider_state ? `, ${cheapest.provider_state}` : ''} — ${cheapestCost}.`)
  }
  parts.push('Showing the top results below. These are Medicare rates; actual patient costs may vary.')

  return parts.join('\n')
}

