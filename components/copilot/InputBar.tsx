'use client'

import React, { useState, useRef } from 'react'
import { Send } from 'lucide-react'

export function InputBar({ onSubmit, size = 'compact' }: { onSubmit: (text: string) => void; size?: 'hero' | 'compact' }) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isHero = size === 'hero'
  const isExpanded = isHero || (size === 'compact' && focused)

  const handleSend = () => {
    if (!text.trim()) return
    onSubmit(text)
    setText('')
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.blur()
    }
    // Collapse back to compact size after send
    setFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter without shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div 
      className={`
        w-full max-w-full flex items-start gap-3 
        ${isExpanded ? 'rounded-3xl' : 'rounded-full'}
        bg-white dark:bg-gray-900 
        shadow-lg transition-all duration-300
        ${focused ? 'shadow-xl' : ''}
        ${isExpanded ? 'px-5 py-4 min-h-32' : 'px-4 py-3 min-h-14'}
      `}
    >
      <textarea
        ref={textareaRef}
        className={`
          w-full min-w-0 bg-transparent outline-none text-gray-700 dark:text-gray-100 resize-none
          ${isExpanded ? 'text-[16px] sm:text-base min-h-[4.5rem] leading-relaxed' : 'text-[16px] sm:text-[16px] h-auto'} 
          placeholder:text-gray-400 dark:placeholder:text-gray-500
        `}
        placeholder="Ask your healthcare question..."
        value={text}
        onChange={handleTextChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        rows={isExpanded ? 3 : 1}
        style={{ height: isExpanded ? 'auto' : '1.5rem' }}
      />
      <button 
        onClick={handleSend} 
        className={`
          flex items-center gap-2 rounded-full bg-[#5EEAD4] hover:bg-[#4DD4BF] 
          text-gray-800 font-medium transition-all shrink-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isExpanded ? 'px-5 py-3 text-[16px] self-end' : 'px-5 py-2.5 text-[16px]'}
        `}
        disabled={!text.trim()}
      >
        <span>Send</span>
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}


