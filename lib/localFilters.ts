import type { Coordinates } from "./utils"
import type { CachedSearchResult } from "./db"

// Local filter options interface
export interface LocalFilterOptions {
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
}

// Provider and Service types (mirrors the types from components)
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
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
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

// Distance calculation utility (mirrors server-side calculation)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Filter providers locally based on criteria
export function filterProvidersLocally(
  providers: Provider[],
  services: Service[],
  filters: LocalFilterOptions,
  userLocation?: Coordinates
): Provider[] {
  let filteredProviders = [...providers]

  // Basic provider filters
  if (filters.acceptsUninsured) {
    filteredProviders = filteredProviders.filter(p => p.accepts_uninsured === true)
  }

  if (filters.acceptsMedicaid) {
    filteredProviders = filteredProviders.filter(p => p.medicaid === true)
  }

  if (filters.acceptsMedicare) {
    filteredProviders = filteredProviders.filter(p => p.medicare === true)
  }

  if (filters.ssnRequired === false) {
    filteredProviders = filteredProviders.filter(p => p.ssn_required === false)
  }

  if (filters.telehealthAvailable) {
    filteredProviders = filteredProviders.filter(p => p.telehealth_available === true)
  }

  // Insurance provider filtering
  if (filters.insuranceProviders && filters.insuranceProviders.length > 0) {
    filteredProviders = filteredProviders.filter(p => 
      p.insurance_providers.some(insurance => 
        filters.insuranceProviders!.includes(insurance)
      )
    )
  }

  // Provider type filtering (based on category)
  if (filters.providerTypes && filters.providerTypes.length > 0) {
    filteredProviders = filteredProviders.filter(p => 
      filters.providerTypes!.includes(p.category)
    )
  }

  // Rating filtering
  if (filters.minRating && filters.minRating > 0) {
    filteredProviders = filteredProviders.filter(p => 
      (p.rating || 0) >= filters.minRating!
    )
  }

  // Distance filtering
  if (userLocation && filters.maxDistance) {
    filteredProviders = filteredProviders.map(provider => {
      if (provider.location?.coordinates) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          provider.location.coordinates[1], // latitude
          provider.location.coordinates[0]  // longitude
        )
        return { ...provider, distance }
      }
      return provider
    }).filter(p => !p.distance || p.distance <= filters.maxDistance!)
  }

  // FreeOnly filter - remove providers that have NO free services
  if (filters.freeOnly) {
    const providersWithFreeServices = new Set<string>()
    services.forEach(service => {
      if (service.is_free) {
        providersWithFreeServices.add(service.provider_id)
      }
    })
    
    filteredProviders = filteredProviders.filter(provider => 
      providersWithFreeServices.has(provider._id)
    )
  }

  return filteredProviders
}

// Filter services locally based on criteria
export function filterServicesLocally(
  services: Service[],
  filters: LocalFilterOptions
): Service[] {
  let filteredServices = [...services]

  // Free only filter
  if (filters.freeOnly) {
    filteredServices = filteredServices.filter(s => s.is_free === true)
  }

  // Service category filtering
  if (filters.serviceCategories && filters.serviceCategories.length > 0) {
    filteredServices = filteredServices.filter(s => 
      filters.serviceCategories!.includes(s.category)
    )
  }

  return filteredServices
}

// Enhanced scoring for providers based on free services
function calculateEnhancedProviderScore(
  provider: Provider,
  providerServices: Service[],
  filters: LocalFilterOptions
): number {
  let enhancedScore = provider.searchScore || 0

  // Count free and total services for this provider
  const freeServices = providerServices.filter(s => s.is_free)
  const totalServiceCount = providerServices.length

  // AMAZING BONUS for free services
  if (freeServices.length > 0) {
    enhancedScore *= (1 + freeServices.length * 5) // 500% boost per free service!
    enhancedScore += freeServices.length * 100 // Additional flat bonus
  }

  // MAJOR BONUS for total service count
  if (totalServiceCount > 0) {
    enhancedScore *= (1 + Math.log(totalServiceCount + 1) * 0.5) // Logarithmic scaling
    enhancedScore += totalServiceCount * 10 // Flat bonus per service
  }

  // SUPER BONUS for providers that are primarily free service focused
  const freeServiceRatio = totalServiceCount > 0 ? freeServices.length / totalServiceCount : 0
  if (freeServiceRatio > 0.5) { // More than 50% free services
    enhancedScore *= 3 // Triple the score!
  } else if (freeServiceRatio > 0.25) { // More than 25% free services
    enhancedScore *= 2 // Double the score!
  }

  // RELEVANCE BONUS for filter-matched services
  const relevantServices = providerServices.filter(s => (s.searchScore || 0) > 0.1)
  if (relevantServices.length > 0) {
    const avgServiceScore = relevantServices.reduce((sum, s) => sum + (s.searchScore || 0), 0) / relevantServices.length
    enhancedScore += avgServiceScore * 20 // Amplify service relevance
  }

  return enhancedScore
}

// Sort providers locally with enhanced scoring
export function sortProvidersLocally(
  providers: Provider[],
  services: Service[],
  sortBy: 'distance' | 'rating' | 'name' | 'relevance',
  filters: LocalFilterOptions
): Provider[] {
  const providersWithScores = providers.map(provider => {
    const providerServices = services.filter(s => s.provider_id === provider._id)
    const enhancedScore = calculateEnhancedProviderScore(provider, providerServices, filters)
    
    return {
      ...provider,
      searchScore: enhancedScore
    }
  })

  switch (sortBy) {
    case 'distance':
      return providersWithScores.sort((a, b) => {
        // Primary sort by distance
        if (!a.distance && !b.distance) return 0
        if (!a.distance) return 1
        if (!b.distance) return -1
        if (a.distance !== b.distance) return a.distance - b.distance
        
        // Secondary sort by enhanced score
        return (b.searchScore || 0) - (a.searchScore || 0)
      })

    case 'rating':
      return providersWithScores.sort((a, b) => {
        // Primary sort by rating
        const aRating = a.rating || 0
        const bRating = b.rating || 0
        if (aRating !== bRating) return bRating - aRating
        
        // Secondary sort by enhanced score
        return (b.searchScore || 0) - (a.searchScore || 0)
      })

    case 'name':
      return providersWithScores.sort((a, b) => {
        // Primary sort by name
        const nameComparison = a.name.localeCompare(b.name)
        if (nameComparison !== 0) return nameComparison
        
        // Secondary sort by enhanced score
        return (b.searchScore || 0) - (a.searchScore || 0)
      })

    case 'relevance':
    default:
      // Sort by enhanced score (relevance first)
      return providersWithScores.sort((a, b) => {
        return (b.searchScore || 0) - (a.searchScore || 0)
      })
  }
}

// Main function to apply all local filters
export function applyLocalFilters(
  cachedResult: CachedSearchResult,
  filters: LocalFilterOptions,
  userLocation?: Coordinates
): { providers: Provider[], services: Service[] } {
  try {
    // Start with original data from cache
    const originalProviders = cachedResult.providers as Provider[]
    const originalServices = cachedResult.services as Service[]

    // Apply filters to services first
    const filteredServices = filterServicesLocally(originalServices, filters)

    // Apply filters to providers
    const filteredProviders = filterProvidersLocally(
      originalProviders, 
      filteredServices, // Use filtered services for provider filtering
      filters, 
      userLocation
    )

    // If we have providers, filter services to only include those from remaining providers
    let finalServices = filteredServices
    if (filteredProviders.length > 0) {
      const remainingProviderIds = new Set(filteredProviders.map(p => p._id))
      finalServices = filteredServices.filter(service => 
        remainingProviderIds.has(service.provider_id)
      )
    }

    console.log(`Local filtering applied: ${filteredProviders.length} providers, ${finalServices.length} services`)
    
    return {
      providers: filteredProviders,
      services: finalServices
    }
  } catch (error) {
    console.error('Error applying local filters:', error)
    // Return original data on error
    return {
      providers: cachedResult.providers as Provider[],
      services: cachedResult.services as Service[]
    }
  }
}

// Utility to check if any meaningful filters are active
export function hasActiveFilters(filters: LocalFilterOptions): boolean {
  return !!(
    filters.freeOnly ||
    filters.acceptsUninsured ||
    filters.acceptsMedicaid ||
    filters.acceptsMedicare ||
    filters.ssnRequired === false ||
    filters.telehealthAvailable ||
    (filters.maxDistance && filters.maxDistance < 50) ||
    (filters.insuranceProviders && filters.insuranceProviders.length > 0) ||
    (filters.serviceCategories && filters.serviceCategories.length > 0) ||
    (filters.providerTypes && filters.providerTypes.length > 0) ||
    (filters.minRating && filters.minRating > 0)
  )
}

// Utility to get filter summary for debugging
export function getFilterSummary(filters: LocalFilterOptions): string {
  const activeFilters = []
  
  if (filters.freeOnly) activeFilters.push('Free Only')
  if (filters.acceptsUninsured) activeFilters.push('Accepts Uninsured')
  if (filters.acceptsMedicaid) activeFilters.push('Accepts Medicaid')
  if (filters.acceptsMedicare) activeFilters.push('Accepts Medicare')
  if (filters.ssnRequired === false) activeFilters.push('No SSN Required')
  if (filters.telehealthAvailable) activeFilters.push('Telehealth Available')
  if (filters.maxDistance && filters.maxDistance < 50) activeFilters.push(`Distance: ${filters.maxDistance}mi`)
  if (filters.insuranceProviders?.length) activeFilters.push(`Insurance: ${filters.insuranceProviders.length}`)
  if (filters.serviceCategories?.length) activeFilters.push(`Services: ${filters.serviceCategories.length}`)
  if (filters.providerTypes?.length) activeFilters.push(`Types: ${filters.providerTypes.length}`)
  if (filters.minRating) activeFilters.push(`Rating: ${filters.minRating}+`)
  
  return activeFilters.length > 0 ? activeFilters.join(', ') : 'No filters'
} 