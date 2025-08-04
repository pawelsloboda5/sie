# Azure OpenAI Voice Agent Call Implementation Plan

## Overview
Create a structured conversation flow using Azure OpenAI to simulate realistic healthcare appointment scheduling calls between an AI agent (representing the patient) and a healthcare provider receptionist.

## Core Architecture

### Data Flow
```
VoiceAgentCallRequest → Azure OpenAI → Structured Conversation → Call Results
```

### Key Components
1. **Conversation Engine**: Azure OpenAI with structured prompting
2. **Provider Data Integration**: Real FavoriteProvider data from db.ts
3. **Turn Management**: Sequential conversation flow with state tracking
4. **Result Processing**: Structured call outcomes with verification status

## Conversation Flow Structure

### Phase 1: Initial Greeting
1. **Receptionist Opens**: "Hello, this is [providerName], how may I help you?"
2. **AI Agent Response**: Introduces self as patient representative
   - "Hello, this is [patientFirstName] [patientLastName], I'm calling to inquire about your services."

### Phase 2: Service Inquiry
3. **AI Agent**: Asks about specific selected service
   - "I'm interested in [selectedService.name]. Do you offer this service?"
4. **Receptionist Response**: Based on real FavoriteProvider data
   - **If service exists**: "Yes, we do offer [service.name]. [Additional service details]"
   - **If service doesn't exist**: "I'm sorry, we don't currently offer that service. [Alternative suggestions]"
   - **Exit condition**: If no → AI agent says goodbye and ends call

### Phase 3: Filter Verification (One Turn Per Filter)
For each `verifyFilters` set to `true`, sequential verification:

#### Filter 1: Free Services (if selected)
5. **AI Agent**: "Do you offer any free services or have sliding scale fees?"
6. **Receptionist**: Based on provider.filters.freeServicesOnly
   - **If true**: "Yes, we do offer some free services/sliding scale options."
   - **If false**: "Our services require payment, but we may have payment plans available."
   - **Exit condition**: If user needs free services but none available → goodbye

#### Filter 2: Medicaid Acceptance (if selected)
7. **AI Agent**: "Do you accept Medicaid insurance?"
8. **Receptionist**: Based on provider.filters.acceptsMedicaid
   - **If true**: "Yes, we accept Medicaid insurance."
   - **If false**: "Unfortunately, we don't currently accept Medicaid."
   - **Exit condition**: If user has Medicaid but not accepted → goodbye

#### Filter 3: Medicare Acceptance (if selected)
9. **AI Agent**: "Do you accept Medicare insurance?"
10. **Receptionist**: Based on provider.filters.acceptsMedicare
    - **If true**: "Yes, we accept Medicare insurance."
    - **If false**: "Unfortunately, we don't currently accept Medicare."
    - **Exit condition**: If user has Medicare but not accepted → goodbye

#### Filter 4: Uninsured Patients (if selected)
11. **AI Agent**: "Do you accept patients without insurance?"
12. **Receptionist**: Based on provider.filters.acceptsUninsured
    - **If true**: "Yes, we do accept uninsured patients."
    - **If false**: "We typically require insurance coverage for our services."
    - **Exit condition**: If user is uninsured but not accepted → goodbye

#### Filter 5: No SSN Required (if selected)
13. **AI Agent**: "Do you require a Social Security Number for treatment?"
14. **Receptionist**: Based on provider.filters.noSSNRequired
    - **If true**: "No, we don't require a Social Security Number."
    - **If false**: "Yes, we do require a Social Security Number for our records."
    - **Exit condition**: If user can't provide SSN but it's required → goodbye

#### Filter 6: Telehealth Available (if selected)
15. **AI Agent**: "Do you offer telehealth or virtual appointments?"
16. **Receptionist**: Based on provider.filters.telehealthAvailable
    - **If true**: "Yes, we offer telehealth appointments."
    - **If false**: "We currently only offer in-person appointments."
    - **Exit condition**: If user needs telehealth but not available → goodbye

### Phase 4: Scheduling (Only if all filters pass)
17. **AI Agent**: Presents availability options
    - "I'm available on [dayOfWeek], [date] at [timeSlots] or between [timeRanges]"
    - Multiple dates/times from AvailabilitySlot array
18. **Receptionist**: Always confirms one of the available times
    - "Let me check our schedule... Yes, we have availability on [selectedDate] at [selectedTime]"
    - Picks from provided availability options

### Phase 5: Appointment Confirmation
19. **AI Agent**: Confirms details
    - "Perfect! So that's [selectedService] on [selectedDate] at [selectedTime] for [patientName]"
20. **Receptionist**: Final confirmation
    - "That's correct. We'll see you on [date] at [time]. Please arrive 15 minutes early."

### Phase 6: Closing
21. **AI Agent**: "Thank you so much for your help!"
22. **Receptionist**: "You're welcome! Have a great day!"

## Technical Implementation Details

### Azure OpenAI Integration

#### System Prompt Structure
```
You are simulating a healthcare appointment scheduling conversation.
You will play TWO roles alternately:

1. RECEPTIONIST at [providerName]:
   - Professional, helpful healthcare receptionist
   - Has access to provider information: [provider data]
   - Responds based on actual provider capabilities
   - Always picks an available appointment time if asked

2. AI AGENT representing patient [patientName]:
   - Polite, direct, asks specific questions
   - Inquires about specific service: [selectedService]
   - Verifies each required filter: [filterList]
   - Provides availability: [availabilityData]
   - Exits politely if requirements not met
```

#### Request/Response Structure
```typescript
interface ConversationRequest {
  callRequest: VoiceAgentCallRequest
  providerConfig: ProviderSelectionData
  currentTurn: number
  conversationHistory: ConversationTurn[]
}

interface ConversationResponse {
  turn: ConversationTurn
  ended: boolean
  nextAction: 'continue' | 'schedule' | 'exit'
  verificationResults: FilterVerificationStatus
}
```

### Provider Data Integration

#### FavoriteProvider Lookup
```typescript
// Get provider from saved favorites using providerId
const provider = await getFavoriteProviders().find(p => p._id === providerId)
```

#### Service Verification
```typescript
// Check if requested service exists for this provider
const services = await getServicesForProviders([providerId])
const serviceExists = services[providerId].some(s => s._id === selectedServiceId)
```

#### Filter Mapping
```typescript
const filterResponses = {
  freeServicesOnly: provider.filters.freeServicesOnly,
  acceptsMedicaid: provider.filters.acceptsMedicaid,
  // ... etc
}
```

### Conversation State Management

#### Turn Tracking
- Track current conversation turn number
- Maintain conversation history
- Determine next required action (service check, filter verify, schedule, exit)

#### Exit Conditions
- Service not available → immediate polite exit
- Any required filter not met → polite exit with explanation
- All filters met → proceed to scheduling

#### Success Conditions
- Service available ✓
- All selected filters verified ✓
- Appointment scheduled ✓

### API Route Implementation

#### POST `/api/voice-agent-call`
**Input**: Complete VoiceAgentCallRequest
**Process**:
1. Extract provider data from favorites
2. Initialize conversation with receptionist greeting
3. Set up conversation context for Azure OpenAI
4. Return first turn and conversation state

#### GET `/api/voice-agent-call?callId&turn&providerId`
**Input**: Conversation continuation parameters
**Process**:
1. Retrieve conversation state
2. Determine next conversation phase
3. Generate appropriate AI response using Azure OpenAI
4. Update conversation state
5. Return next turn or completion signal

### Response Generation Logic

#### Phase Detection
```typescript
const determineConversationPhase = (turn: number, verifiedFilters: FilterStatus) => {
  if (turn <= 2) return 'greeting'
  if (turn <= 4) return 'service_inquiry'
  if (hasUnverifiedFilters(verifiedFilters)) return 'filter_verification'
  if (turn >= maxTurns - 4) return 'scheduling'
  return 'closing'
}
```

#### Filter Verification Sequencing
```typescript
const getNextFilterToVerify = (providerConfig: ProviderSelectionData, verified: FilterStatus) => {
  const filterOrder = ['freeServicesOnly', 'acceptsMedicaid', 'acceptsMedicare', 'acceptsUninsured', 'noSSNRequired', 'telehealthAvailable']
  return filterOrder.find(filter => 
    providerConfig.verifyFilters[filter] && !verified[filter]
  )
}
```

### Result Processing

#### Call Outcome Determination
```typescript
interface CallResult {
  success: boolean
  appointmentScheduled: boolean
  exitReason?: 'service_unavailable' | 'filter_failed' | 'completed'
  verifiedFilters: Record<string, {verified: boolean, notes: string}>
  selectedAppointment?: {date: string, time: string}
  conversationTranscript: string[]
}
```

## Implementation Phases

### Phase 1: Basic Conversation Engine
- Set up Azure OpenAI integration
- Implement basic greeting and service inquiry
- Provider data lookup and service verification
- Simple conversation state management

### Phase 2: Filter Verification System
- Sequential filter checking logic
- Exit condition handling
- Dynamic conversation flow based on provider capabilities
- Enhanced state tracking

### Phase 3: Scheduling Integration
- Availability presentation logic
- Appointment time selection by receptionist
- Confirmation and closing sequences
- Comprehensive result compilation

### Phase 4: Enhancement & Polish
- Error handling and recovery
- Conversation quality improvements
- Performance optimization
- Comprehensive testing with various scenarios

## Success Metrics
- Successful service verification
- Accurate filter checking based on real provider data
- Natural conversation flow without breaks
- Proper exit handling for unmet requirements
- Successful appointment scheduling when all conditions met
- Complete conversation transcript capture

## Data Requirements Summary
- **Patient Info**: firstName, lastName for AI agent identity
- **Provider Data**: name, filters, services from FavoriteProvider
- **Service Data**: selectedServices with details from cached results
- **Filter Data**: specific policies to verify (boolean flags)
- **Availability Data**: dates, times, dayOfWeek for scheduling
- **Conversation State**: turn tracking, verification status, appointment details