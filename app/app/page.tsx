"use client"

import { useState, useEffect, useCallback } from "react"
import { HeroSection } from "@/components/layout/HeroSection"
import { FilterPanel } from "@/components/search/FilterPanel"
import { ResultsList } from "@/components/results/ResultsList"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filter, MapPin, List } from "lucide-react"
 
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

interface Provider {
  _id: string
  name: string
  category: string
  address: string
  phone?: string
  website?: string
  email?: string
  rating: number
  accepts_uninsured: boolean
  medicaid: boolean
  medicare: boolean
  ssn_required: boolean
  telehealth_available: boolean
  insurance_providers: string[]
  distance?: number
  searchScore?: number
}

interface Service {
  _id: string
  provider_id: string
  name: string
  category: string
  description: string
  is_free: boolean
  is_discounted: boolean
  price_info: string
  searchScore?: number
}

interface SearchResults {
  providers: Provider[]
  services: Service[]
  query: string
  totalResults: number
}

const defaultFilters: FilterOptions = {
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
}

export default function FindPage() {
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)
  const [currentQuery, setCurrentQuery] = useState("")
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  
  // State for initial values from URL parameters
  const [initialQuery, setInitialQuery] = useState("")
  const [initialLocation, setInitialLocation] = useState("")


  const handleFilterOnlySearch = useCallback(async (searchFilters: FilterOptions) => {
    setIsLoading(true)
    setCurrentQuery("Filtered Results")
    
    try {
      const response = await fetch('/api/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            freeOnly: searchFilters.freeOnly,
            acceptsUninsured: searchFilters.acceptsUninsured,
            acceptsMedicaid: searchFilters.acceptsMedicaid,
            acceptsMedicare: searchFilters.acceptsMedicare,
            ssnRequired: searchFilters.ssnRequired,
            telehealthAvailable: searchFilters.telehealthAvailable,
            maxDistance: searchFilters.maxDistance,
            insuranceProviders: searchFilters.insuranceProviders,
            serviceCategories: searchFilters.serviceCategories,
          },
          location: currentLocation,
          limit: 20
        }),
      })

      if (!response.ok) {
        throw new Error('Filter search failed')
      }

      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Filter search error:', error)
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [currentLocation])

  const handleSearch = useCallback(async (query: string, location?: {latitude: number, longitude: number}, searchFilters?: Partial<FilterOptions>) => {
    const filtersToUse = searchFilters || filters
    setIsLoading(true)
    setCurrentQuery(query)
    setCurrentLocation(location)
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          location,
          filters: {
            freeOnly: filtersToUse.freeOnly,
            acceptsUninsured: filtersToUse.acceptsUninsured,
            acceptsMedicaid: filtersToUse.acceptsMedicaid,
            acceptsMedicare: filtersToUse.acceptsMedicare,
            ssnRequired: filtersToUse.ssnRequired,
            telehealthAvailable: filtersToUse.telehealthAvailable,
            maxDistance: filtersToUse.maxDistance,
            insuranceProviders: filtersToUse.insuranceProviders,
            serviceCategories: filtersToUse.serviceCategories,
          },
          limit: 20
        }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const results = await response.json()
      
      // Sort providers to prioritize those with free services
      if (results.providers && results.services) {
        results.providers.sort((a: Provider, b: Provider) => {
          // Check if providers have free services
          const aHasFree = results.services.some((service: Service) => 
            service.provider_id === a._id && service.is_free
          )
          const bHasFree = results.services.some((service: Service) => 
            service.provider_id === b._id && service.is_free
          )
          
          // Prioritize providers with free services
          if (aHasFree && !bHasFree) return -1
          if (!aHasFree && bHasFree) return 1
          
          // If both have free services, count them
          if (aHasFree && bHasFree) {
            const aFreeCount = results.services.filter((service: Service) => 
              service.provider_id === a._id && service.is_free
            ).length
            const bFreeCount = results.services.filter((service: Service) => 
              service.provider_id === b._id && service.is_free
            ).length
            if (aFreeCount !== bFreeCount) return bFreeCount - aFreeCount
          }
          
          // Then sort by search relevance score
          return (b.searchScore || 0) - (a.searchScore || 0)
        })
      }
      
      setSearchResults(results)
      
      // Remove the automatic filter-after-search logic to prevent infinite loops
      // Users can manually apply filters if needed
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
    const convertedFilters: FilterOptions = {
      freeOnly: newFilters.freeOnly || false,
      acceptsUninsured: newFilters.acceptsUninsured || false,
      acceptsMedicaid: newFilters.acceptsMedicaid || false,
      acceptsMedicare: newFilters.acceptsMedicare || false,
      ssnRequired: newFilters.ssnRequired !== false,
      telehealthAvailable: newFilters.telehealthAvailable || false,
      maxDistance: newFilters.maxDistance || 25,
      insuranceProviders: newFilters.insuranceProviders || [],
      serviceCategories: newFilters.serviceCategories || [],
      providerTypes: newFilters.providerTypes || [],
      minRating: newFilters.minRating || 0,
      sortBy: newFilters.sortBy || 'relevance'
    }
    setFilters(convertedFilters)
    // Check if any advanced filters are active
    const hasAdvancedFilters = convertedFilters.freeOnly || 
      convertedFilters.acceptsUninsured || 
      convertedFilters.acceptsMedicaid || 
      convertedFilters.acceptsMedicare || 
      convertedFilters.ssnRequired === false || 
      convertedFilters.telehealthAvailable || 
      convertedFilters.insuranceProviders.length > 0 || 
      convertedFilters.serviceCategories.length > 0
    
    // Use filter API if advanced filters are active
    if (hasAdvancedFilters) {
      handleFilterOnlySearch(convertedFilters)
    }
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
    if (currentQuery && currentQuery !== "Filtered Results") {
      handleSearch(currentQuery, currentLocation, defaultFilters)
    } else if (currentQuery === "Filtered Results") {
      // If we were in filter-only mode, clear results
      setSearchResults(null)
      setCurrentQuery("")
    }
  }

  const handleRetrySearch = () => {
    if (currentQuery) {
      handleSearch(currentQuery, currentLocation)
    }
  }

  const handleProviderAction = (action: string, provider: Provider) => {
    // Handle provider actions like call, directions, etc.
    console.log(`Action: ${action}`, provider)
  }

  // Utility function to parse location string (coordinates or text)
  const parseLocationString = (locationString: string): {latitude: number, longitude: number} | undefined => {
    // Check if it's coordinates (latitude, longitude)
    const coordMatch = locationString.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2])
      }
    }
    
    // For text addresses, we don't have geocoding yet, so return undefined
    // TODO: Implement geocoding for text addresses
    return undefined
  }

  // Handle URL parameters on mount to auto-execute search from homepage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('q')
    const location = urlParams.get('location')
    
    // Set initial values for HeroSection pre-population
    setInitialQuery(query || "")
    setInitialLocation(location || "")
    
    if (query && query.trim()) {
      console.log('Auto-executing search from URL params:', { query, location })
      
      try {
        // Parse location if provided
        let locationCoords: {latitude: number, longitude: number} | undefined = undefined
        if (location) {
          locationCoords = parseLocationString(location)
        }
        
        // Auto-execute search with URL parameters
        handleSearch(query, locationCoords).catch((error) => {
          console.error('Auto-search failed:', error)
          // Search will fail gracefully in handleSearch, so no additional action needed
          // The user can still manually search using the pre-populated fields
        })
      } catch (error) {
        console.error('Error processing URL parameters:', error)
        // Even if parsing fails, the search fields will still be pre-populated
        // so the user can manually trigger the search
      }
    }
  }, [handleSearch])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized Hero Section */}
      <div className="min-h-[320px] sm:min-h-[400px] lg:min-h-[450px] flex flex-col">
        <HeroSection 
          onSearch={handleSearch}
          isSearching={isLoading}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          resultsCount={searchResults?.totalResults || 0}
          initialQuery={initialQuery}
          initialLocation={initialLocation}
          onFilterOnlySearch={() => handleFilterOnlySearch(filters)}
        />
      </div>
      
      {/* Main Results Area - Mobile-first responsive design */}
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8">
          {/* Mobile-optimized Results Container */}
          <div className="w-full">
            {/* Mobile Controls - Improved touch targets and spacing */}
            <div className="lg:hidden mb-4 sm:mb-6 space-y-3">
              {/* Filter Button */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-3 h-14 border-2 font-medium text-base bg-background hover:bg-accent transition-colors"
                  >
                    <Filter className="h-5 w-5" />
                    <span>Advanced Filters</span>
                    {(filters.freeOnly || filters.acceptsUninsured || filters.acceptsMedicaid || 
                      filters.acceptsMedicare || filters.telehealthAvailable || 
                      filters.insuranceProviders.length > 0 || filters.serviceCategories.length > 0) && (
                      <span className="ml-2 bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-semibold">
                        Active
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-96 p-0 overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <FilterPanel
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      resultsCount={searchResults?.totalResults || 0}
                      isLoading={isLoading}
                      onFilterOnlySearch={() => {
                        handleFilterOnlySearch(filters)
                        setShowMobileFilters(false)
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* View Mode Toggle - Improved mobile layout */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="h-14 flex items-center justify-center gap-3 text-base font-medium transition-colors"
                >
                  <List className="h-5 w-5" />
                  List View
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  onClick={() => setViewMode('map')}
                  className="h-14 flex items-center justify-center gap-3 text-base font-medium transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  Map View
                </Button>
              </div>
            </div>
            
            {/* Results Display - Mobile-optimized */}
            {viewMode === 'list' ? (
              <ResultsList
                results={searchResults}
                isLoading={isLoading}
                onRetry={handleRetrySearch}
                onProviderAction={handleProviderAction}
                showDistance={!!currentLocation}
                compact={false}
              />
            ) : (
              <div className="bg-muted/30 rounded-xl p-6 sm:p-8 lg:p-12 h-80 sm:h-96 lg:h-[500px] flex items-center justify-center border border-border">
                <div className="text-center max-w-md px-4">
                  <MapPin className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">Map View Coming Soon</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                    Interactive Azure Maps will display here with provider pins and advanced location features
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode('list')}
                    className="h-12 px-6 text-base font-medium"
                  >
                    <List className="h-4 w-4 mr-2" />
                    View as List
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
