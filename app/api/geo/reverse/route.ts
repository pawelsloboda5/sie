import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for reverse geocoding to avoid client-side CORS issues.
// Uses OpenStreetMap Nominatim with proper headers and light caching.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    if (!lat || !lon) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`

    const res = await fetch(url, {
      headers: {
        // Follow Nominatim usage policy: identify the application
        'User-Agent': 'SIE-Wellness/1.0 (www.sie2.com) contact: hello@siewellness.org',
        'Accept': 'application/json'
      },
      // Cache server-side for 1 hour to reduce calls
      next: { revalidate: 3600 }
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'geocoding_failed', status: res.status }, { status: 502 })
    }

    const data = await res.json()
    const address = data?.address || {}
    const city = address.city || address.town || address.village || ''
    const state = address.state || ''
    const postcode = address.postcode || ''
    const display = [city, state, postcode].filter(Boolean).join(', ')

    return NextResponse.json({ ok: true, display, address: data?.address, raw: data }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
    })
  } catch (e) {
    return NextResponse.json({ error: 'proxy_error' }, { status: 500 })
  }
}


