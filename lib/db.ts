

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
  value: any
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

// Define the database
export class HealthcareDB extends Dexie {
  recentSearches!: Table<RecentSearch>
  userPreferences!: Table<UserPreference>
  savedProviders!: Table<SavedProvider>

  constructor() {
    super('HealthcareFinderDB')
    
    this.version(1).stores({
      recentSearches: '++id, query, location, timestamp',
      userPreferences: '++id, key, timestamp',
      savedProviders: '++id, providerId, savedAt'
    })
  }
}

// Create and export the database instance
export const db = new HealthcareDB()

// Helper functions for common operations
export const saveRecentSearch = async (query: string, location?: string, resultCount?: number) => {
  try {
    // Remove old searches if we have too many (keep last 20)
    const count = await db.recentSearches.count()
    if (count >= 20) {
      const oldestSearches = await db.recentSearches
        .orderBy('timestamp')
        .limit(count - 19)
        .toArray()
      
      await db.recentSearches.bulkDelete(oldestSearches.map(s => s.id!))
    }

    // Add new search
    await db.recentSearches.add({
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
    return await db.recentSearches
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray()
  } catch (error) {
    console.error('Error getting recent searches:', error)
    return []
  }
}

export const saveUserPreference = async (key: string, value: any) => {
  try {
    // Update or insert preference
    const existing = await db.userPreferences.where('key').equals(key).first()
    if (existing) {
      await db.userPreferences.update(existing.id!, { value, timestamp: new Date() })
    } else {
      await db.userPreferences.add({ key, value, timestamp: new Date() })
    }
  } catch (error) {
    console.error('Error saving user preference:', error)
  }
}

export const getUserPreference = async (key: string, defaultValue?: any) => {
  try {
    const preference = await db.userPreferences.where('key').equals(key).first()
    return preference ? preference.value : defaultValue
  } catch (error) {
    console.error('Error getting user preference:', error)
    return defaultValue
  }
}