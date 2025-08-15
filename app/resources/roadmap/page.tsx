import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import path from 'node:path'
import fs from 'node:fs/promises'
import { AppHeader } from '@/app/app/header'

export const metadata: Metadata = {
  title: 'Product Roadmap | SIE Wellness',
  description: "See what we've shipped and what's coming next for SIE Wellness. Our roadmap focuses on helpful, trustworthy care discovery at scale.",
  alternates: { canonical: '/resources/roadmap' },
  robots: { index: false, follow: true },
}

type Analysis = {
  total_documents?: number
  service_analysis?: {
    total_services?: number
    total_free_services?: number
    businesses_with_services?: number
    businesses_without_services?: number
  }
  location_analysis?: {
    geocoded?: number
    not_geocoded?: number
    geocoding_success_rate?: number
  }
  insurance_analysis?: {
    accepts_uninsured?: number
  }
}

async function getDataSummary() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'businesses_analysis_20250815_022416.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    const j: Analysis = JSON.parse(raw)

    const totalDocs = j.total_documents ?? 0
    const withServices = j.service_analysis?.businesses_with_services ?? 0
    const totalServices = j.service_analysis?.total_services ?? 0
    const freeServices = j.service_analysis?.total_free_services ?? 0
    const geocoded = j.location_analysis?.geocoded ?? 0
    const geocodeRate = j.location_analysis?.geocoding_success_rate ?? undefined
    const acceptsUninsured = j.insurance_analysis?.accepts_uninsured ?? undefined

    return {
      totalDocs,
      withServices,
      totalServices,
      freeServices,
      geocoded,
      geocodeRate,
      acceptsUninsured,
    }
  } catch {
    return null
  }
}

export default async function RoadmapPage() {
  const s = await getDataSummary()

  return (
    <main>
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_-10%,#E6F7EF_25%,transparent),radial-gradient(700px_350px_at_80%_-5%,#E9F1FF_25%,transparent)] -z-10" />
        <div className="container py-14 md:py-20 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/SIE Prim_teal.png"
              alt="SIE Wellness"
              width={180}
              height={72}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-display-lg mb-3">Product Roadmap</h1>
          <p className="text-body-base text-muted-foreground max-w-2xl mx-auto">What we&apos;ve shipped, what&apos;s next, and how our data pipeline powers better care discovery.</p>
        </div>
      </section>

      <div className="container py-10">
        {s && (
          <section className="mb-12">
            <h2 className="text-h3 mb-3">Current data footprint</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-xl border bg-card p-4 card-shadow">
                <div className="text-sm text-muted-foreground">Businesses</div>
                <div className="text-2xl font-semibold">{s.totalDocs.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-card p-4 card-shadow">
                <div className="text-sm text-muted-foreground">With services mapped</div>
                <div className="text-2xl font-semibold">{s.withServices.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-card p-4 card-shadow">
                <div className="text-sm text-muted-foreground">Total services</div>
                <div className="text-2xl font-semibold">{s.totalServices.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-card p-4 card-shadow">
                <div className="text-sm text-muted-foreground">Free services</div>
                <div className="text-2xl font-semibold">{s.freeServices.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-card p-4 card-shadow">
                <div className="text-sm text-muted-foreground">Geocoded</div>
                <div className="text-2xl font-semibold">{s.geocoded.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-card p-4 card-shadow">
                <div className="text-sm text-muted-foreground">Geo success rate</div>
                <div className="text-2xl font-semibold">{s.geocodeRate != null ? `${s.geocodeRate.toFixed(2)}%` : '—'}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Source: internal multi‑agent pipeline analysis.</p>
          </section>
        )}

        {/* Multi‑Agent Healthcare Data Extractor Overview */}
        <section className="mb-12">
          <h2 className="text-h3 mb-3">Multi‑Agent Healthcare Data Extractor</h2>
          <p className="text-body-base text-foreground/90 mb-6">
            A powerful AI‑driven system that extracts comprehensive healthcare information from business websites using multiple specialized agents working in parallel. Designed to support vulnerable populations including people impacted by Medicaid cuts, immigrants, and low‑income families.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-6 card-shadow">
              <h3 className="text-h4 mb-3">Key capabilities</h3>
              <ul className="list-disc pl-6 space-y-2 text-body-base">
                <li>7 specialized AI agents running in parallel with intelligent URL selection</li>
                <li>Free & discounted service detection with deep keyword + model analysis</li>
                <li>SSN requirement detection for undocumented‑friendly care</li>
                <li>Languages, accessibility, and transportation details extraction</li>
                <li>Sliding scale, self‑pay options, and financial assistance detection</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6 card-shadow">
              <h3 className="text-h4 mb-3">Data we extract</h3>
              <ul className="list-disc pl-6 space-y-2 text-body-base">
                <li>Services offered with free/discount flags ({s?.freeServices?.toLocaleString() || '—'} free mapped)</li>
                <li>Insurance accepted, Medicaid/Medicare, self‑pay & payment plans</li>
                <li>Eligibility: documentation, age groups, new patient policies</li>
                <li>Accessibility: languages, interpretation, walk‑ins, transportation</li>
                <li>Financial assistance and uninsured acceptance ({s?.acceptsUninsured?.toLocaleString() || '—'} accepting uninsured)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-h3 mb-3">Shipped</h2>
          <ul className="list-disc pl-6 space-y-1 text-body-base">
            <li>Faster care discovery with clear, local results</li>
            <li>Thousands of provider pages with easy contact info, directions, and services</li>
            <li>City & service pages that explain options and answer common questions</li>
            <li>Reliable addresses and maps with a mobile‑friendly experience</li>
            <li>Helpful filters: uninsured, no SSN, telehealth, and free/discounted services</li>
            <li>Consistent, clean design and shareable previews when you send links</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-h3 mb-3">Next (30–60 days)</h2>
          <ul className="list-disc pl-6 space-y-1 text-body-base">
            <li>Nationwide coverage: grow from ~5,000 to 100,000+ providers and facilities</li>
            <li>Provider beta: AI agent scheduler that books appointments for patients</li>
            <li>More guides and how‑tos to help people prepare for visits</li>
            <li>Richer provider details (insurance, languages, hours, eligibility)</li>
            <li>Stronger local pages, including neighborhood hubs in top metros</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-h3 mb-3">Later (60–120+ days)</h2>
          <ul className="list-disc pl-6 space-y-1 text-body-base">
            <li>Preventive Care Plan with transparent pricing (phased rollout)</li>
            <li>Internationalization and localized content (hreflang)</li>
            <li>Additional structured data (opening hours, price ranges) where reliable</li>
            <li>Quality signals: editorial bylines, review workflow, and source citations</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-h3 mb-3">How the data pipeline works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-card p-6 card-shadow">
              <h3 className="text-h4 mb-2">1) Data sources</h3>
              <ul className="list-disc pl-6 space-y-2 text-body-base">
                <li>Web scraping across healthcare verticals in DMV cities</li>
                <li>CSV ingestion preserving original fields</li>
                <li>Google Places, Yelp, and official sites</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6 card-shadow">
              <h3 className="text-h4 mb-2">2) Enhanced analysis</h3>
              <ul className="list-disc pl-6 space-y-2 text-body-base">
                <li>Jina.ai content extraction on websites</li>
                <li>Azure OpenAI for service, SSN, insurance, and assistance detection</li>
                <li>Smart keyword + fuzzy matching fallback (95+ terms)</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6 card-shadow">
              <h3 className="text-h4 mb-2">3) Processing & output</h3>
              <ul className="list-disc pl-6 space-y-2 text-body-base">
                <li>Normalization, deduplication, geocoding ({s?.geocodeRate != null ? `${s.geocodeRate.toFixed(2)}%` : '—'} success)</li>
                <li>Quality validation and timestamped JSON database</li>
                <li>Programmatic pages + mining statistics</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <Link className="underline" href="/resources/faq">Read FAQs</Link>
          <span className="text-muted-foreground">·</span>
          <Link className="underline" href="/app">Search providers</Link>
        </div>
      </div>
    </main>
  )
}


