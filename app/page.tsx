'use client'
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, HeartHandshake, MapPin, Stethoscope, Users, Shield, Clock, CreditCard, Building, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SimpleHeroSection } from "@/components/home-page/SimpleHeroSection";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container max-w-screen-xl mx-auto flex h-20 items-center justify-between px-4">
          <Link href="#" className="flex items-center gap-4 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 transition-all duration-300 group-hover:scale-105">
              <Image
                src="/logo_560x560.png"
                alt="SIE Wellness Logo"
                width={48}
                height={48}
                className="rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="leading-tight">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">SIE Wellness</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Healthcare Discovery</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#agents" className="text-gray-600 dark:text-gray-400 hover:text-[#068282] dark:hover:text-teal-400 transition-colors duration-300 relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#068282] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#who-we-help" className="text-gray-600 dark:text-gray-400 hover:text-[#068282] dark:hover:text-teal-400 transition-colors duration-300 relative group">
              Who We Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#068282] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button asChild className="hidden md:inline-flex bg-[#068282] hover:bg-[#0f766e] text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-full px-6">
              <Link href="/app">
                Launch App <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ---------- Hero with Search ---------- */}
      <SimpleHeroSection />

      {/* ---------- Preventive Care Service ---------- */}
      <section className="section-padding bg-gradient-to-br from-teal-50/30 via-white to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-teal-900/10">
        <div className="container space-y-content">
          <div className="text-center space-y-element max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <HeartHandshake className="h-4 w-4 text-[#068282] dark:text-teal-400" />
              <span className="text-sm font-semibold text-[#068282] dark:text-teal-400">Coming Soon</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              SIE Wellness Preventative Healthcare Coverage
            </h2>
            
            <div className="space-y-6 mt-8">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                We&apos;re excited to announce the upcoming launch of SIE Wellness Preventative Healthcare Coverage, 
                designed to proactively support your wellness with annual physicals, dental cleanings, essential 
                lab tests, and personalized add-on services.
              </p>
              
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Our plans are highly affordable with flexible payment options to fit your budget. 
                Sign up today to receive updates, exclusive early access opportunities, and news about our official start date!
              </p>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-lg mx-auto mt-12">
            <div className="flex gap-3 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 border-0 bg-transparent text-base py-4 px-4 focus:outline-none focus:ring-0 placeholder:text-gray-400"
              />
              <Button 
                size="lg" 
                className="px-6 py-4 bg-[#068282] hover:bg-[#0f766e] text-white rounded-xl transition-all duration-300"
              >
                Join Waitlist
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6">
                <Stethoscope className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Annual Physicals</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive yearly checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6">
                <HeartHandshake className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Dental Care</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Regular cleanings and checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6">
                <Users className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Lab Tests</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Essential health screenings</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Quick Stats ---------- */}
      <section className="py-16 border-y bg-teal-50/30 dark:bg-gray-900/50">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="2,300+" label="Healthcare Providers" icon={Building} />
          <Stat number="68,000+" label="Verified Services" icon={Stethoscope} />
          <Stat number="24/7" label="AI Monitoring" icon={Clock} />
          <Stat number="100%" label="Free to Use" icon={HeartHandshake} />
        </div>
      </section>

      {/* ---------- AI Agents Section ---------- */}
      <section id="agents" className="py-24 bg-white dark:bg-gray-900">
        <div className="container text-center space-y-content">
          <div className="space-y-element max-w-4xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              How It Works
            </h3>
            <div className="space-y-4">
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Six specialized AI agents work around the clock, each one a digital expert that
                never sleeps, never takes breaks, and never stops helping you find the care you need.
              </p>
            </div>
          </div>
        </div>
        
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <AgentCard 
            icon={Stethoscope} 
            title="Service Agent" 
            nickname="The Care Cataloger"
            desc="Identifies every single healthcare service a provider offers—from basic checkups to specialized procedures. Categorizes them into general care, diagnostics, preventive services, and specialty treatments with surgical precision."
            capabilities={["68K+ services cataloged", "Real-time service updates", "Free service detection"]}
          />
          <AgentCard 
            icon={CreditCard} 
            title="Insurance Agent" 
            nickname="The Payment Navigator"
            desc="Decodes complex insurance policies and payment options. Knows exactly which providers accept Medicaid, Medicare, specific insurance plans, or offer self-pay options for the uninsured."
            capabilities={["Insurance verification", "Self-pay options", "Sliding scale detection"]}
          />
          <AgentCard 
            icon={Shield} 
            title="Eligibility Agent" 
            nickname="The Access Guardian"
            desc="Your advocate for getting in the door. Discovers age limits, new patient policies, referral requirements, and eligibility criteria so you know exactly what you need before you go."
            capabilities={["Eligibility screening", "Referral requirements", "Age & condition limits"]}
          />
          <AgentCard 
            icon={Users} 
            title="Social Services Agent" 
            nickname="The Community Connector"
            desc="Specializes in vulnerable populations. Finds language support, accessibility features, and documentation requirements. Knows which clinics welcome undocumented immigrants and non-English speakers."
            capabilities={["Language support", "SSN requirements", "Accessibility features"]}
          />
          <AgentCard 
            icon={HeartHandshake} 
            title="Free Services Agent" 
            nickname="The Opportunity Hunter"
            desc="Laser-focused on finding free and discounted healthcare. Scours websites for sliding scale fees, charity care programs, and completely free services to help those who need it most."
            capabilities={["Free care programs", "Sliding scale fees", "Charity care detection"]}
          />
          <AgentCard 
            icon={MapPin} 
            title="Location Intelligence" 
            nickname="The Geographic Genius"
            desc="Your personal geography expert. Analyzes locations, calculates distances, considers public transit access, and prioritizes providers based on your proximity and accessibility needs."
            capabilities={["Geographic analysis", "Distance calculation", "Transit accessibility"]}
          />
        </div>
      </section>

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

      {/* ---------- Open Source CTA ---------- */}
      <section className="py-24 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Open Source Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Open Source</span>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-4xl md:text-5xl font-bold leading-tight">
                Power Your Apps with Our 
                <span className="block text-teal-200">NPI Lookup MCP Server</span>
              </h3>
              
              <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
                The same technology that powers SIE Wellness is now available as an open-source 
                MCP server. Validate healthcare providers, perform fuzzy matching, and integrate 
                real-time NPI lookups into your AI agents.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-teal-900" />
                </div>
                <h4 className="text-lg font-semibold mb-2">MCP Compatible</h4>
                <p className="text-sm text-teal-100">Seamlessly integrate with AI agents using the Model Context Protocol</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Stethoscope className="h-6 w-6 text-teal-900" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Real-time Validation</h4>
                <p className="text-sm text-teal-100">Official CMS NPPES API v2.1 integration with intelligent caching</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-teal-900" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Production Ready</h4>
                <p className="text-sm text-teal-100">Multi-tier caching, rate limiting, and comprehensive error handling</p>
              </div>
            </div>

            {/* Code Preview */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-white/20 backdrop-blur-sm mt-8">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-white/20">
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
      </section>



      {/* ---------- Footer ---------- */}
      <footer className="mt-auto border-t bg-background/80 section-padding">
        <div className="container">
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
                <Link href="#agents" className="block hover:underline">AI Agents</Link>
                <Link href="#how-it-works" className="block hover:underline">How It Works</Link>
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

function Stat({ number, label, icon: Icon }: { number: string; label: string; icon: typeof MapPin }) {
  return (
    <div className="space-y-3 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-2">
        <Icon className="h-8 w-8 text-[#068282] dark:text-teal-400" />
      </div>
      <div className="text-3xl font-bold text-[#068282] dark:text-teal-400">{number}</div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

function AgentCard({ 
  icon: Icon, 
  title, 
  nickname, 
  desc, 
  capabilities 
}: { 
  icon: typeof MapPin; 
  title: string; 
  nickname: string;
  desc: string; 
  capabilities: string[];
}) {
  return (
    <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group rounded-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 transition-all duration-300">
            <Icon className="h-8 w-8 text-[#068282] dark:text-teal-400" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h4>
            <p className="text-sm text-[#068282] dark:text-teal-400 italic font-medium">{nickname}</p>
          </div>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
        <div className="space-y-3">
          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-[#068282] dark:bg-teal-400 flex-shrink-0"></div>
              <span className="text-gray-600 dark:text-gray-400">{capability}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
