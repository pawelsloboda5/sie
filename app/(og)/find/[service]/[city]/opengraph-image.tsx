import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function titleize(s: string) { return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }

export default async function Image({ params }: { params: { service: string; city: string } }) {
  const service = titleize(params.service)
  const city = titleize(params.city)
  return new ImageResponse(
    (
      <div style={{
        fontSize: 44,
        color: '#0B1324',
        background: 'linear-gradient(135deg,#EAF4EF,#EAF2FF)',
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
      }}>
        <div style={{ fontSize: 24, marginBottom: 12, color: '#068282' }}>SIE Wellness</div>
        <div style={{ fontWeight: 800, textAlign: 'center', maxWidth: 1000 }}>Free & Low‑Cost {service} in {city}</div>
      </div>
    ),
    { ...size }
  )
}


