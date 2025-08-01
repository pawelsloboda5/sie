import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

/**
 * AI Voice Agent Call Simulation API
 * ---------------------------------
 * Implements a sophisticated two-agent conversation simulation:
 * 1. AI Agent Caller - Healthcare appointment scheduler
 * 2. Receptionist Agent - Provider's receptionist
 * 
 * Features:
 * - MCP Server integration for provider context
 * - ElevenLabs TTS streaming for realistic voices
 * - Multi-turn conversation state management
 * - Real-time audio streaming
 */

// ================== Environment & Config ==================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'sie-db'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3004'

// Voice IDs for the two agents
const VOICE_ID_CALLER = process.env.VOICE_ID_CALLER || 'EXAVITQu4vr4xnSDxMaL' // Jessica
const VOICE_ID_RECEPTIONIST = process.env.VOICE_ID_RECEPTIONIST || 'ThT5KcBeYPX3keUQqHPh' // Sarah

// ElevenLabs configuration for optimal streaming
const TTS_CONFIG = {
  model_id: 'eleven_turbo_v2_5', // Low latency model
  output_format: 'mp3_44100_64', // Optimized for streaming
  voice_settings: {
    stability: 0.3,              // More expressive
    similarity_boost: 0.75,      // Clear voice quality
    style: 0.0,                  // Neutral style
    use_speaker_boost: true      // Enhanced clarity
  }
}

// ================== Types ==================
interface PatientPreferences {
  serviceType?: string
  insurance?: string
  preferredTime?: string
  specialNeeds?: string[]
  urgency?: 'low' | 'medium' | 'high'
}

interface CallRequest {
  providerId: string
  patientPreferences: PatientPreferences
  simulationMode?: boolean
}

interface ConversationTurn {
  speaker: 'caller' | 'receptionist'
  text: string
  voiceId: string
  timestamp: number
}

interface ConversationState {
  callId: string
  providerId: string
  providerContext: any
  patientInfo: PatientPreferences
  turns: ConversationTurn[]
  currentTurn: number
  status: 'initializing' | 'active' | 'completed' | 'failed'
  appointmentDetails?: {
    serviceType: string
    proposedTime: string
    status: 'pending' | 'confirmed' | 'declined'
  }
}

// ================== MongoDB Connection ==================
let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    cachedClient = client
    return client
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw new Error('Database connection failed')
  }
}

// ================== MCP Server Integration ==================
interface MCPProviderContext {
  provider: {
    _id: string
    name: string
    category: string
    address: string
    phone: string
    accepts_uninsured: boolean
    medicaid: boolean
    medicare: boolean
    telehealth_available: boolean
    free_service_names?: string[]
  }
  services: Array<{
    name: string
    category: string
    description: string
    is_free: boolean
    price_info: string
  }>
  contextSummary: string
}

async function getMCPProviderContext(providerId: string): Promise<MCPProviderContext> {
  try {
    // For now, we'll simulate MCP server integration
    // In production, this would call the actual MCP server
    const client = await connectToDatabase()
    const db = client.db(MONGODB_DB)
    
    // Get provider details
    const provider = await db.collection('providers').findOne({
      _id: new ObjectId(providerId)
    })
    
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }
    
    // Get provider services
    const services = await db.collection('services').find({
      provider_id: new ObjectId(providerId)
    }).limit(10).toArray()
    
    // Generate context summary for AI agents
    const freeServices = services.filter(s => s.is_free).slice(0, 3)
    const allServices = services.slice(0, 5)
    
    const contextSummary = `${provider.name} is a ${provider.category} located at ${provider.address}.
Phone: ${provider.phone}
Insurance: ${provider.medicaid ? 'Accepts Medicaid' : ''} ${provider.medicare ? 'Accepts Medicare' : ''} ${provider.accepts_uninsured ? 'Accepts Uninsured' : ''}
Free Services: ${freeServices.map(s => s.name).join(', ') || 'None listed'}
All Services: ${allServices.map(s => s.name).join(', ')}
Telehealth: ${provider.telehealth_available ? 'Available' : 'Not available'}

This provider was selected for AI-assisted appointment scheduling.`
    
    return {
      provider: {
        _id: provider._id.toString(),
        name: provider.name,
        category: provider.category,
        address: provider.address,
        phone: provider.phone,
        accepts_uninsured: provider.accepts_uninsured || false,
        medicaid: provider.medicaid || false,
        medicare: provider.medicare || false,
        telehealth_available: provider.telehealth_available || false,
        free_service_names: provider.free_service_names
      },
      services: services.map(s => ({
        name: s.name,
        category: s.category,
        description: s.description,
        is_free: s.is_free,
        price_info: s.price_info
      })),
      contextSummary
    }
  } catch (error) {
    console.error('Failed to get MCP provider context:', error)
    throw new Error('Failed to retrieve provider context')
  }
}

// ================== Conversation Engine ==================
class ConversationEngine {
  private state: ConversationState

  constructor(callId: string, providerId: string, providerContext: MCPProviderContext, patientInfo: PatientPreferences) {
    this.state = {
      callId,
      providerId,
      providerContext,
      patientInfo,
      turns: [],
      currentTurn: 0,
      status: 'initializing'
    }
  }

  generateNextTurn(): ConversationTurn | null {
    const turnNumber = this.state.currentTurn
    const isCallerTurn = turnNumber % 2 === 0 // Even turns = caller, odd = receptionist
    
    let text: string
    let speaker: 'caller' | 'receptionist'
    let voiceId: string

    if (isCallerTurn) {
      speaker = 'caller'
      voiceId = VOICE_ID_CALLER
      text = this.generateCallerResponse(turnNumber)
    } else {
      speaker = 'receptionist'
      voiceId = VOICE_ID_RECEPTIONIST
      text = this.generateReceptionistResponse(turnNumber)
    }

    if (!text) {
      return null // Conversation ended
    }

    const turn: ConversationTurn = {
      speaker,
      text,
      voiceId,
      timestamp: Date.now()
    }

    this.state.turns.push(turn)
    this.state.currentTurn++
    
    return turn
  }

  private generateCallerResponse(turnNumber: number): string {
    const provider = this.state.providerContext.provider
    const patient = this.state.patientInfo

    switch (turnNumber) {
      case 0:
        return `Hello, I'm calling to schedule an appointment for my patient at ${provider.name}. Is this a good time to discuss scheduling?`
      
      case 2:
        const serviceType = patient.serviceType || 'a consultation'
        const insurance = patient.insurance || 'they may be uninsured'
        return `I need to schedule ${serviceType}. The patient has ${insurance} for insurance. Do you have any availability this week?`
      
      case 4:
        const preferredTime = patient.preferredTime || 'morning appointments'
        return `That sounds good. The patient prefers ${preferredTime} if possible. What times do you have available?`
      
      case 6:
        return `Perfect! Let me confirm - that's for ${patient.serviceType || 'the consultation'} on the date you mentioned. The patient's name is Sarah Johnson. Should I provide any additional information?`
      
      case 8:
        return `Thank you so much for your help! The patient will be there. Have a great day!`
      
      default:
        return '' // End conversation
    }
  }

  private generateReceptionistResponse(turnNumber: number): string {
    const provider = this.state.providerContext.provider
    
    switch (turnNumber) {
      case 1:
        return `Thank you for calling ${provider.name}! This is Sarah at the front desk. I'd be happy to help you schedule an appointment. What type of service are you looking for?`
      
      case 3:
        const acceptsInsurance = provider.medicaid || provider.medicare || provider.accepts_uninsured
        return `Certainly! We do ${acceptsInsurance ? 'accept various insurance types including Medicaid and Medicare' : 'work with patients on payment options'}. Let me check our availability. What day works best for your patient?`
      
      case 5:
        return `I have some great options available. How about next Tuesday at 10:30 AM, or would Wednesday at 9:15 AM work better? Both are morning slots as requested.`
      
      case 7:
        return `Wonderful! I have Sarah Johnson scheduled for Tuesday at 10:30 AM. Please have her arrive 15 minutes early for paperwork. Is there a phone number where we can reach her if needed?`
      
      case 9:
        return `Perfect! Sarah Johnson is all set for Tuesday at 10:30 AM. We'll send a reminder call the day before. Thank you for calling ${provider.name}, and have a wonderful day!`
      
      default:
        return '' // End conversation
    }
  }

  getState(): ConversationState {
    return { ...this.state }
  }
}

// ================== ElevenLabs TTS Integration ==================
async function generateSpeech(text: string, voiceId: string): Promise<Response> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      ...TTS_CONFIG
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${error}`)
  }

  return response
}

// ================== Main API Handler ==================
export async function POST(request: NextRequest) {
  try {
    const body: CallRequest = await request.json()
    const { providerId, patientPreferences, simulationMode = true } = body

    // Validate required fields
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }

    // Log provider ID for debugging
    console.log('Received provider ID:', providerId, 'Type:', typeof providerId, 'Length:', providerId.length)

    // Validate ObjectId format
    if (!ObjectId.isValid(providerId)) {
      console.error('Invalid ObjectId format:', providerId)
      return NextResponse.json({ 
        error: 'Invalid provider ID format',
        details: `Received ID: "${providerId}" (${typeof providerId}). Expected a valid MongoDB ObjectId.`,
        suggestion: 'Please ensure the provider ID is a valid 24-character hex string.'
      }, { status: 400 })
    }

    // Get provider context from MCP server (or simulated)
    const providerContext = await getMCPProviderContext(providerId)
    
    // Initialize conversation
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const conversation = new ConversationEngine(callId, providerId, providerContext, patientPreferences)
    
    // Generate first turn (caller)
    const firstTurn = conversation.generateNextTurn()
    if (!firstTurn) {
      return NextResponse.json({ error: 'Failed to initialize conversation' }, { status: 500 })
    }

    // Return initial response with call setup
    return NextResponse.json({
      success: true,
      callId,
      agentVoices: {
        caller: VOICE_ID_CALLER,
        receptionist: VOICE_ID_RECEPTIONIST
      },
      providerContext: {
        name: providerContext.provider.name,
        phone: providerContext.provider.phone,
        address: providerContext.provider.address,
        services: providerContext.services.slice(0, 5).map(s => s.name),
        acceptsInsurance: {
          medicaid: providerContext.provider.medicaid,
          medicare: providerContext.provider.medicare,
          uninsured: providerContext.provider.accepts_uninsured
        }
      },
      conversation: conversation.getState(),
      firstTurn,
      message: 'Voice agent call initialized successfully'
    })

  } catch (error) {
    console.error('Voice agent call error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize voice agent call',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ================== Get Conversation Turn ==================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('callId')
    const turnNumber = parseInt(searchParams.get('turn') || '0')
    const providerId = searchParams.get('providerId')

    if (!callId || !providerId) {
      return NextResponse.json({ error: 'Call ID and Provider ID are required' }, { status: 400 })
    }

    // For demo purposes, we'll recreate the conversation state
    // In production, this would be stored in a session store or database
    const providerContext = await getMCPProviderContext(providerId)
    const conversation = new ConversationEngine(callId, providerId, providerContext, {})
    
    // Generate turns up to the requested turn
    let currentTurn = null
    for (let i = 0; i <= turnNumber; i++) {
      currentTurn = conversation.generateNextTurn()
      if (!currentTurn) break
    }

    if (!currentTurn) {
      return NextResponse.json({ 
        success: true,
        ended: true,
        message: 'Conversation has ended'
      })
    }

    return NextResponse.json({
      success: true,
      turn: currentTurn,
      conversation: conversation.getState()
    })

  } catch (error) {
    console.error('Get conversation turn error:', error)
    return NextResponse.json({ 
      error: 'Failed to get conversation turn',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}