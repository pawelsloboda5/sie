

import Dexie, { Table } from 'dexie'

// Define interfaces for our data
export interface RecentSearch {
  id?: number
  query: string
  location?: string
  timestamp: Date
  resultCount?: number
}

export interface UserPreference {
  id?: number
  key: string
  value: string | number | boolean | object
  timestamp: Date
}

export interface SavedProvider {
  id?: number
  providerId: string
  providerName: string
  providerAddress: string
  savedAt: Date
  notes?: string
}

// Server-side collections live in Mongo/Cosmos; this interface mirrors the
// pre-processed Businesses collection shape for cross-referencing on provider pages.
// Many fields are optional because upstream sources vary.
export interface BusinessRecord {
  _id?: unknown
  'Google Maps URL'?: string
  'Category'?: string
  'Name'?: string
  'Phone'?: string
  'Website'?: string
  'email'?: string
  'Business Status'?: string
  'Address'?: string
  'Total Reviews'?: string | number
  'Booking Links'?: string
  'Rating'?: string | number
  'Hours'?: string
  search_keywords?: string[]
  jina_scraped?: boolean
  jina_title?: string
  jina_description?: string
  pages_analyzed?: number
  pages_data?: Array<{ url: string; title?: string }>
  services_offered?: {
    general_services?: Array<{ name: string; category?: string; description?: string; price_info?: string; is_free?: boolean; is_discounted?: boolean }>
    specialized_services?: Array<{ name: string; category?: string; description?: string; price_info?: string; is_free?: boolean; is_discounted?: boolean }>
    diagnostic_services?: Array<{ name: string; category?: string; description?: string; price_info?: string; is_free?: boolean; is_discounted?: boolean }>
  }
  insurance_accepted?: {
    major_providers?: string[]
    medicaid?: boolean
    medicare?: boolean
    self_pay_options?: boolean
    payment_plans?: boolean
    financial_assistance_programs?: string[]
    accepted_payment_methods?: string[]
    notes?: string
  }
  eligibility_requirements?: {
    age_groups?: string[]
    new_patients_accepted?: boolean
    geographic_restrictions?: string[]
    required_documentation?: string[]
    referral_notes?: string
    walk_ins_accepted?: boolean
    appointment_process?: string
    eligibility_restrictions?: string[]
  } | string[]
  referral_info?: {
    referral_required?: boolean
    self_referral_accepted?: boolean
    referral_sources?: string[]
    notes?: string
  }
  telehealth_info?: {
    telehealth_available?: boolean
    services_offered_virtually?: string[]
    platforms_used?: string[]
    scheduling_info?: string
  }
  accessibility_info?: Record<string, unknown>
  financial_assistance?: Record<string, unknown>
  documentation_requirements?: Record<string, unknown>
  special_programs?: Record<string, unknown>
  data_extraction_metadata?: Record<string, unknown>
}

// Add new interface for cached search results
export interface CachedSearchResult {
  id?: number
  query: string
  location?: string
  coordinates?: { latitude: number, longitude: number }
  providers: Record<string, unknown>[] // Replace any with generic object type
  services: Record<string, unknown>[]  // Replace any with generic object type
  timestamp: Date
  totalResults: number
}

// Define the database
export class HealthcareDB extends Dexie {
  recentSearches!: Table<RecentSearch>
  userPreferences!: Table<UserPreference>
  savedProviders!: Table<SavedProvider>
  cachedSearchResults!: Table<CachedSearchResult>

  constructor() {
    super('HealthcareFinderDB')
    
    this.version(1).stores({
      recentSearches: '++id, query, location, timestamp',
      userPreferences: '++id, key, timestamp',
      savedProviders: '++id, providerId, savedAt'
    })

    // Version 2: Add cached search results with proper compound index
    this.version(2).stores({
      recentSearches: '++id, query, location, timestamp',
      userPreferences: '++id, key, timestamp',
      savedProviders: '++id, providerId, savedAt',
      cachedSearchResults: '++id, query, timestamp, [query+location]' // Added compound index
    })
  }
}

// Lazy initialization to avoid server-side issues
let dbInstance: HealthcareDB | null = null

function getDB(): HealthcareDB {
  if (!dbInstance) {
    dbInstance = new HealthcareDB()
  }
  return dbInstance
}

// Export the getDB function for consistent access
export { getDB }

// Keep backward compatibility for existing code
export const db = getDB()

// Helper functions for common operations
export const saveRecentSearch = async (query: string, location?: string, resultCount?: number) => {
  try {
    const database = getDB()
    // Remove old searches if we have too many (keep last 20)
    const count = await database.recentSearches.count()
    if (count >= 20) {
      const oldestSearches = await database.recentSearches
        .orderBy('timestamp')
        .limit(count - 19)
        .toArray()
      
      await database.recentSearches.bulkDelete(oldestSearches.map(s => s.id!))
    }

    // Add new search
    await database.recentSearches.add({
      query,
      location,
      resultCount,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error saving recent search:', error)
  }
}

export const getRecentSearches = async (limit = 10): Promise<RecentSearch[]> => {
  try {
    const database = getDB()
    return await database.recentSearches
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray()
  } catch (error) {
    console.error('Error getting recent searches:', error)
    return []
  }
}

export const saveUserPreference = async (key: string, value: string | number | boolean | object) => {
  try {
    const database = getDB()
    // Update or insert preference
    const existing = await database.userPreferences.where('key').equals(key).first()
    if (existing) {
      await database.userPreferences.update(existing.id!, { value, timestamp: new Date() })
    } else {
      await database.userPreferences.add({ key, value, timestamp: new Date() })
    }
  } catch (error) {
    console.error('Error saving user preference:', error)
  }
}

export const getUserPreference = async (key: string, defaultValue?: string | number | boolean | object) => {
  try {
    const database = getDB()
    const preference = await database.userPreferences.where('key').equals(key).first()
    return preference ? preference.value : defaultValue
  } catch (error) {
    console.error('Error getting user preference:', error)
    return defaultValue
  }
}

// New caching helper functions
export const saveCachedSearchResult = async (searchData: CachedSearchResult) => {
  try {
    const database = getDB()
    
    // Keep only the most recent 5 search results to avoid storage bloat
    const count = await database.cachedSearchResults.count()
    
    if (count >= 5) {
      const oldestResults = await database.cachedSearchResults
        .orderBy('timestamp')
        .limit(count - 4)
        .toArray()
      
      await database.cachedSearchResults.bulkDelete(oldestResults.map(r => r.id!))
    }

    // Remove any existing result with the same query+location to avoid duplicates
    if (searchData.location) {
      await database.cachedSearchResults
        .where('[query+location]')
        .equals([searchData.query, searchData.location])
        .delete()
    } else {
      await database.cachedSearchResults
        .where('query')
        .equals(searchData.query)
        .and(result => !result.location)
        .delete()
    }

    // Add new cached result
    await database.cachedSearchResults.add({
      ...searchData,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error saving cached search result:', error)
    throw error // Re-throw so the caller can handle it
  }
}

export const getCachedSearchResult = async (query: string, location?: string): Promise<CachedSearchResult | null> => {
  try {
    const database = getDB()
    
    // Look for exact match with query and location
    let result: CachedSearchResult | undefined
    
    if (location) {
      result = await database.cachedSearchResults
        .where('[query+location]')
        .equals([query, location])
        .first()
    } else {
      result = await database.cachedSearchResults
        .where('query')
        .equals(query)
        .and(r => !r.location)
        .first()
    }

    if (!result) {
      return null
    }

    // Check if result is still fresh (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (result.timestamp < oneHourAgo) {
      // Result is stale, remove it
      await database.cachedSearchResults.delete(result.id!)
      return null
    }

    return result
  } catch (error) {
    console.error('Error getting cached search result:', error)
    return null
  }
}

export const clearOldCachedResults = async () => {
  try {
    const database = getDB()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    await database.cachedSearchResults
      .where('timestamp')
      .below(oneHourAgo)
      .delete()
    
    console.log('Cleared old cached results')
  } catch (error) {
    console.error('Error clearing old cached results:', error)
  }
}

export const clearAllCachedResults = async () => {
  try {
    const database = getDB()
    await database.cachedSearchResults.clear()
    console.log('Cleared all cached results')
  } catch (error) {
    console.error('Error clearing all cached results:', error)
  }
}