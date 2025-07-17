"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CompactFilterPanel } from "@/components/search/CompactFilterPanel"
import { Search, MapPin, Loader2, ChevronDown } from "lucide-react"

// Types for our search functionality
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
  onSearch?: (query: string, location?: {latitude: number, longitude: number}, filters?: SearchFilters) => void
  isSearching?: boolean
  filters?: SearchFilters
  onFiltersChange?: (filters: SearchFilters) => void
  onClearFilters?: () => void
  resultsCount?: number
  initialQuery?: string
  initialLocation?: string
  onFilterOnlySearch?: () => void
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
  onFilterOnlySearch
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Popular search suggestions based on real healthcare needs
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

  const handleGetLocation = async () => {
    setIsGettingLocation(true)
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
            setIsGettingLocation(false)
          },
          (error) => {
            console.error("Error getting location:", error)
            setIsGettingLocation(false)
            setSearchError("Unable to get your location. Please enter it manually.")
          }
        )
      } else {
        setIsGettingLocation(false)
        setSearchError("Geolocation is not supported by this browser.")
      }
    } catch (error) {
      console.error("Geolocation error:", error)
      setIsGettingLocation(false)
      setSearchError("Error accessing location services.")
    }
  }

  const parseLocation = (locationString: string) => {
    // Check if it's coordinates (latitude, longitude)
    const coordMatch = locationString.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2])
      }
    }
    
    // For now, return null for text addresses - we'd need geocoding API
    return null
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search query")
      return
    }

    setSearchError(null)
    const locationCoords = location ? parseLocation(location) : undefined
    
    // Call parent component's search handler with current filters
    if (onSearch) {
      onSearch(searchQuery, locationCoords || undefined, filters)
      return
    }
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    }
  }

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-8 px-4 max-h-[50vh] min-h-[400px]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
            Find Free & Low-Cost Healthcare Near You
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover accessible healthcare services in your area, regardless of insurance status. 
            Search by service, condition, or location to find the care you need.
          </p>
        </div>

        {/* Search Error Alert */}
        {searchError && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/5">
            <AlertDescription className="text-sm">{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Main Search Interface */}
        <div className="space-y-6">
          {/* Search Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Search for services (e.g., 'free STI testing', 'urgent care', 'dental clinic')"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-12 pr-12 py-3 text-base h-12 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              {/* Search Suggestions Dropdown */}
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-muted transition-colors"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No suggestions found.</CommandEmpty>
                      <CommandGroup heading="Popular Healthcare Searches">
                        {searchSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => {
                              setSearchQuery(suggestion)
                              setIsSearchOpen(false)
                              setShowSuggestions(false)
                            }}
                            className="cursor-pointer"
                          >
                            <Search className="mr-2 h-4 w-4" />
                            {suggestion}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Live Typing Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border-2 border-border rounded-md shadow-lg z-20">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No suggestions found.</CommandEmpty>
                      <CommandGroup heading="Suggested Searches">
                        {searchSuggestions
                          .filter(suggestion => 
                            suggestion.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((suggestion, index) => (
                            <CommandItem
                              key={index}
                              onSelect={() => {
                                setSearchQuery(suggestion)
                                setShowSuggestions(false)
                              }}
                              className="cursor-pointer"
                            >
                              <Search className="mr-2 h-4 w-4" />
                              {suggestion}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>

            {/* Location Input */}
            <div className="lg:col-span-4 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter your location (city, state, or zip code)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 pr-16 py-3 text-base h-12 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-2 hover:bg-muted"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isGettingLocation ? "Getting location..." : "Use my location"}
                </span>
              </Button>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-3">
              <Button 
                size="lg" 
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-all"
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

                     {/* Integrated Compact Filter Panel */}
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
               onFilterOnlySearch={onFilterOnlySearch}
             />
           </div>
        </div>
      </div>
    </section>
  )
} 