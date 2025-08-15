"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
Filter,
ChevronDown,
DollarSign,
Shield,
CreditCard,
MapPin,
Star
} from "lucide-react"

interface FilterOptions {
freeOnly: boolean
acceptsUninsured: boolean
acceptsMedicaid: boolean
acceptsMedicare: boolean
ssnRequired: boolean
telehealthAvailable: boolean
maxDistance: number
insuranceProviders: string[]
serviceCategories: string[]
providerTypes: string[]
minRating: number
sortBy: 'distance' | 'rating' | 'name' | 'relevance'
}

interface CompactFilterPanelProps {
filters: FilterOptions
onFiltersChange: (filters: FilterOptions) => void
onClearFilters?: () => void
resultsCount?: number
isLoading?: boolean
className?: string
isLocalFiltering?: boolean
}

const insuranceOptions = [
"Aetna", "Blue Cross Blue Shield", "Cigna", "Humana",
"Kaiser Permanente", "UnitedHealthcare", "Medicaid",
"Medicare", "Tricare", "Self-Pay"
]

const serviceCategories = [
"Preventive Care", "Urgent Care", "Emergency Services", "Mental Health",
"Dental Care", "Vision Care", "Women's Health", "Pediatric Care",
"Chronic Disease Management", "Diagnostic Services", "Pharmacy Services", "Specialty Care"
]

const providerTypes = [
"Community Health Center", "Urgent Care Center", "Hospital", "Clinic",
"Free Clinic", "Mobile Health Unit", "Telehealth Provider",
"Pharmacy", "Mental Health Center", "Dental Clinic"
]

export function CompactFilterPanel({
filters,
onFiltersChange,
onClearFilters,
resultsCount,
isLoading = false,
className = "",
isLocalFiltering = false
}: CompactFilterPanelProps) {
const [isExpanded, setIsExpanded] = useState(false)

const updateFilter = (key: keyof FilterOptions, value: boolean | number | string | string[]) => {
onFiltersChange({ ...filters, [key]: value } as FilterOptions)
}

const toggleArrayFilter = (key: 'insuranceProviders' | 'serviceCategories' | 'providerTypes', value: string) => {
const arr = filters[key] || []
const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
updateFilter(key, next)
}

const activeFiltersCount = useMemo(() => {
let count = 0
if (filters.freeOnly) count++
if (filters.acceptsUninsured) count++
if (filters.acceptsMedicaid) count++
if (filters.acceptsMedicare) count++
if (filters.ssnRequired === false) count++
if (filters.telehealthAvailable) count++
if (filters.maxDistance < 50) count++
count += filters.insuranceProviders.length
count += filters.serviceCategories.length
count += filters.providerTypes.length
if (filters.minRating > 0) count++
return count
}, [filters])

return (
<div className={`w-full ${className}`}>
{/* Top row: opener + count + clear */}
<div className="flex flex-wrap items-center justify-between gap-3">
<Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="flex-1">
<div className="flex items-center justify-between gap-3">
<CollapsibleTrigger asChild>
<Button variant="outline" className="h-11 rounded-xl px-4 gap-2 border-gray-200 hover:border-emerald-400 hover:bg-white" >
<Filter className="h-4 w-4" />
<span className="font-medium">Advanced Filters</span>
{activeFiltersCount > 0 && (
<Badge className="ml-1 bg-emerald-600 text-white">{activeFiltersCount}</Badge>
)}
<ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
</Button>
</CollapsibleTrigger>
{typeof resultsCount === 'number' && (
          <div className="hidden md:flex items-center text-sm text-gray-500">
            {resultsCount} results
          </div>
        )}

        {onClearFilters && activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="rounded-xl h-11"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Panel */}
      <CollapsibleContent className="mt-4">
        <div className="rounded-2xl border border-gray-200/70 bg-white/80 backdrop-blur p-4 md:p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl bg-gray-100 p-1 h-auto">
              <TabsTrigger value="basic" className="rounded-lg py-2 text-sm">Basic</TabsTrigger>
              <TabsTrigger value="services" className="rounded-lg py-2 text-sm">Services</TabsTrigger>
              <TabsTrigger value="insurance" className="rounded-lg py-2 text-sm">Insurance</TabsTrigger>
              <TabsTrigger value="advanced" className="rounded-lg py-2 text-sm">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic */}
            <TabsContent value="basic" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Cost & Accessibility
                  </h4>
                  <ToggleRow
                    id="free-only"
                    label="Free services only"
                    checked={filters.freeOnly}
                    onChange={(v) => updateFilter('freeOnly', v)}
                  />
                  <ToggleRow
                    id="accepts-uninsured"
                    label="Accepts uninsured"
                    checked={filters.acceptsUninsured}
                    onChange={(v) => updateFilter('acceptsUninsured', v)}
                  />
                  <ToggleRow
                    id="no-ssn"
                    label="No SSN required"
                    checked={filters.ssnRequired === false}
                    onChange={(v) => updateFilter('ssnRequired', !v)}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Insurance Coverage
                  </h4>
                  <ToggleRow
                    id="medicaid"
                    label="Accepts Medicaid"
                    checked={filters.acceptsMedicaid}
                    onChange={(v) => updateFilter('acceptsMedicaid', v)}
                  />
                  <ToggleRow
                    id="medicare"
                    label="Accepts Medicare"
                    checked={filters.acceptsMedicare}
                    onChange={(v) => updateFilter('acceptsMedicare', v)}
                  />
                  <ToggleRow
                    id="telehealth"
                    label="Telehealth available"
                    checked={filters.telehealthAvailable}
                    onChange={(v) => updateFilter('telehealthAvailable', v)}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-600" />
                    Distance
                  </h4>
                  <div>
                    <Label className="text-sm">
                      Maximum distance: <span className="font-semibold">{filters.maxDistance} miles</span>
                    </Label>
                    <Slider
                      value={[filters.maxDistance]}
                      onValueChange={(v) => updateFilter('maxDistance', v[0])}
                      min={1}
                      max={250}
                      step={1}
                      className="mt-3"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Services */}
            <TabsContent value="services" className="mt-4">
              <CheckGrid
                title="Select Service Categories"
                items={serviceCategories}
                selected={filters.serviceCategories}
                onToggle={(val) => toggleArrayFilter('serviceCategories', val)}
              />
            </TabsContent>

            {/* Insurance */}
            <TabsContent value="insurance" className="mt-4">
              <CheckGrid
                title="Select Insurance Providers"
                items={insuranceOptions}
                selected={filters.insuranceProviders}
                onToggle={(val) => toggleArrayFilter('insuranceProviders', val)}
              />
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Provider Types</h4>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 p-3">
                    {providerTypes.map((type) => (
                      <label key={type} className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <Checkbox
                          checked={filters.providerTypes.includes(type)}
                          onCheckedChange={() => toggleArrayFilter('providerTypes', type)}
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-semibold">Minimum Rating</h4>
                    <Label className="text-sm">
                      Rating: <span className="font-semibold">{filters.minRating > 0 ? `${filters.minRating} +` : 'Any'}</span>
                    </Label>
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={(v) => updateFilter('minRating', v[0])}
                      min={0}
                      max={5}
                      step={0.5}
                      className="mt-3"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Sort results by</Label>
                    <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {(isLoading || isLocalFiltering) && (
            <div className="flex items-center justify-center gap-2 py-4 mt-6 rounded-xl bg-gray-50 border border-gray-200">
              <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
              <span className="text-sm text-gray-600">
                {isLocalFiltering ? 'Filtering locally...' : 'Updating results...'}
              </span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
</div>
)
}

function ToggleRow({
id,
label,
checked,
onChange
}: {
id: string
label: string
checked: boolean
onChange: (v: boolean) => void
}) {
return (
<div className="flex items-center justify-between py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50">
<Label htmlFor={id} className="text-sm cursor-pointer">{label}</Label>
<Switch id={id} checked={checked} onCheckedChange={onChange} />
</div>
)
}

function CheckGrid({
title,
items,
selected,
onToggle
}: {
title: string
items: string[]
selected: string[]
onToggle: (val: string) => void
}) {
return (
<div className="space-y-3">
<h4 className="text-sm font-semibold">{title}</h4>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
{items.map((item) => (
<label key={item} className="flex items-center gap-2 py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
<Checkbox checked={selected.includes(item)} onCheckedChange={() => onToggle(item)} />
<span className="text-sm">{item}</span>
</label>
))}
</div>
</div>
)
}