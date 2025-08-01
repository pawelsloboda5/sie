# Frontend Integration Guide - SIE Wellness MCP Server

## Overview for Frontend Engineers

This guide helps you integrate the SIE Wellness MCP Server with your React/Next.js application. The MCP server acts as a bridge between your frontend provider selection and AI voice agents for appointment scheduling.

## Architecture Flow

```
┌─────────────────┐    Provider ID    ┌─────────────────┐    MCP Tools    ┌─────────────────┐
│   React/Next.js │ ──────────────── │   AI Voice      │ ──────────────── │   MCP Server    │
│   Frontend      │                  │   Agent         │                  │   (Healthcare)  │
│                 │ ◄──────────────── │                 │ ◄──────────────── │                 │
└─────────────────┘    Results       └─────────────────┘    Provider Data └─────────────────┘
                                                                                    │
                                                                                    ▼
                                                                            ┌─────────────────┐
                                                                            │   MongoDB       │
                                                                            │   (sie-db)      │
                                                                            └─────────────────┘
```

## Frontend Responsibilities

### 1. Provider Selection Interface
Your React/Next.js app should handle:
- **Provider Search**: Allow users to search for healthcare providers
- **Provider Display**: Show provider details, services, location
- **Provider Selection**: Let users choose a provider for appointment scheduling

### 2. AI Agent Integration
When a user wants to schedule an appointment:
- **Pass Provider ID**: Send the selected provider's MongoDB ObjectId to your AI voice agent
- **Trigger AI Call**: Initiate the AI voice agent with the provider context

## Key Data Structures

### Provider Object (from your database)
```typescript
interface Provider {
  _id: string;                    // MongoDB ObjectId - CRITICAL for MCP calls
  name: string;
  category: string;
  address: string;
  phone: string;
  website?: string;
  email?: string;
  rating?: number;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  state: string;
  accepts_uninsured: boolean;
  medicaid: boolean;
  medicare: boolean;
  ssn_required: boolean;
  telehealth_available: boolean;
  insurance_providers: string[];
  specialties?: string[];
  conditions_treated?: string[];
  eligibility_requirements?: string[];
  free_service_names?: string[];
}
```

### Service Object
```typescript
interface Service {
  _id: string;                    // MongoDB ObjectId
  provider_id: string;            // FK to Provider._id
  name: string;
  category: string;
  description: string;
  is_free: boolean;
  is_discounted: boolean;
  price_info: string;
}
```

## Frontend Implementation Examples

### 1. Provider Selection Component (React)

```tsx
// components/ProviderSelection.tsx
import React, { useState } from 'react';

interface ProviderSelectionProps {
  providers: Provider[];
  onScheduleAppointment: (providerId: string) => void;
}

export default function ProviderSelection({ 
  providers, 
  onScheduleAppointment 
}: ProviderSelectionProps) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const handleScheduleClick = () => {
    if (selectedProvider) {
      // Pass the MongoDB ObjectId to your AI agent
      onScheduleAppointment(selectedProvider._id);
    }
  };

  return (
    <div className="provider-grid">
      {providers.map((provider) => (
        <div key={provider._id} className="provider-card">
          <h3>{provider.name}</h3>
          <p>{provider.category}</p>
          <p>{provider.address}</p>
          <p>Phone: {provider.phone}</p>
          
          {/* Insurance Info */}
          <div className="insurance-badges">
            {provider.accepts_uninsured && <span className="badge">Uninsured OK</span>}
            {provider.medicaid && <span className="badge">Medicaid</span>}
            {provider.medicare && <span className="badge">Medicare</span>}
            {provider.telehealth_available && <span className="badge">Telehealth</span>}
          </div>

          {/* Free Services */}
          {provider.free_service_names && (
            <div className="free-services">
              <h4>Free Services:</h4>
              <ul>
                {provider.free_service_names.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={() => setSelectedProvider(provider)}
            className="select-button"
          >
            Select Provider
          </button>
        </div>
      ))}

      {selectedProvider && (
        <div className="selection-summary">
          <h3>Selected: {selectedProvider.name}</h3>
          <button 
            onClick={handleScheduleClick}
            className="schedule-button"
          >
            Schedule Appointment with AI Agent
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2. AI Agent Integration (Next.js API Route)

```typescript
// pages/api/schedule-appointment.ts (or app/api/schedule-appointment/route.ts)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { providerId, userPreferences } = req.body;

  if (!providerId) {
    return res.status(400).json({ message: 'Provider ID is required' });
  }

  try {
    // Initialize your AI voice agent with the provider context
    const aiAgentResponse = await initializeAIAgent({
      providerId,
      userPreferences,
      mcpServerConfig: {
        // Your MCP server connection details
        serverUrl: process.env.MCP_SERVER_URL,
        tools: [
          'get_voice_agent_context',
          'get_provider_by_id',
          'get_provider_services'
        ]
      }
    });

    res.status(200).json({
      success: true,
      agentSessionId: aiAgentResponse.sessionId,
      message: 'AI agent initialized for appointment scheduling'
    });

  } catch (error) {
    console.error('AI Agent initialization failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize AI agent' 
    });
  }
}

async function initializeAIAgent({ providerId, userPreferences, mcpServerConfig }) {
  // This is where you'd integrate with your specific AI voice agent
  // The AI agent will use the MCP server to get provider context
  
  // Example pseudo-code:
  const aiAgent = new YourAIVoiceAgent({
    mcpServer: mcpServerConfig,
    initialContext: {
      task: 'schedule_appointment',
      providerId: providerId,
      userPreferences: userPreferences
    }
  });

  // The AI agent will call these MCP tools:
  // 1. get_voice_agent_context(providerId) - Get full context for the call
  // 2. get_provider_services(providerId) - Get available services
  // 3. Additional tools as needed during the conversation

  return await aiAgent.initialize();
}
```

### 3. Provider Search with Location (React Hook)

```typescript
// hooks/useProviderSearch.ts
import { useState, useCallback } from 'react';

interface SearchFilters {
  serviceName?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  maxDistance?: number;
  freeOnly?: boolean;
  insurance?: string[];
}

export function useProviderSearch() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProviders = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Your API call to search providers
      // This should query your main database, not the MCP server directly
      const response = await fetch('/api/providers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error('Failed to search providers');
      }

      const data = await response.json();
      setProviders(data.providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { providers, loading, error, searchProviders };
}
```

### 4. Geographic Search Component

```tsx
// components/LocationSearch.tsx
import React, { useState, useEffect } from 'react';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState('');

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          onLocationSelect(lat, lng);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, [onLocationSelect]);

  const handleAddressSearch = async () => {
    // Use a geocoding service to convert address to coordinates
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data.lat && data.lng) {
        onLocationSelect(data.lat, data.lng);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  return (
    <div className="location-search">
      <div className="current-location">
        <button 
          onClick={() => userLocation && onLocationSelect(userLocation.lat, userLocation.lng)}
          disabled={!userLocation}
        >
          Use Current Location
        </button>
        {userLocation && (
          <span className="location-info">
            Current: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        )}
      </div>

      <div className="address-search">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address or zip code"
        />
        <button onClick={handleAddressSearch}>
          Search Address
        </button>
      </div>
    </div>
  );
}
```

## MCP Server Integration Points

### Where Your Frontend Connects to MCP

Your frontend **does NOT directly call the MCP server**. Instead:

1. **Frontend** → Displays providers and handles user selection
2. **AI Voice Agent** → Uses MCP server to get provider context
3. **MCP Server** → Provides rich context about the selected provider

### Critical Data Flow

```typescript
// 1. User selects provider in your React app
const selectedProviderId = "507f1f77bcf86cd799439011"; // MongoDB ObjectId

// 2. Frontend triggers AI agent with provider ID
await fetch('/api/schedule-appointment', {
  method: 'POST',
  body: JSON.stringify({ 
    providerId: selectedProviderId,
    userPreferences: {
      preferredTime: "morning",
      serviceType: "consultation",
      insurance: "Blue Cross"
    }
  })
});

// 3. AI Agent calls MCP server tools:
// - get_voice_agent_context(providerId) 
// - get_provider_services(providerId)
// - get_provider_by_id(providerId)

// 4. MCP server returns rich context for AI to use in phone call
```

## Required Frontend API Endpoints

You'll need these API routes in your Next.js app:

### 1. Provider Search
```typescript
// GET /api/providers/search
// POST /api/providers/search
// Returns: Provider[]
```

### 2. Provider Details
```typescript
// GET /api/providers/[id]
// Returns: Provider with services
```

### 3. Services by Provider
```typescript
// GET /api/providers/[id]/services
// Returns: Service[]
```

### 4. Schedule Appointment (AI Trigger)
```typescript
// POST /api/schedule-appointment
// Body: { providerId: string, userPreferences: object }
// Returns: { sessionId: string, status: string }
```

## Environment Variables for Frontend

```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/sie-db
MCP_SERVER_URL=http://localhost:3004  # If exposing MCP over HTTP
AI_AGENT_API_KEY=your_ai_agent_key
GEOCODING_API_KEY=your_geocoding_key
```

## TypeScript Definitions

```typescript
// types/provider.ts
export interface Provider {
  _id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website?: string;
  email?: string;
  rating?: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  state: string;
  accepts_uninsured: boolean;
  medicaid: boolean;
  medicare: boolean;
  ssn_required: boolean;
  telehealth_available: boolean;
  insurance_providers: string[];
  specialties?: string[];
  conditions_treated?: string[];
  eligibility_requirements?: string[];
  free_service_names?: string[];
  total_services?: number;
  free_services?: number;
}

export interface Service {
  _id: string;
  provider_id: string;
  name: string;
  category: string;
  description: string;
  is_free: boolean;
  is_discounted: boolean;
  price_info: string;
}

export interface SearchFilters {
  serviceName?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  maxDistance?: number;
  freeOnly?: boolean;
  acceptsUninsured?: boolean;
  medicaid?: boolean;
  medicare?: boolean;
  telehealthAvailable?: boolean;
}

export interface AppointmentRequest {
  providerId: string;
  userPreferences: {
    preferredTime?: string;
    serviceType?: string;
    insurance?: string;
    notes?: string;
  };
}
```

## Testing Your Integration

### 1. Test Provider Selection
```bash
# Start the MCP server
cd mcp-server
docker-compose up -d

# Add test data to MongoDB
docker exec -it sie-mongodb mongosh sie-db
```

### 2. Test AI Agent Integration
```typescript
// test/ai-integration.test.ts
describe('AI Agent Integration', () => {
  it('should pass correct provider ID to AI agent', async () => {
    const providerId = "507f1f77bcf86cd799439011";
    
    const response = await fetch('/api/schedule-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

## Common Integration Patterns

### 1. Provider Card Component
```tsx
<ProviderCard 
  provider={provider}
  onSelect={(id) => handleProviderSelect(id)}
  showServices={true}
  showInsurance={true}
/>
```

### 2. Search Results
```tsx
<ProviderSearchResults
  providers={searchResults}
  onProviderSelect={handleScheduleAppointment}
  loading={searchLoading}
/>
```

### 3. Appointment Flow
```tsx
<AppointmentFlow
  selectedProvider={selectedProvider}
  onConfirm={(details) => triggerAIAgent(details)}
  userPreferences={userPreferences}
/>
```

## Performance Considerations

1. **Lazy Load Provider Details**: Only fetch full provider data when needed
2. **Cache Search Results**: Cache provider searches by location/service
3. **Optimize Images**: Use next/image for provider logos/photos
4. **Virtual Scrolling**: For large provider lists
5. **Geographic Indexing**: Use location-based queries efficiently

## Security Considerations

1. **Validate Provider IDs**: Ensure ObjectIds are valid before passing to AI
2. **Sanitize User Input**: Clean all search inputs
3. **Rate Limiting**: Limit API calls per user
4. **Error Handling**: Never expose internal errors to users

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MCP server running and accessible
- [ ] MongoDB populated with provider data
- [ ] AI agent integration tested
- [ ] Provider search working
- [ ] Appointment scheduling flow tested
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Security measures in place

## Support & Troubleshooting

### Common Issues

1. **Provider ID not found**: Ensure you're using valid MongoDB ObjectIds
2. **AI agent not getting context**: Check MCP server logs
3. **Search returning no results**: Verify MongoDB data and indexes
4. **Location search failing**: Check geocoding API configuration

### Debug Commands

```bash
# Check MCP server status
docker-compose ps

# View MCP server logs
docker-compose logs -f mcp-server

# Test MongoDB connection
docker exec -it sie-mongodb mongosh sie-db

# Test provider data
db.providers.findOne()
db.services.find().limit(5)
```

This integration guide provides everything you need to connect your React/Next.js frontend with the MCP server for seamless AI-powered appointment scheduling!


### 1. Database Schemas (schemas.py)
**Key Models:**
- `ProviderDoc`: Complete provider information with location, insurance, services
- `ServiceDoc`: Individual service details with pricing and categories
- `VoiceAgentContext`: Rich context for AI scheduling calls
- `Location`: GeoJSON Point for geographic data

**Important Fields:**
- Provider: `_id`, `name`, `category`, `address`, `phone`, `accepts_uninsured`, `medicaid`, `medicare`, `ssn_required`, `telehealth_available`, `location.coordinates`, `eligibility_requirements`, `specialties`, `conditions_treated`, `service_categories`, `free_service_names`, `summary_text`
- Service: `provider_id` (FK), `name`, `category`, `description`, `is_free`, `is_discounted`, `price_info`, `updated_at`

### 2. Database Service (database.py)
**Class**: `DatabaseService`
**Key Methods:**
- `get_provider_by_id(provider_id)`: Fetch provider by MongoDB ObjectId
- `get_provider_services(provider_id, free_only=False)`: Get services with optional free filter
- `get_voice_agent_context(provider_id)`: Generate comprehensive AI context
- `search_providers_by_service(service_name, location, max_distance=25)`: Geographic service search
- `_calculate_distance()`: Haversine formula for geo calculations
- `_generate_context_summary()`: Human-readable AI context

**Database Configuration:**
- URI: `mongodb://mongodb:27017/sie-db`
- Database: `sie-db`
- Collections: `providers`, `services`

### 3. MCP Tools (tools.py)
**4 Implemented Tools:**

1. **get_provider_by_id**
   - Input: `provider_id` (string - MongoDB ObjectId)
   - Output: Complete provider JSON

2. **get_provider_services**
   - Input: `provider_id` (string), `free_only` (boolean, default false)
   - Output: Array of services

3. **get_voice_agent_context**
   - Input: `provider_id` (string)
   - Output: Rich context summary + detailed data
   - **MOST IMPORTANT**: This is the primary tool for AI scheduling

4. **search_providers_by_service**
   - Input: `service_name` (string), `location` (lat/lng), `max_distance` (number, default 25)
   - Output: Providers with matching services within distance

### 4. MCP Server (server.py)
**Class**: `SIEWellnessMCPServer`
**Protocol**: stdio (not HTTP) - follows MCP standard
**Implementation**: Uses low-level MCP server API (mcp.server.lowlevel)
**Key Features:**
- Async tool handlers for all 4 tools
- JSON serialization with proper error handling
- Logging to stderr for debugging
- Database connection management
- Updated for current MCP SDK compatibility

### 5. Configuration (config.py)
**Environment Variables:**
- `MONGODB_URI`: Default `mongodb://mongodb:27017/sie-db`
- `MONGODB_DB_NAME`: Default `sie-db`
- `MCP_PORT`: Default `3004`

## Docker Configuration

### Dockerfile
- Base: `python:3.11-slim`
- User: `mcpuser` (non-root)
- CMD: `python -m src.server`

### Docker Compose
**Services:**
- `mcp-server`: Main application container (stdio protocol, no exposed ports)
- `mongodb`: MongoDB 7.0 (no authentication for MVP)

**Networks:** `sie-network`
**Volumes:** `mongodb_data` for persistence

**Note:** MCP servers run on stdio protocol, not HTTP, so no health checks or port exposure needed

## Key Implementation Details

### Context Generation for AI Agents
The `get_voice_agent_context` tool generates human-readable summaries:
```
{Provider Name} is a {category} located at {address}.
Phone: {phone}
Rating: {rating}/5

SERVICES: Offers {total} total services, including {free_count} free services.
Free services include: {top_3_free_services}

INSURANCE: Accepts {insurance_list}
ACCESS: {access_requirements}

APPOINTMENT CONTEXT: This provider was selected by the user for AI-assisted appointment scheduling.
```

### Geographic Search
- Uses Haversine formula for distance calculations
- MongoDB 2dsphere indexes for location queries
- Default search radius: 25 miles
- Coordinates stored as `[longitude, latitude]` (GeoJSON format)