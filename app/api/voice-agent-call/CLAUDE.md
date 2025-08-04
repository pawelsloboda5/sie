# Voice Agent Call - Azure OpenAI Responses API Implementation

## Overview
This API endpoint implements a deterministic voice agent for healthcare appointment scheduling using Azure OpenAI's Responses API. The system uses a Finite State Machine (FSM) approach to ensure predictable conversation flow.

## Architecture

### Finite State Machine (FSM)
The conversation follows a strict state machine pattern:

```
greeted → askService → waitServiceConfirm → askVerify → waitVerifyConfirm → schedule → waitScheduleConfirm → done/failed
```

### States
- **greeted**: Receptionist has greeted the caller
- **askService**: Caller asks "Do you offer [service] for free?"
- **waitServiceConfirm**: Waiting for receptionist Yes/No confirmation
- **askVerify**: Caller asks next verification requirement
- **waitVerifyConfirm**: Waiting for receptionist Yes/No on verification
- **schedule**: Caller requests appointment time
- **waitScheduleConfirm**: Waiting for receptionist scheduling confirmation
- **done**: Successfully completed
- **failed**: Service unavailable or verification failed

### Data Structures

```typescript
type Stage = 
  | "greeted" 
  | "askService" 
  | "waitServiceConfirm" 
  | "askVerify" 
  | "waitVerifyConfirm" 
  | "schedule" 
  | "waitScheduleConfirm" 
  | "done" 
  | "failed"

interface ResponsesAPICallState {
  callId: string
  currentTurnNumber: number
  lastResponseId?: string
  stage: Stage
  pendingVerifications: string[]
  verified: Record<string, boolean>
  currentVerification?: string
  patientInfo: PatientPreferences
  providerData: ProviderData
  selectedService: ServiceSelection
  verificationRequirements: string[]
  conversationHistory: Array<{
    speaker: 'caller' | 'receptionist'
    text: string
    timestamp: number
  }>
}
```

## Key Features

### 1. Deterministic Flow Control
- All conversation logic is handled in TypeScript, not delegated to the AI model
- Each state has specific input/output expectations
- No model "guessing" about conversation flow

### 2. Structured JSON Outputs
Uses Azure OpenAI's structured output capability:
```typescript
const response_format = { type: "json_object" }
const schema = {
  type: "object",
  required: ["speech"],
  properties: { 
    speech: { type: "string", maxLength: 50 }
  }
}
```

### 3. Verification Queue System
- Builds queue of verification requirements from `selectedService.requiresVerification`
- Processes one verification per turn
- Tracks completion state in `verified` object

### 4. Simple Yes/No Parsing
Receptionist responses are constrained to simple patterns:
- "Yes." for positive confirmation
- "No." for negative confirmation
- Parsing uses regex: `/yes\b|we do\b/i` and `/no\b|we don't\b/i`

## API Endpoints

### POST `/api/voice-agent-call`
Initializes a new voice call simulation.

**Request Body:**
```json
{
  "providerId": "string",
  "selectedService": {
    "serviceId": "string",
    "serviceName": "string",
    "requiresVerification": {
      "isFree": boolean,
      "acceptsMedicaid": boolean,
      "acceptsMedicare": boolean,
      "acceptsUninsured": boolean,
      "noSSNRequired": boolean,
      "telehealthAvailable": boolean
    }
  },
  "patientPreferences": {
    "firstName": "string",
    "lastName": "string",
    "insurance": "string",
    "preferredDates": [...]
  },
  "verificationRequirements": ["string"],
  "simulationMode": boolean
}
```

**Response:**
```json
{
  "success": true,
  "callId": "string",
  "conversation": {
    "turns": [...],
    "status": "string"
  },
  "firstTurn": {
    "speaker": "receptionist",
    "text": "string",
    "voiceId": "string"
  }
}
```

### GET `/api/voice-agent-call?callId=X&turn=Y`
Generates the next conversation turn.

**Response:**
```json
{
  "turn": {
    "speaker": "caller|receptionist",
    "text": "string",
    "voiceId": "string",
    "timestamp": number
  },
  "turnNumber": number,
  "callId": "string"
}
```

## Verification Questions Mapping

```typescript
const VERIFICATION_QUESTIONS: Record<string, string> = {
  isFree: "Is that service free of charge?",
  acceptsMedicaid: "Do you accept Medicaid?",
  acceptsMedicare: "Do you accept Medicare?",
  acceptsUninsured: "Do you work with uninsured patients?",
  noSSNRequired: "Can we book without providing an SSN?",
  telehealthAvailable: "Is telehealth available for this service?"
}
```

## Error Handling & Fallbacks

### Azure API Empty Response Fallback
```typescript
if (!response.content || response.content.trim() === '') {
  console.log('⚠️ Azure Responses API returned empty content, using fallback')
  response.content = generateFallbackResponse(speaker, stage)
}
```

### Safety Mechanisms
- Conversation length limits (max 20 turns)
- Repeated phrase detection
- Invalid state transition protection
- Timeout handling for stuck conversations

## Environment Variables
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_CHAT_MODEL=gpt-4o-mini
VOICE_ID_CALLER=Fz7HYdHHCP1EF1FLn46C
VOICE_ID_RECEPTIONIST=kPzsL2i3teMYv0FxEYQ6
ENABLE_TTS_AUDIO=true
```

## Testing Strategy

### Unit Tests
- Test each FSM state transition
- Mock Azure API responses
- Verify verification queue processing

### Integration Tests
- Full conversation flows
- Error scenarios (service unavailable, verification failures)
- Azure API integration

### Example Test Cases
```typescript
// Service available, all verifications pass
const testFlow1 = {
  service: "Mammogram Screening",
  verifications: ["isFree", "acceptsUninsured"],
  expectedFlow: ["askService", "askVerify", "askVerify", "schedule", "done"]
}

// Service unavailable
const testFlow2 = {
  service: "Heart Surgery",
  receptionistResponse: "No.",
  expectedFlow: ["askService", "failed"]
}
```

## Future Enhancements

### Real Database Integration
Replace mock provider data with MongoDB queries:
```typescript
async function getProviderData(providerId: string): Promise<ProviderData> {
  const client = new MongoClient(MONGODB_URI)
  const provider = await client.db().collection('providers').findOne({_id: new ObjectId(providerId)})
  return provider
}
```

### Function Calling for Scheduling
Implement actual appointment booking:
```typescript
const tools = [{
  name: "schedule_appointment",
  description: "Book a real appointment slot",
  parameters: {
    type: "object",
    properties: {
      date: { type: "string" },
      time: { type: "string" },
      serviceId: { type: "string" }
    }
  }
}]
```

### Redis State Storage
Replace in-memory state with Redis for production:
```typescript
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

async function saveCallState(callId: string, state: ResponsesAPICallState) {
  await redis.setex(`call:${callId}`, 3600, JSON.stringify(state))
}
```

## Known Issues & Limitations

1. **Memory Storage**: Call states are stored in memory and lost on server restart
2. **Single Server**: No horizontal scaling support
3. **Mock Data**: Provider data is hardcoded for demo purposes
4. **Azure API Dependency**: Relies on preview Azure OpenAI Responses API
5. **No Authentication**: No user authentication or authorization

## Performance Considerations

- **Response Time**: Target <2s per turn generation
- **Memory Usage**: Clean up completed call states after 1 hour
- **Rate Limiting**: Implement Azure API rate limiting
- **Caching**: Cache provider data to reduce database calls

## Security Notes

- API keys stored in environment variables
- No sensitive patient data persisted
- All requests logged for audit purposes
- Input validation on all endpoints