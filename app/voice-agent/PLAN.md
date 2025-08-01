# AI Voice Agent Calling Demo Implementation Plan

## 🎯 Project Objective
Implement a sophisticated AI voice agent calling demo with two distinct agents:
1. **AI Agent Caller** - The system that initiates appointment scheduling calls
2. **Receptionist Agent** - The healthcare provider's receptionist receiving the call

## 📋 Implementation Overview

### Core Components Required
1. **API Route**: `/api/voice-agent-call` - Main orchestration endpoint
2. **MCP Server Integration** - Provider context retrieval 
3. **ElevenLabs TTS Integration** - Streaming audio for both agents
4. **Agent Conversation Logic** - Multi-turn dialogue simulation
5. **Frontend Integration** - Real-time call simulation UI

## 🏗️ Architecture Design

```
Frontend Call Interface → API Route → MCP Server (Provider Context)
                               ↓
                    Agent Conversation Engine
                               ↓
                    ElevenLabs TTS (Streaming Audio)
                               ↓
                    Real-time Audio Playback
```

## 📁 File Structure Plan

```
sie/app/api/voice-agent-call/
├── route.ts                    # Main API endpoint
sie/app/voice-agent/
├── PLAN.md                     # This file
├── CLAUDE.md                   # Context tracking
├── components/
│   ├── AgentCallSimulator.tsx  # Main call interface
│   ├── CallProgress.tsx        # Real-time call status
│   └── AudioPlayer.tsx         # Streaming audio player
```

## 🔧 Technical Implementation Details

### Phase 1: MCP Server Integration
- **Endpoint**: `/api/voice-agent-call`
- **Purpose**: Retrieve provider context for AI agents
- **MCP Tools Used**:
  - `get_voice_agent_context(providerId)` - Primary context tool
  - `get_provider_by_id(providerId)` - Provider details
  - `get_provider_services(providerId)` - Available services

### Phase 2: Agent Personality & Logic
- **AI Agent Caller**:
  - Polite, professional tone
  - Knows patient preferences
  - Attempts to schedule appointment
  - Voice: Female (Jessica/Rachel)
  
- **Receptionist Agent**:
  - Helpful, efficient
  - Knows provider details and availability
  - Can check schedules and book appointments
  - Voice: Different female voice (Bella/Sarah)

### Phase 3: ElevenLabs TTS Integration
- **Model**: `eleven_turbo_v2_5` (low latency for real-time)
- **Format**: `mp3_44100_64` (optimized for streaming)
- **Streaming**: Real-time audio chunks
- **Voices**: 2 distinct female voices for differentiation

### Phase 4: Conversation Flow Design
```
1. AI Agent: "Hello, I'd like to schedule an appointment for my patient"
2. Receptionist: "Of course! What type of service are you looking for?"
3. AI Agent: "We need [service] and the patient has [insurance/requirements]"
4. Receptionist: "Let me check our availability..."
5. [Continue realistic appointment scheduling dialogue]
```

## 🚀 Implementation Steps

### Step 1: MCP Server Route Implementation
- [ ] Create `/api/voice-agent-call/route.ts`
- [ ] Implement MCP server communication
- [ ] Add provider context retrieval
- [ ] Error handling and validation

### Step 2: Agent Conversation Engine
- [ ] Design conversation state machine
- [ ] Implement multi-turn dialogue logic
- [ ] Create realistic appointment scenarios
- [ ] Add context-aware responses

### Step 3: ElevenLabs TTS Integration
- [ ] Implement streaming TTS endpoint
- [ ] Configure two distinct voices
- [ ] Add audio response streaming
- [ ] Handle voice switching between agents

### Step 4: Frontend Integration
- [ ] Update AgentCallSimulator component
- [ ] Add real-time audio playback
- [ ] Implement call progress tracking
- [ ] Connect to backend API

### Step 5: Testing & Refinement
- [ ] Test with various provider scenarios
- [ ] Validate MCP server integration
- [ ] Optimize audio streaming performance
- [ ] Refine conversation flow

## 📊 Technical Specifications

### API Endpoint Structure
```typescript
POST /api/voice-agent-call
Body: {
  providerId: string;           // MongoDB ObjectId
  patientPreferences: {
    serviceType?: string;
    insurance?: string;
    preferredTime?: string;
    specialNeeds?: string[];
  };
  simulationMode: boolean;      // true for demo
}

Response: {
  callId: string;
  agentVoices: {
    caller: string;             // ElevenLabs voice ID
    receptionist: string;       // ElevenLabs voice ID
  };
  providerContext: {
    name: string;
    services: string[];
    phone: string;
    // ... full provider context
  };
}
```

### Conversation State Management
```typescript
interface ConversationState {
  callId: string;
  currentSpeaker: 'caller' | 'receptionist';
  turn: number;
  context: ProviderContext;
  patientInfo: PatientPreferences;
  appointmentDetails?: {
    serviceType: string;
    proposedTime: string;
    status: 'pending' | 'confirmed' | 'declined';
  };
}
```

## 🎭 Agent Personas

### AI Agent Caller (Jessica Voice)
- **Role**: Healthcare appointment scheduler
- **Tone**: Professional, empathetic, patient-focused
- **Knowledge**: Patient needs, insurance info, scheduling preferences
- **Goal**: Successfully book appropriate appointment

### Receptionist Agent (Bella Voice) 
- **Role**: Healthcare provider receptionist
- **Tone**: Helpful, efficient, knowledgeable about services
- **Knowledge**: Provider services, availability, requirements
- **Goal**: Assist with scheduling while following provider protocols

## 🔧 Environment Configuration

### Required Environment Variables
```env
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
VOICE_ID_CALLER=voice_id_for_jessica
VOICE_ID_RECEPTIONIST=voice_id_for_bella

# MCP Server Configuration
MCP_SERVER_URL=http://localhost:3004
MONGODB_URI=mongodb://localhost:27017/sie-db
```

## 🎯 Success Criteria

### Functional Requirements
- [ ] Real-time voice conversation between two AI agents
- [ ] Context-aware dialogue based on provider data
- [ ] Streaming audio with distinct voices
- [ ] Realistic appointment scheduling scenario
- [ ] Error handling and graceful degradation

### Performance Requirements  
- [ ] Audio latency < 1 second
- [ ] Conversation flows naturally
- [ ] MCP server integration reliable
- [ ] Frontend responsive during calls

## 🧪 Testing Strategy

### Unit Testing
- API route functionality
- MCP server integration
- Audio streaming components

### Integration Testing  
- End-to-end call simulation
- Provider context retrieval
- Voice agent coordination

### User Experience Testing
- Audio quality and clarity
- Conversation realism
- Interface responsiveness

## 📈 Future Enhancements

### Phase 2 Features
- Multiple conversation scenarios
- Patient information collection
- Appointment confirmation system
- Call recording and playback

### Advanced Features
- Real-time appointment booking
- Multiple language support
- Voice cloning for personalization
- Analytics and reporting

## 🚨 Risk Mitigation

### Technical Risks
- **ElevenLabs API limits**: Implement rate limiting and fallbacks
- **MCP server downtime**: Add offline mode with cached data
- **Audio streaming issues**: Buffer management and reconnection logic

### Business Risks
- **API costs**: Monitor usage and implement cost controls
- **Voice quality**: Test extensively with different scenarios
- **User experience**: Gather feedback and iterate quickly

---

## 📝 Next Steps
1. Begin with MCP server integration
2. Implement basic conversation engine
3. Add ElevenLabs TTS streaming
4. Connect frontend components
5. Test and refine experience

**Target Completion**: End of current development session
**Primary Focus**: Working demo with realistic conversation flow
