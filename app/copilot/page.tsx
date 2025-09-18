'use client'

import React, { useEffect, useState } from 'react'
import { CopilotHeader } from '@/components/layout/CopilotHeader'
import { ChatWindow, type ChatMessage } from '@/components/copilot/ChatWindow'
import { InputBar } from '@/components/copilot/InputBar'
import { ProviderCards } from '@/components/copilot/ProviderCards'
import { StatePanel, type CopilotUserState, type CopilotDebugInfo } from '@/components/copilot/StatePanel'
import type { Provider } from '@/lib/types/copilot'

type UserLocation = {
  latitude: number
  longitude: number
  city?: string
  state?: string
  display?: string
}

export default function CopilotPage() {
  // Build-time flag exposed via next.config.ts → env.NEXT_PUBLIC_DEBUG_AI_COPILOT
  const showDebugUI = (process.env.NEXT_PUBLIC_DEBUG_AI_COPILOT === 'true' || process.env.NEXT_PUBLIC_DEBUG_AI_COPILOT === '1')
  // Default to streaming unless explicitly disabled via NEXT_PUBLIC_COPILOT_STREAM=false/0
  const supportsStreams = typeof ReadableStream !== 'undefined'
  const streamingDisabledEnv = (process.env.NEXT_PUBLIC_COPILOT_STREAM === 'false' || process.env.NEXT_PUBLIC_COPILOT_STREAM === '0')
  const enableStreaming = supportsStreams && !streamingDisabledEnv

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [providersByMessage, setProvidersByMessage] = useState<Record<number, Provider[]>>({})
  const [state, setState] = useState<CopilotUserState | null>(null)
  const [debug, setDebug] = useState<CopilotDebugInfo | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationInput, setLocationInput] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  

  // Load and persist conversation locally so the model keeps context across navigations
  const STORAGE_KEY = 'sie:copilot:conversation'
  const STATE_KEY = 'sie:copilot:state'
  const LOCATION_KEY = 'sie:copilot:location'
  const PROVIDERS_KEY = 'sie:copilot:providers'

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[]
        const filtered = (parsed || []).filter(m => m && (m.role === 'user' || m.role === 'assistant'))
        if (filtered.length) setMessages(filtered)
      }
      const stateRaw = typeof window !== 'undefined' ? window.localStorage.getItem(STATE_KEY) : null
      if (stateRaw) {
        const parsedState = JSON.parse(stateRaw) as CopilotUserState
        setState(parsedState)
      }
      const locationRaw = typeof window !== 'undefined' ? window.localStorage.getItem(LOCATION_KEY) : null
      if (locationRaw) {
        const parsedLocation = JSON.parse(locationRaw) as UserLocation
        setUserLocation(parsedLocation)
        if (parsedLocation.display) setLocationInput(parsedLocation.display)
      }
      const providersRaw = typeof window !== 'undefined' ? window.localStorage.getItem(PROVIDERS_KEY) : null
      if (providersRaw) {
        const parsedProviders = JSON.parse(providersRaw) as Record<string, Provider[]>
        const normalized: Record<number, Provider[]> = {}
        for (const [k, v] of Object.entries(parsedProviders || {})) {
          const idx = Number(k)
          if (!Number.isNaN(idx)) normalized[idx] = v as Provider[]
        }
        setProvidersByMessage(normalized)
      }
    } catch {}
  }, [])

  // Listen for header-triggered open-location event to render and focus location UI
  useEffect(() => {
    function onOpenLocation() {
      try {
        setUserLocation(null)
        const el = document.getElementById('new-location')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch {}
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('sie:copilot:open-location', onOpenLocation as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sie:copilot:open-location', onOpenLocation as EventListener)
      }
    }
  }, [])

  const handleAutoLocation = async () => {
    setIsGettingLocation(true)
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser')
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Reverse geocode to get city/state
          try {
            const res = await fetch(`/api/geo/reverse?lat=${latitude}&lon=${longitude}`)
            const data = await res.json()
            
            const location: UserLocation = {
              latitude,
              longitude,
              city: data.city,
              state: data.state,
              display: data.display || `${data.city || 'Unknown'}, ${data.state || 'Unknown'}`
            }
            
            setUserLocation(location)
            setLocationInput(location.display || '')
            window.localStorage.setItem(LOCATION_KEY, JSON.stringify(location))
          } catch (err) {
            console.error('Reverse geocode failed', err)
            // Use coords even if reverse geocode fails
            const location: UserLocation = {
              latitude,
              longitude,
              display: 'Current Location'
            }
            setUserLocation(location)
            setLocationInput('Current Location')
            window.localStorage.setItem(LOCATION_KEY, JSON.stringify(location))
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please enter city and state manually.')
        },
        { timeout: 10000 }
      )
    } finally {
      setIsGettingLocation(false)
    }
  }
  
  const handleLocationSubmit = async () => {
    if (!locationInput.trim()) return
    
    setIsGettingLocation(true)
    try {
      // Forward geocode the location
      const res = await fetch(`/api/geo/forward?q=${encodeURIComponent(locationInput)}&country=us`)
      const data = await res.json()
      
      if (data.ok && data.latitude && data.longitude) {
        const location: UserLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          state: data.state,
          display: locationInput
        }
        
        setUserLocation(location)
        window.localStorage.setItem(LOCATION_KEY, JSON.stringify(location))
      } else {
        alert('Could not find that location. Please try again.')
      }
    } catch (err) {
      console.error('Error geocoding location:', err)
      alert('Error finding location. Please try again.')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setIsThinking(true)

    try {
      // Optimistically add an empty assistant draft bubble in ALL modes (streaming and non-streaming)
      const assistantIdx = next.length
      const withAssistantDraft: ChatMessage[] = [...next, { role: 'assistant', content: '' }]
      setMessages(withAssistantDraft)

      if (enableStreaming) {

        let draft = ''
        let rawJson = ''
        const decodeFragment = (s: string) => {
          return s
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '\r')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
        }
        const extractAnswerIncremental = (buffer: string, previous: string) => {
          // Try full JSON parse first
          try {
            const obj = JSON.parse(buffer)
            if (obj && typeof obj.answer === 'string') return obj.answer
          } catch {}
          // Heuristic: locate "answer":" ... (partial)
          const startMatch = buffer.match(/\"answer\"\s*:\s*\"/)
          if (!startMatch || startMatch.index === undefined) return previous
          let slice = buffer.slice(startMatch.index + startMatch[0].length)
          // Stop at next unescaped quote followed by ," or "}
          const boundary = slice.search(/\"\s*,\s*\"|\"\s*\}/)
          if (boundary !== -1) slice = slice.slice(0, boundary)
          // Decode common escapes
          return decodeFragment(slice)
        }
        const afterPeriodsToNewlines = (s: string) => s.replace(/\.\s+/g, '.\n')
        const updateDraft = (delta: string) => {
          rawJson += delta
          const extracted = extractAnswerIncremental(rawJson, draft)
          const formatted = afterPeriodsToNewlines(extracted)
          draft = formatted
          setMessages((prev) => {
            const copy = [...prev]
            copy[assistantIdx] = { role: 'assistant', content: draft }
            return copy
          })
        }

        // Attach last providers context (same as non-streaming)
        let contextProviders: Provider[] | undefined
        try {
          const lastAssistantIndex = [...messages].reverse().findIndex(m => m.role === 'assistant')
          const absoluteIdx = lastAssistantIndex === -1 ? -1 : messages.length - 1 - lastAssistantIndex
          if (absoluteIdx >= 0) {
            contextProviders = (providersByMessage[absoluteIdx] || []).slice(0, 12)
          }
        } catch {}

        const res = await fetch('/api/copilot?stream=1', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // Accept text/event-stream; include no-cache to discourage iOS caching proxies
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'x-copilot-stream': '1'
          },
          body: JSON.stringify({ 
            query: text, 
            conversation: messages, 
            state,
            location: userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined,
            contextProviders,
            stream: true
          }),
        })

        if (!res.ok || !res.body) throw new Error('Stream failed')

        // WebKit fix: piping through a BYOB reader where available helps on some iOS versions
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const STORAGE_KEY = 'sie:copilot:conversation'
        const STATE_KEY = 'sie:copilot:state'
        const PROVIDERS_KEY = 'sie:copilot:providers'

        // Event types for SSE
        type CopilotFinalPayload = {
          answer: string
          providers: Provider[]
          state: CopilotUserState | null
          debug: CopilotDebugInfo | null
          conversation: ChatMessage[]
        }
        type OutputDeltaEvt = { type: 'response.output_text.delta'; delta: string }
        type CopilotFinalEvt = { type: 'copilot.final'; payload: CopilotFinalPayload }
        const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
        const isOutputDeltaEvt = (v: unknown): v is OutputDeltaEvt => {
          if (!isRecord(v)) return false
          return (v.type === 'response.output_text.delta') && (typeof (v as { delta?: unknown }).delta === 'string')
        }
        const isCopilotFinalEvt = (v: unknown): v is CopilotFinalEvt => {
          if (!isRecord(v)) return false
          if (v.type !== 'copilot.final' || !isRecord((v as { payload?: unknown }).payload)) return false
          const p = (v as { payload: Record<string, unknown> }).payload
          return typeof p.answer === 'string' && Array.isArray(p.providers)
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let idx: number
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const chunk = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)
            const lines = chunk.split('\n')
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue
              const jsonStr = trimmed.slice(5).trim()
              if (!jsonStr || jsonStr === '[DONE]') continue
              try {
                const parsed: unknown = JSON.parse(jsonStr)
                if (isOutputDeltaEvt(parsed)) {
                  updateDraft(parsed.delta)
                } else if (isCopilotFinalEvt(parsed)) {
                  const payload = parsed.payload
                  if (payload.answer) {
                    draft = payload.answer
                    setMessages((prev) => {
                      const copy = [...prev]
                      copy[assistantIdx] = { role: 'assistant', content: draft }
                      return copy
                    })
                  }
                  setProvidersByMessage((prev) => {
                    const nextMap = { ...prev, [assistantIdx]: (payload.providers || []) }
                    try { window.localStorage.setItem(PROVIDERS_KEY, JSON.stringify(nextMap)) } catch {}
                    return nextMap
                  })
                  if (payload.state) setState(payload.state)
                  if (payload.debug) setDebug(payload.debug)
                  try {
                    const finalConversation = Array.isArray(payload.conversation) ? payload.conversation : [...withAssistantDraft.slice(0, assistantIdx), { role: 'assistant', content: draft }]
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalConversation))
                    if (payload.state) window.localStorage.setItem(STATE_KEY, JSON.stringify(payload.state))
                  } catch {}
                }
              } catch {}
            }
          }
        }
        setIsThinking(false)
        return
      }

      // Attach last recommended providers (context) so the server can ground follow-ups like
      // "which one of those" without re-searching the entire dataset.
      let contextProviders: Provider[] | undefined
      try {
        const lastAssistantIndex = [...messages].reverse().findIndex(m => m.role === 'assistant')
        const absoluteIdx = lastAssistantIndex === -1 ? -1 : messages.length - 1 - lastAssistantIndex
        if (absoluteIdx >= 0) {
          contextProviders = (providersByMessage[absoluteIdx] || []).slice(0, 12)
        }
      } catch {}

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: text, 
          // Send only prior conversation; server will append the new user query
          conversation: messages, 
          state,
          location: userLocation ? { 
            latitude: userLocation.latitude, 
            longitude: userLocation.longitude 
          } : undefined,
          contextProviders
        }),
      })
      const data = await res.json()
      const answer = (data?.answer as string) || 'Here are some providers that may help.'
      const providers = (data?.providers as Provider[]) || []
      const nextState: CopilotUserState | null = data?.state || null
      const nextDebug: CopilotDebugInfo | null = data?.debug || null

      // Update the assistant draft bubble with final text
      setMessages((prev) => {
        const copy = [...prev]
        copy[assistantIdx] = { role: 'assistant', content: answer }
        return copy
      })
      // Attach providers for this assistant turn
      setProvidersByMessage((prev) => {
        const nextMap = { ...prev, [assistantIdx]: providers }
        try { window.localStorage.setItem(PROVIDERS_KEY, JSON.stringify(nextMap)) } catch {}
        return nextMap
      })
      if (nextState) setState(nextState)
      if (nextDebug) setDebug(nextDebug)

      // Persist conversation locally (our current in-memory conversation)
      try {
        const now = JSON.parse(JSON.stringify(withAssistantDraft)) as ChatMessage[]
        now[assistantIdx] = { role: 'assistant', content: answer }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(now))
        if (nextState) window.localStorage.setItem(STATE_KEY, JSON.stringify(nextState))
      } catch {}
    } catch {
      const withAssistant: ChatMessage[] = [...next, { role: 'assistant', content: 'Sorry, I could not generate an answer right now.' }]
      setMessages(withAssistant)
    } finally {
      setIsThinking(false)
    }
  }

  const handleReset = () => {
    setMessages([])
    setProvidersByMessage({})
    setState(null)
    setDebug(null)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem(STATE_KEY)
        window.localStorage.removeItem(PROVIDERS_KEY)
      }
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-b from-[#E6FFFA] via-[#F0FDFA] to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <CopilotHeader />

      <main className="w-full max-w-full overflow-x-hidden overscroll-x-none px-0 sm:px-4 lg:px-8 pt-2 pb-4 sm:pt-4 sm:pb-8 flex-1">
        <div className="mb-3" id="new-location">
          {/* Location Bar (hidden on copilot if location set; header shows controls) */}
          {!(userLocation) && (
          <div className="mt-1 mx-4 p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-[#068282] dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Your Location
              </span>
              {userLocation && (
                <span className="ml-auto text-[11px] text-[#068282] dark:text-emerald-400 font-medium">
                  ✓ Location set
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <input
                type="text"
                placeholder="Enter city, state (e.g., San Francisco, CA)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLocationSubmit()
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#068282]/30 focus:border-[#068282]/50 transition-all"
                disabled={isGettingLocation}
              />
              <div className="flex gap-2 items-center self-stretch sm:self-auto">
                <button
                  onClick={handleLocationSubmit}
                  disabled={!locationInput.trim() || isGettingLocation}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#068282] to-emerald-600 text-white text-xs sm:text-sm font-medium hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  Set Location
                </button>
                <button
                  onClick={handleAutoLocation}
                  disabled={isGettingLocation}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs sm:text-sm font-medium hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center gap-1.5"
                >
                  {isGettingLocation ? (
                    <>
                      <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                      Getting...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Auto Detect
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="ml-auto sm:ml-0 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-white/30 dark:border-white/20 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all"
                >
                  Reset Conversation
                </button>
              </div>
            </div>
            
           
          </div>
          )}
          {userLocation && (
            <div className="hidden md:block mt-1 mx-4 p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-md">
              <div className="text-sm font-semibold bg-gradient-to-r from-[#068282] to-emerald-600 bg-clip-text text-transparent">
                Your Location: <span className="font-normal text-gray-700 dark:text-gray-200">{userLocation.display || `${userLocation.city || 'Unknown'}, ${userLocation.state || ''}`}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => { try { window.location.hash = 'new-location'; window.scrollTo({ top: 0, behavior: 'smooth' }); window.dispatchEvent(new CustomEvent('sie:copilot:open-location')); } catch {} }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#068282] to-emerald-600 text-white text-xs sm:text-sm font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all"
                >
                  New Location
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-white/30 dark:border-white/20 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all"
                >
                  Reset Conversation
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 ${showDebugUI ? 'lg:grid-cols-3' : ''} gap-4 lg:gap-8 items-start w-full max-w-full overflow-x-hidden`}>
          <div className={showDebugUI ? 'lg:col-span-2 min-w-0' : 'w-full min-w-0'}>
            <ChatWindow
              messages={messages}
              providersByMessage={providersByMessage}
              isThinking={isThinking}
              onPromptClick={handleSend}
              onReset={handleReset}
              inputSlot={
                <div className="flex items-center justify-between gap-2">
                  <InputBar onSubmit={handleSend} size={messages.length === 0 ? 'hero' : 'compact'} />
                </div>
              }
            />
          </div>

          {showDebugUI && (
            <aside className="hidden lg:block sticky top-24 space-y-3 min-w-0 max-w-full">
              <div className="rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-lg p-4">
                <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Latest Recommendations</div>
                <ProviderCards providers={providersByMessage[messages.length - 1] || []} max={6} />
              </div>
              <StatePanel state={state} debug={debug} />
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}


