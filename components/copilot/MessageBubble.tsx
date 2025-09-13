'use client'

import React from 'react'
import Image from 'next/image'

export function MessageBubble({
  role,
  content,
  highlights,
}: {
  role: 'user' | 'assistant'
  content: string
  highlights?: { providers?: string[]; services?: string[]; highlightPrices?: boolean }
}) {
  const isUser = role === 'user'

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Apply <strong> to providers/services/prices, preserving any existing HTML or **bold**
  function applyHighlights(html: string): string {
    if (!highlights || (!highlights.providers?.length && !highlights.services?.length && !highlights.highlightPrices)) {
      return html
    }

    // Build regex patterns (sorted by length desc to avoid partial overlaps)
    const termToPattern = (term: string) => {
      const escaped = escapeRegExp(term.trim()).replace(/\s+/g, '\\s+')
      // Word-ish boundaries: start or non-alnum before; non-alnum or end after
      return new RegExp(`(^|[^A-Za-z0-9])(${escaped})(?=[^A-Za-z0-9]|$)`, 'gi')
    }

    const providerPatterns = (highlights.providers || [])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map(termToPattern)

    const servicePatterns = (highlights.services || [])
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map(termToPattern)

    // Price regex: $12, $12.50, $12-20, $12 - $20, $1,200 etc.
    const priceRegex = /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:\s?-\s?\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)?/g

    // Process only text nodes by splitting on tags
    const parts = html.split(/(<[^>]+>)/g)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i] as string
      if (!part || part.startsWith('<')) continue
      let t = part
      for (const re of providerPatterns) {
        t = t.replace(re, (_m, pre: string, match: string) => `${pre}<strong>${match}</strong>`)
      }
      for (const re of servicePatterns) {
        t = t.replace(re, (_m, pre: string, match: string) => `${pre}<strong>${match}</strong>`)
      }
      if (highlights.highlightPrices) {
        t = t.replace(priceRegex, (m) => `<strong>${m}</strong>`)
      }
      parts[i] = t
    }
    return parts.join('')
  }

  function renderMessageText(text: string): { __html: string } {
    // Minimal markdown: **bold** and newlines, then apply highlights on text nodes
    const escaped = escapeHtml(text || '')
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    const withHighlights = applyHighlights(withBold)
    const withBreaks = withHighlights.replace(/\n/g, '<br/>')
    return { __html: withBreaks }
  }

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'} transition-smooth`}>
      {!isUser && (
        <div className="hidden sm:block h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/70 dark:ring-black/40 shrink-0">
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


