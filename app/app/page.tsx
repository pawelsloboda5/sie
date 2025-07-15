"use client"

import { useState, useEffect } from "react"
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

interface SearchResults {
  providers: any[]
  services: any[]
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

  const handleSearch = async (query: string, location?: {latitude: number, longitude: number}) => {
    handleSearchWithFilters(query, location)
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    // Immediately re-search with new filters
    if (currentQuery) {
      handleSearchWithFilters(currentQuery, currentLocation, newFilters)
    }
  }

  const handleSearchWithFilters = async (query: string, location?: {latitude: number, longitude: number}, filterOverrides?: FilterOptions) => {
    const filtersToUse = filterOverrides || filters
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
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyFilters = () => {
    setShowMobileFilters(false)
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
    if (currentQuery) {
      handleSearch(currentQuery, currentLocation)
    }
  }

  const handleRetrySearch = () => {
    if (currentQuery) {
      handleSearch(currentQuery, currentLocation)
    }
  }

  const handleProviderAction = (action: string, provider: any) => {
    // Handle provider actions like call, directions, etc.
    console.log(`Action: ${action}`, provider)
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onSearch={handleSearch} isSearching={isLoading} />
      
      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filter Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                resultsCount={searchResults?.totalResults || 0}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Results Area */}
          <div className="lg:col-span-3">
            {/* Mobile Controls */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {(filters.freeOnly || filters.acceptsUninsured || filters.acceptsMedicaid || 
                      filters.acceptsMedicare || filters.telehealthAvailable || 
                      filters.insuranceProviders.length > 0 || filters.serviceCategories.length > 0) && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-96 p-0">
                  <div className="p-4">
                    <FilterPanel
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      resultsCount={searchResults?.totalResults || 0}
                      isLoading={isLoading}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Map
                </Button>
              </div>
            </div>
            
            {/* Results Display */}
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
              <div className="bg-muted/30 rounded-lg p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2 font-medium">Map View - Coming Soon</p>
                  <p className="text-sm text-muted-foreground">Interactive Azure Maps will display here with provider pins</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
