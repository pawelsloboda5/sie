# Voice Agent Call API Documentation

## Overview
The Voice Agent Call API simulates realistic healthcare appointment scheduling conversations using Azure OpenAI. It maintains conversation state across multiple turns and provides structured call results.

## Endpoints

### POST `/api/voice-agent-call`
Initialize a new voice agent call conversation.

**Request Body:**
```json
{
  "callRequest": {
    "requestId": "va_1234567890_abc123",
    "patientInfo": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "providerConfigurations": [{
      "providerId": "507f1f77bcf86cd799439011",
      "providerName": "Downtown Health Clinic",
      "selectedServices": [{
        "_id": "service123",
        "name": "Mammogram Screening",
        "category": "Preventive Care"
      }],
      "verifyFilters": {
        "acceptsMedicaid": true,
        "freeServicesOnly": false,
        "noSSNRequired": true
      }
    }],
    "availability": [{
      "date": "2024-01-15",
      "dayOfWeek": "Monday",
      "timeSlots": ["10:00 AM", "2:00 PM"],
      "timeRanges": [{"start": "9:00", "end": "12:00"}]
    }]
  }
}
```

**Response:**
```json
{
  "callId": "call_1234567890_xyz789",
  "firstTurn": {
    "speaker": "receptionist",
    "text": "Hello, this is Downtown Health Clinic, how may I help you?",
    "timestamp": 1641234567890,
    "turn": 0
  },
  "providerContext": {
    "name": "Downtown Health Clinic",
    "address": "123 Main St",
    "phone": "(555) 123-4567"
  }
}
```

### GET `/api/voice-agent-call?callId={id}&turn={number}&providerId={id}`
Continue an existing conversation to the next turn.

**Parameters:**
- `callId`: Unique conversation identifier
- `turn`: Current turn number (for validation)
- `providerId`: Provider ID (for context)

**Response:**
```json
{
  "turn": {
    "speaker": "agent",
    "text": "Hello, this is John Doe. I'm calling to inquire about your mammogram screening services.",
    "timestamp": 1641234567891,
    "turn": 1
  },
  "ended": false,
  "conversationState": {
    "phase": "service_inquiry",
    "currentTurn": 1,
    "verifiedFilters": {}
  }
}
```

**End of Conversation Response:**
```json
{
  "ended": true,
  "finalResult": {
    "providerId": "507f1f77bcf86cd799439011",
    "providerName": "Downtown Health Clinic",
    "success": true,
    "appointmentTime": "10:00 AM",
    "filtersVerified": {
      "acceptsMedicaid": {"verified": true, "notes": "Yes, we accept Medicaid"},
      "noSSNRequired": {"verified": true, "notes": "No SSN required"}
    },
    "transcript": [
      "Receptionist: Hello, this is Downtown Health Clinic...",
      "AI Agent: Hello, this is John Doe..."
    ]
  }
}
```

## Conversation Flow

### Phase 1: Greeting (Turns 0-2)
1. **Receptionist**: Opens with provider greeting
2. **AI Agent**: Introduces patient and purpose

### Phase 2: Service Inquiry (Turns 3-4)
3. **AI Agent**: Asks about specific selected service
4. **Receptionist**: Confirms service availability (or exits if unavailable)

### Phase 3: Filter Verification (Variable turns)
For each filter marked as `true` in `verifyFilters`:
- **AI Agent**: Asks filter-specific question
- **Receptionist**: Responds based on provider's actual capabilities
- **Exit condition**: If any required filter fails, conversation ends politely

### Phase 4: Scheduling (When all filters pass)
- **AI Agent**: Presents patient availability
- **Receptionist**: Confirms available appointment time

### Phase 5: Confirmation & Closing
- Final appointment confirmation
- Polite goodbyes

## Conversation State Management

### State Persistence
- Conversations stored in memory (in-memory Map)
- Full conversation history maintained
- Phase tracking and filter verification status
- Automatic cleanup on completion

### State Structure
```typescript
interface ConversationState {
  callId: string
  callRequest: VoiceAgentCallRequest
  providerConfig: ProviderSelectionData
  providerData: FavoriteProvider
  conversationHistory: ConversationTurn[]
  currentTurn: number
  phase: 'greeting' | 'service_inquiry' | 'filter_verification' | 'scheduling' | 'confirmation' | 'closing'
  verifiedFilters: Record<string, {verified: boolean, notes?: string}>
  selectedAppointment?: {date: string, time: string, dayOfWeek: string}
  success: boolean
  ended: boolean
}
```

## Azure OpenAI Integration

### Environment Variables Required
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_CHAT_MODEL=gpt-35-turbo
```

### Dynamic Prompting
- Context-aware system prompts for each speaker
- Real provider data integration
- Conversation history included in each request
- Phase-specific instructions and behavior

### Fallback Responses
- Predefined responses if Azure OpenAI fails
- Maintains conversation flow even during API issues
- Graceful degradation to basic conversation patterns

## Filter Verification Logic

### Supported Filters
1. **freeServicesOnly**: "Do you offer any free services or sliding scale fees?"
2. **acceptsMedicaid**: "Do you accept Medicaid insurance?"
3. **acceptsMedicare**: "Do you accept Medicare insurance?"
4. **acceptsUninsured**: "Do you accept patients without insurance?"
5. **noSSNRequired**: "Do you require a Social Security Number for treatment?"
6. **telehealthAvailable**: "Do you offer telehealth or virtual appointments?"

### Verification Process
- Filters verified sequentially in predefined order
- Responses analyzed for positive/negative indicators
- Failed filters trigger polite conversation exit
- All successful verifications recorded with notes

## Error Handling

### Common Error Scenarios
1. **Missing Provider**: Returns 404 if provider not found in favorites
2. **Azure OpenAI Failure**: Falls back to predefined responses
3. **Invalid Call ID**: Returns 404 for expired/invalid conversations
4. **Missing Required Data**: Returns 400 with validation errors

### Graceful Degradation
- Fallback responses maintain conversation flow
- Conversation state preserved even during API failures
- Clear error messages for debugging

## Testing the API

### Prerequisites
1. Azure OpenAI service configured
2. Environment variables set
3. At least one provider saved in favorites (via heart icon)
4. Recent search results cached for service data

### Test with cURL

**Initialize Conversation:**
```bash
curl -X POST http://localhost:3000/api/voice-agent-call \
  -H "Content-Type: application/json" \
  -d '{
    "callRequest": {
      "requestId": "test_call_001",
      "patientInfo": {"firstName": "John", "lastName": "Doe"},
      "providerConfigurations": [...]
    }
  }'
```

**Continue Conversation:**
```bash
curl "http://localhost:3000/api/voice-agent-call?callId=call_123&turn=1&providerId=provider_456"
```

### Expected Behavior
1. **Successful Flow**: Service available → All filters pass → Appointment scheduled
2. **Service Unavailable**: Conversation ends after service inquiry
3. **Filter Failure**: Conversation ends when required filter fails
4. **Complete Flow**: Full conversation with transcript and appointment details

## Data Flow Integration

### Provider Data Source
- Uses `getFavoriteProviders()` from `@/lib/voiceAgent`
- Accesses real provider capabilities and contact info
- Filters responses based on actual provider data

### Service Verification
- Cross-references selected services with cached search results
- Validates service availability for specific provider
- Provides realistic service-specific responses

### Appointment Scheduling
- Uses real patient availability from `AvailabilitySlot[]`
- Considers both time slots and time ranges
- Includes day-of-week context for natural conversation

This API provides a complete, stateful conversation system that maintains context across all turns and integrates with real provider and service data.