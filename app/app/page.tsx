"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { HeroSection } from "@/components/layout/HeroSection"
import { ResultsList } from "@/components/results/ResultsList"
import { Button } from "@/components/ui/button"
import { List, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { parseLocationString, type Coordinates } from "@/lib/utils"
import { AppHeader } from "./header"
import { 
  saveCachedSearchResult, 
  getCachedSearchResult, 
  clearOldCachedResults,
  type CachedSearchResult 
} from "@/lib/db"
import { 
  applyLocalFilters, 
  sortProvidersLocally, 
  hasActiveFilters,
  getFilterSummary,
  type LocalFilterOptions 
} from "@/lib/localFilters"
 
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
  rating?: number
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
  isFiltered?: boolean
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
  const [currentLocation, setCurrentLocation] = useState<Coordinates | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'display' | 'list'>('list')
  
  // NEW: Local caching state
  const [hasCachedData, setHasCachedData] = useState(false)
  const [originalSearchData, setOriginalSearchData] = useState<CachedSearchResult | null>(null)
  const [isLocalFiltering, setIsLocalFiltering] = useState(false)
  
  // State for initial values from URL parameters
  const [initialQuery, setInitialQuery] = useState("")
  const [initialLocation, setInitialLocation] = useState("")
  const [hasExecutedUrlSearch, setHasExecutedUrlSearch] = useState(false)
  const searchExecutionRef = useRef(false)

  // Clear old cached results on component mount
  useEffect(() => {
    clearOldCachedResults().catch(console.error)
  }, [])

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
      // Reset cache state since this is a server-filtered result
      setHasCachedData(false)
      setOriginalSearchData(null)
    } catch (error) {
      console.error('Filter search error:', error)
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [currentLocation])

  const handleSearch = useCallback(async (query: string, location?: Coordinates, searchFilters?: Partial<FilterOptions>) => {
    const filtersToUse = searchFilters || filters
    setIsLoading(true)
    setCurrentQuery(query)
    setCurrentLocation(location)
    
    // Reset local filtering state for new search
    setHasCachedData(false)
    setOriginalSearchData(null)
    setIsLocalFiltering(false)
    
    try {
      // Check for cached result first
      const locationString = location ? `${location.latitude}, ${location.longitude}` : undefined
      const cachedResult = await getCachedSearchResult(query, locationString)
      
      if (cachedResult) {
        console.log('Using cached search result for:', query)
        
        // Apply current filters to cached data locally
        const localFilterOptions: LocalFilterOptions = {
          freeOnly: filtersToUse.freeOnly,
          acceptsUninsured: filtersToUse.acceptsUninsured,
          acceptsMedicaid: filtersToUse.acceptsMedicaid,
          acceptsMedicare: filtersToUse.acceptsMedicare,
          ssnRequired: filtersToUse.ssnRequired,
          telehealthAvailable: filtersToUse.telehealthAvailable,
          maxDistance: filtersToUse.maxDistance,
          insuranceProviders: filtersToUse.insuranceProviders,
          serviceCategories: filtersToUse.serviceCategories,
          providerTypes: filtersToUse.providerTypes,
          minRating: filtersToUse.minRating
        }
        
        const filteredResults = applyLocalFilters(cachedResult, localFilterOptions, location)
        const sortedProviders = sortProvidersLocally(
          filteredResults.providers,
          filteredResults.services,
          filtersToUse.sortBy || 'relevance',
          localFilterOptions
        )
        
        setSearchResults({
          providers: sortedProviders,
          services: filteredResults.services,
          query: cachedResult.query,
          totalResults: sortedProviders.length + filteredResults.services.length,
          isFiltered: hasActiveFilters(localFilterOptions)
        })
        
        setOriginalSearchData(cachedResult)
        setHasCachedData(true)
        setIsLoading(false)
        return
      }

      // No cached result, make server call
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
      
      // NEW: Cache the search result
      const cacheData: CachedSearchResult = {
        query,
        location: locationString,
        coordinates: location,
        providers: results.providers,
        services: results.services,
        timestamp: new Date(),
        totalResults: results.totalResults
      }
      
      console.log('💾 Attempting to cache search result:', {
        query: cacheData.query,
        location: cacheData.location,
        providerCount: cacheData.providers.length,
        serviceCount: cacheData.services.length,
        totalResults: cacheData.totalResults
      })
      
      try {
        await saveCachedSearchResult(cacheData)
        setOriginalSearchData(cacheData)
        setHasCachedData(true)
        
        console.log('✅ Search result cached successfully:', query)
        console.log('✅ Cache state updated:', {
          hasCachedData: true,
          originalSearchDataSet: true
        })
      } catch (cacheError) {
        console.error('❌ Failed to cache search result:', cacheError)
        // Continue without caching - don't break the user experience
        setHasCachedData(false)
        setOriginalSearchData(null)
      }
      
      console.log('🔍 Search completed and cached:', query)
      
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
    
    // 🔍 DEBUG: Log cache state when filters change
    console.log('🔍 FILTER CHANGE DEBUG:', {
      hasCachedData,
      hasOriginalSearchData: !!originalSearchData,
      originalSearchDataQuery: originalSearchData?.query,
      originalSearchDataProviderCount: originalSearchData?.providers?.length,
      originalSearchDataServiceCount: originalSearchData?.services?.length,
      newFilters: convertedFilters
    })
    
    // NEW: Use local filtering if we have cached data
    if (hasCachedData && originalSearchData) {
      console.log('✅ Using LOCAL FILTERING with cached data')
      setIsLocalFiltering(true)
      
      console.log('Applying local filters:', getFilterSummary(convertedFilters))
      
      try {
        const localFilterOptions: LocalFilterOptions = {
          freeOnly: convertedFilters.freeOnly,
          acceptsUninsured: convertedFilters.acceptsUninsured,
          acceptsMedicaid: convertedFilters.acceptsMedicaid,
          acceptsMedicare: convertedFilters.acceptsMedicare,
          ssnRequired: convertedFilters.ssnRequired,
          telehealthAvailable: convertedFilters.telehealthAvailable,
          maxDistance: convertedFilters.maxDistance,
          insuranceProviders: convertedFilters.insuranceProviders,
          serviceCategories: convertedFilters.serviceCategories,
          providerTypes: convertedFilters.providerTypes,
          minRating: convertedFilters.minRating
        }
        
        const filteredResults = applyLocalFilters(
          originalSearchData, 
          localFilterOptions, 
          currentLocation
        )
        
        const sortedProviders = sortProvidersLocally(
          filteredResults.providers,
          filteredResults.services,
          convertedFilters.sortBy,
          localFilterOptions
        )
        
        setSearchResults({
          providers: sortedProviders,
          services: filteredResults.services,
          query: originalSearchData.query,
          totalResults: sortedProviders.length + filteredResults.services.length,
          isFiltered: hasActiveFilters(localFilterOptions)
        })
        
        console.log(`✅ Local filtering completed: ${sortedProviders.length} providers, ${filteredResults.services.length} services`)
      } catch (error) {
        console.error('❌ Local filtering failed, falling back to server:', error)
        // Fallback to server call if local filtering fails
        handleFilterOnlySearch(convertedFilters)
      } finally {
        setIsLocalFiltering(false)
      }
      return
    }
    
    // 🔍 DEBUG: Log why we're falling back to server filtering
    console.log('❌ FALLING BACK TO SERVER FILTERING because:', {
      hasCachedData: hasCachedData,
      hasOriginalSearchData: !!originalSearchData,
      reason: !hasCachedData ? 'hasCachedData is false' : 'originalSearchData is null'
    })
    
    // Check if any advanced filters are active and we don't have cached data
    const hasAdvancedFilters = convertedFilters.freeOnly || 
      convertedFilters.acceptsUninsured || 
      convertedFilters.acceptsMedicaid || 
      convertedFilters.acceptsMedicare || 
      convertedFilters.ssnRequired === false || 
      convertedFilters.telehealthAvailable || 
      convertedFilters.insuranceProviders.length > 0 || 
      convertedFilters.serviceCategories.length > 0
    
    // Use filter API if advanced filters are active but no cached data
    if (hasAdvancedFilters) {
      console.log('🔧 Calling server filter API as fallback')
      handleFilterOnlySearch(convertedFilters)
    }
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
    
    // If we have cached data, apply cleared filters locally
    if (hasCachedData && originalSearchData) {
      console.log('Clearing filters locally')
      
      const filteredResults = applyLocalFilters(
        originalSearchData, 
        {}, // Empty filters
        currentLocation
      )
      
      const sortedProviders = sortProvidersLocally(
        filteredResults.providers,
        filteredResults.services,
        'relevance',
        {}
      )
      
      setSearchResults({
        providers: sortedProviders,
        services: filteredResults.services,
        query: originalSearchData.query,
        totalResults: sortedProviders.length + filteredResults.services.length,
        isFiltered: false
      })
      return
    }
    
    // Fallback behavior for when no cached data
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

  // Handle URL parameters on mount to auto-execute search from homepage
  useEffect(() => {
    // Prevent double execution
    if (hasExecutedUrlSearch || searchExecutionRef.current) {
      return
    }

    const handleUrlParams = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const query = urlParams.get('q')
      const location = urlParams.get('location')
      
      // Set initial values for HeroSection pre-population
      setInitialQuery(query || "")
      setInitialLocation(location || "")
      
      if (query && query.trim()) {
        // Final check before execution
        if (searchExecutionRef.current) {
          return
        }
        
        searchExecutionRef.current = true
        setHasExecutedUrlSearch(true)
        
        try {
          // Parse location if provided
          let locationCoords: Coordinates | undefined = undefined
          if (location) {
            locationCoords = await parseLocationString(location)
          }
          
          // Auto-execute search with URL parameters using default filters
          await handleSearch(query, locationCoords, defaultFilters)
        } catch (error) {
          console.error('Auto-search failed:', error)
        }
      }
    }

    handleUrlParams()
  }, [hasExecutedUrlSearch, handleSearch])

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader />
      {/* Hero Section - takes natural height */}
      <div className="flex-shrink-0">
        <HeroSection 
          onSearch={handleSearch}
          isSearching={isLoading}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          resultsCount={searchResults?.totalResults || 0}
          initialQuery={initialQuery}
          initialLocation={initialLocation}
          isLocalFiltering={isLocalFiltering}
          hasCachedData={hasCachedData}
        />
      </div>
      
      {/* Main Results Area - takes remaining height */}
      <main className="flex-1 min-h-0 bg-background">
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8">
            {/* Mobile Controls */}
            <div className="lg:hidden mb-6 space-y-4">
              {/* Results Summary */}
              {searchResults?.totalResults && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        {searchResults.totalResults} Results Found
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {currentQuery && `for "${currentQuery}"`}
                        {hasCachedData && (
                          <span className="ml-2 text-xs text-green-600 font-medium">
                            {isLocalFiltering ? '⚡ Filtering...' : '⚡ Instant'}
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Active Filters Indicator */}
                    {(filters.freeOnly || filters.acceptsUninsured || filters.acceptsMedicaid || 
                      filters.acceptsMedicare || filters.telehealthAvailable || 
                      filters.insuranceProviders.length > 0 || filters.serviceCategories.length > 0) && (
                      <Badge variant="secondary" className="text-xs px-3 py-1">
                        Filters Active
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* View Mode Toggle - Larger and more touch-friendly */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={viewMode === 'display' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('display')}
                    className={`h-12 flex items-center justify-center gap-3 text-base font-semibold rounded-xl transition-all ${
                      viewMode === 'display' 
                        ? 'bg-[#068282] text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Search className="h-5 w-5" />
                    Card View
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className={`h-12 flex items-center justify-center gap-3 text-base font-semibold rounded-xl transition-all ${
                      viewMode === 'list' 
                        ? 'bg-[#068282] text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <List className="h-5 w-5" />
                    List View
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(filters.freeOnly || filters.acceptsUninsured || filters.acceptsMedicaid || 
                filters.acceptsMedicare || filters.telehealthAvailable || 
                filters.insuranceProviders.length > 0 || filters.serviceCategories.length > 0) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Active Filters
                      {hasCachedData && (
                        <span className="ml-2 text-xs text-green-600 font-medium">⚡ Instant</span>
                      )}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 h-8 px-3 rounded-lg"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.freeOnly && (
                      <Badge className="bg-green-600 text-white text-sm px-3 py-1">Free Only</Badge>
                    )}
                    {filters.acceptsUninsured && (
                      <Badge className="bg-blue-600 text-white text-sm px-3 py-1">Uninsured</Badge>
                    )}
                    {filters.acceptsMedicaid && (
                      <Badge className="bg-green-600 text-white text-sm px-3 py-1">Medicaid</Badge>
                    )}
                    {filters.acceptsMedicare && (
                      <Badge className="bg-green-600 text-white text-sm px-3 py-1">Medicare</Badge>
                    )}
                    {filters.telehealthAvailable && (
                      <Badge className="bg-indigo-600 text-white text-sm px-3 py-1">Telehealth</Badge>
                    )}
                    {(filters.insuranceProviders.length + filters.serviceCategories.length) > 0 && (
                      <Badge className="bg-gray-600 text-white text-sm px-3 py-1">
                        +{filters.insuranceProviders.length + filters.serviceCategories.length} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* View Mode Toggle for Desktop */}
                <div className="flex items-center border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'display' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('display')}
                    className="h-8 px-3 text-sm transition-colors"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Card View
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-3 text-sm transition-colors"
                  >
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </Button>
                </div>

                {/* Filter indicators */}
                {(filters.freeOnly || filters.acceptsUninsured || filters.acceptsMedicaid || 
                  filters.acceptsMedicare || filters.telehealthAvailable || 
                  filters.insuranceProviders.length > 0 || filters.serviceCategories.length > 0) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    <div className="flex gap-1">
                      {filters.freeOnly && (
                        <Badge variant="secondary" className="text-xs">Free Only</Badge>
                      )}
                      {filters.acceptsUninsured && (
                        <Badge variant="secondary" className="text-xs">Uninsured</Badge>
                      )}
                      {filters.acceptsMedicaid && (
                        <Badge variant="secondary" className="text-xs">Medicaid</Badge>
                      )}
                      {filters.acceptsMedicare && (
                        <Badge variant="secondary" className="text-xs">Medicare</Badge>
                      )}
                      {filters.telehealthAvailable && (
                        <Badge variant="secondary" className="text-xs">Telehealth</Badge>
                      )}
                      {(filters.insuranceProviders.length + filters.serviceCategories.length) > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{filters.insuranceProviders.length + filters.serviceCategories.length} more
                        </Badge>
                      )}
                    </div>
                    {hasCachedData && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        ⚡ Instant
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {searchResults?.totalResults && (
                  <span className="text-sm text-muted-foreground">
                    {searchResults.totalResults} results found
                    {hasCachedData && (
                      <span className="ml-2 text-xs text-green-600 font-medium">
                        {isLocalFiltering ? '⚡ Filtering...' : '⚡ Cached'}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            
            {/* Results Display - takes remaining height */}
            <div className="flex-1 min-h-0">
              <ResultsList
                results={searchResults}
                isLoading={isLoading || isLocalFiltering}
                onRetry={handleRetrySearch}
                onProviderAction={handleProviderAction}
                showDistance={!!currentLocation}
                compact={viewMode === 'list'}
                activeFilters={filters}
              />
            </div>
          </div>
          
          {/* Bottom padding */}
          <div className="flex-shrink-0 h-4 sm:h-6"></div>
        </div>
      </main>
    </div>
  )
}
