

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

// Add new interface for cached search results
export interface CachedSearchResult {
  id?: number
  query: string
  location?: string
  coordinates?: { latitude: number, longitude: number }
  providers: any[] // Using any to avoid circular dependencies with Provider type
  services: any[]  // Using any to avoid circular dependencies with Service type
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
    console.log('🔧 Initializing new HealthcareDB instance')
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
    console.log('💾 saveCachedSearchResult: Starting cache operation')
    const database = getDB()
    console.log('💾 saveCachedSearchResult: Got database instance')
    
    // Keep only the most recent 5 search results to avoid storage bloat
    const count = await database.cachedSearchResults.count()
    console.log('💾 saveCachedSearchResult: Current cache count:', count)
    
    if (count >= 5) {
      const oldestResults = await database.cachedSearchResults
        .orderBy('timestamp')
        .limit(count - 4)
        .toArray()
      
      await database.cachedSearchResults.bulkDelete(oldestResults.map(r => r.id!))
      console.log('💾 saveCachedSearchResult: Cleaned up old cache entries:', oldestResults.length)
    }

    // Remove any existing result with the same query+location to avoid duplicates
    if (searchData.location) {
      await database.cachedSearchResults
        .where('[query+location]')
        .equals([searchData.query, searchData.location])
        .delete()
      console.log('💾 saveCachedSearchResult: Removed duplicate with location')
    } else {
      await database.cachedSearchResults
        .where('query')
        .equals(searchData.query)
        .and(result => !result.location)
        .delete()
      console.log('💾 saveCachedSearchResult: Removed duplicate without location')
    }

    // Add new cached result
    const newId = await database.cachedSearchResults.add({
      ...searchData,
      timestamp: new Date()
    })
    
    console.log('✅ saveCachedSearchResult: Successfully cached with ID:', newId)
    console.log('✅ Cached search result saved:', searchData.query)
  } catch (error) {
    console.error('❌ saveCachedSearchResult: Error saving cached search result:', error)
    throw error // Re-throw so the caller can handle it
  }
}

export const getCachedSearchResult = async (query: string, location?: string): Promise<CachedSearchResult | null> => {
  try {
    console.log('🔍 getCachedSearchResult: Looking for cached result:', { query, location })
    const database = getDB()
    
    // Look for exact match with query and location
    let result: CachedSearchResult | undefined
    
    if (location) {
      result = await database.cachedSearchResults
        .where('[query+location]')
        .equals([query, location])
        .first()
      console.log('🔍 getCachedSearchResult: Searched with location, found:', !!result)
    } else {
      result = await database.cachedSearchResults
        .where('query')
        .equals(query)
        .and(r => !r.location)
        .first()
      console.log('🔍 getCachedSearchResult: Searched without location, found:', !!result)
    }

    if (!result) {
      console.log('🔍 getCachedSearchResult: No cached result found')
      return null
    }

    // Check if result is still fresh (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (result.timestamp < oneHourAgo) {
      // Result is stale, remove it
      await database.cachedSearchResults.delete(result.id!)
      console.log('🔍 getCachedSearchResult: Cached result was stale, removed')
      return null
    }

    console.log('✅ getCachedSearchResult: Found fresh cached result:', {
      query: result.query,
      providerCount: result.providers.length,
      serviceCount: result.services.length,
      age: Math.round((Date.now() - result.timestamp.getTime()) / 1000 / 60) + ' minutes'
    })
    return result
  } catch (error) {
    console.error('❌ getCachedSearchResult: Error getting cached search result:', error)
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

// 🔧 DEBUG UTILITIES - Can be called from browser console
export const debugCache = {
  // Check all cached results
  listAll: async () => {
    try {
      const database = getDB()
      const results = await database.cachedSearchResults.toArray()
      console.log('📋 All cached results:', results)
      return results
    } catch (error) {
      console.error('❌ Error listing cached results:', error)
      return []
    }
  },
  
  // Check cache for specific query
  check: async (query: string, location?: string) => {
    try {
      const result = await getCachedSearchResult(query, location)
      console.log('🔍 Cache check result:', result)
      return result
    } catch (error) {
      console.error('❌ Error checking cache:', error)
      return null
    }
  },
  
  // Get database info
  info: async () => {
    try {
      const database = getDB()
      const count = await database.cachedSearchResults.count()
      const tables = database.tables.map(t => t.name)
      console.log('ℹ️ Database info:', { 
        name: database.name, 
        version: database.verno, 
        tables,
        cachedResultsCount: count 
      })
      return { name: database.name, version: database.verno, tables, cachedResultsCount: count }
    } catch (error) {
      console.error('❌ Error getting database info:', error)
      return null
    }
  },
  
  // Clear all cache
  clear: async () => {
    try {
      await clearAllCachedResults()
      console.log('✅ Cache cleared')
    } catch (error) {
      console.error('❌ Error clearing cache:', error)
    }
  }
}

// Make debugging available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugCache = debugCache
  console.log('🔧 Cache debugging available: window.debugCache')
}