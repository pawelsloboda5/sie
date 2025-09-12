"use client"

import React, { useState, useMemo } from "react"
import type { ProviderUI as Provider, SearchResultsUI as SearchResults } from "@/lib/types/ui"
import { ProviderCard } from "./ProviderCard"
import { ProviderDetailsModal } from "../provider/ProviderDetailsModal"
import { buildProviderSlug } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
Search,
MapPin,
Star,
SortAsc,
Building,
Heart,
AlertCircle,
RefreshCw
} from "lucide-react"

// Provider, Service, SearchResults imported from UI types

// Service from UI types

// SearchResults from UI types

interface FilterOptions {
freeOnly?: boolean
acceptsUninsured?: boolean
acceptsMedicaid?: boolean
acceptsMedicare?: boolean
ssnRequired?: boolean
telehealthAvailable?: boolean
maxDistance?: number
insuranceProviders?: string[]
serviceCategories?: string[]
providerTypes?: string[]
minRating?: number
sortBy?: 'distance' | 'rating' | 'name' | 'relevance'
}

interface ResultsListProps {
results: SearchResults | null
isLoading: boolean
onRetry?: () => void
onProviderAction?: (action: string, provider: Provider) => void
showDistance?: boolean
compact?: boolean
activeFilters?: FilterOptions
}

type SortOption = 'relevance' | 'distance' | 'rating' | 'name'

export function ResultsList({
results,
isLoading,
onRetry,
onProviderAction,
showDistance = true,
compact = false,
activeFilters
}: ResultsListProps) {
const [sortBy, setSortBy] = useState<SortOption>('relevance')
const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

const sortedProviders = useMemo(() => {
if (!results?.providers) return []
let providers = [...results.providers]
if (activeFilters?.freeOnly && results.services) {
const providersWithFree = new Set<string>()
results.services.forEach(s => { if (s.is_free) providersWithFree.add(s.provider_id) })
providers = providers.filter(p => providersWithFree.has(p._id))
}
switch (sortBy) {
case 'distance':
return providers.sort((a, b) => {
if (!a.distance && !b.distance) return 0
if (!a.distance) return 1
if (!b.distance) return -1
if (a.distance !== b.distance) return a.distance - b.distance
return (b.searchScore || 0) - (a.searchScore || 0)
})
case 'rating':
return providers.sort((a, b) => {
const aRating = a.rating || 0
const bRating = b.rating || 0
if (aRating !== bRating) return bRating - aRating
return (b.searchScore || 0) - (a.searchScore || 0)
})
case 'name':
return providers.sort((a, b) => {
const nameComp = a.name.localeCompare(b.name)
if (nameComp !== 0) return nameComp
return (b.searchScore || 0) - (a.searchScore || 0)
})
case 'relevance':
default:
return providers.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))
}
}, [results?.providers, results?.services, sortBy, activeFilters?.freeOnly])

const getProviderTopService = (provider: Provider) => {
  // Prefer server-provided semantic featured service, if available
  if (provider.freeServicePreview && provider.freeServicePreview.length > 0) {
    return provider.freeServicePreview[0]
  }
  // Fallback to local heuristic
  const sourceServices = (provider.services && provider.services.length > 0)
    ? provider.services
    : (results?.services || [])
  const providerServices = sourceServices.filter(s => s.provider_id === provider._id)
  if (providerServices.length === 0) return null
  const free = providerServices.filter(s => s.is_free)
  if (free.length > 0) return free.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))[0]
  const discounted = providerServices.filter(s => s.is_discounted)
  if (discounted.length > 0) return discounted.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))[0]
  return providerServices.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))[0]
}

const handleProviderAction = (action: string, provider: Provider) => {
  switch (action) {
    case 'call':
      if (provider.phone) window.open(`tel:${provider.phone}`, '_self');
      break;
    case 'directions': {
      const address = encodeURIComponent(provider.address);
      window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
      break;
    }
    case 'website':
      if (provider.website) window.open(provider.website, '_blank');
      break;
    case 'details': {
      const slug = buildProviderSlug(provider.name, provider._id)
      window.location.href = `/providers/${slug}`
      break;
    }
  }
  onProviderAction?.(action, provider);
};

if (isLoading) {
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-40" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full pr-2 sm:pr-4">
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-7 w-72" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-5 w-60" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

if (
  !results ||
  (Array.isArray(results.providers) && results.providers.length === 0 &&
    Array.isArray(results.services) && results.services.length === 0)
) {
  return (
    <div className="h-full flex items-center justify-center">
      <Card className="p-10 text-center max-w-md w-full bg-white/80 border-gray-200/70">
        <div className="flex flex-col items-center space-y-6">
          <Search className="h-16 w-16 text-gray-300" />
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900">
              {!results ? 'Start your search' : 'No results found'}
            </h3>
            <p className="text-gray-600">
              {!results
                ? 'Enter a service, condition, or location to find providers near you.'
                : `We couldn't find any providers matching "${results.query}". Try adjusting your search or filters.`}
            </p>
          </div>
          {onRetry && results && (
            <Button onClick={onRetry} variant="outline" className="h-11 px-6">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

return (
<div className="h-full flex flex-col space-y-5 w-full max-w-[95vw] mx-auto">
<div className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
<div className="space-y-1">
<h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
{results.isFiltered ? (
<>Found {results.totalResults} filtered results</>
) : (
<>Found {results.totalResults} results for &quot;{results.query}&quot;</>
)}
</h2>
<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
<span className="flex items-center gap-2">
<Building className="h-4 w-4" />
{results.providers.length} Providers
</span>
<span className="flex items-center gap-2">
<Heart className="h-4 w-4" />
{results.services.length} Services Available
</span>
{results.isFiltered && (
<span className="flex items-center gap-2 text-emerald-700 font-medium">
Filter mode
</span>
)}
</div>
</div>
<div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
      <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
        <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Relevance
            </div>
          </SelectItem>
          {showDistance && (
            <SelectItem value="distance">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Distance
              </div>
            </SelectItem>
          )}
          <SelectItem value="rating">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rating
            </div>
          </SelectItem>
          <SelectItem value="name">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              Name
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {sortedProviders.length === 0 ? (
    <div className="flex-1 flex items-center justify-center">
      <Card className="p-6 text-center max-w-md">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No providers found matching your criteria.</p>
      </Card>
    </div>
  ) : (
    <div className="flex-1 min-h-0 overflow-hidden">
      <ScrollArea className="h-full pr-2 sm:pr-4">
        <div className="space-y-5 pb-4">
          {sortedProviders.map((provider) => {
            const topService = getProviderTopService(provider)
            const allServices = (provider.services && provider.services.length > 0)
              ? provider.services
              : results.services.filter(s => s.provider_id === provider._id)
            return (
              <ProviderCard
                key={provider._id}
                provider={provider}
                services={allServices}
                topService={topService}
                onGetDirections={(p) => handleProviderAction('directions', p)}
                onCallProvider={(p) => handleProviderAction('call', p)}
                onVisitWebsite={(p: Provider) => handleProviderAction('website', p)}
                onViewDetails={(p: Provider) => handleProviderAction('details', p)}
                showDistance={showDistance}
                compact={compact}
              />
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )}

  <ProviderDetailsModal
    provider={selectedProvider}
    services={selectedProvider ? results?.services.filter(s => s.provider_id === selectedProvider._id) || [] : []}
    isOpen={isDetailsModalOpen}
    onClose={() => {
      setIsDetailsModalOpen(false)
      setSelectedProvider(null)
    }}
    onGetDirections={(p) => handleProviderAction('directions', p)}
    onCallProvider={(p) => handleProviderAction('call', p)}
    onVisitWebsite={(p) => handleProviderAction('website', p)}
    showDistance={showDistance}
  />
</div>
)
}