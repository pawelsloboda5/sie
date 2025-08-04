import { NextRequest, NextResponse } from 'next/server'
import { 
  type VoiceAgentCallRequest, 
  type CallResult, 
  type PatientInfo, 
  type ProviderSelectionData,
  type AvailabilitySlot
} from '@/lib/voiceAgent'

// Conversation state interfaces
interface ConversationTurn {
  speaker: 'caller' | 'receptionist'
  text: string
  timestamp: number
  turn: number
}

interface ConversationState {
  callId: string
  callRequest: VoiceAgentCallRequest
  providerConfig: ProviderSelectionData
  conversationHistory: ConversationTurn[]
  currentTurn: number
  phase: 'greeting' | 'service_inquiry' | 'filter_verification' | 'scheduling' | 'confirmation' | 'closing' | 'ended'
  verifiedFilters: Record<string, { verified: boolean; notes?: string }>
  exitReason?: 'service_unavailable' | 'filter_failed' | 'completed'
  selectedAppointment?: { date: string; time: string; dayOfWeek: string }
  success: boolean
  ended: boolean
}

interface FilterVerificationStatus {
  freeServicesOnly?: { verified: boolean; notes?: string }
  acceptsMedicaid?: { verified: boolean; notes?: string }
  acceptsMedicare?: { verified: boolean; notes?: string }
  acceptsUninsured?: { verified: boolean; notes?: string }
  noSSNRequired?: { verified: boolean; notes?: string }
  telehealthAvailable?: { verified: boolean; notes?: string }
}

// In-memory conversation storage (in production, use Redis or database)
const conversationStates = new Map<string, ConversationState>()

/**
 * POST: Initialize a new voice agent call
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🚀 Initializing voice agent call with:', body)

    const { callRequest, providerConfig, patientInfo, availability, simulationMode } = body

    // Validate required data
    if (!callRequest || !providerConfig) {
      return NextResponse.json({
        error: 'Missing required call request or provider configuration'
      }, { status: 400 })
    }

    // Validate that providerConfig has the required data
    if (!providerConfig.providerName || !providerConfig.providerId) {
      return NextResponse.json({
        error: 'Provider configuration missing required name or ID'
      }, { status: 400 })
    }

    console.log('📋 Provider Configuration:', {
      name: providerConfig.providerName,
      address: providerConfig.providerAddress,
      phone: providerConfig.providerPhone,
      services: providerConfig.selectedServices.length,
      filters: providerConfig.verifyFilters
    })

    // Generate unique call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize conversation state using client-provided data
    const conversationState: ConversationState = {
      callId,
      callRequest,
      providerConfig,
      conversationHistory: [],
      currentTurn: 0,
      phase: 'greeting',
      verifiedFilters: {},
      success: false,
      ended: false
    }

    // Generate first turn (receptionist greeting)
    const firstTurn = await generateReceptionistGreeting(conversationState)
    
    // Add to conversation history
    conversationState.conversationHistory.push(firstTurn)
    conversationState.currentTurn = 1

    // Store conversation state
    conversationStates.set(callId, conversationState)

    console.log('✅ Call initialized successfully:', callId)

    return NextResponse.json({
      callId,
      firstTurn,
      providerContext: {
        name: providerConfig.providerName,
        address: providerConfig.providerAddress || 'Provider Address',
        phone: providerConfig.providerPhone || 'Provider Phone'
      },
      conversationState: {
        phase: conversationState.phase,
        currentTurn: conversationState.currentTurn
      }
    })

  } catch (error) {
    console.error('❌ Error initializing voice call:', error)
    return NextResponse.json({
      error: 'Failed to initialize voice call',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET: Continue conversation with next turn
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('callId')
    const turn = parseInt(searchParams.get('turn') || '0')
    const providerId = searchParams.get('providerId')

    console.log('🔄 Continuing conversation:', { callId, turn, providerId })

    if (!callId) {
      return NextResponse.json({
        error: 'Missing callId parameter'
      }, { status: 400 })
    }

    // Get conversation state
    const conversationState = conversationStates.get(callId)
    if (!conversationState) {
      return NextResponse.json({
        error: 'Conversation not found or expired'
      }, { status: 404 })
    }

    // Check if conversation has ended
    if (conversationState.ended) {
      return NextResponse.json({
        ended: true,
        finalResult: generateCallResult(conversationState)
      })
    }

    // Generate next turn based on conversation phase
    const nextTurn = await generateNextTurn(conversationState)
    
    if (!nextTurn) {
      // End conversation
      conversationState.ended = true
      conversationState.phase = 'ended'
      
      return NextResponse.json({
        ended: true,
        finalResult: generateCallResult(conversationState)
      })
    }

    // Add turn to history and update state
    conversationState.conversationHistory.push(nextTurn)
    conversationState.currentTurn++

    // Update conversation state
    conversationStates.set(callId, conversationState)

    console.log('✅ Generated turn:', nextTurn.text)

    return NextResponse.json({
      turn: nextTurn,
      ended: conversationState.ended,
      conversationState: {
        phase: conversationState.phase,
        currentTurn: conversationState.currentTurn,
        verifiedFilters: conversationState.verifiedFilters
      }
    })

  } catch (error) {
    console.error('❌ Error continuing conversation:', error)
    return NextResponse.json({
      error: 'Failed to continue conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Generate receptionist greeting (first turn)
 */
async function generateReceptionistGreeting(state: ConversationState): Promise<ConversationTurn> {
  const greeting = `Hello, this is ${state.providerConfig.providerName}, how may I help you?`
  
  return {
    speaker: 'receptionist',
    text: greeting,
    timestamp: Date.now(),
    turn: 0
  }
}

/**
 * Generate next conversation turn using Azure OpenAI
 */
async function generateNextTurn(state: ConversationState): Promise<ConversationTurn | null> {
  // Determine who should speak next
  const lastTurn = state.conversationHistory[state.conversationHistory.length - 1]
  const nextSpeaker = lastTurn.speaker === 'receptionist' ? 'caller' : 'receptionist'

  // Update conversation phase based on current state
  updateConversationPhase(state)

  if (state.phase === 'ended') {
    return null
  }

  // Generate response using Azure OpenAI
  const response = await generateAzureOpenAIResponse(state, nextSpeaker)

  return {
    speaker: nextSpeaker,
    text: response,
    timestamp: Date.now(),
    turn: state.currentTurn
  }
}

/**
 * Update conversation phase based on current state
 */
function updateConversationPhase(state: ConversationState) {
  const turnCount = state.conversationHistory.length

  if (turnCount <= 2) {
    state.phase = 'greeting'
  } else if (turnCount <= 4) {
    state.phase = 'service_inquiry'
  } else if (hasUnverifiedFilters(state)) {
    state.phase = 'filter_verification'
  } else if (allFiltersVerified(state) && !state.selectedAppointment) {
    state.phase = 'scheduling'
  } else if (state.selectedAppointment) {
    state.phase = 'confirmation'
  } else {
    state.phase = 'closing'
  }

  // End conversation after goodbyes
  if (state.phase === 'confirmation' && turnCount > 6) {
    const recentMessages = state.conversationHistory.slice(-2).map(turn => turn.text.toLowerCase())
    const hasGoodbyes = recentMessages.some(msg => 
      msg.includes('goodbye') || msg.includes('thank you') || msg.includes('have a great day')
    )
    
    if (hasGoodbyes) {
      console.log('🏁 Detected goodbyes, ending conversation')
      state.phase = 'ended'
    }
  }

  console.log(`📋 Conversation phase: ${state.phase} (turn ${turnCount})`)
}

/**
 * Check if there are unverified filters
 */
function hasUnverifiedFilters(state: ConversationState): boolean {
  const filtersToVerify = Object.entries(state.providerConfig.verifyFilters)
    .filter(([_, shouldVerify]) => shouldVerify)
    .map(([filterName, _]) => filterName)

  return filtersToVerify.some(filterName => !state.verifiedFilters[filterName])
}

/**
 * Check if all required filters have been verified
 */
function allFiltersVerified(state: ConversationState): boolean {
  const filtersToVerify = Object.entries(state.providerConfig.verifyFilters)
    .filter(([_, shouldVerify]) => shouldVerify)
    .map(([filterName, _]) => filterName)

  return filtersToVerify.every(filterName => state.verifiedFilters[filterName])
}

/**
 * Get next filter to verify
 */
function getNextFilterToVerify(state: ConversationState): string | null {
  const filterOrder = ['freeServicesOnly', 'acceptsMedicaid', 'acceptsMedicare', 'acceptsUninsured', 'noSSNRequired', 'telehealthAvailable']
  
  return filterOrder.find(filterName => 
    state.providerConfig.verifyFilters[filterName as keyof typeof state.providerConfig.verifyFilters] && 
    !state.verifiedFilters[filterName]
  ) || null
}

/**
 * Generate Azure OpenAI response with conversation context
 */
async function generateAzureOpenAIResponse(state: ConversationState, speaker: 'caller' | 'receptionist'): Promise<string> {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const chatModel = process.env.AZURE_OPENAI_CHAT_MODEL || 'gpt-35-turbo'

    if (!endpoint || !apiKey) {
      throw new Error('Missing Azure OpenAI credentials')
    }

    // Build conversation context
    const systemPrompt = buildSystemPrompt(state, speaker)
    const conversationHistory = buildConversationHistory(state)

    const url = `${endpoint}/openai/deployments/${chatModel}/chat/completions?api-version=2025-04-01-preview`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        max_tokens: 150,
        temperature: 0.7,
        stop: ['Human:', 'Assistant:']
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Azure OpenAI API error:', errorData)
      throw new Error(`Azure OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content?.trim()

    if (!aiResponse) {
      throw new Error('No response from Azure OpenAI')
    }

    // Update verification status if this was a filter response
    updateVerificationStatus(state, speaker, aiResponse)

    return aiResponse

  } catch (error) {
    console.error('Error generating Azure OpenAI response:', error)
    // Fallback to predefined responses
    return generateFallbackResponse(state, speaker)
  }
}

/**
 * Build system prompt for Azure OpenAI
 */
function buildSystemPrompt(state: ConversationState, speaker: 'caller' | 'receptionist'): string {
  const patientName = `${state.callRequest.patientInfo.firstName} ${state.callRequest.patientInfo.lastName}`
  const providerName = state.providerConfig.providerName
  const selectedServices = state.providerConfig.selectedServices.map(s => s.name).join(', ')
  
  console.log('📅 Processing availability slots:', state.callRequest.availability)
  const availabilityText = state.callRequest.availability.map(slot => {
    const times = slot.timeSlots.length > 0 
      ? slot.timeSlots.join(', ')
      : slot.timeRanges?.map(r => `${r.start} to ${r.end}`).join(', ') || ''
    
    // Convert date string to Date object for formatting
    const dateObj = new Date(slot.date)
    const formattedDate = isNaN(dateObj.getTime()) ? slot.date : dateObj.toLocaleDateString()
    
    return `${slot.dayOfWeek} ${formattedDate} at ${times}`
  }).join('; ')

  if (speaker === 'receptionist') {
    return `You are a professional, helpful receptionist at ${providerName}.

PROVIDER INFORMATION:
- Name: ${providerName}
- Provider ID: ${state.providerConfig.providerId}
- Available Services: ${selectedServices}
- Filter Capabilities: ${JSON.stringify(state.providerConfig.verifyFilters)}

CONVERSATION CONTEXT:
- You are speaking with ${patientName}
- They are interested in: ${selectedServices}
- Current phase: ${state.phase}

INSTRUCTIONS:
- Be professional and helpful
- Answer based on your provider's actual capabilities from the filter settings
- If a filter is set to false (like acceptsMedicaid: false), politely decline
- If a filter is set to true (like acceptsUninsured: true), confirm availability
- Always be ready to schedule if all requirements are met
- Keep responses natural and concise (1-2 sentences)

CONVERSATION HISTORY:
${state.conversationHistory.map(turn => `${turn.speaker}: ${turn.text}`).join('\n')}

Respond as the receptionist:`
  } else {
    const nextFilter = getNextFilterToVerify(state)
    
    return `You are an AI agent calling on behalf of patient ${patientName}.

PATIENT INFORMATION:
- Name: ${patientName}
- Interested in: ${selectedServices}
- Available: ${availabilityText}

CONVERSATION CONTEXT:
- You are calling ${providerName}
- Current phase: ${state.phase}
- Next filter to verify: ${nextFilter || 'none'}

INSTRUCTIONS:
- Be polite and professional
- Ask about one thing at a time
- If any requirement is not met, politely end the call
- If scheduling, provide the patient's availability
- Keep responses natural and concise (1-2 sentences)

CONVERSATION HISTORY:
${state.conversationHistory.map(turn => `${turn.speaker}: ${turn.text}`).join('\n')}

Respond as the AI agent:`
  }
}

/**
 * Build conversation history for Azure OpenAI
 */
function buildConversationHistory(state: ConversationState) {
  return state.conversationHistory.map(turn => ({
    role: turn.speaker === 'caller' ? 'user' : 'assistant',
    content: turn.text
  }))
}

/**
 * Update verification status based on response
 */
function updateVerificationStatus(state: ConversationState, speaker: 'caller' | 'receptionist', response: string) {
  if (speaker === 'receptionist' && state.phase === 'filter_verification') {
    const nextFilter = getNextFilterToVerify(state)
    if (nextFilter) {
      // Check what the provider's actual capability is for this filter
      const providerCapability = state.providerConfig.verifyFilters[nextFilter as keyof typeof state.providerConfig.verifyFilters]
      
      // Generate response based on provider's actual capability
      let verified = false
      let notes = response
      
      if (providerCapability) {
        // Provider supports this capability
        verified = true
        notes = `Yes, we do support this - ${response}`
      } else {
        // Provider doesn't support this capability
        verified = false
        notes = `Sorry, we don't support this - ${response}`
        
        // This is a deal-breaker, end the call
        state.ended = true
        state.exitReason = 'filter_failed'
        state.phase = 'closing'
      }
      
      state.verifiedFilters[nextFilter] = {
        verified,
        notes
      }

      console.log(`🔍 Filter ${nextFilter}: Provider capability=${providerCapability}, Verified=${verified}`)
    }
  }

  // Check for appointment scheduling
  if (speaker === 'receptionist' && state.phase === 'scheduling') {
    if (response.toLowerCase().includes('available') || response.toLowerCase().includes('appointment')) {
      // Extract appointment details (simplified)
      const firstAvailability = state.callRequest.availability[0]
      if (firstAvailability) {
        state.selectedAppointment = {
          date: new Date(firstAvailability.date).toLocaleDateString(),
          time: firstAvailability.timeSlots[0] || firstAvailability.timeRanges?.[0]?.start || '10:00 AM',
          dayOfWeek: firstAvailability.dayOfWeek
        }
        state.success = true
        state.phase = 'confirmation'
      }
    }
  }
}

/**
 * Generate fallback response if Azure OpenAI fails
 */
function generateFallbackResponse(state: ConversationState, speaker: 'caller' | 'receptionist'): string {
  const patientName = `${state.callRequest.patientInfo.firstName} ${state.callRequest.patientInfo.lastName}`
  
  if (speaker === 'receptionist') {
    switch (state.phase) {
      case 'greeting':
        return `Hello, this is ${state.providerConfig.providerName}, how may I help you?`
      case 'service_inquiry':
        return `Yes, we do offer that service. How can I help you today?`
      case 'filter_verification':
        return `Yes, that's correct. Is there anything else you'd like to know?`
      case 'scheduling':
        return `Let me check our schedule... Yes, we have availability then. Shall I book that for you?`
      default:
        return `Thank you for calling ${state.providerConfig.providerName}. Have a great day!`
    }
  } else {
    switch (state.phase) {
      case 'greeting':
        return `Hello, this is ${patientName}. I'm calling to inquire about your services.`
      case 'service_inquiry':
        const serviceName = state.providerConfig.selectedServices[0]?.name || 'healthcare services'
        return `I'm interested in ${serviceName}. Do you offer this service?`
      case 'filter_verification':
        const nextFilter = getNextFilterToVerify(state)
        return getFilterQuestion(nextFilter)
      case 'scheduling':
        const availability = state.callRequest.availability[0]
        return `I'm available on ${availability?.dayOfWeek} at ${availability?.timeSlots[0] || 'morning'}. Do you have any openings?`
      default:
        return `Thank you so much for your help!`
    }
  }
}

/**
 * Get question for specific filter
 */
function getFilterQuestion(filterName: string | null): string {
  switch (filterName) {
    case 'freeServicesOnly':
      return 'Do you offer any free services or sliding scale fees?'
    case 'acceptsMedicaid':
      return 'Do you accept Medicaid insurance?'
    case 'acceptsMedicare':
      return 'Do you accept Medicare insurance?'
    case 'acceptsUninsured':
      return 'Do you accept patients without insurance?'
    case 'noSSNRequired':
      return 'Do you require a Social Security Number for treatment?'
    case 'telehealthAvailable':
      return 'Do you offer telehealth or virtual appointments?'
    default:
      return 'Is there anything else I should know about your services?'
  }
}

/**
 * Generate final call result
 */
function generateCallResult(state: ConversationState): CallResult {
  // Convert generic verification results to the expected format
  const filtersVerified = {
    freeServicesOnly: state.verifiedFilters.freeServicesOnly || { verified: false },
    acceptsMedicaid: state.verifiedFilters.acceptsMedicaid || { verified: false },
    acceptsMedicare: state.verifiedFilters.acceptsMedicare || { verified: false },
    acceptsUninsured: state.verifiedFilters.acceptsUninsured || { verified: false },
    noSSNRequired: state.verifiedFilters.noSSNRequired || { verified: false },
    telehealthAvailable: state.verifiedFilters.telehealthAvailable || { verified: false },
    featuredService: { verified: true, notes: 'Service discussed during call' }
  }

  return {
    providerId: state.providerConfig.providerId,
    providerName: state.providerConfig.providerName,
    success: state.success,
    appointmentTime: state.selectedAppointment?.time,
    failureReason: state.exitReason,
    filtersVerified,
    callDuration: `${Math.floor(state.conversationHistory.length * 0.5)}:${String((state.conversationHistory.length * 30) % 60).padStart(2, '0')}`,
    transcript: state.conversationHistory.map(turn => 
      `${turn.speaker === 'caller' ? 'AI Agent' : 'Receptionist'}: ${turn.text}`
    ),
    servicesDiscussed: state.providerConfig.selectedServices
  }
}