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
            
            <div className="space-y-4">
              <p className="text-xl text-gray-700 dark:text-gray-300">
                We&apos;re excited to announce the upcoming launch of SIE Wellness Preventative Healthcare Coverage, 
                designed to proactively support your wellness with annual physicals, dental cleanings, essential 
                lab tests, and personalized add-on services.
              </p>
              
              <p className="text-base text-gray-600 dark:text-gray-400">
                Our plans are highly affordable with flexible payment options to fit your budget. 
                Sign up today to receive updates, exclusive early access opportunities, and news about our official start date!
              </p>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-lg mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-4">
                <Stethoscope className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Annual Physicals</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive yearly checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-4">
                <HeartHandshake className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Dental Care</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Regular cleanings and checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-4">
                <Users className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Lab Tests</h4>
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
              <h5 className="text-h6 mb-3">Resources</h5>
              <div className="space-y-2 text-body-sm text-muted-foreground">
                <Link href="/docs" className="block hover:underline">Documentation</Link>
                <Link href="/api" className="block hover:underline">API Access</Link>
                <Link href="/support" className="block hover:underline">Support</Link>
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
