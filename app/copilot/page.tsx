'use client'

import React, { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
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

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [providersByMessage, setProvidersByMessage] = useState<Record<number, Provider[]>>({})
  const [state, setState] = useState<CopilotUserState | null>(null)
  const [debug, setDebug] = useState<CopilotDebugInfo | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationInput, setLocationInput] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  function isChatMessage(m: unknown): m is ChatMessage {
    return !!m && typeof (m as { content?: unknown }).content === 'string' && ((m as { role?: unknown }).role === 'user' || (m as { role?: unknown }).role === 'assistant')
  }

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
    setMessages(next)
    setIsThinking(true)

    try {
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
      // Prefer server conversation if present; filter to user/assistant only
      const returned = Array.isArray(data?.conversation) ? (data.conversation as ChatMessage[]) : []
      // Prefer server conversation; otherwise, append assistant to our local optimistic list
      const merged: ChatMessage[] = (returned.length ? returned : [...next, { role: 'assistant', content: answer }])
        .filter(isChatMessage)
      // Collapse any accidental consecutive duplicates (same role and content)
      const filtered: ChatMessage[] = []
      for (const m of merged) {
        const last = filtered[filtered.length - 1]
        if (last && last.role === m.role && last.content === m.content) continue
        filtered.push(m)
      }

      setMessages(filtered)
      if (nextState) setState(nextState)
      setDebug(nextDebug)
      // Map providers to the last assistant message index
      const lastAssistantIndex = [...filtered].reverse().findIndex(m => m.role === 'assistant')
      const absoluteIdx = lastAssistantIndex === -1 ? filtered.length - 1 : filtered.length - 1 - lastAssistantIndex
      setProvidersByMessage((prev) => {
        const nextMap = { ...prev, [absoluteIdx]: providers }
        try { window.localStorage.setItem(PROVIDERS_KEY, JSON.stringify(nextMap)) } catch {}
        return nextMap
      })

      // Persist conversation locally
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
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
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
      <Header />

      <main className="container mx-auto w-full max-w-full overflow-x-hidden px-2 sm:px-4 lg:px-8 pt-2 pb-4 sm:pt-4 sm:pb-8 flex-1">
        <div className="mb-3">
          {/* Location Bar */}
          <div className="mt-1 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                Your Location
              </span>
              {userLocation && (
                <span className="ml-auto text-[11px] text-emerald-600 dark:text-emerald-400">
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
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isGettingLocation}
              />
              <div className="flex gap-2 items-center self-stretch sm:self-auto">
                <button
                  onClick={handleLocationSubmit}
                  disabled={!locationInput.trim() || isGettingLocation}
                  className="px-3 py-2 rounded-md bg-emerald-600 text-white text-xs sm:text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Set Location
                </button>
                <button
                  onClick={handleAutoLocation}
                  disabled={isGettingLocation}
                  className="px-3 py-2 rounded-md bg-teal-600 text-white text-xs sm:text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
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
                  className="ml-auto sm:ml-0 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-900"
                >
                  Reset Conversation
                </button>
              </div>
            </div>
            
           
          </div>
        </div>

        <div className={`grid grid-cols-1 ${showDebugUI ? 'lg:grid-cols-3' : ''} gap-4 lg:gap-8 items-start`}>
          <div className={showDebugUI ? 'lg:col-span-2' : ''}>
            <ChatWindow
              messages={messages}
              providersByMessage={providersByMessage}
              isThinking={isThinking}
              onPromptClick={handleSend}
              onReset={handleReset}
              inputSlot={
                <div className="flex items-center justify-between gap-2">
                  <InputBar onSubmit={handleSend} />
                </div>
              }
            />
          </div>

          {showDebugUI && (
            <aside className="hidden lg:block sticky top-24 space-y-3">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
                <div className="text-sm font-semibold mb-2">Latest Recommendations</div>
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


