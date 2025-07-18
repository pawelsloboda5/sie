"use client"

import React, { useState, useEffect } from "react"
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
  const [hasAutoRequestedLocation, setHasAutoRequestedLocation] = useState(false)

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

  // Auto-request location on component mount
  useEffect(() => {
    if (!initialLocation && !hasAutoRequestedLocation) {
      setHasAutoRequestedLocation(true)
      handleGetLocation()
    }
  }, [initialLocation, hasAutoRequestedLocation])

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
            // Don't show error for automatic location request
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
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-2 md:py-6 px-2 md:px-4 min-h-[280px] md:min-h-[380px]">
      <div className="container mx-auto max-w-7xl">
        {/* Header - Hidden on mobile, visible on desktop */}
        <div className="text-center mb-4 md:mb-8 hidden md:block">
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
          <Alert className="mb-3 md:mb-6 border-destructive/50 bg-destructive/5 mx-2">
            <AlertDescription className="text-sm">{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Main Search Interface - Optimized for mobile and desktop */}
        <div className="space-y-2 md:space-y-4">
          {/* Search Row - Mobile optimized, Desktop expanded */}
          <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
            {/* Search Input - Expanded on desktop */}
            <div className="lg:col-span-6 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Search for services (e.g., 'free STI testing', 'urgent care', 'dental clinic')"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 md:pl-12 pr-10 md:pr-12 py-2 md:py-3 text-sm md:text-base h-11 md:h-14 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              {/* Search Suggestions Dropdown */}
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 flex items-center justify-center rounded hover:bg-muted transition-colors"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 text-muted-foreground transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] md:w-[500px] p-0" align="start">
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

            {/* Location Input - Simplified with single icon */}
            <div className="lg:col-span-4 relative">
              <MapPin className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <Input
                placeholder={isGettingLocation ? "Getting your location..." : "Enter your location (city, state, or zip code)"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isGettingLocation}
                className="pl-10 md:pl-12 pr-12 md:pr-14 py-2 md:py-3 text-sm md:text-base h-11 md:h-14 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                variant="ghost"
                size="sm"
                className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 h-8 md:h-9 px-2 md:px-3 hover:bg-muted text-xs md:text-sm"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                ) : (
                  <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                )}
                <span className="ml-1 hidden md:inline">
                  {isGettingLocation ? "Getting..." : "Use GPS"}
                </span>
                <span className="sr-only">
                  {isGettingLocation ? "Getting location..." : "Use my location"}
                </span>
              </Button>
            </div>

            {/* Search Button - Optimized for both mobile and desktop */}
            <div className="lg:col-span-2">
              <Button 
                size="lg" 
                className="w-full h-11 md:h-14 text-sm md:text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 focus:ring-2 focus:ring-primary/20 transition-all shadow-lg hover:shadow-xl"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    <span className="hidden md:inline">Searching...</span>
                    <span className="md:hidden">Search</span>
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden md:inline">Find Healthcare</span>
                    <span className="md:hidden">Search</span>
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