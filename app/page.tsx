'use client'
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { HeartHandshake, Stethoscope, Users, Shield, Building, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SimpleHeroSection } from "@/components/home-page/SimpleHeroSection";
import { Header } from "@/components/layout/Header";

export default function Landing() {
  const [isOpenSourceOpen, setIsOpenSourceOpen] = useState(false);


  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ---------- Hero with Search ---------- */}
      <SimpleHeroSection />

      {/* ---------- Who We Help ---------- */}
      <section id="who-we-help" className="py-24 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Built for Real People with Real Needs
          </h3>
          <div className="space-y-2 max-w-3xl mx-auto">
            <p className="text-xl text-gray-700 dark:text-gray-300">
              From individuals seeking care to organizations serving communities, 
              our AI makes healthcare accessible for everyone.
            </p>
          </div>
        </div>
        
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <UserGroup 
            icon={Users}
            title="Individuals & Families"
            desc="Uninsured, underinsured, or undocumented—find care without barriers, documentation, or insurance requirements."
            benefits={["No insurance needed", "SSN not required", "Language support", "Free services"]}
          />
          <UserGroup 
            icon={Building}
            title="Social Workers"
            desc="Save hours of research with instant access to vetted provider lists tailored to your clients' specific needs."
            benefits={["Instant provider lists", "Client-specific filters", "Export capabilities", "Always updated"]}
          />
          <UserGroup 
            icon={HeartHandshake}
            title="Non-Profits"
            desc="Enhance your community programs with comprehensive healthcare resource data and referral capabilities."
            benefits={["Community programs", "Resource libraries", "Referral networks", "Grant reporting"]}
          />
          <UserGroup 
            icon={Phone}
            title="Healthcare Navigators"
            desc="Empower your navigation services with detailed provider information and accessibility insights."
            benefits={["Navigation tools", "Accessibility data", "Provider insights", "Client matching"]}
          />
        </div>
      </section>

      {/* ---------- Collapsible Open Source Banner ---------- */}
      <Collapsible open={isOpenSourceOpen} onOpenChange={setIsOpenSourceOpen}>
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-grid-pattern"></div>
          </div>
          
          <div className="container relative z-10">
            <CollapsibleTrigger asChild>
              <button className="w-full py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  {/* Open Source Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Open Source</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">
                      Power Your Apps with Our NPI Lookup MCP Server
                    </h3>
                    <p className="text-teal-100 text-sm md:text-base">
                      The same technology that powers SIE Wellness, now available for developers
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-teal-200">
                  <span className="text-sm hidden md:inline">Learn More</span>
                  {isOpenSourceOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pb-8">
              <div className="pt-4 border-t border-white/20">
                <div className="max-w-4xl space-y-8">
                  <p className="text-lg text-teal-100 leading-relaxed">
                    The same technology that powers SIE Wellness is now available as an open-source 
                    MCP server. Validate healthcare providers, perform fuzzy matching, and integrate 
                    real-time NPI lookups into your AI agents.
                  </p>

                  {/* Feature Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-teal-900" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">MCP Compatible</h4>
                      <p className="text-sm text-teal-100">Seamlessly integrate with AI agents using the Model Context Protocol</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center mb-4">
                        <Stethoscope className="h-6 w-6 text-teal-900" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Real-time Validation</h4>
                      <p className="text-sm text-teal-100">Official CMS NPPES API v2.1 integration with intelligent caching</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-teal-900" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Production Ready</h4>
                      <p className="text-sm text-teal-100">Multi-tier caching, rate limiting, and comprehensive error handling</p>
                    </div>
                  </div>

                  {/* Code Preview */}
                  <div className="bg-gray-900/50 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="ml-4 text-sm text-gray-400">npi_lookup_example.py</span>
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
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button 
                      asChild 
                      size="lg"
                      className="bg-white text-teal-900 hover:bg-teal-50 font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Link href="https://github.com/pawelsloboda5/NPI_Lookup_MCP_Server" target="_blank" rel="noopener noreferrer">
                        <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View on GitHub
                      </Link>
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-200">MIT</div>
                      <div className="text-sm text-teal-100">License</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-200">Python 3.8+</div>
                      <div className="text-sm text-teal-100">Compatible</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-200">&lt;500ms</div>
                      <div className="text-sm text-teal-100">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-200">100%</div>
                      <div className="text-sm text-teal-100">Open Source</div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </div>
      </Collapsible>

      {/* ---------- Footer ---------- */}
      <footer className="mt-auto border-t bg-background/80 section-padding">
        <div className="container">
          {/* SEO FAQ */}
          <section className="mb-12">
            <h3 className="text-h3 mb-4">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-body-sm">
              <div className="space-y-3">
                <h4 className="text-h5">About the Search Tool</h4>
                <p><strong>What is SIE Wellness Search?</strong> It’s an intelligent tool that helps you find free & low‑cost healthcare: clinics, urgent care, dental, mental health, labs, immunizations, and more.</p>
                <p><strong>How does it work?</strong> We organize provider data from trusted sources and our network so you can compare services, pricing, languages, hours, and accessibility in one place.</p>
                <p><strong>Is it free?</strong> Yes. Search is free for everyone. We may add optional premium features later.</p>
                <p><strong>Does it include only doctors?</strong> No — you’ll find primary care, specialists, community health centers, urgent care, pharmacies, labs, and preventive care.</p>
                <p><strong>How accurate is the info?</strong> We refresh data frequently and show clear contact details so you can confirm hours and availability.</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-h5">Appointments & Access</h4>
                <p><strong>What is Automated Phone Scheduling?</strong> A smart assistant that books appointments for you and sends confirmations and reminders by text/email.</p>
                <p><strong>Can I use it for any provider?</strong> We’re expanding coverage across our network — primary care, specialists, urgent care, dental, and mental health.</p>
                <p><strong>Do I need insurance?</strong> No. Many listings accept uninsured patients and offer sliding‑scale or free services.</p>
                <p><strong>Is SSN required?</strong> Many clinics do not require a Social Security Number. We label “No SSN” when available.</p>
                <p><strong>Is telehealth available?</strong> Yes — filter for telehealth to find virtual visit options near you.</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-h5">Preventive Care Plan (Coming Soon)</h4>
                <p><strong>What is the Preventive Care Plan?</strong> A bundled package of annual checkups, screenings, and wellness services designed to help you stay healthy.</p>
                <p><strong>Why is preventive care important?</strong> Early detection catches issues when they’re most treatable and often least expensive.</p>
                <p><strong>What services are included?</strong> We’re designing a plan with common screenings, primary care visits, and wellness checks — final details will be announced before launch.</p>
                <p><strong>Do I need insurance?</strong> No. The plan is designed to work for uninsured and underinsured people with transparent pricing.</p>
              </div>
            </div>
            {/* JSON-LD FAQ schema for rich results */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'What is SIE Wellness Search?',
                      acceptedAnswer: { '@type': 'Answer', text: 'An intelligent tool to find free and low‑cost healthcare — clinics, urgent care, dental, mental health, labs, immunizations, and more.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'How does the search work?',
                      acceptedAnswer: { '@type': 'Answer', text: 'We organize provider data from trusted sources and our network so you can compare services, pricing, languages, hours, and accessibility in one place.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'Is SIE Wellness free to use?',
                      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The search experience is free for everyone. Optional premium features may be added later.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'Do I need insurance or an SSN?',
                      acceptedAnswer: { '@type': 'Answer', text: 'No. Many clinics accept uninsured patients and do not require a Social Security Number. Use filters for Uninsured and No SSN.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'Is telehealth available?',
                      acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can filter for telehealth to find virtual care options near you.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'What is Automated Phone Scheduling?',
                      acceptedAnswer: { '@type': 'Answer', text: 'A smart assistant that books your appointments for you and sends confirmations and reminders by text or email.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'What is the Preventive Care Plan?',
                      acceptedAnswer: { '@type': 'Answer', text: 'A bundled package of annual checkups, screenings, and wellness services designed to help you stay healthy. Coming soon.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'Why is preventive care important?',
                      acceptedAnswer: { '@type': 'Answer', text: 'Preventive care helps detect potential health issues early, when they are easiest and least expensive to treat.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'What services are included in the Preventive Care Plan?',
                      acceptedAnswer: { '@type': 'Answer', text: 'We’re designing a plan with common screenings, primary care visits, and wellness checks. Final details will be announced before launch.' }
                    },
                    {
                      '@type': 'Question',
                      name: 'Do I need insurance for the Preventive Care Plan?',
                      acceptedAnswer: { '@type': 'Answer', text: 'No. The plan is designed for uninsured and underinsured people with transparent pricing.' }
                    }
                  ]
                })
              }}
            />
          </section>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Link href="#" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center">
                  <Image
                    src="/logo_560x560.png"
                    alt="SIE Wellness Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <span className="text-h5">SIE Wellness</span>
              </Link>
              <p className="text-body-sm text-muted-foreground">
                AI-powered healthcare discovery for everyone.
              </p>
            </div>
            <div>
              <h5 className="text-h6 mb-3">Platform</h5>
              <div className="space-y-2 text-body-sm text-muted-foreground">
                <Link href="/app" className="block hover:underline">Search Providers</Link>
                <Link href="/providers" className="block hover:underline">Browse Providers</Link>
              </div>
            </div>
            <div>
              <h5 className="text-h6 mb-3">Emergency</h5>
              <div className="space-y-2 text-body-sm">
                <Link href="tel:911" className="block text-destructive font-semibold hover:underline">Emergency 911</Link>
                <Link href="tel:988" className="block text-blue-600 font-semibold hover:underline">Crisis Line 988</Link>
                <Link href="tel:211" className="block text-green-600 font-semibold hover:underline">Community Resources 211</Link>
              </div>
            </div>
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SIE Wellness. Built with ♥ for communities in need.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="/terms" className="hover:underline">Terms</Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="mailto:hello@siewellness.org" className="hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function UserGroup({ 
  icon: Icon, 
  title, 
  desc, 
  benefits 
}: { 
  icon: typeof Users; 
  title: string; 
  desc: string; 
  benefits: string[];
}) {
  return (
    <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6">
          <Icon className="h-8 w-8 text-[#068282] dark:text-teal-400" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h4>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-6">{desc}</p>
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <span className="text-[#14b8a6]">✓</span>
              <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
