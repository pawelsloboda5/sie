"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CompactFilterPanel } from "@/components/search/CompactFilterPanel"
import { Search, MapPin, Loader2, ChevronDown } from "lucide-react"
import { reverseGeocode, parseLocationString, type Coordinates } from "@/lib/utils"

interface SearchFilters {
freeOnly?: boolean
acceptsUninsured?: boolean
acceptsMedicaid?: boolean
acceptsMedicare?: boolean
ssnRequired?: boolean
telehealthAvailable?: boolean
insuranceProviders?: string[]
maxDistance?: number
serviceCategories?: string[]
providerTypes?: string[]
minRating?: number
sortBy?: 'distance' | 'rating' | 'name' | 'relevance'
}

interface HeroSectionProps {
onSearch?: (query: string, location?: Coordinates, filters?: SearchFilters) => void
isSearching?: boolean
filters?: SearchFilters
onFiltersChange?: (filters: SearchFilters) => void
onClearFilters?: () => void
resultsCount?: number
initialQuery?: string
initialLocation?: string
isLocalFiltering?: boolean
onLocationChange?: (coords?: Coordinates) => void
}

export function HeroSection({
onSearch,
isSearching = false,
filters = {
freeOnly: false,
acceptsUninsured: false,
acceptsMedicaid: false,
acceptsMedicare: false,
ssnRequired: true,
telehealthAvailable: false,
maxDistance: 25,
insuranceProviders: [],
serviceCategories: [],
providerTypes: [],
minRating: 0,
sortBy: 'relevance'
},
onFiltersChange,
onClearFilters,
resultsCount = 0,
initialQuery = "",
initialLocation = "",
isLocalFiltering = false
 , onLocationChange
}: HeroSectionProps) {
const [searchQuery, setSearchQuery] = useState(initialQuery)
const [location, setLocation] = useState(initialLocation)
const [coords, setCoords] = useState<Coordinates | undefined>(undefined)
const [isSearchOpen, setIsSearchOpen] = useState(false)
const [showSuggestions, setShowSuggestions] = useState(false)
const [isGettingLocation, setIsGettingLocation] = useState(false)
const [searchError, setSearchError] = useState<string | null>(null)
const [hasAutoRequestedLocation, setHasAutoRequestedLocation] = useState(false)

const searchSuggestions = [
"Free STI testing",
"Urgent care near me",
"Dental clinic uninsured",
"Mental health services",
"Pregnancy testing",
"Diabetes management",
"Blood pressure check",
"Vaccination clinic",
"Free mammogram",
"Women's health services",
"Free birth control",
"Pediatric care",
"Eye exam",
"Free prescription assistance",
"HIV testing",
"Substance abuse treatment"
]

const handleGetLocation = useCallback(async () => {
setIsGettingLocation(true)
try {
if ("geolocation" in navigator) {
navigator.geolocation.getCurrentPosition(
async (position) => {
const { latitude, longitude } = position.coords
const address = await reverseGeocode(latitude, longitude)
setLocation(address)
setIsGettingLocation(false)
 // propagate precise coordinates so distance filtering works even if the input shows a label
 try { const c = { latitude, longitude }; setCoords(c); onLocationChange?.(c) } catch {}
},
(error) => {
console.error("Error getting location:", error)
setIsGettingLocation(false)
if (hasAutoRequestedLocation) {
setSearchError("Location access denied. You can enter your location manually.")
}
}
)
} else {
setIsGettingLocation(false)
if (hasAutoRequestedLocation) {
setSearchError("Geolocation is not supported by this browser.")
}
}
} catch (error) {
console.error("Geolocation error:", error)
setIsGettingLocation(false)
if (hasAutoRequestedLocation) {
setSearchError("Error accessing location services.")
}
}
}, [hasAutoRequestedLocation, onLocationChange])

useEffect(() => {
if (!initialLocation && !hasAutoRequestedLocation) {
setHasAutoRequestedLocation(true)
handleGetLocation()
}
}, [initialLocation, hasAutoRequestedLocation, handleGetLocation])

// Keep parent's coordinates in sync when user types an address
useEffect(() => {
  if (!onLocationChange) return
  const handler = setTimeout(async () => {
    try {
      if (location && location.trim()) {
        const coords = await parseLocationString(location)
        if (coords) { setCoords(coords); onLocationChange(coords) }
      }
    } catch {}
  }, 600)
  return () => clearTimeout(handler)
}, [location, onLocationChange])

const handleSearch = async () => {
if (!searchQuery.trim()) {
setSearchError("Please enter a search query")
return
}
setSearchError(null)
const locationCoords = coords || (location ? await parseLocationString(location) : undefined)
onSearch?.(searchQuery, locationCoords || undefined, filters)
}

const handleFiltersChange = (newFilters: SearchFilters) => onFiltersChange?.(newFilters)
const handleClearFilters = () => onClearFilters?.()

return (
<section className="relative py-8 md:py-12">
<div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_-10%,#E6F7EF_25%,transparent),radial-gradient(700px_350px_at_80%_-5%,#E9F1FF_25%,transparent)] -z-10" />
<div className="container mx-auto max-w-7xl">
<div className="text-center mb-6 md:mb-10">
<h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
Find Free & Low-Cost Healthcare Near You
</h1>
<p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto">
Discover accessible healthcare in your area—search by service, condition, or location.
</p>
</div>
{searchError && (
      <Alert className="mb-4 border-red-200 bg-red-50">
        <AlertDescription className="text-sm">{searchError}</AlertDescription>
      </Alert>
    )}

    <div className="space-y-3 md:space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for services (e.g., 'free STI testing', 'dental clinic', 'urgent care')"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(e.target.value.length > 0)
            }}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="pl-10 pr-10 h-12 md:h-14 text-[15px] border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />

          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] md:w-[520px] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>No suggestions found.</CommandEmpty>
                  <CommandGroup heading="Popular searches">
                    {searchSuggestions.map((s, i) => (
                      <CommandItem
                        key={i}
                        onSelect={() => {
                          setSearchQuery(s)
                          setIsSearchOpen(false)
                          setShowSuggestions(false)
                        }}
                        className="cursor-pointer"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        {s}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
              <Command>
                <CommandList>
                  <CommandEmpty>No suggestions found.</CommandEmpty>
                  <CommandGroup heading="Suggested">
                    {searchSuggestions
                      .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 5)
                      .map((s, i) => (
                        <CommandItem
                          key={i}
                          onSelect={() => {
                            setSearchQuery(s)
                            setShowSuggestions(false)
                          }}
                          className="cursor-pointer"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          {s}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={isGettingLocation ? "Getting your location..." : "Enter your city, state, or zip"}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isGettingLocation}
            className="pl-10 pr-20 h-12 md:h-14 text-[15px] border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl truncate"
          />
          <Button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 rounded-lg"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="ml-2 hidden md:inline">
              {isGettingLocation ? "Detecting..." : "Use GPS"}
            </span>
          </Button>
        </div>

        <div className="lg:col-span-2">
          <Button 
            size="lg" 
            className="w-full h-12 md:h-14 font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Find Healthcare
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="w-full">
        <CompactFilterPanel
          filters={{
            freeOnly: filters.freeOnly || false,
            acceptsUninsured: filters.acceptsUninsured || false,
            acceptsMedicaid: filters.acceptsMedicaid || false,
            acceptsMedicare: filters.acceptsMedicare || false,
            ssnRequired: filters.ssnRequired !== false,
            telehealthAvailable: filters.telehealthAvailable || false,
            maxDistance: filters.maxDistance || 25,
            insuranceProviders: filters.insuranceProviders || [],
            serviceCategories: filters.serviceCategories || [],
            providerTypes: filters.providerTypes || [],
            minRating: filters.minRating || 0,
            sortBy: filters.sortBy || 'relevance'
          }}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          resultsCount={resultsCount}
          isLoading={isSearching}
          isLocalFiltering={isLocalFiltering}
        />
      </div>
    </div>
  </div>
</section>
)
}