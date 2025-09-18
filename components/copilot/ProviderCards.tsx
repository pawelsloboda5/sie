'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { buildProviderSlug } from '@/lib/utils'
import type { Provider } from '@/lib/types/copilot'

type ProviderItem = Provider

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ' +
        className
      }
    >
      {children}
    </span>
  )
}

function formatAddressLine(provider: ProviderItem): string {
  if (provider.addressLine) {
    const firstLine = provider.addressLine.split('\n')[0]
    const comma = firstLine.indexOf(',')
    return comma > -1 ? firstLine.slice(0, comma) : firstLine
  }
  if (provider.address) {
    const firstLine = provider.address.split('\n')[0]
    const comma = firstLine.indexOf(',')
    return comma > -1 ? firstLine.slice(0, comma) : firstLine
  }
  if (provider.city && provider.state) {
    return `${provider.city}, ${provider.state}`
  }
  return 'Location not specified'
}

function formatDistance(miles?: number): string | null {
  if (typeof miles !== 'number' || Number.isNaN(miles)) return null
  if (miles < 0.1) return '<0.1 mi'
  return `${miles.toFixed(1)} mi`
}

export function ProviderCards({ providers, max = 6, onNavigateStart }: { providers: ProviderItem[]; max?: number; onNavigateStart?: (name: string) => void }) {
  const router = useRouter()
  if (!providers || providers.length === 0) return null
  const items = providers.slice(0, max)
  const isSingle = items.length === 1

  return (
    <div className="mt-2 w-full max-w-full overflow-x-hidden pb-4 mb-2">
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">Recommended Providers</div>

      {/* Grid on md+, compact carousel on small */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {items.map((p) => {
          const slug = buildProviderSlug(p.name, p._id)
          const go = () => { onNavigateStart?.(p.name); router.push(`/providers/${slug}`) }
          const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }
          return (
            <article
              key={p._id}
              onClick={(e) => { if (!(e.target as HTMLElement).closest('a')) go() }}
              onKeyDown={onKey}
              tabIndex={0}
              role="button"
              aria-label={`${p.name} details`}
              className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none"
            >
            <div className="flex items-start gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{p.name}</h5>
                  {typeof p.rating === 'number' && (
                    <span className="shrink-0 text-[11px] text-amber-600 dark:text-amber-400">★ {p.rating.toFixed(1)}</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 truncate">
                  {formatAddressLine(p)}
                </p>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.insurance?.selfPayOptions && (
                    <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800">Self-pay</Badge>
                  )}
                  {p.insurance?.medicaid && (
                    <Badge className="bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800">Medicaid</Badge>
                  )}
                  {p.insurance?.medicare && (
                    <Badge className="bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800">Medicare</Badge>
                  )}
                  {p.ssn_required === false && (
                    <Badge className="bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:ring-purple-800">No SSN</Badge>
                  )}
                  {p.telehealth?.available && (
                    <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-800">Telehealth</Badge>
                  )}
                  {p.priceRange && (
                    <Badge className="bg-yellow-50 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:ring-yellow-800">
                      ${p.priceRange.min === 0 ? 'Free' : p.priceRange.min}+
                    </Badge>
                  )}
                  {formatDistance(p.distance) && (
                    <Badge className="bg-gray-50 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                      {formatDistance(p.distance)}
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                      Call
                    </a>
                  )}
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
            </article>
          )
        })}
      </div>

      {/* Mobile: if one card, render full-width without carousel; otherwise keep horizontal carousel */}
      {isSingle ? (
        <div className="sm:hidden px-2 w-full max-w-full">
          {items.map((p) => {
            const slug = buildProviderSlug(p.name, p._id)
            const go = () => { onNavigateStart?.(p.name); router.push(`/providers/${slug}`) }
            const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }
            return (
              <article
                key={p._id}
                onClick={(e) => { if (!(e.target as HTMLElement).closest('a')) go() }}
                onKeyDown={onKey}
                tabIndex={0}
                role="button"
                aria-label={`${p.name} details`}
                className="w-full max-w-full rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{p.name}</h5>
                      {typeof p.rating === 'number' && (
                        <span className="shrink-0 text-[11px] text-amber-600 dark:text-amber-400">★ {p.rating.toFixed(1)}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 truncate">
                      {formatAddressLine(p)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.insurance?.selfPayOptions && (
                        <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800">Self-pay</Badge>
                      )}
                      {p.insurance?.medicaid && (
                        <Badge className="bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800">Medicaid</Badge>
                      )}
                      {p.insurance?.medicare && (
                        <Badge className="bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800">Medicare</Badge>
                      )}
                      {p.ssn_required === false && (
                        <Badge className="bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:ring-purple-800">No SSN</Badge>
                      )}
                      {p.telehealth?.available && (
                        <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-800">Telehealth</Badge>
                      )}
                      {p.priceRange && (
                        <Badge className="bg-yellow-50 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:ring-yellow-800">
                          ${p.priceRange.min === 0 ? 'Free' : p.priceRange.min}+
                        </Badge>
                      )}
                      {formatDistance(p.distance) && (
                        <Badge className="bg-gray-50 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                          {formatDistance(p.distance)}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {p.phone && (
                        <a
                          href={`tel:${p.phone}`}
                          className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                        >
                          Call
                        </a>
                      )}
                      {p.website && (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="sm:hidden px-2 overflow-x-auto overflow-y-hidden scrollbar-thin w-full max-w-full">
          <div className="flex gap-2.5 snap-x snap-mandatory pb-2 min-w-full max-w-full">
            {items.map((p) => {
              const slug = buildProviderSlug(p.name, p._id)
              const go = () => { onNavigateStart?.(p.name); router.push(`/providers/${slug}`) }
              const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }
              return (
                <article
                  key={p._id}
                  onClick={(e) => { if (!(e.target as HTMLElement).closest('a')) go() }}
                  onKeyDown={onKey}
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.name} details`}
                  className="snap-start min-w-[85%] max-w-[90%] rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none"
                >
                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{p.name}</h5>
                      {typeof p.rating === 'number' && (
                        <span className="shrink-0 text-[11px] text-amber-600 dark:text-amber-400">★ {p.rating.toFixed(1)}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 truncate">
                      {formatAddressLine(p)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.insurance?.selfPayOptions && (
                        <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800">Self-pay</Badge>
                      )}
                      {p.insurance?.medicaid && (
                        <Badge className="bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800">Medicaid</Badge>
                      )}
                      {p.insurance?.medicare && (
                        <Badge className="bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800">Medicare</Badge>
                      )}
                      {p.ssn_required === false && (
                        <Badge className="bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:ring-purple-800">No SSN</Badge>
                      )}
                      {p.telehealth?.available && (
                        <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-800">Telehealth</Badge>
                      )}
                      {p.priceRange && (
                        <Badge className="bg-yellow-50 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:ring-yellow-800">
                          ${p.priceRange.min === 0 ? 'Free' : p.priceRange.min}+
                        </Badge>
                      )}
                      {formatDistance(p.distance) && (
                        <Badge className="bg-gray-50 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                          {formatDistance(p.distance)}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {p.phone && (
                        <a
                          href={`tel:${p.phone}`}
                          className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                        >
                          Call
                        </a>
                      )}
                      {p.website && (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
