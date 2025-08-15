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
    const res = await fetch(`/api/geo/reverse?lat=${latitude}&lon=${longitude}`)
    if (!res.ok) throw new Error('Reverse geocoding failed')
    const data = await res.json()
    return data.display || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  } catch (e) {
    console.error('Reverse geocoding failed:', e)
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  }
}

/**
 * Convert an address string to coordinates using forward geocoding
 * @param address - The address string to geocode
 * @returns Promise<Coordinates | undefined> - The coordinates or undefined if geocoding fails
 */
export async function forwardGeocode(address: string): Promise<Coordinates | undefined> {
  try {
    const res = await fetch(`/api/geo/forward?q=${encodeURIComponent(address)}`)
    if (!res.ok) throw new Error('Forward geocoding failed')
    const data = await res.json()
    if (data && data.ok) return { latitude: data.latitude, longitude: data.longitude }
    return undefined
  } catch (e) {
    console.error('Forward geocoding failed:', e)
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

// ---------------- Provider slug utilities (SEO) ----------------

function basicSlugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Build a stable provider slug. We include a short id suffix to avoid collisions
 * while keeping the URL human‑readable.
 */
export function buildProviderSlug(name: string, id?: string): string {
  const base = basicSlugify(name || 'provider')
  const suffix = id ? `-p-${String(id).slice(-6)}` : ''
  return `${base}${suffix}`
}

/** Extract the short id suffix from a provider slug, if present. */
export function extractProviderIdFromSlug(slug: string): string | undefined {
  const match = slug.match(/-p-([a-z0-9]{6})$/i)
  return match ? match[1] : undefined
}
