# AI Copilot Migration to prices-only Collection

## Summary
Successfully migrated the AI Copilot feature from the old `businesses/providers` collection to the new clean `prices-only` collection with structured pricing data.

## Key Changes

### 1. New API Routes Created
- **`/api/copilot/search/route.ts`**: Dedicated search for prices-only collection
  - Price-based ranking (free → cheapest → nearest)
  - Service term expansion (e.g., mammogram → mammography, breast screening)
  - Distance calculation using Haversine formula
  - Server-side vector search preferred; falls back to geo/text + client rerank
  
- **`/api/copilot/filter/route.ts`**: Filtering endpoint for prices-only collection
  - Insurance carrier matching
  - Price range filtering
  - Location-based filtering
  - State/city filtering

- **`/api/copilot/provider/route.ts`**: Provider lookup by name for provider-profile questions

### 2. Updated Main Copilot Route
- **`/api/copilot/route.ts`**:
  - Now calls copilot-specific endpoints (`/api/copilot/search` and `/api/copilot/filter`)
  - Adapted to new data schema with nested insurance and telehealth objects
  - Updated provider ranking to use structured price data
  - Enhanced provider service summaries with actual pricing

### 3. Component Updates
- **`ProviderCards.tsx`**:
  - Updated interface to match new schema
  - Shows price ranges for each provider
  - Displays insurance acceptance (Medicaid, Medicare, Self-pay)
  - Better address formatting
  
- **`StatePanel.tsx`**:
  - Added insurance_providers field to state tracking

### 4. Data Schema Changes

#### Old Schema (businesses/providers)
```javascript
{
  accepts_uninsured: boolean,
  medicaid: boolean,
  insurance_providers: string[],
  services: { is_free: boolean, price_info: string }
}
```

#### New Schema (prices-only)
```javascript
{
  insurance: {
    medicaid: boolean,
    medicare: boolean,
    selfPayOptions: boolean,
    majorProviders: string[]
  },
  services: [{
    isFree: boolean,
    price: {
      min: number,
      max: number,
      flat: number
    }
  }]
}
```

## Key Features

### Price-Focused Search
- Balances free and affordable paid services
- Considers distance and ratings as secondary factors
- Shows price ranges on provider cards

### Insurance Matching
- Checks `insurance.majorProviders` array for carrier matches
- Filters by Medicaid, Medicare, and self-pay options
- Displays accepted insurance on cards

### Service Matching
- Text-based matching (no embeddings yet)
- Keyword expansion for common medical terms
- Category and service name matching

## Database Configuration
- **Database**: `sie-db` (via MONGODB_DB env var)
- **Collection**: `prices-only` (hardcoded in routes)
- **Total Documents**: 548 providers with clean pricing data

## Benefits of Migration
1. **100% Price Coverage**: Every provider has pricing information
2. **Structured Data**: Consistent price format (min/max/flat)
3. **Clean Insurance Info**: Nested, organized insurance data
4. **Better UX**: Can show exact prices to users
5. **Focused Search**: Optimized for finding cheapest options

## Next Steps (Optional)
1. Add service embeddings for semantic search
2. Implement result caching for common queries
3. Add appointment booking integration
4. Create price prediction for services without explicit pricing

## Testing Instructions
1. Ensure MongoDB connection string is set in environment
2. Database should have `prices-only` collection
3. Test copilot at `/copilot` route
4. Try queries like:
   - "cheapest dental cleaning near me"
   - "free mammogram in DC"
   - "clinics that accept Medicaid"
   - "urgent care under $100"

## Notes
- Main search functionality (`/api/search`, `/api/filter`) remains unchanged
- This is a completely separate system from the main provider search
- All copilot-specific code is isolated in `/api/copilot/` directory
