'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Provider } from '@/lib/types/copilot'
import { MessageBubble } from './MessageBubble'
import { ProviderCards } from './ProviderCards'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export function ChatWindow({
  messages,
  providersByMessage,
  isThinking,
  onPromptClick,
  inputSlot,
  onReset,
}: {
  messages: ChatMessage[]
  providersByMessage?: Record<number, Provider[]>
  isThinking?: boolean
  onPromptClick: (prompt: string) => void
  inputSlot?: React.ReactNode
  onReset?: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  void onReset

  useEffect(() => {
    if (!scrollerRef.current) return
    scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking, providersByMessage])

  const prompts = [
    'Therapy near me for cheap',
    'Low-cost dental care near me',
    'Clinics that do not require SSN',
    'Mental health clinics that accept Medicaid',
  ]

  return (
    <div className="relative">
      {navigatingTo && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <div className="glass rounded-xl px-4 py-3 border border-white/20 dark:border-white/10 text-center">
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
      <div className="glass rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden lg:h-[60vh] flex flex-col">
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-0 py-3 sm:p-6 space-y-4 bg-white/60 dark:bg-gray-900/40 lg:pb-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 84px)' }}
        >
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">Try one of these to get started</p>
              <div className="flex flex-wrap justify-center gap-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => onPromptClick(p)}
                    className="btn-capability hover-lift-sm rounded-full"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className="space-y-2">
              <div className={m.role === 'assistant' ? 'pl-0 sm:pl-0' : ''}>
                <MessageBubble role={m.role} content={m.content} />
              </div>
              {m.role === 'assistant' && providersByMessage?.[i]?.length ? (
                <div className="ml-0 sm:ml-12">
                  <ProviderCards providers={providersByMessage[i]} max={6} onNavigateStart={(name) => setNavigatingTo(name)} />
                </div>
              ) : null}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/70 dark:ring-black/40">
                <Image src="/logo_560x560.png" alt="AI" width={32} height={32} className="h-8 w-8 object-cover" />
              </div>
              <div className="glass rounded-xl rounded-bl-sm px-4 py-3 border border-white/20 dark:border-white/10">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop input area (inline) */}
        <div className="hidden lg:block p-3 sm:p-4 border-t border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/60">
          <div className="w-full">
            {inputSlot}
          </div>
        </div>
      </div>

      {/* Mobile fixed input at bottom, compact height */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-white/20 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-2 py-2"
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


