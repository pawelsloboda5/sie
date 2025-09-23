/* app/page.tsx
 * Drop-in replacement for a fresher, glassy, gradient-rich look
 * Everything else (copy, JSON-LD, layout, etc.) is unchanged.
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import {
  HeartHandshake,
  Users,
  Building,
  Phone,
  MessageSquare,
  Search,
  DollarSign,
  Star,
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { NewHeroSection } from '@/components/home-page/NewHeroSection'
import { Header } from '@/components/layout/Header'

export default function Landing() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  
  const testimonials = [
    {
      name: "Maria S.",
      location: "Arlington, VA",
      text: "Found free prenatal care when I lost my job. The copilot knew exactly what to ask and found three clinics near me.",
      savings: "$2,400"
    },
    {
      name: "James T.",
      location: "Washington, DC",
      text: "Saved $1,800 on my son's dental work. Found a clinic with payment plans that actually worked with our budget.",
      savings: "$1,800"
    },
    {
      name: "Anonymous",
      location: "Bethesda, MD",
      text: "No insurance, no SSN, no problem. Finally got my diabetes medication at a price I could afford.",
      savings: "$3,200/year"
    },
    {
      name: "Sarah L.",
      location: "Alexandria, VA",
      text: "I needed mental health support in Spanish. The copilot found a Spanish-speaking therapist in seconds.",
      savings: "Time & stress"
    }
  ]

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 isolate">
      <Header />

      {/* SEO-Optimized Title and Meta Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "SIE Wellness - AI Healthcare Navigator & Affordable Care Finder",
            "url": "https://www.sie2.com",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "description": "AI-powered healthcare copilot helping 300+ users find affordable medical care. Compare prices at 3,000+ providers. Save $2,400+ annually on healthcare costs.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "327",
              "bestRating": "5",
              "worstRating": "1"
            },
            "featureList": [
              "AI Healthcare Assistant",
              "Price Transparency Tool",
              "Insurance Alternative Finder",
              "Free Clinic Locator",
              "Medicaid Provider Search",
              "Telehealth Options",
              "Prescription Savings",
              "Mental Health Resources"
            ],
            "screenshot": "https://www.sie2.com/copilot-demo-gif.gif",
            "softwareVersion": "2.0",
            "creator": {
              "@type": "Organization",
              "name": "SIE Wellness",
              "url": "https://www.sie2.com"
            }
          })
        }}
      />

      {/* Medical Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "about": {
              "@type": "MedicalCondition",
              "name": "Healthcare Affordability"
            },
            "mainEntity": {
              "@type": "MedicalOrganization",
              "name": "SIE Wellness Healthcare Network",
              "description": "Network of 3,000+ verified affordable healthcare providers",
              "medicalSpecialty": [
                "Primary Care",
                "Dental Care",
                "Mental Health",
                "Urgent Care",
                "Women's Health",
                "Pediatrics"
              ],
              "availableService": {
                "@type": "MedicalProcedure",
                "name": "Affordable Healthcare Services",
                "procedureType": "Diagnostic, Preventive, Therapeutic"
              }
            }
          })
        }}
      />

      {/* ---------- Hero Section ---------- */}
      <NewHeroSection isAboveTheFold={true} />

      {/* ---------- AI Copilot Introduction ---------- */}
      <AICopilotSection />

      {/* ---------- Healthcare Cost Calculator (SEO Feature) ---------- */}
      <HealthcareCostSection />

      {/* ---------- Real Savings, Real Stories ---------- */}
      <RealSavingsSection 
        testimonials={testimonials} 
        currentTestimonial={currentTestimonial}
        setCurrentTestimonial={setCurrentTestimonial}
      />

      {/* ---------- How It Works ---------- */}
      <HowItWorksSection />

      {/* ---------- For Organizations (Investor Appeal) ---------- */}
      <OrganizationsSection />

      {/* ---------- Provider Trust Section ---------- */}
      <TrustIndicatorsSection />

      {/* ---------- Service Categories for SEO ---------- */}
      <ServiceCategoriesSection />

      {/* ---------- Who We Help ---------- */}
      <section id="who-we-help" className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container">
          <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/SIE Prim_teal.png"
              alt="SIE Wellness"
                width={180}
                height={72}
              className="object-contain"
            />
          </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Built for Real People with Real Needs
          </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Whether you&apos;re looking for yourself or helping others, we understand that healthcare isn&apos;t one-size-fits-all.
          </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Individuals & Families */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-xl group flex flex-col h-full">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-blue-700 dark:text-blue-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  People Like You
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed min-h-[3rem]">
                  Lost your job? New to the country? Between insurance? We get it. Find care that works for your situation.
                </p>
              </div>
              <ul className="space-y-2 mt-auto">
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>No insurance? No problem</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>No SSN required options</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Free & sliding scale care</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Simple, clear guidance</span>
                </li>
              </ul>
            </div>

            {/* Social Workers */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-xl group flex flex-col h-full">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building className="w-7 h-7 text-purple-700 dark:text-purple-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Case Managers
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed min-h-[3rem]">
                  Stop spending hours on Google. Get instant, accurate referrals for every client&apos;s unique needs.
                </p>
              </div>
              <ul className="space-y-2 mt-auto">
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Build referral lists in seconds</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Filter by client eligibility</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Export & share with clients</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Always current information</span>
                </li>
              </ul>
            </div>

            {/* Non-Profits */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-xl group flex flex-col h-full">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-7 h-7 text-rose-700 dark:text-rose-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Community Orgs
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed min-h-[3rem]">
                  Extend your impact with tools that help your community navigate healthcare together.
                </p>
              </div>
              <ul className="space-y-2 mt-auto">
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>White-label for your programs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Track community impact</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Resource library access</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Grant reporting tools</span>
                </li>
              </ul>
            </div>

            {/* Healthcare Navigators */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-xl group flex flex-col h-full">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7 text-amber-700 dark:text-amber-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Patient Advocates
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed min-h-[3rem]">
                  Give every patient the guidance they deserve with real-time access to comprehensive provider data.
                </p>
              </div>
              <ul className="space-y-2 mt-auto">
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Real-time availability</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Accessibility features</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Cost transparency</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>Quality ratings</span>
                </li>
              </ul>
            </div>
          </div>
                  </div>
      </section>

      {/* ---------- Quick Start CTA ---------- */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg font-medium">
                🚀 Ready to find affordable care?
              </span>
                </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Your Health Journey Starts with One Question
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
              No sign-up needed. No credit card. Just tell us what you need and get instant, personalized results.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
              <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100 font-bold px-10 py-6 rounded-full text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
                <Link href="/copilot">
                  <MessageSquare className="mr-3 w-6 h-6" />
                  Start Your Free Conversation
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-emerald-900 dark:text-emerald-200 bg-white/10 hover:bg-white/20 font-bold px-10 py-6 rounded-full text-lg backdrop-blur-sm">
                <Link href="/app">
                  <Search className="mr-3 w-6 h-6" />
                  Browse Providers
                    </Link>
                  </Button>
                </div>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⏱️</span>
                <span className="text-lg">Average response: 5 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">💬</span>
                <span className="text-lg">Available 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🔍</span>
                <span className="text-lg">3,000+ verified providers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source MCP server section removed */}

      {/* AI-Powered Search section removed from homepage */}

      {/* ---------- Footer ---------- */}
      <footer className="mt-auto border-t bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="container section-padding">
          {/* SEO FAQ */}
          <section className="mb-12">
            <h3 className="text-display-md mb-8">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 text-body-base">
                <h4 className="text-h5 text-foreground mb-4">About Our AI Healthcare Copilot</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      How is this different from Google or WebMD?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      We don&apos;t diagnose or give medical advice. Instead, we connect you with real, affordable providers in your area. Our AI understands your specific situation and finds care that fits your budget, insurance status, and needs.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      Is my information safe?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Yes. We&apos;re HIPAA compliant, never sell your data, and you can use our service anonymously. Your conversations are private and encrypted.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      How accurate is the pricing information?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      We update our database weekly and verify prices directly with providers. When exact prices aren&apos;t available, we show ranges based on typical costs for that service in your area.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      Can I use this for emergencies?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      No. For medical emergencies, always call 911. We&apos;re here for non-emergency care planning and finding affordable routine, preventive, and specialty care.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-body-base">
                <h4 className="text-h5 text-foreground mb-4">Access & Eligibility</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      I don&apos;t have insurance. Can I still get care?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Absolutely. We specialize in finding free clinics, sliding-scale providers, and cash-pay options. Many community health centers serve everyone regardless of insurance status.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      I&apos;m undocumented. Will providers ask for papers?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      We highlight providers that don&apos;t require SSN or immigration documentation. Many community clinics serve everyone regardless of status. Your privacy is protected.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      Can I get help finding care in my area?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Yes! Our AI copilot searches providers in your local area. Just provide your city or zip code, and we&apos;ll find care options near you with transparent pricing.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                      How do I know these providers are real?
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Every provider is verified through official databases and direct confirmation. We never show fake or outdated listings. Look for our &quot;Verified&quot; badge for extra confidence.
                    </p>
                  </div>
                </div>
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
              <Link href="/cities" className="block text-sm text-muted-foreground hover:text-primary mt-1">
                Browse by City
              </Link>
              <Link href="/compare" className="block text-sm text-muted-foreground hover:text-primary mt-1">
                Compare Solutions
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
              <h5 className="text-h6 mb-3">Coverage Areas</h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-x-4 gap-y-1.5 text-muted-foreground">
                <li><Link href="/cities/washington-dc" className="hover:text-primary">Washington, DC</Link></li>
                <li><Link href="/cities/baltimore" className="hover:text-primary">Baltimore, MD</Link></li>
                <li><Link href="/cities/alexandria" className="hover:text-primary">Alexandria, VA</Link></li>
                <li><Link href="/cities/arlington" className="hover:text-primary">Arlington, VA</Link></li>
                <li><Link href="/cities/bethesda" className="hover:text-primary">Bethesda, MD</Link></li>
                <li><Link href="/cities/silver-spring" className="hover:text-primary">Silver Spring, MD</Link></li>
                <li><Link href="/cities/minneapolis" className="hover:text-primary">Minneapolis, MN</Link></li>
                <li><Link href="/cities/st-paul" className="hover:text-primary">St. Paul, MN</Link></li>
                <li><Link href="/cities/san-francisco" className="hover:text-primary">San Francisco, CA</Link></li>
                <li><Link href="/cities/oakland" className="hover:text-primary">Oakland, CA</Link></li>
                <li><Link href="/cities/san-jose" className="hover:text-primary">San Jose, CA</Link></li>
                <li><Link href="/cities/richmond" className="hover:text-primary">Richmond, VA</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SIE Wellness - AI Healthcare Navigator | Affordable Medical Care Finder | Free Clinic Locator</p>
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

/* ---------- New Homepage Sections ---------- */

function AICopilotSection() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-white dark:bg-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,130,130,0.05),transparent_70%)]" />
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Meet Your Personal Healthcare Guide
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Just ask a question in plain English. Get instant, personalized healthcare options. No medical jargon, no confusion.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Chat Demo with GIF */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative max-w-[280px] md:max-w-[320px] lg:max-w-[360px]">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-3xl blur-2xl" />
              
              {/* GIF Display - naturally integrated */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative w-full h-[600px] overflow-hidden">
                  <Image
                    src="/copilot-demo-gif.gif"
                    alt="Live demo of SIE Wellness AI Copilot helping find affordable dental care"
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
              
              {/* Subtle caption */}
              <p className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                See how our copilot finds affordable care in seconds
              </p>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Why Our Copilot is Different
            </h3>
            {[
              { icon: MessageSquare, title: "Plain English Questions", desc: "No medical terms needed. Just describe what you need." },
              { icon: Search, title: "3,000+ Providers", desc: "Verified network including free and sliding-scale options." },
              { icon: DollarSign, title: "Price Transparency", desc: "See actual costs upfront, including free services." },
              { icon: Star, title: "10,000+ Services", desc: "Comprehensive database of healthcare services with pricing." },
              { icon: Lock, title: "Private & Secure", desc: "HIPAA compliant. We never sell your data." }
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{benefit.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            <Link href="/copilot">
              Start a Conversation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

type Testimonial = {
  name: string
  location: string
  text: string
  savings: string
}

type RealSavingsProps = {
  testimonials: Testimonial[]
  currentTestimonial: number
  setCurrentTestimonial: (index: number) => void
}

function RealSavingsSection({ testimonials, currentTestimonial, setCurrentTestimonial }: RealSavingsProps) {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-800/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Healthcare That Fits Your Budget
          </h2>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">$2,400</div>
            <div className="text-slate-600 dark:text-slate-400">Illustrative annual savings target</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">73%</div>
            <div className="text-slate-600 dark:text-slate-400">Find care options under $100</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-4xl font-bold text-green-600 dark:text-green-400">4.8</span>
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="text-slate-600 dark:text-slate-400">Early user rating (300+ and growing)</div>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="absolute top-4 right-4">
            <svg className="w-16 h-16 text-teal-100 dark:text-teal-900/20" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 mb-6 leading-relaxed">
              &quot;{testimonials[currentTestimonial].text}&quot;
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{testimonials[currentTestimonial].name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{testimonials[currentTestimonial].location}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 dark:text-slate-400">Saved</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{testimonials[currentTestimonial].savings}</div>
              </div>
            </div>
          </div>
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentTestimonial
                    ? 'w-8 bg-teal-600 dark:bg-teal-400'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      emoji: "💬",
      title: "Have a conversation",
      description: "Just tell us what&apos;s going on in plain English. No medical terms needed. You can refine by asking about insurance coverage, prices, or provider details.",
      example: '"I need help with my diabetes but I lost my job"'
    },
    {
      emoji: "🔍",
      title: "We do the homework",
      description: "While you wait (about 5 seconds), we check 3,000+ providers for insurance acceptance, language availability, and options that fit your budget.",
      example: "Found: 3 clinics with sliding scale fees near you"
    },
    {
      emoji: "✅",
      title: "Pick what works for you",
      description: "Get a personalized shortlist with verified low‑cost options and upfront prices. Save or share, then follow clear next steps (call, directions, or online booking when available).",
      example: "Unity Health: Free consultation, Saturdays available"
    }
  ]

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Getting Care Shouldn&apos;t Be Complicated
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We turned a broken system into a simple conversation. Here&apos;s how it actually works.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Connection line - only on desktop between cards */}
              {idx < 2 && (
                <svg
                  className="hidden md:block absolute top-16 left-[calc(100%-0.5rem)] w-12 h-6 text-slate-300 dark:text-slate-600"
                  viewBox="0 0 48 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M0 12 H38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M38 12 L30 6 M38 12 L30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              
              {/* Card - with fixed height and aligned example */}
              <div className="h-full min-h-[300px] md:min-h-[340px] bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-lg group overflow-hidden">
                {/* Step number & emoji */}
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">{step.emoji}</div>
                  <div className="text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full">
                    Step {idx + 1}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex flex-col h-full space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Real example */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 italic block">
                      {step.example}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">Coverage today: DC, MD, VA, MN, CA (B2B nationwide)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">300+ Happy Users and Growing</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function OrganizationsSection() {
  return (
    <section className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900 relative">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Enterprise Healthcare Navigation at Scale
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Help your employees find affordable care with access to our expanded network of 100,000+ private providers and 1M+ services with transparent pricing.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* The Problem */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Employees&apos; Challenges</h3>
              <div className="h-1 w-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
            </div>
            <div className="space-y-6">
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-1">
                  60%
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Don&apos;t know where to find affordable care</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-1">
                  $970
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Average wasted per employee on wrong providers</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent mb-1">
                  36%
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Skip care entirely due to cost uncertainty</div>
              </div>
            </div>
          </div>

          {/* Our Solution */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enterprise Benefits</h3>
              <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
            </div>
            <div className="space-y-6">
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-1">
                  100K+
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Private providers with negotiated rates</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
                  1M+
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Healthcare services with transparent pricing</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">AI copilot for employee healthcare questions</div>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Expected ROI</h3>
              <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            </div>
            <div className="space-y-6">
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent mb-1">
                  30%
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Reduction in unnecessary ER visits</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent mb-1">
                  $500
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Average savings per employee per year</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-500 bg-clip-text text-transparent mb-1">
                  85%
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Employee satisfaction with healthcare benefits</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Interested? Email our CEO at{' '}
            <Link href="mailto:dantedanielphd@gmail.com" className="text-emerald-600 hover:underline">
              dantedanielphd@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------- New Trust Section ---------- */
function TrustIndicatorsSection() {
  const stats = [
    { number: "3,000+", label: "Verified Providers", icon: "🏥" },
    { number: "10,000+", label: "Healthcare Services", icon: "🔍" },
    { number: "300+", label: "Happy Users", icon: "👥" },
    { number: "24/7", label: "Available", icon: "⏰" }
  ]

  return (
    <section className="py-12 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Growing Every Day to Serve You Better
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            We&apos;re just getting started, but already making a real difference in how people find affordable healthcare.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.number}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Removed redundant badges per current messaging */}
      </div>
    </section>
  )
}

/* ---------- New SEO-Optimized Components ---------- */

function HealthcareCostSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Healthcare Price Comparison Tool
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Compare real healthcare costs across 3,000+ providers. No hidden fees. No surprises.
          </p>
        </div>

        {/* Price Comparison Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Primary Care Visit</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Without Insurance:</span>
                <span className="font-bold text-red-600">$200-400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">With SIE Wellness:</span>
                <span className="font-bold text-green-600">$20-75</span>
              </div>
              <div className="pt-3 border-t">
                <span className="text-2xl font-bold text-emerald-600">Save 80%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Dental Cleaning</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Traditional Dentist:</span>
                <span className="font-bold text-red-600">$150-300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Our Network:</span>
                <span className="font-bold text-green-600">$50-100</span>
              </div>
              <div className="pt-3 border-t">
                <span className="text-2xl font-bold text-emerald-600">Save 67%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Mental Health Session</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Private Therapist:</span>
                <span className="font-bold text-red-600">$150-350</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Sliding Scale:</span>
                <span className="font-bold text-green-600">$30-80</span>
              </div>
              <div className="pt-3 border-t">
                <span className="text-2xl font-bold text-emerald-600">Save 77%</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEO-Rich Cost Calculator CTA */}
        <div className="text-center">
          <p className="mb-6 text-lg text-slate-700 dark:text-slate-300">
            Find affordable healthcare prices in your area. Compare costs for medical, dental, mental health, and specialty care.
          </p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold">
            <Link href="/copilot">
              Compare Healthcare Costs Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function ServiceCategoriesSection() {
  const services = [
    {
      title: "Primary Care",
      description: "Find affordable doctors for check-ups, physicals, and preventive care",
      keywords: "affordable primary care, cheap doctor visit, low cost physician",
      link: "/services/primary-care",
      icon: "👨‍⚕️",
      price: "From $20"
    },
    {
      title: "Urgent Care",
      description: "Low-cost urgent care clinics for non-emergency medical needs",
      keywords: "cheap urgent care, affordable walk-in clinic, low cost emergency",
      link: "/services/urgent-care",
      icon: "🚑",
      price: "From $50"
    },
    {
      title: "Dental Care",
      description: "Affordable dentists, free dental clinics, and low-cost dental services",
      keywords: "cheap dentist, affordable dental care, free dental clinic",
      link: "/services/dental-care",
      icon: "🦷",
      price: "From $30"
    },
    {
      title: "Mental Health",
      description: "Sliding scale therapy, free counseling, affordable mental health services",
      keywords: "affordable therapy, sliding scale counseling, cheap mental health",
      link: "/services/mental-health",
      icon: "🧠",
      price: "From $40"
    },
    {
      title: "Women's Health",
      description: "Low-cost women's health services, free clinics, reproductive care",
      keywords: "affordable womens health, free womens clinic, low cost obgyn",
      link: "/services/womens-health",
      icon: "👩‍⚕️",
      price: "From $25"
    },
    {
      title: "Lab Tests",
      description: "Cheap blood tests, affordable lab work, low-cost diagnostic testing",
      keywords: "cheap lab tests, affordable blood work, low cost diagnostics",
      link: "/services/lab-tests",
      icon: "🔬",
      price: "From $15"
    }
  ]

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Affordable Healthcare Services Near You
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Browse healthcare services by category. Find free clinics, sliding scale providers, and transparent pricing for every medical need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <Link
              key={idx}
              href={service.link}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all hover:shadow-lg"
              data-keywords={service.keywords}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{service.icon}</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                  {service.price}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {service.description}
              </p>
              <div className="mt-4 flex items-center text-emerald-600 font-medium">
                Find Providers
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

          {/* Location-Based SEO Content */}
          <div className="mt-16 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              Find Affordable Healthcare in Your Area
            </h3>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
              Currently serving Washington DC, Maryland, Virginia, Minnesota, and California Bay Area
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 text-sm">
              {[
                { name: 'Washington, DC', slug: 'washington-dc' },
                { name: 'Baltimore, MD', slug: 'baltimore' },
                { name: 'Alexandria, VA', slug: 'alexandria' },
                { name: 'Arlington, VA', slug: 'arlington' },
                { name: 'Bethesda, MD', slug: 'bethesda' },
                { name: 'Richmond, VA', slug: 'richmond' },
                { name: 'Minneapolis, MN', slug: 'minneapolis' },
                { name: 'St. Paul, MN', slug: 'st-paul' },
                { name: 'San Francisco, CA', slug: 'san-francisco' },
                { name: 'Oakland, CA', slug: 'oakland' },
                { name: 'San Jose, CA', slug: 'san-jose' },
                { name: 'Silver Spring, MD', slug: 'silver-spring' }
              ].map(city => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-center p-2 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  {city.name}
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline" size="sm">
                <Link href="/cities">
                  View All Locations
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
      </div>
    </section>
  )
}