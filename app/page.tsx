/* app/page.tsx
 * Drop-in replacement for a fresher, glassy, gradient-rich look
 * Everything else (copy, JSON-LD, layout, etc.) is unchanged.
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  HeartHandshake,
  Stethoscope,
  Users,
  Shield,
  Building,
  Phone,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { NewHeroSection } from '@/components/home-page/NewHeroSection'
import { SimpleHeroSection } from '@/components/home-page/SimpleHeroSection'
import { RecentSearches } from '@/components/home-page/RecentSearches'
import { LastCachedPreview } from '@/components/home-page/LastCachedPreview'
import { Header } from '@/components/layout/Header'

export default function Landing() {
  const [isOpenSourceOpen, setIsOpenSourceOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30 isolate">
      <Header />

      {/* ---------- Hero Section ---------- */}
      <NewHeroSection isAboveTheFold={true} />

      {/* ---------- Recent Searches ---------- */}
      <RecentSearches limit={6} />

      {/* ---------- Last cached preview (lightweight) ---------- */}
      <LastCachedPreview />

      {/* ---------- Who We Help ---------- */}
      <section id="who-we-help" className="py-24 relative">
        <div className="container text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/SIE Prim_teal.png"
              alt="SIE Wellness"
              width={200}
              height={80}
              className="object-contain"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 dark:from-emerald-300 dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">
            Built for Real People with Real Needs
          </h2>
          <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            From individuals seeking care to organizations serving communities, our AI makes
            healthcare accessible for everyone.
          </p>
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          <GlassyUserGroup
            icon={Users}
            title="Individuals & Families"
            desc="Uninsured, underinsured, or undocumented—find care without barriers, documentation, or insurance requirements."
            benefits={['No insurance needed', 'SSN not required', 'Language support', 'Free services']}
          />
          <GlassyUserGroup
            icon={Building}
            title="Social Workers"
            desc="Save hours of research with instant access to vetted provider lists tailored to your clients' specific needs."
            benefits={['Instant provider lists', 'Client-specific filters', 'Export capabilities', 'Always updated']}
          />
          <GlassyUserGroup
            icon={HeartHandshake}
            title="Non-Profits"
            desc="Enhance your community programs with comprehensive healthcare resource data and referral capabilities."
            benefits={['Community programs', 'Resource libraries', 'Referral networks', 'Grant reporting']}
          />
          <GlassyUserGroup
            icon={Phone}
            title="Healthcare Navigators"
            desc="Empower your navigation services with detailed provider information and accessibility insights."
            benefits={['Navigation tools', 'Accessibility data', 'Provider insights', 'Client matching']}
          />
        </div>
      </section>

      {/* ---------- Collapsible Open Source Banner ---------- */}
      <Collapsible open={isOpenSourceOpen} onOpenChange={setIsOpenSourceOpen}>
        <div className="relative isolate overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950 text-white">
          <div className="absolute -top-96 left-1/4 -z-10 aspect-[1108/632] w-[69.25rem] -translate-x-1/4 rotate-[30deg] bg-gradient-to-r from-teal-400/20 via-teal-300/10 to-transparent opacity-60 blur-3xl" />
          <div className="container relative z-10">
            <CollapsibleTrigger asChild>
              <button className="w-full py-6 flex items-center justify-between text-left bg-slate-900/40 border border-teal-300/20 backdrop-blur-sm hover:bg-slate-900/60 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-400/10 backdrop-blur-sm border border-teal-300/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold tracking-wide">Open&nbsp;Source</span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-teal-100/90">
                      Power Your Apps with Our NPI Lookup MCP Server
                    </h3>
                    <p className="text-teal-100/90 mt-1 text-sm md:text-base">
                      The same technology that powers SIE Wellness, now available for developers.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-teal-200">
                  <span className="text-sm hidden md:inline">Learn&nbsp;More</span>
                  {isOpenSourceOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pb-8">
              <div className="pt-8 border-t border-teal-300/20 space-y-8">
                <p className="text-lg text-teal-100/90 leading-relaxed max-w-4xl">
                  The same technology that powers SIE Wellness is now available as an open-source
                  MCP server. Validate healthcare providers, perform fuzzy matching, and integrate
                  real-time NPI lookups into your AI agents.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassSquare icon={Shield} label="MCP Compatible" />
                  <GlassSquare icon={Stethoscope} label="Real-time Validation" />
                  <GlassSquare icon={Users} label="Production Ready" />
                </div>

                <div className="bg-slate-900/60 rounded-3xl p-6 border border-teal-300/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="ml-4 font-mono text-sm text-gray-400">npi_lookup_example.py</span>
                  </div>
                  <pre className="text-sm text-teal-200 font-mono overflow-x-auto">
                    <code>{`from ProviderSearchInput import NPILookupClient
async with NPILookupClient() as client:
    # Search by name and state
    results = await client.search_by_name("Mayo Clinic", state="MN")

    # Validate an NPI
    is_valid = await client.validate_npi("1234567890")

    # Search by location  
    results = await client.search_by_location(
        city="San Francisco", state="CA"
    )`}</code>
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-teal-900 hover:bg-teal-50 font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Link
                      href="https://github.com/pawelsloboda5/NPI_Lookup_MCP_Server"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      View on GitHub
                    </Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-teal-300/20 text-center">
                  <Stat value="MIT" label="License" />
                  <Stat value="&lt;500 ms" label="Response" />
                  <Stat value="Py 3.8+" label="Compatible" />
                  <Stat value="100%" label="Open" />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </div>
      </Collapsible>

      {/* ---------- AI-Powered Search Section ---------- */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Healthcare Providers with AI
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered search understands what you need and connects you with the right care.
              No insurance? No problem. Search by service, location, or specific needs.
            </p>
          </div>
        </div>
        <SimpleHeroSection showRecentSearches={false} />
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="mt-auto border-t bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="container section-padding">
          {/* SEO FAQ */}
          <section className="mb-12">
            <h3 className="text-display-md mb-4">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 text-body-base">
                <h4 className="text-h5 text-foreground">About the Search Tool</h4>
                <p>
                  <strong>What is SIE Wellness Search?</strong> It’s an intelligent tool that helps you find
                  free & low-cost healthcare: clinics, urgent care, dental, mental health, labs, immunizations, and more.
                </p>
                <p>
                  <strong>How does it work?</strong> We organize provider data from trusted sources and our network so you can compare services, pricing, languages, hours, and accessibility in one place.
                </p>
                <p>
                  <strong>Is it free?</strong> Yes. Search is free for everyone. We may add optional premium features later.
                </p>
                <p>
                  <strong>Does it include only doctors?</strong> No—you’ll find primary care, specialists, community health centers, urgent care, pharmacies, labs, and preventive care.
                </p>
              </div>

              <div className="space-y-4 text-body-base">
                <h4 className="text-h5 text-foreground">Appointments & Access</h4>
                <p>
                  <strong>Do I need insurance?</strong> No. Many listings accept uninsured patients and offer sliding-scale or free services.
                </p>
                <p>
                  <strong>Is SSN required?</strong> Many clinics do not require a Social Security Number. We label “No SSN” when available.
                </p>
                <p>
                  <strong>Is telehealth available?</strong> Yes—filter for telehealth to find virtual visit options near you.
                </p>
              </div>
            </div>
            {/* FAQPage JSON-LD for rich results */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "What is SIE Wellness Search?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text:
                          "It’s an intelligent tool that helps you find free & low-cost healthcare: clinics, urgent care, dental, mental health, labs, immunizations, and more.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How does it work?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text:
                          "We organize provider data from trusted sources and our network so you can compare services, pricing, languages, hours, and accessibility in one place.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is it free?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text:
                          "Yes. Search is free for everyone. We may add optional premium features later.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Does it include only doctors?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text:
                          "No—you’ll find primary care, specialists, community health centers, urgent care, pharmacies, labs, and preventive care.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do I need insurance?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text:
                          "No. Many listings accept uninsured patients and offer sliding-scale or free services.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is SSN required?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text:
                          "Many clinics do not require a Social Security Number. We label ‘No SSN’ when available.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is telehealth available?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text:
                          "Yes—filter for telehealth to find virtual visit options near you.",
                      },
                    },
                  ],
                }),
              }}
            />
          </section>

          <Separator className="mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="space-y-4">
              <Link href="#" className="flex items-center gap-3">
                <div className="flex h-12 w-32 items-center justify-center">
                  <Image
                    src="/1600x600-black-banner-logo.png"
                    alt="SIE Wellness Logo"
                    width={128}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </Link>
              <p className="text-body-sm text-muted-foreground">
                AI-powered healthcare discovery for everyone.
              </p>
            </div>

            <div>
              <h5 className="text-h6 mb-3">Platform</h5>
              <Link href="/app" className="block text-sm text-muted-foreground hover:text-primary">
                Search Providers
              </Link>
              <Link href="/providers" className="block text-sm text-muted-foreground hover:text-primary mt-1">
                Browse Providers
              </Link>
            </div>

            <div>
              <h5 className="text-h6 mb-3">Emergency</h5>
              <Link href="tel:911" className="block text-sm text-destructive font-semibold">
                911
              </Link>
              <Link href="tel:988" className="block text-sm text-blue-500 font-semibold">
                988
              </Link>
              <Link href="tel:211" className="block text-sm text-green-500 font-semibold">
                211
              </Link>
            </div>

            <div className="md:col-span-2">
              <h5 className="text-h6 mb-3">DMV Quick Links</h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-x-4 gap-y-1.5 text-muted-foreground">
                <li><Link href="/find/urgent-care/washington-dc">Urgent Care – DC</Link></li>
                <li><Link href="/find/mental-health/washington-dc">Mental Health – DC</Link></li>
                <li><Link href="/find/free-sti-testing/washington-dc">Free STI Testing – DC</Link></li>
                <li><Link href="/find/womens-health/washington-dc">Women’s Health – DC</Link></li>
                <li><Link href="/find/vision-care/washington-dc">Vision Care – DC</Link></li>
                <li><Link href="/find/pharmacy-low-cost/washington-dc">Low-Cost Pharmacy – DC</Link></li>
                <li><Link href="/find/immunizations/washington-dc">Immunizations – DC</Link></li>
                <li><Link href="/find/blood-testing-labs/washington-dc">Blood Testing – DC</Link></li>
                <li><Link href="/find/telehealth/washington-dc">Telehealth – DC</Link></li>
                <li><Link href="/find/mental-health/alexandria-va">Mental Health – Alexandria</Link></li>
                <li><Link href="/find/womens-health/fairfax-va">Women’s Health – Fairfax</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SIE Wellness. Built with ❤️️ for communities in need.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="mailto:hello@siewellness.org">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ---------- Local glassy helper components ---------- */

function GlassyUserGroup({
  icon: Icon,
  title,
  desc,
  benefits
}: {
  icon: typeof Users
  title: string
  desc: string
  benefits: string[]
}) {
  return (
    <Card className="h-full relative group bg-white/50 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/10 via-emerald-300/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="relative p-8 text-left h-full grid grid-rows-[auto_1fr_auto]">
        <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800">
          <Icon className="w-7 h-7 text-emerald-700 dark:text-emerald-200" />
        </div>
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{desc}</p>
        </div>
        <ul className="mt-5 grid grid-rows-4 gap-2">
          {benefits.map(b => (
            <li key={b} className="flex items-center md:h-6 text-sm text-emerald-700 dark:text-emerald-400 md:whitespace-nowrap md:truncate">
              <Sparkles className="mr-2 h-4 w-4 flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function GlassSquare({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="glass p-6 rounded-2xl flex flex-col items-center text-center border border-white/30">
      <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-teal-200/90 to-teal-300/90 flex items-center justify-center">
        <Icon className="h-6 w-6 text-teal-900" />
      </div>
      <h4 className="text-base font-semibold text-truncate">{label}</h4>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-teal-200 tracking-tight">{value}</div>
      <div className="text-sm text-teal-100/70">{label}</div>
    </div>
  )
}