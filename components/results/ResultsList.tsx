"use client"

import React, { useState, useMemo } from "react"
import { ProviderCard } from "./ProviderCard"
import { ProviderDetailsModal } from "../provider/ProviderDetailsModal"
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
  provider?: Provider
  searchScore?: number
}

interface SearchResults {
  providers: Provider[]
  services: Service[]
  query: string
  totalResults: number
  isFiltered?: boolean
}

interface ResultsListProps {
  results: SearchResults | null
  isLoading: boolean
  onRetry?: () => void
  onProviderAction?: (action: string, provider: Provider) => void
  showDistance?: boolean
  compact?: boolean
}

type SortOption = 'relevance' | 'distance' | 'rating' | 'name'

export function ResultsList({ 
  results, 
  isLoading, 
  onRetry, 
  onProviderAction,
  showDistance = true,
  compact = false 
}: ResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const sortedProviders = useMemo(() => {
    if (!results?.providers) return []
    
    const providers = [...results.providers]
    
    switch (sortBy) {
      case 'distance':
        return providers.sort((a, b) => {
          // Primary sort by distance
          if (!a.distance && !b.distance) return 0
          if (!a.distance) return 1
          if (!b.distance) return -1
          if (a.distance !== b.distance) return a.distance - b.distance
          
          // Secondary sort by relevance score (which already includes free service bonuses)
          return (b.searchScore || 0) - (a.searchScore || 0)
        })
      case 'rating':
        return providers.sort((a, b) => {
          // Primary sort by rating
          if (a.rating !== b.rating) return b.rating - a.rating
          
          // Secondary sort by relevance score (which already includes free service bonuses)
          return (b.searchScore || 0) - (a.searchScore || 0)
        })
      case 'name':
        return providers.sort((a, b) => {
          // Primary sort by name
          const nameComparison = a.name.localeCompare(b.name)
          if (nameComparison !== 0) return nameComparison
          
          // Secondary sort by relevance score (which already includes free service bonuses)
          return (b.searchScore || 0) - (a.searchScore || 0)
        })
      case 'relevance':
      default:
        // Trust the backend relevance-first scoring completely
        return providers.sort((a, b) => {
          return (b.searchScore || 0) - (a.searchScore || 0)
        })
    }
  }, [results?.providers, sortBy])

  // Get the most relevant service for each provider
  const getProviderTopService = (providerId: string) => {
    if (!results?.services) return null
    const providerServices = results.services.filter(s => s.provider_id === providerId)
    if (providerServices.length === 0) return null
    
    // Prioritize free services, then discounted, then by search score
    const freeServices = providerServices.filter(s => s.is_free)
    if (freeServices.length > 0) {
      return freeServices.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))[0]
    }
    
    const discountedServices = providerServices.filter(s => s.is_discounted)
    if (discountedServices.length > 0) {
      return discountedServices.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))[0]
    }
    
    return providerServices.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))[0]
  }

  const handleProviderAction = (action: string, provider: Provider) => {
    switch (action) {
      case 'call':
        if (provider.phone) {
          window.open(`tel:${provider.phone}`, '_self')
        }
        break
      case 'directions':
        const address = encodeURIComponent(provider.address)
        window.open(`https://maps.google.com/maps?q=${address}`, '_blank')
        break
      case 'website':
        if (provider.website) {
          window.open(provider.website, '_blank')
        }
        break
      case 'details':
        setSelectedProvider(provider)
        setIsDetailsModalOpen(true)
        break
    }
    
    onProviderAction?.(action, provider)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-40" />
        </div>
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
      </div>
    )
  }

  // Empty State
  if (!results || (results.providers.length === 0 && results.services.length === 0)) {
    return (
      <Card className="p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center space-y-6">
          <Search className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {!results ? 'Start your search' : 'No results found'}
            </h3>
            <p className="text-gray-600 max-w-md text-base sm:text-lg leading-relaxed">
              {!results 
                ? 'Enter a service, condition, or location to find healthcare providers near you.'
                : `We couldn't find any providers matching "${results.query}". Try adjusting your search terms or filters.`
              }
            </p>
          </div>
          {onRetry && results && (
            <Button onClick={onRetry} variant="outline" className="mt-4 h-12 px-6 text-base font-medium">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Results Header */}
      <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-xl lg:text-2xl font-semibold text-gray-900 break-words">
            {results.isFiltered ? (
              <>Found {results.totalResults} filtered results</>
            ) : (
              <>Found {results.totalResults} results for &quot;{results.query}&quot;</>
            )}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {results.providers.length} Providers
            </span>
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {results.services.length} Services Available
            </span>
            {results.isFiltered && (
              <span className="flex items-center gap-2 text-primary font-medium">
                <Search className="h-4 w-4" />
                Filter Mode
              </span>
            )}
          </div>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-40 h-12">
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

      {/* Provider Results */}
          {sortedProviders.length === 0 ? (
            <Card className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No providers found matching your criteria.</p>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] sm:h-[800px] pr-2 sm:pr-4">
              <div className="space-y-4 sm:space-y-6">
            {sortedProviders.map((provider) => {
              const topService = getProviderTopService(provider._id)
              const allServices = results.services.filter(s => s.provider_id === provider._id)
              
              return (
                  <ProviderCard
                    key={provider._id}
                    provider={provider}
                  services={allServices}
                  topService={topService}
                    onGetDirections={(p) => handleProviderAction('directions', p)}
                    onCallProvider={(p) => handleProviderAction('call', p)}
                    onVisitWebsite={(p) => handleProviderAction('website', p)}
                    onViewDetails={(p) => handleProviderAction('details', p)}
                    showDistance={showDistance}
                    compact={compact}
                  />
              )
            })}
              </div>
            </ScrollArea>
          )}

      {/* Provider Details Modal */}
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