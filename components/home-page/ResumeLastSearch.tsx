'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { getRecentSearches, type RecentSearch } from '@/lib/db'

export function ResumeLastSearch() {
  const [last, setLast] = useState<RecentSearch | null>(null)

  useEffect(() => {
    getRecentSearches(1)
      .then((items) => setLast(items?.[0] || null))
      .catch(() => setLast(null))
  }, [])

  if (!last) return null

  const params = new URLSearchParams()
  params.set('q', last.query)
  if (last.location) params.set('location', last.location)

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 border-y">
      <div className="container py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Resume your last search:</span>
          <span className="truncate max-w-[52vw] sm:max-w-none">{last.query}{last.location ? ` · ${last.location}` : ''}</span>
        </div>
        <Link
          href={`/app?${params.toString()}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}


