'use client'

import React, { useMemo, useState } from 'react'
import type { HospitalDataRecord } from '@/lib/hospitalDataApi'

type SortKey = 'provider_name' | 'provider_city' | 'provider_state' | 'drg_description' | 'average_covered_charges' | 'average_total_payments' | 'average_medicare_payments' | 'total_discharges'

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(/,/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function formatCurrency(value: unknown): string {
  const n = toNumber(value)
  if (n === null) return 'N/A'
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatInt(value: unknown): string {
  const n = toNumber(value)
  if (n === null) return 'N/A'
  return n.toLocaleString('en-US')
}

export function HospitalResults({ records, max = 10 }: { records: HospitalDataRecord[]; max?: number }) {
  const [sortKey, setSortKey] = useState<SortKey>('average_covered_charges')
  const [asc, setAsc] = useState<boolean>(true)

  type Column = {
    key: SortKey
    label: string
    align?: 'left' | 'right'
    isNumeric?: boolean
    formatter?: (v: unknown) => string
  }

  const allColumns: Column[] = [
    { key: 'provider_name', label: 'Hospital' },
    { key: 'provider_city', label: 'City' },
    { key: 'provider_state', label: 'State' },
    { key: 'drg_description', label: 'Procedure' },
    { key: 'average_covered_charges', label: 'Avg Covered', align: 'right', isNumeric: true, formatter: formatCurrency },
    { key: 'average_total_payments', label: 'Avg Total', align: 'right', isNumeric: true, formatter: formatCurrency },
    { key: 'average_medicare_payments', label: 'Medicare', align: 'right', isNumeric: true, formatter: formatCurrency },
    { key: 'total_discharges', label: 'Discharges', align: 'right', isNumeric: true, formatter: formatInt },
  ]

  const visibleColumns = useMemo(() => {
    const cols = allColumns.filter((c) => {
      const naCount = records.reduce((acc, r) => {
        const v = (r as Record<string, unknown>)[c.key]
        if (c.isNumeric) return acc + (toNumber(v) === null ? 1 : 0)
        const s = String(v ?? '').trim()
        return acc + (s === '' || /^n\/?a$/i.test(s) ? 1 : 0)
      }, 0)
      // Hide column when all rows are N/A
      return naCount < records.length
    })
    // Ensure at least one column remains
    return cols.length ? cols : allColumns.slice(0, 1)
  }, [records])

  // If current sortKey is hidden, pick the first visible column
  const effectiveSortKey = useMemo<SortKey>(() => {
    return (visibleColumns.some((c) => c.key === sortKey) ? sortKey : visibleColumns[0]!.key) as SortKey
  }, [sortKey, visibleColumns])

  const sorted = useMemo(() => {
    const arr = [...records]
    arr.sort((a, b) => {
      const aVal = a[effectiveSortKey as keyof HospitalDataRecord]
      const bVal = b[effectiveSortKey as keyof HospitalDataRecord]
      const aNum = toNumber(aVal)
      const bNum = toNumber(bVal)
      if (aNum !== null || bNum !== null) {
        const cmp = (aNum ?? Number.POSITIVE_INFINITY) - (bNum ?? Number.POSITIVE_INFINITY)
        return asc ? cmp : -cmp
      }
      const aStr = String(aVal ?? '')
      const bStr = String(bVal ?? '')
      const cmp = aStr.localeCompare(bStr)
      return asc ? cmp : -cmp
    })
    return arr.slice(0, max)
  }, [records, effectiveSortKey, asc, max])

  function setSort(next: SortKey) {
    if (next === sortKey) setAsc(!asc)
    else { setSortKey(next); setAsc(true) }
  }

  const sortIcon = (key: SortKey) => (
    <span className="ml-1 text-[10px] opacity-60">
      {effectiveSortKey === key ? (asc ? '▲' : '▼') : '↕'}
    </span>
  )

  return (
    <div className="mt-2 w-full max-w-full overflow-x-auto">
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">Hospital cost comparison (Medicare)</div>
      <table className="w-full min-w-[560px] text-left text-[12px] sm:text-[13px]">
        <thead>
          <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            {visibleColumns.map((c) => (
              <th
                key={c.key}
                className={`py-2 pr-3 cursor-pointer ${c.align === 'right' ? 'text-right' : ''}`}
                onClick={() => setSort(c.key)}
              >
                {c.label} {sortIcon(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => (
            <tr key={`${r.provider_name}-${idx}`} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/50">
              {visibleColumns.map((c) => {
                const raw = (r as Record<string, unknown>)[c.key]
                const display = c.formatter ? c.formatter(raw) : (String(raw ?? '') || '—')
                return (
                  <td key={c.key} className={`py-2 pr-3 ${c.align === 'right' ? 'text-right whitespace-nowrap' : ''}`}>
                    {display}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">These are Medicare rates; actual patient costs may vary.</p>
    </div>
  )
}


