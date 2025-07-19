import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Geocoding utilities
export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Convert coordinates to a readable address using reverse geocoding
 * @param latitude - The latitude coordinate
 * @param longitude - The longitude coordinate
 * @returns Promise<string> - The formatted address or coordinates as fallback
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }
    
    const data = await response.json()
    
    if (data && data.display_name) {
      // Extract city, state, zip from the address components
      const address = data.address || {}
      const parts = []
      
      // Add city
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village)
      }
      
      // Add state
      if (address.state) {
        parts.push(address.state)
      }
      
      // Add postal code
      if (address.postcode) {
        parts.push(address.postcode)
      }
      
      // If we have structured parts, use them; otherwise use display_name
      if (parts.length > 0) {
        return parts.join(', ')
      } else {
        // Fallback to a shorter version of display_name
        const displayParts = data.display_name.split(',').slice(0, 3)
        return displayParts.join(',').trim()
      }
    }
    
    // Fallback to coordinates if geocoding fails
    return `${latitude}, ${longitude}`
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    // Fallback to coordinates if geocoding fails
    return `${latitude}, ${longitude}`
  }
}

/**
 * Convert an address string to coordinates using forward geocoding
 * @param address - The address string to geocode
 * @returns Promise<Coordinates | undefined> - The coordinates or undefined if geocoding fails
 */
export async function forwardGeocode(address: string): Promise<Coordinates | undefined> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }
    
    const data = await response.json()
    
    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      }
    }
    
    return undefined
  } catch (error) {
    console.error('Forward geocoding failed:', error)
    return undefined
  }
}

/**
 * Parse a location string that could be either coordinates or an address
 * @param locationString - The location string to parse
 * @returns Promise<Coordinates | undefined> - The coordinates or undefined if parsing fails
 */
export async function parseLocationString(locationString: string): Promise<Coordinates | undefined> {
  // Check if it's coordinates (latitude, longitude)
  const coordMatch = locationString.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
  if (coordMatch) {
    return {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2])
    }
  }
  
  // For text addresses, use forward geocoding
  return await forwardGeocode(locationString)
}
