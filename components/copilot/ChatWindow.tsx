'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { Provider } from '@/lib/types/copilot'
import type { HospitalDataRecord } from '@/lib/hospitalDataApi'
import { MessageBubble } from './MessageBubble'
import { ProviderCards } from './ProviderCards'
import { HospitalResults } from './HospitalResults'
import Image from 'next/image'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export function ChatWindow({
  messages,
  providersByMessage,
  hospitalsByMessage,
  isThinking,
  onPromptClick,
  inputSlot,
  onReset,
}: {
  messages: ChatMessage[]
  providersByMessage?: Record<number, Provider[]>
  hospitalsByMessage?: Record<number, HospitalDataRecord[]>
  isThinking?: boolean
  onPromptClick: (prompt: string) => void
  inputSlot?: React.ReactNode
  onReset?: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  void onReset

  // No in-chat settings; header owns settings. Keep only minimal state here.

  useEffect(() => {
    if (!scrollerRef.current) return
    scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking, providersByMessage, hospitalsByMessage])

  void Image

  const prompts = [
    'Therapy near me for cheap',
    'Low-cost dental care near me',
    'Cheap physical exams',
    'Mental health clinics that accept Medicaid',
    'Who has the cheapest hip replacement NY?',
  ]

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="relative w-full max-w-full overflow-x-hidden">
      {navigatingTo && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
          <div className="rounded-2xl bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-900/60 backdrop-blur-xl px-5 py-4 border border-white/50 dark:border-white/20 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:120ms]" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:240ms]" />
            </div>
            <div className="text-sm font-medium">
              Taking you to the provider page of {navigatingTo}
            </div>
          </div>
        </div>
      )}
      <div className="bg-transparent lg:h-[65vh] flex flex-col w-full max-w-full">
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin px-4 py-4 sm:p-6 space-y-4 bg-transparent lg:pb-0 max-w-full"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 128px)' }}
        >
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full overflow-hidden ring-2 ring-white/50 dark:ring-white/20 shadow-lg">
                <Image src="/logo_560x560.png" alt="SIE" width={56} height={56} className="object-cover" />
              </div>
              <h1 className="text-[18px] font-semibold text-gray-800 dark:text-gray-100">
                {greeting}, how can I help you find affordable care and prices?
              </h1>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose a prompt or ask your own question</p>
              <div className="mt-4 flex flex-col gap-3 max-w-sm mx-auto">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => onPromptClick(p)}
                    className="rounded-xl px-4 py-3.5 text-[13px] text-left font-medium bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => {
            const provs = (m.role === 'assistant' ? providersByMessage?.[i] : undefined) || []
            const providerNames = Array.from(new Set(provs.map(p => p?.name).filter(Boolean))) as string[]
            const serviceNames = Array.from(new Set(
              provs.flatMap(p => (Array.isArray(p?.services) ? p.services : [])
                .map(s => s?.name)
                .filter(Boolean))
            )) as string[]
            const isLast = i === messages.length - 1
            const isAssistantDraft = m.role === 'assistant' && (!m.content || m.content.trim() === '')
            return (
            <div key={i} className="space-y-2 min-w-0 max-w-full">
              <div className={m.role === 'assistant' ? 'pl-0 sm:pl-0 min-w-0 max-w-full' : 'min-w-0 max-w-full'}>
                <MessageBubble 
                  role={m.role} 
                  content={m.content}
                  highlights={m.role === 'assistant' ? { providers: providerNames, services: serviceNames, highlightPrices: true } : undefined}
                  isTyping={isAssistantDraft && isLast}
                />
              </div>
              {m.role === 'assistant' && providersByMessage?.[i]?.length ? (
                <div className="ml-0 sm:ml-12 max-w-full overflow-x-hidden">
                  <ProviderCards providers={providersByMessage[i]} max={6} onNavigateStart={(name) => setNavigatingTo(name)} />
                </div>
              ) : null}
              {m.role === 'assistant' && hospitalsByMessage?.[i]?.length ? (
                <div className="ml-0 sm:ml-12 max-w-full overflow-x-hidden">
                  <HospitalResults records={hospitalsByMessage[i] as HospitalDataRecord[]} max={10} />
                </div>
              ) : null}
            </div>
          )})}

          {/* External typing indicator removed; typing dots now render inside the assistant bubble when streaming */}
        </div>

        {/* Desktop input area (inline) */}
        <div className="hidden lg:block p-4 bg-transparent mt-4">
          <div className="w-full">
            {inputSlot}
          </div>
        </div>
      </div>

      {/* Mobile fixed input at bottom, compact height */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-3 py-3 shadow-lg"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        }}
      >
        <div className="max-w-full">
          {inputSlot}
        </div>
      </div>
    </div>
  )
}


