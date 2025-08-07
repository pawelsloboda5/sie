'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  HeartHandshake,
  Stethoscope,
  Users,
  Shield,
  Building,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { SimpleHeroSection } from '@/components/home-page/SimpleHeroSection';
import { HeroPro } from '@/components/home-page/HeroPro';
import { QuickCategories } from '@/components/home-page/QuickCategories';
import { TopPromo } from '@/components/home-page/TopPromo';
import { TrustBar } from '@/components/home-page/TrustBar';
import { Header } from '@/components/layout/Header';

export default function Landing() {
  const [isOpenSourceOpen, setIsOpenSourceOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-white to-teal-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-teal-950/20">
      <Header />
      
     
      {/* ---------- Keep your searchable hero (if desired) ---------- */}
      <section className="container">
        <SimpleHeroSection />
      </section>
      {/* ---------- New Brand Hero ---------- */}
      <HeroPro />

      

      {/* ---------- Social Proof / Trust ---------- */}
      <TrustBar />

      {/* ---------- Who We Help (retained but refreshed) ---------- */}
      <section
        id="who-we-help"
        className="py-24 bg-white/50 dark:bg-gray-900/40 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.14),transparent_55%)]" />
        <div className="container relative">
          <div className="text-center mb-16">
            <Badge>Built for Everyone</Badge>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mt-4">
              Built for Real People with Real Needs
            </h3>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mt-4">
              From individuals seeking care to organizations serving communities,
              our AI makes healthcare discovery accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <UserGroup
              icon={Users}
              title="Individuals & Families"
              desc="Find care without barriers—no insurance or documentation required."
              benefits={[
                'No insurance needed',
                'SSN not required',
                'Language support',
                'Free services',
              ]}
            />
            <UserGroup
              icon={Building}
              title="Social Workers"
              desc="Generate vetted provider lists tailored to each client in seconds."
              benefits={[
                'Instant provider lists',
                'Client-specific filters',
                'Export capabilities',
                'Always updated',
              ]}
            />
            <UserGroup
              icon={HeartHandshake}
              title="Non-Profits"
              desc="Enhance programs with comprehensive resource data and referrals."
              benefits={[
                'Community programs',
                'Resource libraries',
                'Referral networks',
                'Grant reporting',
              ]}
            />
            <UserGroup
              icon={Phone}
              title="Healthcare Navigators"
              desc="Empower navigation with accessibility insights and provider detail."
              benefits={[
                'Navigation tools',
                'Accessibility data',
                'Provider insights',
                'Client matching',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ---------- Collapsible Open Source Banner (retained, styled) ---------- */}
      <Collapsible
        open={isOpenSourceOpen}
        onOpenChange={setIsOpenSourceOpen}
        className="mt-4"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-teal-400 blur-3xl" />
            <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-emerald-400 blur-3xl" />
          </div>

          <div className="container relative z-10">
            <CollapsibleTrigger asChild>
              <button className="w-full py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors duration-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold">Open Source</span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">
                      Power Your Apps with Our NPI Lookup MCP Server
                    </h3>
                    <p className="text-teal-100 text-sm md:text-base">
                      The same technology that powers SIE Wellness—now available
                      to developers
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

            <CollapsibleContent className="pb-10">
              <div className="pt-6 border-t border-white/20">
                <div className="max-w-5xl space-y-8">
                  <p className="text-lg text-teal-100 leading-relaxed">
                    Validate healthcare providers, perform fuzzy matching, and
                    integrate real-time NPI lookups into your AI agents with our
                    MCP-compatible server.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                      icon={<Shield className="h-6 w-6 text-teal-900" />}
                      title="MCP Compatible"
                      desc="Plug directly into AI agents using Model Context Protocol."
                    />
                    <FeatureCard
                      icon={<Stethoscope className="h-6 w-6 text-teal-900" />}
                      title="Real-time Validation"
                      desc="Official CMS NPPES API v2.1 with caching for performance."
                    />
                    <FeatureCard
                      icon={<Users className="h-6 w-6 text-teal-900" />}
                      title="Production Ready"
                      desc="Multi-tier caching, rate limiting, and robust error handling."
                    />
                  </div>

                  <CodeCard 
                    filename="npi_lookup_example.py" 
                    code={`from ProviderSearchInput import NPILookupClient

async with NPILookupClient() as client:
    # Search by name and state
    results = await client.search_by_name("Mayo Clinic", state="MN")
    
    # Validate an NPI
    is_valid = await client.validate_npi("1234567890")
    
    # Search by location  
    results = await client.search_by_location(
        city="San Francisco", state="CA"
    )`} 
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-teal-900 hover:bg-teal-50 font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Link
                        href="https://github.com/pawelsloboda5/NPI_Lookup_MCP_Server"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        View on GitHub
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/20">
                    <Stat label="License" value="MIT" />
                    <Stat label="Compatible" value="Python 3.8+" />
                    <Stat label="Response Time" value="<500ms" />
                    <Stat label="Open Source" value="100%" />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </div>
      </Collapsible>

      {/* ---------- Footer ---------- */}
      <footer className="mt-auto border-t bg-background/70 backdrop-blur section-padding">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-600/10">
                  <Image
                    src="/logo_560x560.png"
                    alt="SIE Wellness Logo"
                    width={32}
                    height={32}
                    className="rounded"
                  />
                </div>
                <span className="text-h5 font-semibold">SIE Wellness</span>
              </Link>
              <p className="text-body-sm text-muted-foreground">
                AI-powered healthcare discovery for everyone.
              </p>
            </div>

            <div>
              <h5 className="text-h6 mb-3 font-semibold">Platform</h5>
              <div className="space-y-2 text-body-sm text-muted-foreground">
                <Link href="/app" className="block hover:underline">
                  Search Providers
                </Link>
                <Link href="/providers" className="block hover:underline">
                  Browse Providers
                </Link>
              </div>
            </div>

            <div>
              <h5 className="text-h6 mb-3 font-semibold">Company</h5>
              <div className="space-y-2 text-body-sm text-muted-foreground">
                <Link href="#who-we-help" className="block hover:underline">
                  Who We Help
                </Link>
                <Link href="/about" className="block hover:underline">
                  About
                </Link>
                <Link href="/blog" className="block hover:underline">
                  Blog
                </Link>
              </div>
            </div>

            <div>
              <h5 className="text-h6 mb-3 font-semibold">Emergency</h5>
              <div className="space-y-2 text-body-sm">
                <Link
                  href="tel:911"
                  className="block text-destructive font-semibold hover:underline"
                >
                  Emergency 911
                </Link>
                <Link
                  href="tel:988"
                  className="block text-blue-600 font-semibold hover:underline"
                >
                  Crisis Line 988
                </Link>
                <Link
                  href="tel:211"
                  className="block text-green-600 font-semibold hover:underline"
                >
                  Community Resources 211
                </Link>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} SIE Wellness. Built with ♥ for
              communities in need.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="mailto:hello@siewellness.org" className="hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Helper Components ---------- */

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-teal-700 border-teal-200 bg-teal-50 dark:text-teal-300 dark:border-teal-900/60 dark:bg-teal-900/20 ${className}`}>
      {children}
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-sm text-teal-100">{desc}</p>
    </div>
  );
}

function CodeCard({ filename, code }: { filename: string; code: string }) {
  return (
    <div className="bg-gray-900/60 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
      <div className="text-left">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="ml-4 text-sm text-gray-400">{filename}</span>
        </div>
        <pre className="text-sm text-teal-200 font-mono overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-teal-200">{value}</div>
      <div className="text-sm text-teal-100">{label}</div>
    </div>
  );
}

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
    <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-6 md:p-7">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal-50 dark:bg-teal-900/20 mb-5">
          <Icon className="h-7 w-7 text-[#068282] dark:text-teal-400" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h4>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-5">
          {desc}
        </p>
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <span className="text-[#14b8a6]">✓</span>
              <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
