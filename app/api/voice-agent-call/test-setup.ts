/**
 * Voice Agent Call API Test Setup
 * ===============================
 * Use this to test the voice agent call functionality
 */

import { type VoiceAgentCallRequest, type PatientInfo, type ProviderSelectionData } from '@/lib/voiceAgent'

// Sample test data for voice agent calls
export const samplePatientInfo: PatientInfo = {
  firstName: 'John',
  lastName: 'Doe'
}

export const sampleProviderConfig: ProviderSelectionData = {
  providerId: '507f1f77bcf86cd799439011', // Sample MongoDB ObjectId
  providerName: 'Downtown Health Clinic',
  selectedServices: [
    {
      _id: 'service_mammogram_001',
      name: 'Mammogram Screening',
      category: 'Preventive Care',
      description: 'Annual mammogram screening for breast cancer detection',
      is_free: false,
      is_discounted: true,
      price_info: 'Sliding scale available'
    }
  ],
  verifyFilters: {
    freeServicesOnly: false,
    acceptsMedicaid: true,
    acceptsMedicare: false,
    acceptsUninsured: false,
    noSSNRequired: true,
    telehealthAvailable: false
  }
}

export const sampleAvailability = [
  {
    date: new Date('2024-01-15'),
    dayOfWeek: 'Monday',
    timeSlots: ['10:00 AM', '2:00 PM'],
    timeRanges: [
      { start: '9:00', end: '12:00' },
      { start: '14:00', end: '17:00' }
    ]
  },
  {
    date: new Date('2024-01-16'),
    dayOfWeek: 'Tuesday',
    timeSlots: ['11:00 AM'],
    timeRanges: [
      { start: '13:00', end: '16:00' }
    ]
  }
]

export const sampleCallRequest: VoiceAgentCallRequest = {
  requestId: 'test_call_001',
  patientInfo: samplePatientInfo,
  providerConfigurations: [sampleProviderConfig],
  availability: sampleAvailability,
  callMetadata: {
    timestamp: new Date(),
    callType: 'appointment_booking',
    selectedProviderIds: [sampleProviderConfig.providerId],
    totalProviders: 1
  }
}

// Test helper functions
export async function testVoiceAgentInitialization() {
  try {
    console.log('🧪 Testing Voice Agent Call Initialization...')
    
    const response = await fetch('/api/voice-agent-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callRequest: sampleCallRequest,
        providerConfig: sampleProviderConfig,
        patientInfo: samplePatientInfo,
        availability: sampleAvailability,
        simulationMode: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Initialization failed:', error)
      return null
    }

    const result = await response.json()
    console.log('✅ Call initialized successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Test error:', error)
    return null
  }
}

export async function testConversationContinuation(callId: string, turn: number, providerId: string) {
  try {
    console.log(`🔄 Testing conversation continuation (Turn ${turn})...`)
    
    const response = await fetch(`/api/voice-agent-call?callId=${callId}&turn=${turn}&providerId=${providerId}`)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Continuation failed:', error)
      return null
    }

    const result = await response.json()
    console.log('✅ Turn generated successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Test error:', error)
    return null
  }
}

export async function runFullConversationTest() {
  console.log('🚀 Starting full conversation test...')
  
  // Step 1: Initialize conversation
  const initResult = await testVoiceAgentInitialization()
  if (!initResult) {
    console.error('❌ Failed to initialize conversation')
    return
  }

  const { callId, firstTurn } = initResult
  console.log(`📞 First turn: ${firstTurn.text}`)

  // Step 2: Continue conversation for several turns
  let currentTurn = 1
  let conversationEnded = false
  const maxTurns = 15 // Prevent infinite loops

  while (!conversationEnded && currentTurn < maxTurns) {
    const continueResult = await testConversationContinuation(
      callId, 
      currentTurn, 
      sampleProviderConfig.providerId
    )
    
    if (!continueResult) {
      console.error(`❌ Failed to continue conversation at turn ${currentTurn}`)
      break
    }

    if (continueResult.ended) {
      console.log('🏁 Conversation ended:', continueResult.finalResult)
      conversationEnded = true
    } else {
      console.log(`📱 Turn ${currentTurn}: ${continueResult.turn.text}`)
      currentTurn++
    }
  }

  if (!conversationEnded) {
    console.log('⚠️ Conversation reached maximum turns without ending')
  }

  console.log('✅ Full conversation test completed')
}

// Environment validation
export function validateEnvironment() {
  console.log('🔍 Validating environment setup...')
  
  const required = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_CHAT_MODEL'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing)
    return false
  }

  console.log('✅ Environment setup is valid')
  return true
}

// Quick test function for development
export async function quickTest() {
  if (!validateEnvironment()) {
    return
  }

  console.log('🏃‍♂️ Running quick test...')
  await testVoiceAgentInitialization()
}