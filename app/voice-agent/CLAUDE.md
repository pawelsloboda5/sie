# Voice Agent Implementation - Key Details & Context

## System Architecture Overview

### Core Data Structure (VoiceAgentCallRequest)
- **Complete centralized interface** containing all call data
- Includes: patient info, provider configurations, availability, call metadata
- Stored in localStorage with session restoration capabilities
- Full TypeScript safety across all components

### Key Components & Relationships

#### 1. ProviderSelector Component
- Uses `FavoriteProvider` data from localStorage (saved via heart icon)
- Fetches real services via `getServicesForProviders()` from cached search results
- Collects patient info (firstName, lastName) for AI agent identity
- Per-provider configuration:
  - **Selected Services**: Specific services to verify during call
  - **Filter Verification**: Policies to confirm (Medicaid, free services, etc.)

#### 2. AvailabilityPicker Component  
- Calendar-based date selection with multi-date support
- **Time Slots**: Specific times (e.g., "10:00 AM", "2:00 PM")
- **Time Ranges**: Flexible ranges (e.g., "9:00" to "17:00")
- Enhanced with dayOfWeek calculation for context

#### 3. AgentCallSimulator Component
- Receives complete `VoiceAgentCallRequest` object
- Uses real patient info, provider configs, and availability
- Enhanced call results with actual verification data

### Data Flow Architecture
```
User Input → Component State → Validation → VoiceAgentCallRequest → localStorage → AI API
```

## Database Integration

### FavoriteProvider Structure
- Stored in localStorage via voiceAgent.ts functions
- Contains: _id, name, address, phone, filters, category, savedAt
- Only providers with valid MongoDB ObjectIds can be used for AI calling
- Filters indicate provider policies (acceptsMedicaid, freeServicesOnly, etc.)

### Services Data Source
- Services fetched from `cachedSearchResults` in IndexedDB
- Function: `getServicesForProviders(providerIds: string[])`
- Returns services grouped by provider with pricing info
- Sorted by: free services first, then discounted, then alphabetical

### Session Management
- Auto-save complete session data to localStorage
- Session restoration on page reload with date object handling
- Validation at each step before proceeding
- Cleanup after successful call completion

## Key Interface Definitions

### VoiceAgentCallRequest
```typescript
{
  requestId: string                          // Unique session identifier
  patientInfo: PatientInfo                   // Patient name for AI calls
  providerConfigurations: ProviderSelectionData[]  // Provider-specific configs
  availability: AvailabilitySlot[]           // User availability with times
  callMetadata: { timestamp, callType, selectedProviderIds, totalProviders }
}
```

### ProviderSelectionData
```typescript
{
  providerId: string
  providerName: string                       // Added for API context
  selectedServices: DatabaseService[]       // Specific services to verify
  verifyFilters: {                          // Policies to confirm during call
    freeServicesOnly: boolean
    acceptsMedicaid: boolean
    acceptsMedicare: boolean
    acceptsUninsured: boolean
    noSSNRequired: boolean
    telehealthAvailable: boolean
  }
}
```

### AvailabilitySlot
```typescript
{
  date: Date
  dayOfWeek: string                         // "Monday", "Tuesday", etc.
  timeSlots: string[]                       // ["10:00 AM", "2:00 PM"]
  timeRanges?: Array<{                      // Flexible ranges
    start: string                           // "9:00"
    end: string                             // "17:00"
  }>
}
```

## API Integration Points

### Current Route: `/api/voice-agent-call`
- POST: Initialize voice call with complete call request data
- GET: Continue conversation with callId and turn number
- Enhanced to receive structured VoiceAgentCallRequest

### TTS Route: `/api/voice-agent-call/tts`
- POST: Generate speech from text with speaker voice selection
- Used for realistic conversation playback

## Azure OpenAI Integration Context

### Available Data for Conversation Flow
1. **Patient Context**: First name, last name for AI agent identity
2. **Provider Context**: Name, address, phone, known policies
3. **Service Context**: Specific services to verify with pricing info
4. **Filter Context**: Specific policies to confirm (one per turn)
5. **Availability Context**: Exact dates, times, and day-of-week

### Conversation Requirements
- Structured turn-by-turn flow
- Real provider data validation
- Filter verification one at a time
- Graceful exit on any "no" response
- Appointment scheduling with specific availability

## Technical Implementation Notes

### Error Handling & Validation
- Comprehensive form validation before API calls
- Session recovery on browser refresh
- Graceful degradation for missing data
- Type safety throughout entire flow

### Performance Considerations
- Lazy database initialization for SSR compatibility
- Efficient service filtering from cached results
- Minimal localStorage usage with cleanup
- Parallel component updates where possible

### User Experience Features
- Real-time validation feedback
- Session restoration notifications
- Progress indicators through call flow
- Detailed call results with verification status

## Critical Implementation Details

### Provider Data Requirements
- Must have valid MongoDB ObjectId (24 char hex)
- Must be saved via heart icon from search results
- Services must exist in cached search results
- Phone number required for actual calling

### Availability Handling
- Support both specific times AND flexible ranges
- Day-of-week context for natural conversation
- Multiple dates supported per session
- Validation ensures at least one time specified

### Call Result Enhancement
- Maps verified filters to actual user selections
- Includes discussed services in results
- Provides detailed conversation transcript
- Links appointment to specific availability slot

## Next Implementation Phase
- Azure OpenAI conversation engine
- Structured turn-by-turn dialog flow
- Real provider data integration
- Enhanced result processing and display
