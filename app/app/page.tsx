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
saveFavoriteProvider,
type FavoriteProvider
} from "@/lib/voiceAgent"
import {
applyLocalFilters,
sortProvidersLocally,
hasActiveFilters,
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

const [hasCachedData, setHasCachedData] = useState(false)
const [originalSearchData, setOriginalSearchData] = useState<CachedSearchResult | null>(null)
const [isLocalFiltering, setIsLocalFiltering] = useState(false)

const [initialQuery, setInitialQuery] = useState("")
const [initialLocation, setInitialLocation] = useState("")
const [hasExecutedUrlSearch, setHasExecutedUrlSearch] = useState(false)
const searchExecutionRef = useRef(false)

useEffect(() => {
clearOldCachedResults().catch(console.error)
}, [])

const handleFilterOnlySearch = useCallback(async (searchFilters: FilterOptions) => {
setIsLoading(true)
setCurrentQuery("Filtered Results")
try {
  const response = await fetch('/api/filter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  if (!response.ok) throw new Error('Filter search failed')

  const results = await response.json()
  setSearchResults(results)
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
const filtersToUse = searchFilters ? { ...filters, ...searchFilters } as FilterOptions : filters
setIsLoading(true)
setCurrentQuery(query)
setCurrentLocation(location)
setHasCachedData(false)
setOriginalSearchData(null)
setIsLocalFiltering(false)
try {
  const locationString = location ? `${location.latitude}, ${location.longitude}` : undefined
  const cachedResult = await getCachedSearchResult(query, locationString)
  
  if (cachedResult) {
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
      filtersToUse.sortBy || 'relevance'
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

  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  if (!response.ok) throw new Error('Search failed')

  const results = await response.json()
  
  if (results.providers && results.services) {
    results.providers.sort((a: Provider, b: Provider) => {
      const aHasFree = results.services.some((s: Service) => s.provider_id === a._id && s.is_free)
      const bHasFree = results.services.some((s: Service) => s.provider_id === b._id && s.is_free)
      if (aHasFree && !bHasFree) return -1
      if (!aHasFree && bHasFree) return 1
      if (aHasFree && bHasFree) {
        const aFreeCount = results.services.filter((s: Service) => s.provider_id === a._id && s.is_free).length
        const bFreeCount = results.services.filter((s: Service) => s.provider_id === b._id && s.is_free).length
        if (aFreeCount !== bFreeCount) return bFreeCount - aFreeCount
      }
      return (b.searchScore || 0) - (a.searchScore || 0)
    })
  }
  
  setSearchResults(results)
  
  const cacheData: CachedSearchResult = {
    query,
    location: locationString,
    coordinates: location,
    providers: results.providers,
    services: results.services,
    timestamp: new Date(),
    totalResults: results.totalResults
  }
  
  try {
    await saveCachedSearchResult(cacheData)
    setOriginalSearchData(cacheData)
    setHasCachedData(true)
  } catch (cacheError) {
    console.error('Failed to cache search result:', cacheError)
    setHasCachedData(false)
    setOriginalSearchData(null)
  }
  
} catch (error) {
  console.error('Search error:', error)
  setSearchResults(null)
} finally {
  setIsLoading(false)
}
}, [filters])

const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
const converted: FilterOptions = {
freeOnly: newFilters.freeOnly ?? false,
acceptsUninsured: newFilters.acceptsUninsured ?? false,
acceptsMedicaid: newFilters.acceptsMedicaid ?? false,
acceptsMedicare: newFilters.acceptsMedicare ?? false,
ssnRequired: newFilters.ssnRequired !== false,
telehealthAvailable: newFilters.telehealthAvailable ?? false,
maxDistance: newFilters.maxDistance ?? 25,
insuranceProviders: newFilters.insuranceProviders ?? [],
serviceCategories: newFilters.serviceCategories ?? [],
providerTypes: newFilters.providerTypes ?? [],
minRating: newFilters.minRating ?? 0,
sortBy: newFilters.sortBy ?? 'relevance'
}
setFilters(converted)
if (hasCachedData && originalSearchData) {
  setIsLocalFiltering(true)
  try {
    const localFilterOptions: LocalFilterOptions = {
      freeOnly: converted.freeOnly,
      acceptsUninsured: converted.acceptsUninsured,
      acceptsMedicaid: converted.acceptsMedicaid,
      acceptsMedicare: converted.acceptsMedicare,
      ssnRequired: converted.ssnRequired,
      telehealthAvailable: converted.telehealthAvailable,
      maxDistance: converted.maxDistance,
      insuranceProviders: converted.insuranceProviders,
      serviceCategories: converted.serviceCategories,
      providerTypes: converted.providerTypes,
      minRating: converted.minRating
    }
    
    const filteredResults = applyLocalFilters(
      originalSearchData, 
      localFilterOptions, 
      currentLocation
    )
    
    const sortedProviders = sortProvidersLocally(
      filteredResults.providers,
      filteredResults.services,
      converted.sortBy
    )
    
    setSearchResults({
      providers: sortedProviders,
      services: filteredResults.services,
      query: originalSearchData.query,
      totalResults: sortedProviders.length + filteredResults.services.length,
      isFiltered: hasActiveFilters(localFilterOptions)
    })
  } catch (error) {
    console.error('Local filtering failed, falling back to server:', error)
    handleFilterOnlySearch(converted)
  } finally {
    setIsLocalFiltering(false)
  }
  return
}

const hasAdvanced = converted.freeOnly || 
  converted.acceptsUninsured || 
  converted.acceptsMedicaid || 
  converted.acceptsMedicare || 
  converted.ssnRequired === false || 
  converted.telehealthAvailable || 
  converted.insuranceProviders.length > 0 || 
  converted.serviceCategories.length > 0

if (hasAdvanced) {
  handleFilterOnlySearch(converted)
}
}

const handleClearFilters = () => {
setFilters(defaultFilters)
if (hasCachedData && originalSearchData) {
const filtered = applyLocalFilters(originalSearchData, {}, currentLocation)
const sorted = sortProvidersLocally(filtered.providers, filtered.services, 'relevance')
setSearchResults({
providers: sorted,
services: filtered.services,
query: originalSearchData.query,
totalResults: sorted.length + filtered.services.length,
isFiltered: false
})
return
}
if (currentQuery && currentQuery !== "Filtered Results") {
  handleSearch(currentQuery, currentLocation, defaultFilters)
} else if (currentQuery === "Filtered Results") {
  setSearchResults(null)
  setCurrentQuery("")
}
}

const handleRetrySearch = () => {
if (currentQuery) handleSearch(currentQuery, currentLocation)
}

const handleProviderAction = async (action: string, provider: Provider) => {
switch (action) {
case 'voice-agent': {
const favoriteProvider: FavoriteProvider = {
_id: provider._id,
name: provider.name,
address: provider.address,
phone: provider.phone,
category: provider.category,
savedAt: new Date(),
filters: {
freeServicesOnly: false,
acceptsMedicaid: provider.medicaid,
acceptsMedicare: provider.medicare,
acceptsUninsured: provider.accepts_uninsured,
noSSNRequired: !provider.ssn_required,
telehealthAvailable: provider.telehealth_available
}
}
saveFavoriteProvider(favoriteProvider)
window.location.href = '/voice-agent'
break
}
default:
break
}
}

useEffect(() => {
if (hasExecutedUrlSearch || searchExecutionRef.current) return
const handleUrlParams = async () => {
const urlParams = new URLSearchParams(window.location.search)
const query = urlParams.get('q')
const location = urlParams.get('location')
setInitialQuery(query || "")
setInitialLocation(location || "")
if (query && query.trim()) {
if (searchExecutionRef.current) return
searchExecutionRef.current = true
setHasExecutedUrlSearch(true)
try {
let coords: Coordinates | undefined = undefined
if (location) coords = await parseLocationString(location)
await handleSearch(query, coords, defaultFilters)
} catch (error) {
console.error('Auto-search failed:', error)
}
}
}
handleUrlParams()
}, [hasExecutedUrlSearch, handleSearch])

return (
<div className="min-h-screen flex flex-col bg-[radial-gradient(1200px_600px_at_10%_-10%,#EAF4EF_25%,transparent),radial-gradient(1000px_500px_at_90%_0%,#EAF2FF_20%,transparent)]">
<AppHeader />
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
    />
  </div>
  
  <main className="flex-1 min-h-0">
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 container mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-8">
        {/* Mobile quick controls */}
        <div className="lg:hidden mb-5 space-y-3">
          {searchResults?.totalResults ? (
            <div className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{searchResults.totalResults} Results</h2>
                  <p className="text-xs text-gray-500">{currentQuery && `for "${currentQuery}"`}</p>
                </div>
                {(filters.freeOnly || filters.acceptsUninsured || filters.acceptsMedicaid || 
                  filters.acceptsMedicare || filters.telehealthAvailable || 
                  filters.insuranceProviders.length > 0 || filters.serviceCategories.length > 0) && (
                  <Badge variant="secondary" className="text-xs px-3">Filters Active</Badge>
                )}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm p-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={viewMode === 'display' ? 'default' : 'ghost'}
                onClick={() => setViewMode('display')}
                className={`h-11 rounded-xl ${viewMode === 'display' ? 'bg-emerald-600 text-white' : ''}`}
              >
                <Search className="h-4 w-4 mr-2" />
                Card View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className={`h-11 rounded-xl ${viewMode === 'list' ? 'bg-emerald-600 text-white' : ''}`}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop quick controls */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg p-1 bg-white/80">
              <Button
                variant={viewMode === 'display' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('display')}
                className="h-8 px-3"
              >
                <Search className="h-4 w-4 mr-2" />
                Card View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
            {(filters.freeOnly || filters.acceptsUninsured || filters.acceptsMedicaid || 
              filters.acceptsMedicare || filters.telehealthAvailable || 
              filters.insuranceProviders.length > 0 || filters.serviceCategories.length > 0) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Active:</span>
                <div className="flex gap-1 flex-wrap">
                  {filters.freeOnly && <Badge variant="secondary" className="text-xs">Free</Badge>}
                  {filters.acceptsUninsured && <Badge variant="secondary" className="text-xs">Uninsured</Badge>}
                  {filters.acceptsMedicaid && <Badge variant="secondary" className="text-xs">Medicaid</Badge>}
                  {filters.acceptsMedicare && <Badge variant="secondary" className="text-xs">Medicare</Badge>}
                  {filters.ssnRequired === false && <Badge variant="secondary" className="text-xs">No SSN</Badge>}
                  {filters.telehealthAvailable && <Badge variant="secondary" className="text-xs">Telehealth</Badge>}
                  {filters.insuranceProviders.map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}
                  {filters.serviceCategories.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                  {filters.providerTypes.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                  {filters.minRating > 0 && <Badge variant="secondary" className="text-xs">{filters.minRating}+ Stars</Badge>}
                  {filters.maxDistance < 50 && <Badge variant="secondary" className="text-xs">≤ {filters.maxDistance}mi</Badge>}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Results */}
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
      <div className="h-6" />
    </div>
  </main>
</div>
)
}