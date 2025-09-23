# AI Copilot Verification & Testing Guide

## ✅ Schema Alignment Complete

All copilot routes now fully align with the `prices-only` collection schema:

### Key Field Names (Corrected)
- ✅ `isFree` (not `is_free`)
- ✅ `isDiscounted` (not `is_discounted`) 
- ✅ `majorProviders` in insurance
- ✅ Added `email` field to providers
- ✅ Added `acceptedPaymentMethods` and `notes` to insurance
- ✅ Added `platforms` and `schedulingInfo` to telehealth

## 🧪 Testing Tools

### 1. Database Connection Test
Visit: `http://localhost:3001/api/copilot/test`

This will show you:
- Database connection status
- Available collections
- Document count in `prices-only`
- Sample providers
- Dental provider count

### 2. Database Test Script
```powershell
cd sie
node test-copilot-db.js
```

Shows:
- Total documents
- Dental providers
- Sample services with prices

### 3. Dental Search Test
```powershell
cd sie
node test-dental-search.js
```

Specifically tests:
- Dental category matching
- Dental service matching
- Low-cost dental options

## 🔍 What to Check

### Database Setup
1. **MongoDB is running**: Check with `mongosh`
2. **Database name**: Should be `sie-db` (or set MONGODB_DB env var)
3. **Collection exists**: Must have `prices-only` collection
4. **Documents loaded**: Should have 548 providers

### Query Testing

Try these queries in the copilot UI:

1. **"Low-cost dental care"**
   - Should NOT filter for only free services
   - Should find dental providers with various prices
   - Debug should show `freeOnly: undefined` or `false`

2. **"Free dental services"**
   - Should filter for only free services
   - Debug should show `freeOnly: true`

3. **"Dentist"**
   - Should match all providers with "Dentist" category
   - Should also match services with "dental" in name

4. **"Dental cleaning under $100"**
   - Should find dental services with prices < $100

## 📊 Expected Debug Output

For "Low-cost dental care":
```json
{
  "state": {
    "service_terms": ["dental care"],
    "free_only": null,  // NOT true
    "accepts_medicaid": null,
    "accepts_uninsured": null
  },
  "debug": {
    "effective_query": "dental care",  // No "free" prefix
    "filters_used": {},  // No freeOnly filter
    "provider_count": 25+,  // Should find providers
    "service_count": 100+
  }
}
```

## 🛠️ Troubleshooting

### If Still Getting 0 Providers

1. **Check MongoDB Connection**:
   ```powershell
   mongosh mongodb://localhost:27017/sie-db --eval "db.getCollection('prices-only').countDocuments()"
   ```
   Should return 548

2. **Check Collection Name**:
   ```powershell
   mongosh mongodb://localhost:27017/sie-db --eval "db.getCollectionNames()"
   ```
   Should include "prices-only"

3. **Check Console Logs**:
   Look for these in terminal when querying:
   ```
   Copilot search request: { query: 'dental', filters: {}, location: null }
   Found 548 providers from database before filtering
   Search results: 548 total, 523 skipped, 25 matched, 12 returned
   ```

4. **Verify Data Structure**:
   Run test endpoint: `http://localhost:3001/api/copilot/test`
   Should show dental providers in the response

### If Database/Collection Issues

1. Make sure MongoDB is running
2. Verify database name matches your setup
3. Check that `prices-only` collection exists
4. Ensure documents are loaded (548 total)

### Environment Variables (Optional)

If your setup differs from defaults:
```bash
MONGODB_URI=mongodb://localhost:27017  # Your MongoDB URI
MONGODB_DB=sie-db  # Your database name
COPILOT_SERVER_VECTOR=true           # Default; set false to disable server-side vector
COPILOT_MAX_DISTANCE_MI=100          # Optional distance cap when user location is present
```

## 📝 Summary of Changes

1. **Database name**: Changed from `medical_services` to `sie-db`
2. **Field alignment**: All fields now match exact schema
3. **Filter logic**: "Low-cost" no longer triggers free-only filter
4. **Dental matching**: Enhanced to match "Dentist" category properly
5. **Debugging**: Added comprehensive logging and test endpoints

## 🚀 Next Steps

1. Run the test endpoint to verify database connection
2. Try the test scripts to verify data exists
3. Test queries in the UI
4. Check console logs for debugging info

The system should now correctly:
- Find dental providers when searching for "dental" or "dentist"
- Show affordable options (not just free) for "low-cost" queries
- Display actual prices from the database
- Sort by price (cheapest first)
