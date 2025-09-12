'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { RecentSearch } from '@/lib/db'
import { getRecentSearches } from '@/lib/db'

export function RecentSearches({ limit = 6 }: { limit?: number }) {
  const [recent, setRecent] = useState<RecentSearch[]>([])

  useEffect(() => {
    getRecentSearches(limit).then(setRecent).catch(() => setRecent([]))
  }, [limit])

  if (!recent || recent.length === 0) return null

  return (
    <div className="container pt-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent searches</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map((r) => {
          const params = new URLSearchParams()
          params.set('q', r.query)
          if (r.location) params.set('location', r.location)
          return (
            <Link
              key={`${r.id}-${r.timestamp?.toString?.()}`}
              href={`/app?${params.toString()}`}
              className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border bg-white/80 hover:bg-emerald-50 text-slate-700 dark:text-slate-200"
            >
              {r.query}
              {r.location ? ` · ${r.location}` : ''}
            </Link>
          )
        })}
      </div>
    </div>
  )
}


