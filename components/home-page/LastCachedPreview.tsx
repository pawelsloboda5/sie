'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { getRecentSearches, getCachedSearchResult, type RecentSearch } from '@/lib/db'
import { buildProviderSlug } from '@/lib/utils'

type CachedProvider = {
  _id?: string
  name?: string
  address?: string
}

export function LastCachedPreview() {
  const [recent, setRecent] = useState<RecentSearch | null>(null)
  const [providers, setProviders] = useState<CachedProvider[]>([])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const recents = await getRecentSearches(1)
        const last = recents?.[0]
        if (!isMounted || !last) return
        setRecent(last)
        const locationString = last.location
        const cached = await getCachedSearchResult(last.query, locationString)
        if (!isMounted || !cached) return
        const topProviders = (cached.providers || []).slice(0, 3) as CachedProvider[]
        setProviders(topProviders)
      } catch {}
    })()
    return () => { isMounted = false }
  }, [])

  if (!recent || providers.length === 0) return null

  const params = new URLSearchParams()
  params.set('q', recent.query)
  if (recent.location) params.set('location', recent.location)

  return (
    <div className="container py-6">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Quick preview from your last search</h3>
          <Link className="text-sm underline" href={`/app?${params.toString()}`}>View all</Link>
        </div>
        <ul className="space-y-2">
          {providers.map((p, idx) => {
            const slug = buildProviderSlug(p.name || 'provider', p._id)
            return (
              <li key={`${p._id || idx}`} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link className="font-medium hover:underline" href={`/providers/${slug}`}>{p.name || 'Provider'}</Link>
                  {p.address && <div className="text-xs text-muted-foreground truncate">{p.address}</div>}
                </div>
                <Link className="text-sm underline shrink-0" href={`/providers/${slug}`}>Details</Link>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}


