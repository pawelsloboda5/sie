'use client'

import React, { useState } from 'react'

export function InputBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSubmit(text)
    setText('')
  }

  return (
    <div className="hero-search-bar w-full max-w-full flex items-center gap-2 rounded-xl shadow-lg border border-white/30 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-2">
      <input
        className="w-full min-w-0 bg-transparent outline-none px-3 py-2 text-sm sm:text-base placeholder:text-gray-400"
        placeholder="Ask your healthcare question…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSend()
          }
        }}
      />
      <button onClick={handleSend} className="btn-hero whitespace-nowrap shrink-0">Send</button>
    </div>
  )
}


