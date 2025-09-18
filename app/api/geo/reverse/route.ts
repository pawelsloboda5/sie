export const runtime = 'edge'
export const preferredRegion = ['iad1']
import { NextRequest, NextResponse } from 'next/server'

// Azure Maps configuration
const AZURE_MAPS_KEY = process.env.AZURE_MAPS_KEY || ''

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }
    
    // If no Azure Maps key, return basic response
    if (!AZURE_MAPS_KEY) {
      return NextResponse.json({
        ok: true,
        display: 'Current Location',
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      })
    }
    
    // Azure Maps reverse geocoding
    const azureUrl = `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${lat},${lon}`
    
    const response = await fetch(azureUrl)
    const data = await response.json()
    
    if (data.addresses && data.addresses.length > 0) {
      const address = data.addresses[0].address
      return NextResponse.json({
        ok: true,
        display: address.freeformAddress || `${address.municipality || ''}, ${address.countrySubdivision || ''}`,
        city: address.municipality || address.municipalitySubdivision || '',
        state: address.countrySubdivision || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      })
    }
    
    // Fallback if no results
    return NextResponse.json({
      ok: true,
      display: 'Current Location',
      latitude: parseFloat(lat),
      longitude: parseFloat(lon)
    })
    
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to reverse geocode location' },
      { status: 500 }
    )
  }
}