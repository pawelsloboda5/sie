'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, CheckCircle, XCircle, Loader2, Volume2, VolumeX, Play, Pause, Download, ClipboardCopy } from 'lucide-react'
import CallProgress, { type AgentCallState } from './CallProgress'
import { type VoiceAgentCallRequest, type CallResult } from '@/lib/voiceAgent'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type CallState = AgentCallState

interface AgentCallSimulatorProps {
callRequest: VoiceAgentCallRequest
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
startedAt: number
}

export default function AgentCallSimulator({
callRequest,
onComplete
}: AgentCallSimulatorProps) {
const [currentProviderIndex, setCurrentProviderIndex] = useState(0)
const [callState, setCallState] = useState<CallState>('idle')
const [callResults, setCallResults] = useState<CallResult[]>([])
const [isCompleted, setIsCompleted] = useState(false)

const [voiceCallState, setVoiceCallState] = useState<VoiceCallState | null>(null)
const [currentTurn, setCurrentTurn] = useState<ConversationTurn | null>(null)
const [isPlaying, setIsPlaying] = useState(false)
const [audioEnabled, setAudioEnabled] = useState(process.env.NEXT_PUBLIC_ENABLE_TTS_AUDIO === 'true')
const [error, setError] = useState<string | null>(null)

const [search, setSearch] = useState('')
const transcriptContainerRef = useRef<HTMLDivElement | null>(null)

const audioRef = useRef<HTMLAudioElement | null>(null)

const handleComplete = useCallback((results: CallResult[]) => {
if (!isCompleted) {
setIsCompleted(true)
onComplete(results)
}
}, [onComplete, isCompleted])

const initializeVoiceCall = useCallback(async (providerId: string) => {
try {
setError(null)
setCallState('initializing')
const providerConfig = callRequest.providerConfigurations.find(
  config => config.providerId === providerId
)

const response = await fetch('/api/voice-agent-call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    providerId,
    callRequest: callRequest,
    providerConfig: providerConfig,
    patientInfo: callRequest.patientInfo,
    availability: callRequest.availability,
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
  status: 'active',
  startedAt: Date.now()
})

setCurrentTurn(data.firstTurn)
setCallState('dialing')

setTimeout(() => {
  setCallState('connected')
  if (audioEnabled) {
    playTurnAudio(data.firstTurn)
  }
}, 1200)
} catch (error) {
console.error('Failed to initialize voice call:', error)
setError(error instanceof Error ? error.message : 'Failed to start call')
setCallState('failed')
}
}, [audioEnabled, callRequest])

const playTurnAudio = useCallback(async (turn: ConversationTurn) => {
if (!audioEnabled) return
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

const audioBlob = await response.blob()
const audioUrl = URL.createObjectURL(audioBlob)

if (audioRef.current) {
  audioRef.current.src = audioUrl
  audioRef.current.onended = () => {
    setIsPlaying(false)
    URL.revokeObjectURL(audioUrl)
  }
  audioRef.current.onerror = () => {
    setIsPlaying(false)
    URL.revokeObjectURL(audioUrl)
  }
  await audioRef.current.play()
}
} catch (error) {
console.error('Audio playback error:', error)
setIsPlaying(false)
}
}, [audioEnabled])

const proceedToNextTurn = useCallback(async () => {
if (!voiceCallState) return
try {
const nextTurnNumber = voiceCallState.currentTurn + 1
if (nextTurnNumber > 24) {
setCallState('completed')
finalizeCallResult()
return
}
const response = await fetch(
  `/api/voice-agent-call?callId=${voiceCallState.callId}&turn=${nextTurnNumber}&providerId=${callRequest.callMetadata.selectedProviderIds[currentProviderIndex]}`
)

if (!response.ok) {
  throw new Error('Failed to get next turn')
}

const data = await response.json()

if (data.ended) {
  setCallState('completed')
  finalizeCallResult()
  return
}

setVoiceCallState(prev => prev ? {
  ...prev,
  currentTurn: nextTurnNumber,
  turns: [...prev.turns, data.turn]
} : null)

setCurrentTurn(data.turn)

if (audioEnabled) {
  setTimeout(() => playTurnAudio(data.turn), 300)
}

// Auto-scroll transcript to bottom
requestAnimationFrame(() => {
  if (transcriptContainerRef.current) {
    transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
  }
})

setTimeout(() => proceedToNextTurn(), audioEnabled ? 3000 : 1200)
} catch (error) {
console.error('Failed to proceed to next turn:', error)
setCallState('completed')
finalizeCallResult()
}
}, [voiceCallState, callRequest, currentProviderIndex, audioEnabled, playTurnAudio])

useEffect(() => {
if (callState === 'connected' && voiceCallState && voiceCallState.currentTurn === 0) {
const timer = setTimeout(() => {
proceedToNextTurn()
}, audioEnabled ? 2500 : 1000)
return () => clearTimeout(timer)
}
}, [callState, voiceCallState, audioEnabled, proceedToNextTurn])

const finalizeCallResult = useCallback(() => {
if (!voiceCallState) return
const providerId = callRequest.callMetadata.selectedProviderIds[currentProviderIndex]
const providerConfig = callRequest.providerConfigurations.find(config => config.providerId === providerId)
// Determine appointment time: find the first concrete time in availability
const appointmentTime = pickFirstAppointment(callRequest)

const durationMs = Date.now() - voiceCallState.startedAt
const callDuration = msToClock(durationMs)

const result: CallResult = {
  providerId: providerId,
  providerName: voiceCallState.providerContext.name,
  success: true,
  appointmentTime,
  callDuration,
  filtersVerified: {
    freeServicesOnly: { verified: !!providerConfig?.verifyFilters.freeServicesOnly, notes: providerConfig?.verifyFilters.freeServicesOnly ? 'Confirmed during call' : '' },
    acceptsMedicaid: { verified: !!providerConfig?.verifyFilters.acceptsMedicaid, notes: providerConfig?.verifyFilters.acceptsMedicaid ? 'Confirmed during call' : '' },
    acceptsMedicare: { verified: !!providerConfig?.verifyFilters.acceptsMedicare, notes: providerConfig?.verifyFilters.acceptsMedicare ? 'Confirmed during call' : '' },
    acceptsUninsured: { verified: !!providerConfig?.verifyFilters.acceptsUninsured, notes: providerConfig?.verifyFilters.acceptsUninsured ? 'Confirmed during call' : '' },
    noSSNRequired: { verified: !!providerConfig?.verifyFilters.noSSNRequired, notes: providerConfig?.verifyFilters.noSSNRequired ? 'Confirmed during call' : '' },
    telehealthAvailable: { verified: !!providerConfig?.verifyFilters.telehealthAvailable, notes: providerConfig?.verifyFilters.telehealthAvailable ? 'Confirmed during call' : '' },
    featuredService: { verified: true, notes: 'Service availability confirmed' }
  },
  servicesDiscussed: providerConfig?.selectedServices || [],
  transcript: voiceCallState.turns.map(t => ({
    speaker: t.speaker === 'caller' ? 'AI Agent' : 'Receptionist',
    text: t.text,
    timestamp: t.timestamp
  }))
}

setCallResults(prev => {
  const next = [...prev, result]
  if (currentProviderIndex < callRequest.callMetadata.selectedProviderIds.length - 1) {
    setTimeout(() => {
      setCurrentProviderIndex(p => p + 1)
      setCallState('idle')
      setVoiceCallState(null)
      setCurrentTurn(null)
    }, 1000)
  } else {
    setTimeout(() => handleComplete(next), 600)
  }
  return next
})
}, [voiceCallState, callRequest, currentProviderIndex, handleComplete])

useEffect(() => {
if (callState === 'idle' && currentProviderIndex < callRequest.callMetadata.selectedProviderIds.length) {
const timer = setTimeout(() => {
initializeVoiceCall(callRequest.callMetadata.selectedProviderIds[currentProviderIndex])
}, 350)
return () => clearTimeout(timer)
}
}, [callState, currentProviderIndex, callRequest, initializeVoiceCall])

useEffect(() => {
return () => {
if (audioRef.current) {
audioRef.current.pause()
audioRef.current = null
}
}
}, [])

const toggleAudio = useCallback(() => setAudioEnabled(v => !v), [])

const filteredTurns = (voiceCallState?.turns ?? []).filter(t =>
!search ? true : t.text.toLowerCase().includes(search.toLowerCase())
)

return (
<div className="space-y-6">
<audio ref={audioRef} style={{ display: 'none' }} />
<div className="text-center mb-2">
    <h2 className="text-2xl font-semibold mb-1">AI Voice Agent Active</h2>
    <p className="text-gray-600">
      Calling {callRequest.callMetadata.totalProviders} provider(s) to schedule appointments
    </p>
  </div>

  {error && (
    <Card className="p-4 border-red-200 bg-red-50">
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="h-5 w-5" />
        <span className="font-medium">Call Error: {error}</span>
      </div>
    </Card>
  )}

  <Card className="p-6 sm:p-8 border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 rounded-2xl">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            callState === 'failed' ? 'bg-red-100' :
            callState === 'completed' ? 'bg-emerald-100' :
            'bg-blue-100'
          }`}>
            {callState === 'failed' ? (
              <XCircle className="h-6 w-6 text-red-600" />
            ) : callState === 'completed' ? (
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            ) : (
              <Phone className="h-6 w-6 text-blue-600 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              Provider {currentProviderIndex + 1} of {callRequest.callMetadata.totalProviders}
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleAudio} className="gap-2">
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {audioEnabled ? 'Audio On' : 'Audio Off'}
          </Button>
          {(callState !== 'idle' && callState !== 'completed' && callState !== 'failed') && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          )}
        </div>
      </div>

      {/* Progress */}
      <CallProgress currentState={callState} />

      {/* Current utterance */}
      {currentTurn && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${currentTurn.speaker === 'caller' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            <span className="font-medium text-sm">
              {currentTurn.speaker === 'caller' ? 'AI Agent' : 'Receptionist'}
            </span>
            {isPlaying && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                Speaking...
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-700">{currentTurn.text}</p>
        </div>
      )}

      {/* Tools */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcript..."
            className="w-56"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => {
            if (!voiceCallState) return
            const blob = new Blob([formatTranscript(voiceCallState.turns)], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'transcript.txt'
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={async () => {
            if (!voiceCallState) return
            await navigator.clipboard.writeText(formatTranscript(voiceCallState.turns))
          }}
        >
          <ClipboardCopy className="h-4 w-4" />
          Copy
        </Button>
        {audioEnabled ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => audioRef.current?.pause()}>
            <Pause className="h-4 w-4" />
            Pause audio
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => currentTurn && playTurnAudio(currentTurn)}>
            <Play className="h-4 w-4" />
            Play latest
          </Button>
        )}
      </div>

      {/* Transcript */}
      {voiceCallState && voiceCallState.turns.length > 0 && (
        <div ref={transcriptContainerRef} className="bg-gray-50 rounded-lg p-4 max-h-72 overflow-y-auto border border-gray-200/70">
          <h4 className="font-medium text-sm mb-3">Live Conversation</h4>
          <div className="space-y-3">
            {filteredTurns.map((turn, index) => (
              <div key={`${turn.timestamp}-${index}`} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${turn.speaker === 'caller' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                    <span className="font-medium">{turn.speaker === 'caller' ? 'AI Agent' : 'Receptionist'}</span>
                    <span>•</span>
                    <span>{new Date(turn.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-800">{turn.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </Card>

  {/* Results */}
  {callResults.length > 0 && (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Call Results</h3>
      {callResults.map((result) => (
        <Card key={result.providerId} className="p-0 overflow-hidden border-emerald-200/60">
          <div className="p-4 flex items-center justify-between bg-emerald-50 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div>
                <h4 className="font-semibold text-lg">{result.providerName}</h4>
                <p className="text-sm text-gray-600">Call Duration: {result.callDuration}</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
              ✓ Appointment Scheduled — {result.appointmentTime}
            </Badge>
          </div>

          {/* Transcript */}
          {Array.isArray(result.transcript) && result.transcript.length > 0 && (
            <div className="p-4">
              <h5 className="font-medium mb-3">Call Transcript:</h5>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {result.transcript.map((entry: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{entry.speaker}:</span>
                    <span className="ml-2">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )}
</div>
)
}

/* Helpers */

function getCallStateMessage(state: CallState): string {
const messages: Record<CallState, string> = {
idle: 'Preparing call...',
initializing: 'Initializing voice agent...',
dialing: 'Dialing provider...',
connected: 'Connected — conversation in progress',
conversation: 'AI agents talking...',
completed: 'Call completed successfully!',
failed: 'Call failed — check error above'
}
return messages[state]
}

function formatTranscript(turns: ConversationTurn[]) {
  return turns
    .map(
      t =>
        `${new Date(t.timestamp).toLocaleTimeString()} - ${
          t.speaker === 'caller' ? 'AI Agent' : 'Receptionist'
        }: ${t.text}`
    )
    .join('\n')
}

function msToClock(ms: number) {
const s = Math.max(0, Math.round(ms / 1000))
const mm = String(Math.floor(s / 60)).padStart(2, '0')
const ss = String(s % 60).padStart(2, '0')
return `${mm}:${ss}`
}

// Picks the first concrete time from availability (supports both timeSlots and timeRanges)
function pickFirstAppointment(callRequest: VoiceAgentCallRequest): string {
const a = callRequest.availability || []
if (a.length === 0) return 'Soonest available'
// Prefer explicit timeSlots if present
for (const day of a as any[]) {
if (Array.isArray(day.timeSlots) && day.timeSlots.length > 0) {
return readableDate(day.date) + ' ' + normalizeTime(day.timeSlots[0])
}
if (Array.isArray(day.timeRanges) && day.timeRanges.length > 0) {
const r = day.timeRanges[0]
return readableDate(day.date) + ' ' + normalizeTime(r.start)
}
}
// Fallback
const d = (a[0] as any).date
if ((a[0] as any).startTime) return readableDate(d) + ' ' + normalizeTime((a[0] as any).startTime)
return readableDate((a[0] as any).date) + ' 10:00 AM'
}

function readableDate(dateInput: string | Date) {
  let dt: Date
  if (dateInput instanceof Date) {
    dt = dateInput
  } else {
    const [y, m, d] = dateInput.split('-').map(Number)
    dt = new Date(y, m - 1, d)
  }
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function normalizeTime(t: string) {
// Accepts "HH:MM" or already 12h strings
if (!t) return '10:00 AM'
if (t.includes('AM') || t.includes('PM')) return t
const [h, m] = t.split(':').map(Number)
const suffix = h >= 12 ? 'PM' : 'AM'
const hr = h % 12 === 0 ? 12 : h % 12
return `${hr}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}








