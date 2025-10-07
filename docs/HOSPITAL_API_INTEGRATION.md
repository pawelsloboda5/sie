# Hospital Cost Data API Integration

## Overview

The SIE Wellness chatbot now integrates with a public Medicare hospital cost data API, enabling users to ask natural language questions about hospital costs and receive accurate provider data including names, costs, locations, and ratings.

## Architecture

### Files Created/Modified

1. **`sie/lib/hospitalDataApi.ts`** - Core API wrapper
   - `queryHospitalData()` - Main API call function
   - `formatHospitalSummary()` - Format response for chatbot display
   - `formatHospitalCost()` - Format currency values
   - Type definitions for API requests/responses

2. **`sie/app/api/copilot/route.ts`** - Chatbot integration
   - Added `hospital_query` route to router schema
   - Added `query_hospital_costs` tool to execTool function
   - Integrated hospital response handling in streaming and non-streaming paths
   - Updated LLM routing instructions to detect hospital cost queries

3. **`sie/lib/hospitalDataApi.test.example.ts`** - Example usage and tests
   - Demonstrates API usage patterns
   - Provides manual testing checklist
   - Shows integration with chatbot flow

## API Endpoint

**Endpoint (all environments):** `https://34-239-131-85.sslip.io/api/v1/ask?explain=false`

- **Method:** POST
- **Authentication:** None required
- **CORS:** Pre-configured for https://www.sie2.com and http://localhost:3001
- **Timeout:** 15 seconds
- **Template Matching:** Enabled by default for 95% success rate and better data quality
- **Note:** Always uses production API endpoint (public API with CORS for localhost)
- **Why `/ask`?** More mature query engine with better cost data processing vs `/query` endpoint

## Request Format

```typescript
{
  question: string,              // Natural language question
  use_template_matching: true    // Use battle-tested templates (recommended)
}
```

## Response Format

```typescript
{
  success: boolean,
  results: Array<{                // Note: 'results' not 'data'
    provider_name: string,
    provider_state?: string,
    provider_city?: string,
    average_covered_charges?: string,    // String format: "89234.50"
    average_total_payments?: string,
    average_medicare_payments?: string,
    drg_description?: string,
    total_discharges?: number,
    rating?: number
  }>,
  sql_query?: string,             // Note: 'sql_query' not 'sql'
  template_used?: number,         // Which template matched (shows reliability)
  confidence_score?: number,      // Match confidence (0.0-1.0)
  execution_time_ms?: number,
  answer?: string,                // Usually empty when explain=false
  message?: string
}
```

**Key Differences from `/query` endpoint:**
- Response field: `results` instead of `data`
- SQL field: `sql_query` instead of `sql`
- Costs are strings with decimal precision
- Includes `template_used` and `confidence_score` for transparency
- Template matching provides 95% success rate vs RAG fallback

## Usage Examples

### In Chatbot

The integration is automatic. Users can ask questions like:

- "What are the cheapest hospitals for knee replacement in California?"
- "Compare heart surgery costs between Texas and Florida"
- "Show me hospital costs for hip replacement in New York"
- "Find affordable providers for cancer treatment in Virginia"

The chatbot will automatically:
1. Detect hospital cost queries using route detection
2. Call the hospital API with the user's question
3. Format the response for display
4. Handle errors gracefully

### Programmatic Usage

```typescript
import { queryHospitalData, formatHospitalSummary } from '@/lib/hospitalDataApi'

// Query hospital data (now uses /ask endpoint with template matching)
const response = await queryHospitalData(
  'What are the cheapest hospitals for heart surgery in California?',
  10
)

// Response includes quality metrics
console.log('Template used:', response.template_used)
console.log('Confidence:', response.confidence_score)
console.log('Execution time:', response.execution_time_ms, 'ms')

// Format for display
const summary = formatHospitalSummary(response)
console.log(summary)
```

## Query Detection

The system uses a **3-layer detection strategy** to reliably identify hospital queries:

### 1. Early Pre-Check (Highest Priority)
Before any expensive LLM calls, the system immediately checks for obvious hospital queries:
- **Pattern:** `hospital` OR `hospitals` + surgery/procedure word + cost word
- **Examples:** "hospital costs for knee surgery", "cheapest hospitals for heart surgery"
- **Fast:** Regex-based, <1ms detection time
- **Exit:** Returns hospital data immediately, bypassing all other routing

### 2. LLM Router (Primary)
The Azure OpenAI model analyzes ambiguous queries with prioritized rules:
1. Hospital queries (highest priority)
2. Provider profiles
3. Filter-only queries
4. Service searches
5. Hybrid queries

### 3. Heuristic Fallback
If LLM routing fails or returns null, fallback regex patterns detect:
- **Strong signal:** Explicit "hospital" + surgery + cost terms
- **Medium signal:** Major procedures (knee replacement, bypass, etc.) + cost terms
- **Weak signal:** General surgery + cost terms

## Error Handling

The integration handles multiple error scenarios:

1. **Empty Query**
   ```
   Returns: { success: false, error: 'Empty question provided' }
   ```

2. **Network Timeout** (15s)
   ```
   Returns: { success: false, error: 'Request timeout...' }
   ```

3. **API Error**
   ```
   Returns: { success: false, error: 'API error: HTTP 500' }
   ```

4. **Invalid Response**
   ```
   Returns: { success: false, error: 'Invalid API response format' }
   ```

All errors are gracefully displayed to users with helpful messages.

## Environment Variables

```bash
# Optional: Override API endpoint
NEXT_PUBLIC_HOSPITAL_API_URL=https://34-239-131-85.sslip.io/api/v1/query
```

If not set, defaults to:
- **Production:** `https://34-239-131-85.sslip.io/api/v1/query`
- **Development:** `http://localhost:8000/api/v1/query`

## Testing

### Manual Testing

1. Open chatbot at `/copilot`
2. Ask hospital cost questions:
   - "What are hospital costs for knee surgery in Texas?"
   - "Cheapest hospitals for heart surgery"
   - "Compare hip replacement costs"

3. Verify:
   - Query is detected as `hospital_query` route (check debug panel if enabled)
   - Response includes formatted hospital data
   - Provider names, costs, and locations are displayed
   - Error messages are clear and helpful

### Example Test Queries

```typescript
// See sie/lib/hospitalDataApi.test.example.ts for complete examples

import { queryHospitalData } from '@/lib/hospitalDataApi'

// Basic query
const response = await queryHospitalData(
  'Cheapest hospitals for knee replacement in California',
  5
)

// State comparison
const txResponse = await queryHospitalData(
  'Heart surgery costs in Texas',
  10
)
```

### Testing Checklist

- ✅ Query detection (hospital vs regular provider search)
- ✅ API response parsing
- ✅ Error handling (network, timeout, invalid data)
- ✅ Response formatting
- ✅ Chatbot UI updates
- ✅ Conversation state persistence
- ✅ Streaming and non-streaming paths

## Data Characteristics

**Medicare Data:**
- Data covers Medicare fee-for-service beneficiaries
- Includes hospital inpatient charges and payments
- DRG (Diagnosis Related Group) classifications
- Provider names, locations, and volume data
- Quality/safety ratings where available

**Important Notes:**
- These are Medicare rates; actual costs may vary
- Users should call providers to confirm current pricing
- Not all providers/procedures have complete data

## Performance

- **Typical Response Time:** 200-2000ms
- **Timeout:** 15 seconds
- **Caching:** None (queries are dynamic)
- **Rate Limiting:** None currently configured

## Future Enhancements

Potential improvements:

1. **Caching:** Cache common queries for faster responses
2. **Location Integration:** Use user's location for geographically relevant results
3. **Filtering:** Add cost range, rating filters
4. **Comparison UI:** Visual cost comparison between states/providers
5. **Follow-up Questions:** "Tell me more about [specific hospital]"
6. **Procedure Recommendations:** Suggest related procedures

## Troubleshooting

### Issue: "No matching template found and RAG is disabled"
**Cause:** The external hospital API's template matching system is disabled or the query doesn't match any known templates.

**Solution:**
1. Check API status at: `https://34-239-131-85.sslip.io/docs`
2. The API may be temporarily down or misconfigured
3. Try a different query format (e.g., "hospital costs for knee surgery in Texas")
4. The system now displays a helpful error message to users and suggests using local provider search
5. User will see: "Hospital Cost Data Temporarily Unavailable" with suggestions

**Note:** This is an external API issue, not a problem with our integration. Our code handles it gracefully.

### Issue: Hospital queries not detected
**Solution:** Check debug panel to see route decision. The system now has 3-layer detection (early pre-check, LLM router, fallback heuristics). Update regex patterns in `decideRouteFallback` if needed.

### Issue: API timeout errors
**Solution:** Check network connectivity to `34-239-131-85.sslip.io`. Consider increasing timeout from 15s in `hospitalDataApi.ts`.

### Issue: CORS errors
**Solution:** Should not occur as CORS is configured for both production (`https://www.sie2.com`) and development (`http://localhost:3001`). If you see CORS errors, verify the API is accessible.

### Issue: Calling localhost:8000 instead of production API
**Solution:** Fixed! The code now always uses the production endpoint by default. Only uses localhost if `NEXT_PUBLIC_HOSPITAL_API_URL=http://localhost:8000/api/v1/query` is explicitly set in `.env.local`.

### Issue: Malformed responses
**Solution:** Check API response structure. Update type definitions in `hospitalDataApi.ts` if API schema changed. Enable console logging to see raw responses.

## Support

For API issues or questions:
- Check API docs: `https://34-239-131-85.sslip.io/docs`
- Review integration guide: `docs/SIE_Integration.md`
- Test API directly: See test examples in `lib/hospitalDataApi.test.example.ts`

## Compliance

- ✅ No authentication required
- ✅ Public Medicare data
- ✅ CORS configured for production domain
- ✅ 15-second timeout for responsiveness
- ✅ Graceful error handling
- ✅ User-friendly error messages

