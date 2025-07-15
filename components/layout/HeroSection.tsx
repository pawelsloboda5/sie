"use client"

import React, { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Clock, DollarSign, Shield, Phone, Stethoscope, Loader2, Star, ChevronDown } from "lucide-react"

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
}

interface SearchResults {
  providers: any[]
  services: any[]
  query: string
  totalResults: number
}

interface HeroSectionProps {
  onSearch?: (query: string, location?: {latitude: number, longitude: number}) => void
  isSearching?: boolean
}

export function HeroSection({ onSearch, isSearching = false }: HeroSectionProps = {}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Quick filter options
  const quickFilters = [
    { id: "free", label: "Free Services", icon: DollarSign, color: "bg-green-100 text-green-800 hover:bg-green-200", filter: "freeOnly" },
    { id: "uninsured", label: "Accepts Uninsured", icon: Shield, color: "bg-blue-100 text-blue-800 hover:bg-blue-200", filter: "acceptsUninsured" },
    { id: "urgent", label: "Urgent Care", icon: Clock, color: "bg-orange-100 text-orange-800 hover:bg-orange-200", filter: "serviceCategories", value: ["Urgent Care"] },
    { id: "telehealth", label: "Telehealth", icon: Phone, color: "bg-purple-100 text-purple-800 hover:bg-purple-200", filter: "telehealthAvailable" },
    { id: "medicaid", label: "Accepts Medicaid", icon: Stethoscope, color: "bg-teal-100 text-teal-800 hover:bg-teal-200", filter: "acceptsMedicaid" },
  ]

  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  // Sample search suggestions
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

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  const buildFiltersFromSelection = (): SearchFilters => {
    const filters: SearchFilters = {}
    
    selectedFilters.forEach(filterId => {
      const filter = quickFilters.find(f => f.id === filterId)
      if (filter) {
        switch (filter.filter) {
          case "freeOnly":
            filters.freeOnly = true
            break
          case "acceptsUninsured":
            filters.acceptsUninsured = true
            break
          case "acceptsMedicaid":
            filters.acceptsMedicaid = true
            break
          case "telehealthAvailable":
            filters.telehealthAvailable = true
            break
          case "serviceCategories":
            filters.serviceCategories = filter.value as string[]
            break
        }
      }
    })

    return filters
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
    
    // If parent component provides onSearch handler, use it
    if (onSearch) {
      onSearch(searchQuery, locationCoords || undefined)
      return
    }
    
    // Otherwise, handle search locally for preview
    startTransition(async () => {
      try {
        const filters = buildFiltersFromSelection()

        const searchRequest = {
          query: searchQuery,
          location: locationCoords,
          filters,
          limit: 20
        }

        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchRequest),
        })

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`)
        }

        const results: SearchResults = await response.json()
        
        // Sort providers to prioritize those with free services
        if (results.providers && results.services) {
          results.providers.sort((a: any, b: any) => {
            // Check if providers have free services
            const aHasFree = results.services.some((service: any) => 
              service.provider_id === a._id && service.is_free
            )
            const bHasFree = results.services.some((service: any) => 
              service.provider_id === b._id && service.is_free
            )
            
            // Prioritize providers with free services
            if (aHasFree && !bHasFree) return -1
            if (!aHasFree && bHasFree) return 1
            
            // If both have free services, count them
            if (aHasFree && bHasFree) {
              const aFreeCount = results.services.filter((service: any) => 
                service.provider_id === a._id && service.is_free
              ).length
              const bFreeCount = results.services.filter((service: any) => 
                service.provider_id === b._id && service.is_free
              ).length
              if (aFreeCount !== bFreeCount) return bFreeCount - aFreeCount
            }
            
            // Then sort by search relevance score
            return (b.searchScore || 0) - (a.searchScore || 0)
          })
        }
        
        setSearchResults(results)
        
      } catch (error) {
        console.error('Search error:', error)
        setSearchError(error instanceof Error ? error.message : 'Search failed. Please try again.')
      }
    })
  }

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Free & Low-Cost Healthcare Near You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover accessible healthcare services in your area, regardless of insurance status. 
            Search by service, condition, or location to find the care you need.
          </p>
        </div>

        {/* Search Error Alert */}
        {searchError && (
          <Alert className="mb-6 border-destructive">
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
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
              className="pl-12 pr-12 py-4 text-lg h-14 bg-background border-2 border-border focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-muted transition-colors"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>No suggestions found.</CommandEmpty>
                    <CommandGroup heading="Popular Searches">
                      {searchSuggestions.map((suggestion, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => {
                            setSearchQuery(suggestion)
                            setIsSearchOpen(false)
                            setShowSuggestions(false)
                          }}
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
            
            {/* Typing Suggestions */}
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
        </div>

        {/* Location Input */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter your location (city, state, or zip code)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 pr-4 py-3 h-12 bg-background border-2 border-border focus:border-primary"
              />
            </div>
            <Button
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              variant="outline"
              className="px-4 h-12 border-2"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">
                {isGettingLocation ? "Getting..." : "Use My Location"}
              </span>
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-3">Quick Filters:</p>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon
              const isSelected = selectedFilters.includes(filter.id)
              return (
                <Badge
                  key={filter.id}
                  variant={isSelected ? "default" : "secondary"}
                  className={`cursor-pointer transition-all duration-200 px-3 py-2 text-sm ${
                    isSelected 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : filter.color
                  }`}
                  onClick={() => toggleFilter(filter.id)}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {filter.label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Search Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg h-14 bg-primary hover:bg-primary/90"
            onClick={handleSearch}
            disabled={(isPending || isSearching) || !searchQuery.trim()}
          >
            {(isPending || isSearching) ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Find Healthcare Services
              </>
            )}
          </Button>
        </div>

        {/* Selected Filters Display */}
        {selectedFilters.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedFilters.map((filterId) => {
                const filter = quickFilters.find(f => f.id === filterId)
                if (!filter) return null
                const Icon = filter.icon
                return (
                  <Badge
                    key={filterId}
                    variant="default"
                    className="bg-primary text-primary-foreground"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {filter.label}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Search Results Preview */}
        {searchResults && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
              Found {searchResults.totalResults} results for "{searchResults.query}"
            </h3>
              <p className="text-sm text-muted-foreground">
                {searchResults.providers.length} providers • {searchResults.services.length} services
              </p>
            </div>

            {/* Featured Provider & Service */}
            {(searchResults.providers.length > 0 || searchResults.services.length > 0) && (
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                  <h4 className="font-semibold text-primary">Top Match</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Featured Provider */}
                  {searchResults.providers.length > 0 && (
                    <div className="bg-background rounded-lg p-4 border shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-lg text-gray-900">
                            {searchResults.providers[0].name}
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">
                            {searchResults.providers[0].category}
                          </p>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < Math.floor(searchResults.providers[0].rating) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              ({searchResults.providers[0].rating.toFixed(1)})
                            </span>
                          </div>
                        </div>
                        {searchResults.providers[0].distance && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {searchResults.providers[0].distance < 1 
                              ? `${(searchResults.providers[0].distance * 5280).toFixed(0)} ft`
                              : `${searchResults.providers[0].distance.toFixed(1)} mi`
                            }
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{searchResults.providers[0].address}</span>
                      </div>
                      
                      {/* Accessibility badges */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {searchResults.providers[0].accepts_uninsured && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Uninsured OK
                          </Badge>
                        )}
                        {searchResults.providers[0].medicaid && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Medicaid
                          </Badge>
                        )}
                        {searchResults.providers[0].medicare && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Medicare
                          </Badge>
                        )}
                        {!searchResults.providers[0].ssn_required && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                            No SSN Required
                          </Badge>
                        )}
                        {searchResults.providers[0].telehealth_available && (
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Telehealth
                          </Badge>
                        )}
                      </div>
                      
                      {/* Quick actions */}
                      <div className="flex gap-2">
                        {searchResults.providers[0].phone && (
                          <Button 
                            size="sm" 
                            onClick={() => window.open(`tel:${searchResults.providers[0].phone}`, '_self')}
                            className="flex-1"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const address = encodeURIComponent(searchResults.providers[0].address)
                            window.open(`https://maps.google.com/maps?q=${address}`, '_blank')
                          }}
                          className="flex-1"
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Featured Service */}
                  {searchResults.services.length > 0 && (
                    <div className="bg-background rounded-lg p-4 border shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-lg text-gray-900">
                            {searchResults.services[0].name}
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">
                            {searchResults.services[0].category}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {searchResults.services[0].is_free && (
                            <Badge className="bg-green-100 text-green-800">
                              <DollarSign className="h-3 w-3 mr-1" />
                              FREE
                            </Badge>
                          )}
                          {searchResults.services[0].is_discounted && !searchResults.services[0].is_free && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <DollarSign className="h-3 w-3 mr-1" />
                              DISCOUNTED
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {searchResults.services[0].description && (
                        <p className="text-sm text-gray-700 mb-3">
                          {searchResults.services[0].description}
                        </p>
                      )}
                      
                      {searchResults.services[0].price_info && (
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <span className="font-medium">Pricing:</span>
                          <span className="text-gray-600">{searchResults.services[0].price_info}</span>
                        </div>
                      )}
                      
                      {searchResults.services[0].provider && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-medium mb-1">Available at:</p>
                          <p className="text-sm text-gray-600">{searchResults.services[0].provider.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{searchResults.services[0].provider.address}</p>
                          
                          <div className="flex gap-2">
                            {searchResults.services[0].provider.phone && (
                              <Button 
                                size="sm" 
                                onClick={() => window.open(`tel:${searchResults.services[0].provider.phone}`, '_self')}
                                className="flex-1"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const address = encodeURIComponent(searchResults.services[0].provider.address)
                                window.open(`https://maps.google.com/maps?q=${address}`, '_blank')
                              }}
                              className="flex-1"
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              Directions
                            </Button>
                </div>
              </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Results Summary */}
            {searchResults.totalResults > 1 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {searchResults.totalResults - 1} more results available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View all providers and services in the main search
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View All Results
                  </Button>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
} 