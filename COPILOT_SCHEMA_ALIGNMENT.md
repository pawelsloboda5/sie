# Copilot Schema Alignment Summary

## Completed Updates to Match `prices-only` Collection Schema

### Field Name Corrections
✅ **Service fields:**
- `isFree` (not `is_free`)
- `isDiscounted` (not `is_discounted`)

✅ **Insurance fields:**
- `majorProviders` (array of insurance company names)
- `acceptedPaymentMethods` (array of payment methods)
- `notes` (insurance notes/details)

✅ **Provider fields:**
- Added `email` field
- Added `bookingUrl` field

✅ **Telehealth fields:**
- Added `platforms` array
- Added `schedulingInfo` string

### Schema Structure

The copilot now fully aligns with the `prices-only` collection schema:

```typescript
// Service structure
{
  name: string
  category: string
  description?: string
  price?: {
    currency: "USD"
    raw?: string
    amounts?: number[]
    min?: number
    max?: number
    flat?: number
  }
  priceInfoText?: string
  isFree: boolean
  isDiscounted: boolean
}

// Provider structure
{
  _id: string
  name: string
  category: string
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
  location?: {
    type: "Point"
    coordinates: [longitude, latitude]
  }
  services: Service[]
  insurance?: {
    medicaid?: boolean
    medicare?: boolean
    selfPayOptions?: boolean
    paymentPlans?: boolean
    majorProviders?: string[]
    acceptedPaymentMethods?: string[]
    notes?: string
  }
  telehealth?: {
    available?: boolean
    services?: string[]
    platforms?: string[]
    schedulingInfo?: string
  }
}
```

### Vector Search Defaults
- Server-side vector search is enabled by default when supported by the database
- Falls back to geo/text filtering and client-side vector reranking when disabled

### Database Configuration
- Database: `sie-db`
- Collection: `prices-only`
- Documents: 548 providers with clean pricing data

### Files Updated
1. `/api/copilot/search/route.ts` - Aligned types and field access; server-vector default
2. `/api/copilot/filter/route.ts` - Aligned field access
3. `/api/copilot/provider/route.ts` - Added for provider-by-name lookup
4. `/api/copilot/route.ts` - Fixed field names in LLM context; streaming support
5. `/components/copilot/ProviderCards.tsx` - Updated interface

All field references now exactly match the schema in the `prices-only` collection.
