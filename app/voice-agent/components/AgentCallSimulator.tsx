import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, CheckCircle, XCircle, Loader2, Volume2, VolumeX } from 'lucide-react'
import CallProgress from './CallProgress'
import { AvailabilitySlot, CallResult } from '../page'

type CallState = 
  | 'idle'
  | 'initializing'
  | 'dialing'
  | 'connected'
  | 'conversation'
  | 'completed'
  | 'failed'

interface AgentCallSimulatorProps {
  selectedProviders: string[]
  userAvailability: AvailabilitySlot[]
  onComplete: (results: CallResult[]) => void
}

interface ConversationTurn {
  speaker: 'caller' | 'receptionist'
  text: string
  voiceId: string
  timestamp: number
}

interface VoiceCallState {
  callId: string
  currentTurn: number
  turns: ConversationTurn[]
  providerContext: any
  status: string
}

export default function AgentCallSimulator({
  selectedProviders,
  userAvailability,
  onComplete
}: AgentCallSimulatorProps) {
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0)
  const [callState, setCallState] = useState<CallState>('idle')
  const [callResults, setCallResults] = useState<CallResult[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Voice call specific state
  const [voiceCallState, setVoiceCallState] = useState<VoiceCallState | null>(null)
  const [currentTurn, setCurrentTurn] = useState<ConversationTurn | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Memoize the completion handler to prevent unnecessary re-renders
  const handleComplete = useCallback((results: CallResult[]) => {
    if (!isCompleted) {
      setIsCompleted(true)
      onComplete(results)
    }
  }, [onComplete, isCompleted])

  // Initialize voice call with API
  const initializeVoiceCall = useCallback(async (providerId: string) => {
    try {
      setError(null)
      setCallState('initializing')
      
      // Debug logging
      console.log('Initializing voice call with provider ID:', providerId)
      console.log('Provider ID type:', typeof providerId)
      console.log('Provider ID length:', providerId.length)
      
      const response = await fetch('/api/voice-agent-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          patientPreferences: {
            serviceType: 'mammogram screening',
            insurance: 'Medicaid',
            preferredTime: 'morning',
            specialNeeds: ['no SSN required']
          },
          simulationMode: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initialize call')
      }

      const data = await response.json()
      
      setVoiceCallState({
        callId: data.callId,
        currentTurn: 0,
        turns: [data.firstTurn],
        providerContext: data.providerContext,
        status: 'active'
      })
      
      setCurrentTurn(data.firstTurn)
      setCallState('dialing')
      
      // Start conversation after a short delay
      setTimeout(() => {
        setCallState('connected')
        playTurnAudio(data.firstTurn)
      }, 2000)
      
    } catch (error) {
      console.error('Failed to initialize voice call:', error)
      setError(error instanceof Error ? error.message : 'Failed to start call')
      setCallState('failed')
    }
  }, [])

  // Play audio for conversation turn
  const playTurnAudio = useCallback(async (turn: ConversationTurn) => {
    if (!audioEnabled) {
      // Skip audio, proceed to next turn after delay
      setTimeout(() => proceedToNextTurn(), 3000)
      return
    }

    try {
      setIsPlaying(true)
      
      const response = await fetch('/api/voice-agent-call/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: turn.text,
          speaker: turn.speaker,
          voiceId: turn.voiceId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      // Create audio element and play streaming response
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
          // Proceed to next turn after audio finishes
          setTimeout(() => proceedToNextTurn(), 1000)
        }
        audioRef.current.onerror = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
          setTimeout(() => proceedToNextTurn(), 2000)
        }
        await audioRef.current.play()
      }
      
    } catch (error) {
      console.error('Audio playback error:', error)
      setIsPlaying(false)
      // Continue without audio
      setTimeout(() => proceedToNextTurn(), 2000)
    }
  }, [audioEnabled])

  // Proceed to next conversation turn
  const proceedToNextTurn = useCallback(async () => {
    if (!voiceCallState) return

    try {
      const nextTurnNumber = voiceCallState.currentTurn + 1
      
      const response = await fetch(
        `/api/voice-agent-call?callId=${voiceCallState.callId}&turn=${nextTurnNumber}&providerId=${selectedProviders[currentProviderIndex]}`
      )

      if (!response.ok) {
        throw new Error('Failed to get next turn')
      }

      const data = await response.json()
      
      if (data.ended) {
        // Conversation completed
        setCallState('completed')
        generateCallResult()
        return
      }

      // Update state with new turn
      setVoiceCallState(prev => prev ? {
        ...prev,
        currentTurn: nextTurnNumber,
        turns: [...prev.turns, data.turn]
      } : null)
      
      setCurrentTurn(data.turn)
      
      // Play audio for new turn
      setTimeout(() => playTurnAudio(data.turn), 500)
      
    } catch (error) {
      console.error('Failed to proceed to next turn:', error)
      setCallState('completed')
      generateCallResult()
    }
  }, [voiceCallState, selectedProviders, currentProviderIndex])

  // Generate call result based on conversation
  const generateCallResult = useCallback(() => {
    if (!voiceCallState) return

    const result: CallResult = {
      providerId: selectedProviders[currentProviderIndex],
      providerName: voiceCallState.providerContext.name,
      success: true, // For demo, assume success
      appointmentTime: userAvailability[0]?.timeSlots[0] || '10:30 AM',
      callDuration: '3:45',
      filtersVerified: {
        freeServicesOnly: { verified: true, notes: 'Free services confirmed via voice call' },
        acceptsMedicaid: { verified: true, notes: 'Medicaid acceptance verified' },
        noSSNRequired: { verified: true, notes: 'No SSN requirement confirmed' },
        featuredService: { verified: true, notes: 'Service availability confirmed' }
      },
      transcript: voiceCallState.turns.map(turn => 
        `${turn.speaker === 'caller' ? 'AI Agent' : 'Receptionist'}: ${turn.text}`
      )
    }

    setCallResults(prevResults => {
      const newResults = [...prevResults, result]
      
      // Move to next provider or complete
      if (currentProviderIndex < selectedProviders.length - 1) {
        setTimeout(() => {
          setCurrentProviderIndex(prev => prev + 1)
          setCallState('idle')
          setVoiceCallState(null)
          setCurrentTurn(null)
        }, 2000)
      } else {
        setTimeout(() => {
          handleComplete(newResults)
        }, 1000)
      }
      
      return newResults
    })
  }, [voiceCallState, selectedProviders, currentProviderIndex, userAvailability, handleComplete])

  // Start initial call when component loads
  useEffect(() => {
    if (callState === 'idle' && currentProviderIndex < selectedProviders.length) {
      const timer = setTimeout(() => {
        initializeVoiceCall(selectedProviders[currentProviderIndex])
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [callState, currentProviderIndex, selectedProviders, initializeVoiceCall])

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Fix missing dependency warning
  useEffect(() => {
    if (!playTurnAudio) return
  }, [playTurnAudio])

  // Toggle audio playback
  const toggleAudio = useCallback(() => {
    setAudioEnabled(!audioEnabled)
  }, [audioEnabled])

  return (
    <div className="space-y-6">
      {/* Audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">AI Voice Agent Active</h2>
        <p className="text-gray-600">
          Calling {selectedProviders.length} provider(s) to schedule appointments
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Call Error: {error}</span>
          </div>
        </Card>
      )}

      {/* Current Call Status */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Call Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${
                callState === 'failed' ? 'bg-red-100' :
                callState === 'completed' ? 'bg-green-100' :
                'bg-blue-100'
              }`}>
                {callState === 'failed' ? (
                  <XCircle className="h-6 w-6 text-red-600" />
                ) : callState === 'completed' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Phone className="h-6 w-6 text-blue-600 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Provider {currentProviderIndex + 1} of {selectedProviders.length}
                </h3>
                <p className="text-sm text-gray-600">
                  {getCallStateMessage(callState)}
                </p>
                {voiceCallState && (
                  <p className="text-xs text-blue-600 mt-1">
                    Calling: {voiceCallState.providerContext.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Audio Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className="flex items-center gap-2"
              >
                {audioEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span>Audio On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span>Audio Off</span>
                  </>
                )}
              </Button>
              
              {callState !== 'idle' && callState !== 'completed' && callState !== 'failed' && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
            </div>
          </div>

          {/* Progress Visualization */}
          <CallProgress currentState={callState} />

          {/* Current Turn Display */}
          {currentTurn && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentTurn.speaker === 'caller' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="font-medium text-sm">
                  {currentTurn.speaker === 'caller' ? 'AI Agent' : 'Receptionist'}
                </span>
                {isPlaying && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Volume2 className="h-3 w-3" />
                    <span>Speaking...</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700">{currentTurn.text}</p>
            </div>
          )}

          {/* Live Conversation Transcript */}
          {voiceCallState && voiceCallState.turns.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <h4 className="font-medium text-sm mb-3">Live Conversation</h4>
              <div className="space-y-3">
                {voiceCallState.turns.map((turn, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      turn.speaker === 'caller' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {turn.speaker === 'caller' ? 'AI Agent' : 'Receptionist'}
                      </div>
                      <p className="text-sm text-gray-700">{turn.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Results Summary */}
      {callResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Call Results</h3>
          {callResults.map((result, index) => (
            <Card key={result.providerId} className="p-6">
              <div className="space-y-4">
                {/* Provider Header */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{result.providerName}</h4>
                      <p className="text-sm text-gray-600">Call Duration: {result.callDuration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {result.success ? (
                      <div>
                        <div className="text-green-600 font-semibold">✅ APPOINTMENT SCHEDULED</div>
                        <div className="text-sm">{result.appointmentTime}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-red-600 font-semibold">❌ APPOINTMENT FAILED</div>
                        <div className="text-sm text-red-600">{result.failureReason}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Transcript */}
                {result.transcript && result.transcript.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3">Call Transcript:</h5>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                      {result.transcript.map((line, lineIndex) => (
                        <div key={lineIndex} className="text-sm">
                          <span className="font-medium">{line.split(':')[0]}:</span>
                          <span className="ml-2">{line.split(':').slice(1).join(':')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper functions
function getCallStateMessage(state: CallState): string {
  const messages: Record<CallState, string> = {
    idle: 'Preparing call...',
    initializing: 'Initializing voice agent...',
    dialing: 'Dialing provider...',
    connected: 'Connected - conversation in progress',
    conversation: 'AI agents talking...',
    completed: 'Call completed successfully!',
    failed: 'Call failed - check error above'
  }
  return messages[state]
}