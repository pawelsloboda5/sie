// Shared Copilot data shapes

export type Coordinates = { latitude: number; longitude: number }

export type ServicePrice = {
  currency?: string
  raw?: string
  amounts?: number[]
  min?: number
  max?: number
  flat?: number
}

export type Service = {
  name: string
  category: string
  description?: string
  price?: ServicePrice
  priceInfoText?: string
  isFree: boolean
  isDiscounted: boolean
}

export type Provider = {
  _id: string
  id?: string
  name: string
  category: string
  phone?: string
  website?: string
  email?: string
  bookingUrl?: string
  rating?: number
  totalReviews?: number
  address?: string
  addressLine?: string
  city?: string
  state?: string
  postalCode?: string
  location?: {
    type: string
    coordinates: [number, number]
  }
  services: Service[]
  insurance?: {
    medicaid?: boolean
    medicare?: boolean
    selfPayOptions?: boolean
    paymentPlans?: boolean
    majorProviders?: string[]
  }
  telehealth?: {
    available?: boolean
    services?: string[]
    platforms?: string[]
  }
  distance?: number
  cheapestService?: Service
  priceRange?: { min: number; max: number }
  free_services?: number
  accepts_uninsured?: boolean
  // Some UI surfaces rely on this flag when present in documents
  ssn_required?: boolean
  // Flattened mirrors used in other parts of the app (optional)
  medicaid?: boolean
  medicare?: boolean
  telehealth_available?: boolean
  insurance_providers?: string[]
  searchScore?: number
}

export type SearchFilters = {
  freeOnly?: boolean
  acceptsUninsured?: boolean
  acceptsMedicaid?: boolean
  acceptsMedicare?: boolean
  ssnRequired?: boolean
  telehealthAvailable?: boolean
  insuranceProviders?: string[]
  serviceCategories?: string[]
  maxDistance?: number
  state?: string
  city?: string
  paymentPlans?: boolean
  maxPrice?: number
}

export type SearchResponse = {
  providers: Provider[]
  provider_count: number
  service_count: number
  total_available?: number
  search_params?: {
    query: string
    expanded_terms?: string[]
    location?: Coordinates | null
    filters?: SearchFilters
  }
}

export type FilterResponse = {
  providers: Provider[]
  total_count: number
  filters_applied?: SearchFilters
  location_used?: Coordinates | null
}

export type GeoForwardResult = {
  ok: boolean
  latitude?: number
  longitude?: number
  city?: string
  state?: string
  display?: string
}

export type GeoReverseResult = {
  ok: boolean
  latitude?: number
  longitude?: number
  city?: string
  state?: string
  display?: string
}

export type SummarizeResult = { answer?: string; follow_up_question?: string; selected_provider_ids?: string[] }


