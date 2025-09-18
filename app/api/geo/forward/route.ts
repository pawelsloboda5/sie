export const runtime = 'edge'
export const preferredRegion = ['iad1']
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const country = (searchParams.get('country') || 'us').toLowerCase()
    if (!q) return NextResponse.json({ error: 'q required' }, { status: 400 })

    // Prefer US by default to avoid resolving "dc" to non‑US regions
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1&countrycodes=${encodeURIComponent(country)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SIE-Wellness/1.0 (www.sie2.com) contact: hello@siewellness.org',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })
    if (!res.ok) return NextResponse.json({ error: 'geocoding_failed', status: res.status }, { status: 502 })
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return NextResponse.json({ ok: false })
    const first = data[0]
    const address = first.address || {}
    return NextResponse.json({ 
      ok: true, 
      latitude: parseFloat(first.lat), 
      longitude: parseFloat(first.lon),
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      display: first.display_name || q,
      raw: first 
    }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' }
    })
  } catch {
    return NextResponse.json({ error: 'proxy_error' }, { status: 500 })
  }
}


