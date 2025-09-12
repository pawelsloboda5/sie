'use client'

import React from 'react'

export interface CopilotUserState {
  service_terms: string[] | null
  free_only: boolean | null
  accepts_medicaid: boolean | null
  accepts_uninsured: boolean | null
  insurance_providers: string[] | null
  location_text: string | null
  accepts_medicare?: boolean | null
  telehealth_available?: boolean | null
  ssn_required?: boolean | null
}

export interface CopilotDebugInfo {
  effective_query?: string
  filters_used?: Record<string, unknown> | null
  location_used?: { latitude: number; longitude: number } | null
  selected_provider_ids?: string[] | null
  provider_count?: number
  service_count?: number
}

export function StatePanel({ state, debug }: { state: CopilotUserState | null; debug?: CopilotDebugInfo | null }) {
  if (!state && !debug) return null

  const pretty = (obj: unknown) => {
    try { return JSON.stringify(obj ?? null, null, 2) } catch { return String(obj) }
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Conversation State</div>
        <button
          onClick={() => {
            try { navigator.clipboard.writeText(pretty({ state, debug })) } catch {}
          }}
          className="text-xs text-indigo-700 dark:text-indigo-300 hover:underline"
        >
          Copy JSON
        </button>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2">
        <div className="text-xs">
          <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">State</div>
          <pre className="text-[11px] leading-4 p-2 rounded-md bg-gray-50 dark:bg-gray-800 overflow-x-auto">
            {pretty(state)}
          </pre>
        </div>

        <div className="text-xs">
          <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">Debug</div>
          <pre className="text-[11px] leading-4 p-2 rounded-md bg-gray-50 dark:bg-gray-800 overflow-x-auto">
            {pretty(debug)}
          </pre>
        </div>
      </div>
    </div>
  )
}


