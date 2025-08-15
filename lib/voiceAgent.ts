// Voice Agent utilities and extended types
import { SavedProvider } from './db'

export interface SavedProviderExtended extends SavedProvider {
  phone?: string
  filters: {
    freeServicesOnly: boolean
    acceptsMedicaid: boolean
    acceptsMedicare: boolean
    acceptsUninsured: boolean
    noSSNRequired: boolean
    telehealthAvailable: boolean
  }
  featuredService: string
  category?: string
  appointmentSlots?: AppointmentSlot[]
}

export interface AppointmentSlot {
  providerId: string
  dateTime: string
  status: 'available' | 'scheduled' | 'failed'
  confirmationId?: string
}

export interface VoiceAgentProvider {
  _id: string
  name: string
  address: string
  phone: string
  filters: {
    freeServicesOnly: boolean
    acceptsMedicaid: boolean
    acceptsMedicare: boolean
    acceptsUninsured: boolean
    noSSNRequired: boolean
    telehealthAvailable: boolean
  }
  featuredService: string
  category: string
}

// Storage key for voice agent providers
export const VOICE_AGENT_STORAGE_KEY = 'voiceAgentProviders'

// Save a provider for voice agent scheduling
export const saveVoiceAgentProvider = (provider: VoiceAgentProvider): void => {
  try {
    const existing = getVoiceAgentProviders()
    const updated = [...existing.filter(p => p._id !== provider._id), provider]
    localStorage.setItem(VOICE_AGENT_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving voice agent provider:', error)
  }
}

// Get all saved voice agent providers
export const getVoiceAgentProviders = (): VoiceAgentProvider[] => {
  try {
    const stored = localStorage.getItem(VOICE_AGENT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading voice agent providers:', error)
    return []
  }
}

// Legacy functions - keeping for backward compatibility but not used with new favorites system
// Remove a provider from voice agent list
export const removeVoiceAgentProvider = (providerId: string): void => {
  try {
    const existing = getVoiceAgentProviders()
    const updated = existing.filter(p => p._id !== providerId)
    localStorage.setItem(VOICE_AGENT_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error removing voice agent provider:', error)
  }
}

// Update provider appointment status
export const updateProviderAppointment = (
  providerId: string, 
  appointment: AppointmentSlot
): void => {
  try {
    const providers = getVoiceAgentProviders()
    const provider = providers.find(p => p._id === providerId)
    
    if (provider) {
      // This would be implemented if we extend the VoiceAgentProvider interface
      console.log('Appointment updated:', appointment)
    }
  } catch (error) {
    console.error('Error updating provider appointment:', error)
  }
}

// Clear all voice agent providers
export const clearVoiceAgentProviders = (): void => {
  try {
    localStorage.removeItem(VOICE_AGENT_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing voice agent providers:', error)
  }
}

// Favorites functionality
export const FAVORITES_STORAGE_KEY = 'favoriteProviders'

export interface FavoriteProvider {
  _id: string
  name: string
  address: string
  phone?: string
  category: string
  savedAt: Date
  filters: {
    freeServicesOnly: boolean
    acceptsMedicaid: boolean
    acceptsMedicare: boolean
    acceptsUninsured: boolean
    noSSNRequired: boolean
    telehealthAvailable: boolean
  }
}

// Save a provider to favorites
export const saveFavoriteProvider = (provider: FavoriteProvider): void => {
  try {
    // Validate that the provider has a valid MongoDB ObjectId
    if (!provider._id || typeof provider._id !== 'string' || provider._id.length !== 24) {
      console.warn('Provider ID may not be a valid MongoDB ObjectId:', provider._id)
    }
    
    console.log('Saving favorite provider:', provider.name, 'with ID:', provider._id)
    
    const existing = getFavoriteProviders()
    const updated = [...existing.filter(p => p._id !== provider._id), provider]
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated))
    
    console.log('Successfully saved favorite provider. Total favorites:', updated.length)
  } catch (error) {
    console.error('Error saving favorite provider:', error)
  }
}

// Get all favorite providers
export const getFavoriteProviders = (): FavoriteProvider[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading favorite providers:', error)
    return []
  }
}

// Remove a provider from favorites
export const removeFavoriteProvider = (providerId: string): void => {
  try {
    const existing = getFavoriteProviders()
    const updated = existing.filter(p => p._id !== providerId)
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error removing favorite provider:', error)
  }
}

// Check if provider is favorited
export const isProviderFavorited = (providerId: string): boolean => {
  try {
    const favorites = getFavoriteProviders()
    return favorites.some(p => p._id === providerId)
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return false
  }
}

// Toggle favorite status
export const toggleFavoriteProvider = (provider: FavoriteProvider): boolean => {
  try {
    if (isProviderFavorited(provider._id)) {
      removeFavoriteProvider(provider._id)
      return false
    } else {
      saveFavoriteProvider(provider)
      return true
    }
  } catch (error) {
    console.error('Error toggling favorite provider:', error)
    return false
  }
}

// Get featured service for a provider (this would normally fetch from your services API)
export const getFeaturedServiceForProvider = async (providerId: string): Promise<string> => {
  try {
    // In a real implementation, this would call your services API
    // For now, return a default message
    return 'Healthcare services available - call for details'
  } catch (error) {
    console.error('Error getting featured service:', error)
    return 'Healthcare services available'
  }
}

// Convert FavoriteProvider to VoiceAgentProvider format for AgentCallSimulator
export const convertFavoriteToVoiceAgent = (favorite: FavoriteProvider): VoiceAgentProvider => {
  return {
    _id: favorite._id,
    name: favorite.name,
    address: favorite.address,
    phone: favorite.phone || '',
    filters: favorite.filters,
    featuredService: 'Healthcare services available', // Will be updated when we fetch services
    category: favorite.category
  }
}
