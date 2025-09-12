# AI Copilot API Routes

## Overview
The copilot API routes are separate from the main search functionality and specifically designed to work with the `prices-only` collection, which contains clean, structured provider data with detailed pricing information.

## Key Differences from Main Search
- Uses `prices-only` collection instead of `businesses/providers`
- Focuses on finding the cheapest services near users
- All providers have pricing data (no missing price info)
- Optimized for cost-conscious healthcare searches
- Client-side vector reranking using provider/service embeddings (Cosmos vCore lacks vector index)

## Routes

### `/api/copilot/search`
- **Purpose**: Search for providers based on services and location
- **Features**:
  - Service term expansion (e.g., "mammogram" → "mammography", "breast screening")
  - Server-side geo/text filtering via `$geoNear` + `$match` ($text), capped candidates
  - Query embedding computed server-side via Azure OpenAI
  - Client-side vector rerank (cosine) using provider `embedding` and `services[].embedding`
  - Blended scoring: 60% similarity + boosts (free/low price/near/rating)
  - Filters for insurance (Medicaid, Medicare, self-pay) and telehealth
  - Returns cheapest service per provider and price ranges

### `/api/copilot/filter`
- **Purpose**: Filter providers by specific criteria
- **Features**:
  - Insurance carrier matching
  - Price range filtering
  - Distance-based filtering
  - State/city filtering
  - Returns providers ranked by matching services count and price

### `/api/copilot/route.ts` (Main)
- **Purpose**: Orchestrates the AI conversation and provider selection
- **Updates**:
  - Calls copilot-specific search/filter endpoints
  - Adapted to new data schema (nested insurance, structured pricing)
  - Focus on affordability and access (Medicaid, self-pay options)
  - Summarizer prompt improved (style hint, grounding on provided context)

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

1. **Vector Rerank**: Use cosine similarity of query embedding vs provider/service embeddings
2. **Price/Access Boosts**: Favor free, affordable, closer, and higher-rated providers
3. **Insurance Matching**: Check `insurance.majorProviders` for carrier matches when requested
4. **Geo/Text Pre-filter**: `$geoNear` (when coordinates provided) and `$text` search to reduce candidates

## Future Enhancements

1. **Server-side vector index**: Move to `$vectorSearch` when cluster supports it
2. **Cache embeddings**: Cache query embeddings to cut costs and latency
3. **Price Prediction**: ML model for services without explicit pricing
4. **Appointment Integration**: Connect with bookingUrl for real-time slots

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name (default: medical_services)
- Collection used: `prices-only` (hardcoded in routes)
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_EMBEDDING_MODEL`

Operational Notes
- Cosmos DB vCore does not support `$vectorSearch`; rerank is done in app using embeddings stored in documents.
- Candidates are capped (500) to keep CPU bounded for reranking.
- We exclude provenance fields via `$project: { source: 0 }`.
