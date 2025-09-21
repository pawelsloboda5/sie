# AI Copilot API Routes

## Overview
The Copilot API routes are separate from the main search functionality and optimized for affordable care discovery against the `prices-only` collection (structured pricing and insurance data).

Key update: Server-side vector search is enabled by default when supported by the database (Cosmos DB `cosmosSearch`). When disabled, the system falls back to geo/text filtering and client-side vector reranking.

## Key Differences from Main Search
- Uses `prices-only` collection instead of `businesses/providers` for clean pricing/insurance fields
- Focuses on free and low-cost options near the user, with price ranges and cheapest service per provider
- All providers include pricing data when available
- Server-side vector search by default (Cosmos `cosmosSearch`) with post-filtering and distance caps
- Fallback to geo/text pipeline plus client-side vector reranking when server vector is disabled

## Routes

### `/api/copilot/search`
- **Purpose**: Search for providers based on services and location
- **Features**:
  - Service term expansion (e.g., "mammogram" → "mammography", "breast screening")
  - Server-side vector search (`cosmosSearch`) on provider `embedding` and service embeddings when `COPILOT_SERVER_VECTOR=true`
  - Merges service-level vector hits from `prices-only-services` back into providers
  - Post-merge filtering for insurance, telehealth, and free-only
  - Distance computation and optional max-distance cap via `COPILOT_MAX_DISTANCE_MI`
  - Fallback to `$geoNear` + filters or filters-only when server vector is disabled
  - Client-side vector reranking as a fallback when server vector is not used
  - Returns: ordered providers, cheapest service, price ranges, and `search_params`

### `/api/copilot/filter`
- **Purpose**: Filter providers by specific criteria
- **Features**:
  - Insurance carrier matching
  - Price and distance-based filtering
  - State/city filtering
  - Returns providers ranked by relevance and affordability

### `/api/copilot/provider`
- **Purpose**: Look up providers by name (for provider-profile questions)
- **Features**:
  - Tokenized case-insensitive name matching with distance bonus
  - Returns top N most likely matches (embeddings removed from response)

### `/api/copilot/route.ts` (Main)
- **Purpose**: Orchestrates the AI conversation, provider selection, and summarization
- **Behavior**:
  - Extracts conversation state (service terms, affordability, insurance, location)
  - Routes to `/api/copilot/search`, `/api/copilot/filter`, and optionally `/api/copilot/provider`
  - Builds a rich search context and calls Azure Responses API to generate concise answers
  - Supports streaming SSE for faster perceived responsiveness

## Data Schema (prices-only collection)

```typescript
{
  _id: string
  name: string
  category: string  // e.g., "Medical clinic", "Dentist"
  
  // Location
  addressLine?: string
  city?: string
  state?: string
  postalCode?: string
  location?: {
    type: "Point"
    coordinates: [longitude, latitude]
  }
  
  // Services with structured pricing
  services: [{
    name: string
    category: string
    description?: string
    price?: {
      currency: "USD"
      raw?: string  // Original price text
      amounts?: number[]
      min?: number
      max?: number
      flat?: number
    }
    isFree: boolean
    isDiscounted: boolean
    priceInfoText?: string
  }]
  
  // Insurance info
  insurance?: {
    medicaid?: boolean
    medicare?: boolean
    selfPayOptions?: boolean
    paymentPlans?: boolean
    majorProviders?: string[]  // e.g., ["Cigna", "Aetna"]
  }
  
  // Telehealth
  telehealth?: {
    available?: boolean
    services?: string[]
    platforms?: string[]
  }
  
  // Contact & ratings
  phone?: string
  website?: string
  bookingUrl?: string
  rating?: number
  totalReviews?: number
}
```

## Key Behaviors

1. **Vector Search or Rerank**: Server-side vector search by default; fallback to client-side rerank when disabled
2. **Price/Access Boosts**: Favor free, affordable, closer, and higher-rated providers
3. **Insurance Matching**: Check `insurance.majorProviders` for carrier matches when requested
4. **Geo/Text Pre-filter**: `$geoNear` (when coordinates provided) and optional `$text` to cap candidates

## Future Enhancements

1. **Vector index portability**: Support both Cosmos `cosmosSearch` and Atlas `$vectorSearch`
2. **Cache embeddings**: Cache query embeddings to cut costs and latency
3. **Price prediction**: ML for services without explicit pricing
4. **Appointment integration**: Connect with `bookingUrl` for real-time slots

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name (default: `sie-db`)
- Collections: `prices-only` (providers), `prices-only-services` (optional, for service embeddings)
- Azure OpenAI: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_CHAT_MODEL`, `AZURE_OPENAI_API_VERSION`
- Vector toggles (optional):
  - `COPILOT_SERVER_VECTOR` (default: `true`)
  - `COPILOT_VECTOR_PATH` (default: `embedding`)
  - `COPILOT_SERVICE_COLLECTION` (default: `prices-only-services`)
  - `COPILOT_SERVICE_VECTOR_FIELD` (default: `embedding`)
  - `COPILOT_VECTOR_K`, `COPILOT_SERVICE_VECTOR_K`, `COPILOT_VECTOR_NPROBES`
- Limits and distance:
  - `COPILOT_RESULT_LIMIT` (default: `4` for `/search`)
  - `COPILOT_MAX_DISTANCE_MI` (default: `100`)

Operational Notes
- Server-side vector search is preferred; when disabled, the system uses geo/text and client-side rerank.
- Candidates are capped to keep CPU bounded for reranking.
- Provenance/noisy fields are excluded via `$project: { source: 0 }`.
