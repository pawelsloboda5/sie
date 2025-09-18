'use client'

import React from 'react'
import Image from 'next/image'

export function MessageBubble({
  role,
  content,
  highlights,
  isTyping,
}: {
  role: 'user' | 'assistant'
  content: string
  highlights?: { providers?: string[]; services?: string[]; highlightPrices?: boolean }
  isTyping?: boolean
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

    // Price regex: $12, $12.50, $12-20, $12 – $20, $12—$20, $12 to $20, $1,200 etc.
    const priceRegex = /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:\s?(?:-|\u2013|\u2014|to)\s?\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)?/gi

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

  // Convert the Services line into mobile-friendly blocks (each service on a new line on mobile)
  function formatServicesLines(html: string): string {
    try {
      const lines = html.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] as string
        // Match any prefix (including bullets) before "Services:" then capture the remainder
        const match = line.match(/^(.*?)(Services:\s*)(.+)$/i)
        if (!match) continue
        const prefix = match[1] || ''
        const label = match[2] || 'Services: '
        const rest = match[3] || ''
        const parts = rest.split(/;\s*/).filter(Boolean)
        if (parts.length <= 1) continue
        const rebuilt = prefix + label + parts.map((p, idx) => {
          const sep = idx < parts.length - 1 ? '<span class="hidden sm:inline">; </span>' : ''
          return `<span class="block sm:inline">${p}</span>${sep}`
        }).join('')
        lines[i] = rebuilt
      }
      return lines.join('\n')
    } catch {
      return html
    }
  }

  // Collapse extra blank lines before Features
  function collapseFeatureGaps(input: string): string {
    try {
      return (input || '').replace(/\n\s*\n\s*(-\s*Features:)/gi, '\n$1')
    } catch {
      return input
    }
  }

  function renderMessageText(text: string): { __html: string } {
    // Normalize spacing, then minimal markdown: **bold** and newlines, then apply highlights on text nodes
    // If the stream accidentally contains a JSON-like wrapper, strip leading/trailing braces and leading "answer":
    const stripped = (() => {
      const t = text || ''
      // Quick checks to avoid heavy parsing
      if (t.startsWith('{') && t.includes('"answer"')) {
        // Remove outermost braces and any leading answer key
        const inner = t.replace(/^\{\s*\"answer\"\s*:\s*\"?/i, '').replace(/\"\s*\}\s*$/i, '')
        return inner
      }
      return t
    })()
    // Convert sentences to new lines for readability during stream
    const sentenceBreaks = stripped.replace(/\.\s+/g, '.\n')
    const normalized = collapseFeatureGaps(sentenceBreaks)
    const escaped = escapeHtml(normalized)
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    const withHighlights = applyHighlights(withBold)
    const withServices = formatServicesLines(withHighlights)
    const withBreaks = withServices.replace(/\n/g, '<br/>')
    return { __html: withBreaks }
  }

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'} transition-smooth w-full max-w-full`}>
      {!isUser && (
        <div className="hidden sm:block h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/70 dark:ring-black/40 shrink-0">
          <Image src="/logo_560x560.png" alt="AI" width={32} height={32} className="object-cover" />
        </div>
      )}
      <div
        className={
          isUser
            ? 'max-w-[85%] sm:max-w-[70%] rounded-xl rounded-br-sm bg-[#068282] text-white px-4 py-3 shadow-md animate-in fade-in slide-in-from-right-2 min-w-0'
            : 'max-w-[85%] sm:max-w-[70%] rounded-xl rounded-bl-sm glass border border-white/20 dark:border-white/10 px-4 py-3 shadow md:shadow-lg animate-in fade-in slide-in-from-left-2 min-w-0'
        }
      >
        {isTyping && (!content || content.trim() === '') ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:240ms]" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-normal sm:break-words leading-relaxed text-[14px] sm:text-[18px] [line-height:1.55] sm:[line-height:1.6]" dangerouslySetInnerHTML={renderMessageText(content)} />
        )}
      </div>
    </div>
  )
}


