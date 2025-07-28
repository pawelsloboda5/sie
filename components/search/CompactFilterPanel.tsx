"use client"

import React, { useState } from "react"
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
  FileText,
  Star,
  Zap
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
  onClearFilters: () => void
  resultsCount?: number
  isLoading?: boolean
  className?: string
  isLocalFiltering?: boolean // NEW: Indicate local vs server filtering
  hasCachedData?: boolean    // NEW: Indicate if we have cached data
}

// Predefined filter options
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
  isLoading = false,
  className = "",
  isLocalFiltering = false,
  hasCachedData = false
}: CompactFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: boolean | number | string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleArrayFilter = (key: 'insuranceProviders' | 'serviceCategories' | 'providerTypes', value: string) => {
    const currentArray = filters[key] || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.freeOnly) count++
    if (filters.acceptsUninsured) count++
    if (filters.acceptsMedicaid) count++
    if (filters.acceptsMedicare) count++
    if (filters.ssnRequired === false) count++
    if (filters.telehealthAvailable) count++
    if (filters.maxDistance < 50) count++
    if (filters.insuranceProviders.length > 0) count++
    if (filters.serviceCategories.length > 0) count++
    if (filters.providerTypes.length > 0) count++
    if (filters.minRating > 0) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={`w-full ${className}`}>
      {/* Compact Filter Trigger */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 h-12 sm:h-11 border-2 hover:border-primary/50 transition-colors w-full sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 px-2">
                  {activeFiltersCount}
                </Badge>
              )}
              {/* NEW: Local filtering indicator */}
              {hasCachedData && (
                <Badge variant="outline" className="ml-1 text-xs text-green-600 border-green-600">
                  <Zap className="h-3 w-3" />
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Expanded Filter Panel */}
        <CollapsibleContent className="mt-4">
          <div className="p-4 sm:p-6 bg-muted/20 rounded-lg border border-border">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 h-12 sm:h-auto">
                <TabsTrigger value="basic" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Basic</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Services</span>
                </TabsTrigger>
                <TabsTrigger value="insurance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Insurance</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Advanced</span>
                </TabsTrigger>
              </TabsList>

              {/* Basic Filters Tab */}
              <TabsContent value="basic" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Accessibility & Cost */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Cost & Accessibility
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between space-x-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Label htmlFor="free-only" className="text-sm font-medium cursor-pointer flex-1">
                          Free services only
                        </Label>
                        <Switch
                          id="free-only"
                          checked={filters.freeOnly}
                          onCheckedChange={(checked) => updateFilter('freeOnly', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Label htmlFor="accepts-uninsured" className="text-sm font-medium cursor-pointer flex-1">
                          Accepts uninsured
                        </Label>
                        <Switch
                          id="accepts-uninsured"
                          checked={filters.acceptsUninsured}
                          onCheckedChange={(checked) => updateFilter('acceptsUninsured', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Label htmlFor="no-ssn-required" className="text-sm font-medium cursor-pointer flex-1">
                          No SSN required
                        </Label>
                        <Switch
                          id="no-ssn-required"
                          checked={filters.ssnRequired === false}
                          onCheckedChange={(checked) => updateFilter('ssnRequired', !checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insurance Coverage */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Insurance Coverage
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between space-x-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Label htmlFor="accepts-medicaid" className="text-sm font-medium cursor-pointer flex-1">
                          Accepts Medicaid
                        </Label>
                        <Switch
                          id="accepts-medicaid"
                          checked={filters.acceptsMedicaid}
                          onCheckedChange={(checked) => updateFilter('acceptsMedicaid', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Label htmlFor="accepts-medicare" className="text-sm font-medium cursor-pointer flex-1">
                          Accepts Medicare
                        </Label>
                        <Switch
                          id="accepts-medicare"
                          checked={filters.acceptsMedicare}
                          onCheckedChange={(checked) => updateFilter('acceptsMedicare', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Label htmlFor="telehealth" className="text-sm font-medium cursor-pointer flex-1">
                          Telehealth available
                        </Label>
                        <Switch
                          id="telehealth"
                          checked={filters.telehealthAvailable}
                          onCheckedChange={(checked) => updateFilter('telehealthAvailable', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Distance & Location */}
                  <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      Distance
                    </h4>
                    
                    <div className="space-y-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Maximum distance: <span className="font-bold text-primary">{filters.maxDistance} miles</span>
                        </Label>
                        <Slider
                          value={[filters.maxDistance]}
                          onValueChange={(value) => updateFilter('maxDistance', value[0])}
                          max={250}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-0">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-foreground mb-4">Select Service Categories</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {serviceCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2 p-3 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Checkbox
                          id={`service-${category}`}
                          checked={filters.serviceCategories.includes(category)}
                          onCheckedChange={() => toggleArrayFilter('serviceCategories', category)}
                        />
                        <Label htmlFor={`service-${category}`} className="text-sm cursor-pointer flex-1">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Insurance Tab */}
              <TabsContent value="insurance" className="mt-0">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-foreground mb-4">Select Insurance Providers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {insuranceOptions.map((insurance) => (
                      <div key={insurance} className="flex items-center space-x-2 p-3 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                        <Checkbox
                          id={`insurance-${insurance}`}
                          checked={filters.insuranceProviders.includes(insurance)}
                          onCheckedChange={() => toggleArrayFilter('insuranceProviders', insurance)}
                        />
                        <Label htmlFor={`insurance-${insurance}`} className="text-sm cursor-pointer flex-1">
                          {insurance}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Provider Types */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground mb-4">Provider Types</h4>
                    <div className="space-y-2 max-h-60 sm:max-h-48 overflow-y-auto">
                      {providerTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2 p-3 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                          <Checkbox
                            id={`provider-${type}`}
                            checked={filters.providerTypes.includes(type)}
                            onCheckedChange={() => toggleArrayFilter('providerTypes', type)}
                          />
                          <Label htmlFor={`provider-${type}`} className="text-sm cursor-pointer flex-1">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating & Sort */}
                  <div className="space-y-6">
                    {/* Minimum Rating */}
                    <div className="space-y-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                      <h4 className="font-semibold text-sm text-foreground">Minimum Rating</h4>
                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Rating: <span className="font-bold text-primary">
                            {filters.minRating > 0 ? `${filters.minRating} stars` : 'Any'}
                          </span>
                        </Label>
                        <Slider
                          value={[filters.minRating]}
                          onValueChange={(value) => updateFilter('minRating', value[0])}
                          max={5}
                          min={0}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sort Options */}
                    <div className="space-y-3 p-3 sm:p-0 bg-white sm:bg-transparent rounded-md sm:rounded-none">
                      <Label className="text-sm font-semibold">Sort Results By</Label>
                      <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                        <SelectTrigger className="w-full h-12 sm:h-auto">
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

            {/* Loading/Filtering Indicator */}
            {(isLoading || isLocalFiltering) && (
              <div className="flex items-center justify-center py-4 mt-4 border-t">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span className="text-sm text-muted-foreground">
                  {isLocalFiltering ? 'Filtering locally...' : 'Updating results...'}
                </span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
} 