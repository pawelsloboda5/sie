'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarDays, Clock, Plus, X, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { type AvailabilitySlot } from '@/lib/voiceAgent'

interface AvailabilityPickerProps {
onAvailabilitySet: (slots: AvailabilitySlot[]) => void
onBack: () => void
onNext: () => void
}

/**

Revamped AvailabilityPicker
Multi-date calendar with pill selection
Quick time presets (apply to all selected dates)
Per-date time range editor with add/remove
Sticky footer actions and live summary
Keeps the same outward API
*/
type DateKey = string // YYYY-MM-DD

type LocalRange = {
start: string // "HH:MM"
end: string // "HH:MM"
}

export default function AvailabilityPicker({
onAvailabilitySet,
onBack,
onNext
}: AvailabilityPickerProps) {
const [current, setCurrent] = useState(new Date())
const [selectedDates, setSelectedDates] = useState<DateKey[]>([])
const [rangesByDate, setRangesByDate] = useState<Record<DateKey, LocalRange[]>>({})
const [errors, setErrors] = useState<string[]>([])

// Quick presets for fast time adding
const presets = useMemo(
() => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
[]
)

// Build human-friendly month grid
const monthMatrix = useMemo(() => buildMonthMatrix(current), [current])

// Derived summary
const totalDates = selectedDates.length
const totalRanges = selectedDates.reduce((acc, d) => acc + (rangesByDate[d]?.length ?? 0), 0)

useEffect(() => {
// Push AvailabilitySlot[] up whenever local changes
const slots = flattenToSlots(rangesByDate)
onAvailabilitySet(slots)
}, [rangesByDate, onAvailabilitySet])

const toggleDate = (date: Date) => {
const key = toKey(date)
const isSelected = selectedDates.includes(key)
let next = isSelected ? selectedDates.filter(d => d !== key) : [...selectedDates, key]
// Sort date keys chronologically for nicer UX
next = next.sort()
setSelectedDates(next)

// Initialize ranges if newly selected
if (!isSelected && !rangesByDate[key]) {
  setRangesByDate(prev => ({ ...prev, [key]: [{ start: '', end: '' }] }))
}

// Clean up if deselected
if (isSelected) {
  setRangesByDate(prev => {
    const copy = { ...prev }
    delete copy[key]
    return copy
  })
}
}

const addRange = (key: DateKey) => {
setRangesByDate(prev => ({
...prev,
[key]: [...(prev[key] ?? []), { start: '', end: '' }]
}))
}

const removeRange = (key: DateKey, index: number) => {
setRangesByDate(prev => {
const next = [...(prev[key] ?? [])]
next.splice(index, 1)
return { ...prev, [key]: next.length ? next : [{ start: '', end: '' }] }
})
}

const updateRange = (key: DateKey, index: number, which: 'start' | 'end', value: string) => {
setRangesByDate(prev => {
const next = [...(prev[key] ?? [])]
next[index] = { ...next[index], [which]: value }
return { ...prev, [key]: next }
})
}

// Apply a single preset time to all selected dates by appending [time, time+1h]
const applyPresetToAll = (time: string) => {
if (selectedDates.length === 0) return
const end = addHour(time)
setRangesByDate(prev => {
const copy = { ...prev }
for (const key of selectedDates) {
const existing = copy[key] ?? []
// Avoid duplicate range if already present
if (!existing.some(r => r.start === time && r.end === end)) {
copy[key] = [...existing, { start: time, end }]
}
}
return copy
})
}

const validate = () => {
const errs: string[] = []
if (selectedDates.length === 0) {
errs.push('Please select at least one date.')
}
// Validate each range
for (const key of selectedDates) {
const list = rangesByDate[key] ?? []
list.forEach((r, i) => {
if (!r.start || !r.end) {
errs.push(`${key}: Time range #${i + 1} is incomplete.`)
} else if (!isEndAfterStart(r.start, r.end)) {
errs.push(`${key}: End time must be after start time in range #${i + 1}.`)
}
})
}
setErrors(errs)
return errs.length === 0
}

const handleStart = () => {
if (!validate()) return
onNext()
}

return (
<div className="space-y-8">
{/* Intro */}
<div className="text-center mb-2">
<h2 className="text-2xl font-semibold tracking-tight">Select Your Availability</h2>
<p className="text-gray-600 dark:text-gray-300">Choose when you're available for appointments</p>
</div>
{errors.length > 0 && (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-400/20">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="font-semibold mb-2">Please review:</div>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </AlertDescription>
    </Alert>
  )}

  {/* Calendar + Builder */}
  <Card className="border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur rounded-2xl">
    <CardHeader className="pb-0">
      <CardTitle className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5" />
        Select Available Dates
      </CardTitle>
      <p className="text-sm text-gray-500 mt-1">Click multiple dates to add them to your availability</p>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Calendar */}
        <div className="rounded-xl border border-gray-200/70 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => setCurrent(prev => addMonths(prev, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">
              {current.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrent(prev => addMonths(prev, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthMatrix.map((day, idx) => {
              if (!day) return <div key={idx} />
              const k = toKey(day)
              const isSelected = selectedDates.includes(k)
              const inMonth = day.getMonth() === current.getMonth()
              return (
                <button
                  key={k}
                  onClick={() => toggleDate(day)}
                  className={[
                    'h-10 rounded-lg text-sm transition-colors',
                    'border',
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : inMonth
                        ? 'hover:bg-gray-50 dark:hover:bg-white/10 border-gray-200/70 dark:border-white/10'
                        : 'text-gray-400 border-transparent'
                  ].join(' ')}
                  title={k}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Selected pills */}
          {selectedDates.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedDates.map(k => (
                <Badge key={k} variant="secondary" className="rounded-full gap-1">
                  {readableDate(k)}
                  <button
                    className="ml-1 hover:text-red-600"
                    onClick={() => toggleDate(fromKey(k))}
                    aria-label={`Remove ${k}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Builder */}
        <div className="space-y-6">
          <Card className="border-gray-200/70 dark:border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Quick Time Selection
              </CardTitle>
              <p className="text-sm text-gray-500">Add common time slots to all selected dates</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {presets.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyPresetToAll(t)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200/70 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-sm"
                >
                  {to12h(t)}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h4 className="font-medium">Configure Each Date</h4>

            {selectedDates.length === 0 && (
              <p className="text-sm text-gray-500">Select a date to start adding time ranges.</p>
            )}

            {selectedDates.map((key) => (
              <Card key={key} className="border-blue-200/60">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">{readableDate(key)}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => toggleDate(fromKey(key))}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label className="text-sm">Time Ranges</Label>
                  {(rangesByDate[key] ?? []).map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <TimeInput
                        value={r.start}
                        placeholder="--:--"
                        onChange={(val) => updateRange(key, i, 'start', val)}
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <TimeInput
                        value={r.end}
                        placeholder="--:--"
                        onChange={(val) => updateRange(key, i, 'end', val)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeRange(key, i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div>
                    <Button variant="secondary" size="sm" onClick={() => addRange(key)} className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add Range
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="border-emerald-200/80 bg-emerald-50/70 dark:bg-emerald-500/10 dark:border-emerald-400/20">
            <AlertDescription className="text-sm">
              Availability Summary: {totalDates} date{totalDates !== 1 ? 's' : ''}, {totalRanges} time range{totalRanges !== 1 ? 's' : ''}.
              The AI agent will use this when scheduling appointments.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Footer actions */}
  <div className="sticky bottom-4 z-10 bg-transparent">
    <div className="flex items-center justify-between gap-3 rounded-xl px-0">
      <Button variant="outline" onClick={onBack}>Back</Button>
      <Button
        onClick={handleStart}
        disabled={selectedDates.length === 0}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-xl shadow-[0_12px_24px_-10px_rgba(37,99,235,0.6)]"
      >
        Start AI Calls
      </Button>
    </div>
  </div>
</div>
)
}

/* ---------- Helpers ---------- */

function TimeInput({
value,
onChange,
placeholder
}: {
value: string
onChange: (v: string) => void
placeholder?: string
}) {
return (
<div className="relative">
<Input
type="time"
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
className="w-36"
/>
</div>
)
}

function toKey(d: Date): DateKey {
const y = d.getFullYear()
const m = String(d.getMonth() + 1).padStart(2, '0')
const day = String(d.getDate()).padStart(2, '0')
return `${y}-${m}-${day}`
}

function fromKey(k: DateKey): Date {
const [y, m, d] = k.split('-').map(Number)
return new Date(y, m - 1, d)
}

function buildMonthMatrix(anchor: Date): (Date | null)[] {
const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
const startDay = firstOfMonth.getDay() // 0..6
const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()

const cells: (Date | null)[] = []
// Leading blanks
for (let i = 0; i < startDay; i++) cells.push(null)
// Month days
for (let d = 1; d <= daysInMonth; d++) {
cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), d))
}
// Trailing to fill grid to multiples of 7
while (cells.length % 7 !== 0) cells.push(null)
return cells
}

function addMonths(date: Date, by: number) {
const d = new Date(date)
d.setMonth(d.getMonth() + by)
return d
}

function addHour(time: string): string {
const [h, m] = time.split(':').map(Number)
const end = new Date(0, 0, 0, h, m)
end.setHours(end.getHours() + 1)
const hh = String(end.getHours()).padStart(2, '0')
const mm = String(end.getMinutes()).padStart(2, '0')
return `${hh}:${mm}`
}

function isEndAfterStart(start: string, end: string) {
return start < end
}

function to12h(t: string) {
const [h, m] = t.split(':').map(Number)
const suffix = h >= 12 ? 'PM' : 'AM'
const hr = h % 12 === 0 ? 12 : h % 12
return `${hr}:${String(m).padStart(2, '0')} ${suffix}`
}

function readableDate(key: DateKey) {
const d = fromKey(key)
return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function flattenToSlots(rangesMap: Record<DateKey, LocalRange[]>): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = []

  for (const [key, ranges] of Object.entries(rangesMap)) {
    if (!ranges || ranges.length === 0) continue
    const dateObj = fromKey(key)
    const dayOfWeek = dateObj.toLocaleDateString(undefined, { weekday: 'long' })

    slots.push({
      date: dateObj,
      dayOfWeek,
      timeSlots: [],
      timeRanges: ranges.map(r => ({ start: r.start, end: r.end }))
    })
  }

  return slots
}