# AI Copilot Troubleshooting Guide

## Common Issues and Solutions

### 1. No Providers Found (0 results)

**Symptoms:**
- Copilot returns generic responses instead of actual providers
- Debug shows `provider_count: 0`

**Possible Causes & Solutions:**

#### A. Wrong Database Name
- **Check:** Your MongoDB database name
- **Fix:** Update environment variable or default in code
  ```bash
  # In .env.local
  MONGODB_DB=sie-db  # Use your actual database name
  ```

#### B. Collection Name Mismatch
- **Check:** Run the test script to see available collections
  ```bash
  node sie/test-copilot-db.js
  ```
- **Expected:** Should show `prices-only` collection with 548 documents
- **Fix:** Ensure your collection is named exactly `prices-only`

#### C. MongoDB Connection Issues
- **Check:** MongoDB is running and accessible
- **Test:** 
  ```bash
  # Test connection
  mongosh mongodb://localhost:27017/sie-db --eval "db.getCollectionNames()"
  ```

### 2. "Low-cost" Being Treated as "Free"

**Issue:** Query for "low-cost dental" filters for only free services

**Fixed in Latest Update:**
- Removed "low-cost" and "affordable" from free-only triggers
- Only applies free filter when user explicitly says "free"

### 3. Dental Providers Not Matching

**Issue:** Dental queries not finding dentist providers

**Enhanced Matching:**
- Now checks for "dent" or "oral" in category
- Expands "dental" → ["dental", "dentist", "teeth", "tooth"]
- More lenient category matching

## Testing Your Setup

### 1. Run Database Test
```bash
cd sie
node test-copilot-db.js
```

**Expected Output:**
```
✓ Connected successfully
Available collections:
  - prices-only
Documents in prices-only: 548
Found 5 dental providers:
  [Provider names with services and prices]
```

### 2. Test Copilot Search Directly
```bash
# Test the search endpoint
curl -X POST http://localhost:3001/api/copilot/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "dental",
    "filters": {},
    "limit": 5
  }'
```

### 3. Check Logs
When testing in the browser, check the terminal for:
```
Copilot search request: { query: 'dental', filters: {}, location: null }
Found 548 providers from database before filtering
Search results: 548 total, 523 skipped, 25 matched, 5 returned
```

## Configuration Checklist

- [ ] MongoDB is running
- [ ] Database name is correct (`sie-db` or your custom name)
- [ ] Collection `prices-only` exists with 548 documents
- [ ] Environment variables are set:
  - `MONGODB_URI` (defaults to `mongodb://localhost:27017`)
  - `MONGODB_DB` (defaults to `sie-db`)

## Query Examples That Should Work

After fixes, these should return actual providers:

1. **"Low-cost dental care"** - Should find affordable dental providers (not just free)
2. **"Free dental services"** - Should find only free dental services
3. **"Dentist near me"** - Should find dental providers
4. **"Dental cleaning under $100"** - Should find services within price range
5. **"Dental care that accepts Medicaid"** - Should filter by insurance

## Debug Information

When copilot returns results, check the State Panel for:

```json
{
  "debug": {
    "effective_query": "dental care",  // Should NOT include "free" for low-cost
    "filters_used": {
      "freeOnly": undefined  // Should be undefined for "low-cost" queries
    },
    "provider_count": 25,  // Should be > 0
    "service_count": 150   // Should be > 0
  }
}
```

## If Still Having Issues

1. **Verify Data Structure:** Check that your documents in `prices-only` match the expected schema
2. **Check Indexes:** Ensure location has 2dsphere index if using geo queries
3. **Enable Debug Mode:** Add more console.logs to track the issue
4. **Test MongoDB Directly:** Query the collection using MongoDB Compass or mongosh

## Contact for Help

If issues persist after following this guide:
1. Check the console logs for specific error messages
2. Verify your data matches the schema in COPILOT_MIGRATION_SUMMARY.md
3. Test with the provided test script to isolate the issue
