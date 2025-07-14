"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  MapPin, 
  DollarSign, 
  Shield, 
  CreditCard, 
  Phone, 
  Clock,
  Star,
  FileText
} from "lucide-react"

interface FilterOptions {
  // Basic filters
  freeOnly: boolean
  acceptsUninsured: boolean
  acceptsMedicaid: boolean
  acceptsMedicare: boolean
  ssnRequired: boolean
  telehealthAvailable: boolean
  
  // Distance filter
  maxDistance: number
  
  // Insurance providers
  insuranceProviders: string[]
  
  // Service categories
  serviceCategories: string[]
  
  // Provider types
  providerTypes: string[]
  
  // Rating filter
  minRating: number
  
  // Sort options
  sortBy: 'distance' | 'rating' | 'name' | 'relevance'
}

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  resultsCount?: number
  isLoading?: boolean
}

const insuranceOptions = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Kaiser Permanente",
  "UnitedHealthcare",
  "Medicaid",
  "Medicare",
  "Tricare",
  "Self-Pay"
]

const serviceCategories = [
  "Preventive Care",
  "Urgent Care",
  "Emergency Services",
  "Mental Health",
  "Dental Care",
  "Vision Care",
  "Women's Health",
  "Pediatric Care",
  "Chronic Disease Management",
  "Diagnostic Services",
  "Pharmacy Services",
  "Specialty Care"
]

const providerTypes = [
  "Community Health Center",
  "Urgent Care Center",
  "Hospital",
  "Clinic",
  "Free Clinic",
  "Mobile Health Unit",
  "Telehealth Provider",
  "Pharmacy",
  "Mental Health Center",
  "Dental Clinic"
]

export function FilterPanel({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  resultsCount = 0,
  isLoading = false 
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    location: false,
    insurance: false,
    services: false,
    providers: false,
    rating: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilter = (key: keyof FilterOptions, value: any) => {
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
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {resultsCount > 0 && `${resultsCount} results found`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <Collapsible open={expandedSections.basic} onOpenChange={() => toggleSection('basic')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Basic Filters</span>
            </div>
            {expandedSections.basic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="free-only"
                checked={filters.freeOnly}
                onCheckedChange={(checked) => updateFilter('freeOnly', checked)}
              />
              <Label htmlFor="free-only" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Free services only</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="accepts-uninsured"
                checked={filters.acceptsUninsured}
                onCheckedChange={(checked) => updateFilter('acceptsUninsured', checked)}
              />
              <Label htmlFor="accepts-uninsured" className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Accepts uninsured</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="accepts-medicaid"
                checked={filters.acceptsMedicaid}
                onCheckedChange={(checked) => updateFilter('acceptsMedicaid', checked)}
              />
              <Label htmlFor="accepts-medicaid">Accepts Medicaid</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="accepts-medicare"
                checked={filters.acceptsMedicare}
                onCheckedChange={(checked) => updateFilter('acceptsMedicare', checked)}
              />
              <Label htmlFor="accepts-medicare">Accepts Medicare</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="no-ssn-required"
                checked={filters.ssnRequired === false}
                onCheckedChange={(checked) => updateFilter('ssnRequired', !checked)}
              />
              <Label htmlFor="no-ssn-required">No SSN required</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="telehealth"
                checked={filters.telehealthAvailable}
                onCheckedChange={(checked) => updateFilter('telehealthAvailable', checked)}
              />
              <Label htmlFor="telehealth" className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-purple-600" />
                <span>Telehealth available</span>
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Location & Distance */}
        <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Distance</span>
            </div>
            {expandedSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div>
              <Label className="text-sm font-medium">
                Maximum distance: {filters.maxDistance} miles
              </Label>
              <Slider
                value={[filters.maxDistance]}
                onValueChange={(value) => updateFilter('maxDistance', value[0])}
                max={50}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Insurance */}
        <Collapsible open={expandedSections.insurance} onOpenChange={() => toggleSection('insurance')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Insurance</span>
              {filters.insuranceProviders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.insuranceProviders.length}
                </Badge>
              )}
            </div>
            {expandedSections.insurance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {insuranceOptions.map((insurance) => (
                <div key={insurance} className="flex items-center space-x-2">
                  <Checkbox
                    id={`insurance-${insurance}`}
                    checked={filters.insuranceProviders.includes(insurance)}
                    onCheckedChange={() => toggleArrayFilter('insuranceProviders', insurance)}
                  />
                  <Label htmlFor={`insurance-${insurance}`} className="text-sm">
                    {insurance}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Service Categories */}
        <Collapsible open={expandedSections.services} onOpenChange={() => toggleSection('services')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Services</span>
              {filters.serviceCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.serviceCategories.length}
                </Badge>
              )}
            </div>
            {expandedSections.services ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {serviceCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${category}`}
                    checked={filters.serviceCategories.includes(category)}
                    onCheckedChange={() => toggleArrayFilter('serviceCategories', category)}
                  />
                  <Label htmlFor={`service-${category}`} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Provider Types */}
        <Collapsible open={expandedSections.providers} onOpenChange={() => toggleSection('providers')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Provider Types</span>
              {filters.providerTypes.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.providerTypes.length}
                </Badge>
              )}
            </div>
            {expandedSections.providers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {providerTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`provider-${type}`}
                    checked={filters.providerTypes.includes(type)}
                    onCheckedChange={() => toggleArrayFilter('providerTypes', type)}
                  />
                  <Label htmlFor={`provider-${type}`} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Rating Filter */}
        <Collapsible open={expandedSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span className="font-medium">Rating</span>
            </div>
            {expandedSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div>
              <Label className="text-sm font-medium">
                Minimum rating: {filters.minRating > 0 ? `${filters.minRating} stars` : 'Any'}
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
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Sort Options */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort by</Label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
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

        {/* Real-time filtering indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Updating results...
          </div>
        )}
      </CardContent>
    </Card>
  )
} 