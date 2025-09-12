'use client'

import React from 'react'
import Image from 'next/image'

export function MessageBubble({
  role,
  content,
}: {
  role: 'user' | 'assistant'
  content: string
}) {
  const isUser = role === 'user'

  function renderMessageText(text: string): { __html: string } {
    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    // Minimal markdown: **bold** and newlines
    const escaped = escapeHtml(text || '')
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    const withBreaks = withBold.replace(/\n/g, '<br/>')
    return { __html: withBreaks }
  }

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'} transition-smooth`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/70 dark:ring-black/40 shrink-0">
          <Image src="/logo_560x560.png" alt="AI" width={32} height={32} className="object-cover" />
        </div>
      )}
      <div
        className={
          isUser
            ? 'max-w-[85%] sm:max-w-[70%] rounded-xl rounded-br-sm bg-[#068282] text-white px-4 py-3 shadow-md animate-in fade-in slide-in-from-right-2'
            : 'max-w-[85%] sm:max-w-[70%] rounded-xl rounded-bl-sm glass border border-white/20 dark:border-white/10 px-4 py-3 shadow md:shadow-lg animate-in fade-in slide-in-from-left-2'
        }
      >
        <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={renderMessageText(content)} />
      </div>
    </div>
  )
}


