# AI Copilot Location Setup Guide

## New Location Features Added

### 1. UI Location Bar
Added a location input bar at the top of the copilot page that allows users to:
- **Auto Detect Location**: Uses browser geolocation API to get current GPS coordinates
- **Manual Entry**: Type in "City, State" (e.g., "San Francisco, CA")
- Persists location in localStorage for future visits

### 2. Location-Aware Search
The copilot now:
- Accepts user location and passes it to the search API
- Prioritizes user-provided location over text-based location hints
- Calculates distances to providers
- Sorts results by price AND distance

## Environment Setup

### Azure Maps (Optional but Recommended)

For better reverse geocoding (GPS coords → city/state), add Azure Maps key:

```bash
# In .env.local
AZURE_MAPS_KEY=your-azure-maps-subscription-key
```

Without Azure Maps:
- Forward geocoding still works (uses OpenStreetMap)
- Reverse geocoding returns "Current Location" as display text
- Distance calculations still work

### Getting Azure Maps Key (Free Tier Available)
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new Azure Maps account
3. Get the primary key from Keys section
4. Add to environment variables

## How It Works

### User Flow
1. User loads copilot page
2. Prompted to set location via:
   - Auto detect (GPS)
   - Manual entry (city, state)
3. Location persists across sessions
4. All queries use this location for finding nearby providers

### API Flow
```
User Query + Location
    ↓
Copilot Route
    ↓
Search Route (with lat/lon)
    ↓
MongoDB Query + Distance Calculation
    ↓
Sorted Results (by price, then distance)
```

## Multiple Provider Selection Fix

The copilot now:
- Always tries to return 3-6 providers minimum
- LLM instructed to mention at least 2-3 providers
- Fallback selection ensures multiple options
- Shows dental-only providers for dental queries

## Testing Location Features

1. **Test Auto-Detect**:
   - Click "Auto Detect" button
   - Browser will ask for location permission
   - Should show city/state once detected

2. **Test Manual Entry**:
   ```
   Try these:
   - "San Francisco, CA"
   - "Minneapolis, MN"
   - "Washington, DC"
   ```

3. **Test Distance Sorting**:
   - Set a location
   - Search for "dental care"
   - Results should show distance badges
   - Closer providers ranked higher

## Troubleshooting

### Location Not Working?
1. Check browser permissions for location access
2. Ensure HTTPS (geolocation requires secure context)
3. Check console for errors

### Only 1 Provider Showing?
- Fixed: LLM now instructed to select 2-3 minimum
- Fallback selection ensures multiple providers
- Check debug panel for `selected_provider_ids`

### No Dental Providers Found?
- Fixed: Enhanced dental matching logic
- Filters non-dental providers for dental queries
- Shows only actual dentists/oral care providers

## MongoDB Index for Location

For optimal performance, ensure 2dsphere index on location field:

```javascript
db.collection('prices-only').createIndex({ 
  "location": "2dsphere" 
})
```

This enables efficient location-based queries and sorting.

## API Endpoints

### `/api/geo/forward`
- Converts "City, State" → lat/lon
- Uses OpenStreetMap Nominatim
- Returns: `{ latitude, longitude, city, state, display }`

### `/api/geo/reverse`
- Converts lat/lon → "City, State"
- Uses Azure Maps (if configured)
- Falls back to "Current Location" without Azure
- Returns: `{ city, state, display, latitude, longitude }`

### `/api/copilot`
- Now accepts `location: { latitude, longitude }`
- Passes location to search endpoints
- Prioritizes user location over text hints

## Benefits

1. **Better Results**: Finds truly nearby providers
2. **Accurate Distances**: Shows exact miles to each provider
3. **Persistent**: Remembers location across sessions
4. **Flexible**: Works with or without Azure Maps
5. **Multiple Options**: Always shows 2-3+ providers
