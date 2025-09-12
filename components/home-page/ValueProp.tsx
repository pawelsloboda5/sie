'use client'

import { useMemo } from 'react'

type Variant = 'A' | 'B'

export function ValueProp({ variant = 'A' }: { variant?: Variant }) {
  const text = useMemo(() => {
    switch (variant) {
      case 'B':
        return 'Find care fast — free & low‑cost clinics near you. No insurance needed.'
      case 'A':
      default:
        return 'Find Free & Low‑Cost Healthcare Near You — No Insurance or SSN Required.'
    }
  }, [variant])

  return (
    <div className="w-full bg-emerald-50/70 dark:bg-emerald-900/20 border-y border-emerald-200/70 dark:border-emerald-800/50">
      <div className="container py-3 text-center">
        <p className="text-sm md:text-base font-medium text-emerald-900 dark:text-emerald-200">
          {text}
        </p>
      </div>
    </div>
  )
}


