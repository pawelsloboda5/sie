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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300 group-hover:scale-105 group-hover:from-primary/20 group-hover:to-primary/10">
              <Image
                src="/logo_560x560.png"
                alt="SIE Wellness Logo"
                width={56}
                height={56}
                className="rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-muted-foreground">AI‑Powered Healthcare Discovery</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#agents" className="text-muted-foreground hover:text-primary transition-colors duration-300 relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#who-we-help" className="text-muted-foreground hover:text-primary transition-colors duration-300 relative group">
              Who We Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button asChild className="hidden md:inline-flex bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl">
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
      <section className="section-padding bg-gradient-to-br from-muted/20 via-background to-muted/30">
        <div className="container space-y-content">
          <div className="text-center space-y-element max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <HeartHandshake className="h-4 w-4 text-primary" />
              <span className="text-body-sm font-semibold text-primary">Coming Soon</span>
            </div>
            
            <h2 className="text-h1">
              SIE Wellness Preventative Healthcare Coverage
            </h2>
            
            <div className="space-y-4">
              <p className="text-lead">
                We&apos;re excited to announce the upcoming launch of SIE Wellness Preventative Healthcare Coverage, 
                designed to proactively support your wellness with annual physicals, dental cleanings, essential 
                lab tests, and personalized add-on services.
              </p>
              
              <p className="text-body-base text-muted-foreground">
                Our plans are highly affordable with flexible payment options to fit your budget. 
                Sign up today to receive updates, exclusive early access opportunities, and news about our official start date!
              </p>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-lg mx-auto">
            <div className="flex gap-3 p-2 glass rounded-2xl card-shadow-lg">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 border-0 bg-transparent input-lg rounded-l-2xl focus-ring-visible"
              />
              <Button 
                size="lg" 
                className="btn-lg rounded-r-2xl bg-primary hover:bg-primary/90 transition-smooth"
              >
                Join Waitlist
              </Button>
            </div>
            <p className="text-body-sm text-muted-foreground mt-3 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-h5 mb-2">Annual Physicals</h4>
              <p className="text-body-sm text-muted-foreground">Comprehensive yearly checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <HeartHandshake className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-h5 mb-2">Dental Care</h4>
              <p className="text-body-sm text-muted-foreground">Regular cleanings and checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-h5 mb-2">Lab Tests</h4>
              <p className="text-body-sm text-muted-foreground">Essential health screenings</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Quick Stats ---------- */}
      <section className="section-padding-sm border-y bg-muted/40">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="2,300+" label="Healthcare Providers" icon={Building} />
          <Stat number="68,000+" label="Verified Services" icon={Stethoscope} />
          <Stat number="24/7" label="AI Monitoring" icon={Clock} />
          <Stat number="100%" label="Free to Use" icon={HeartHandshake} />
        </div>
      </section>

      {/* ---------- AI Agents Section ---------- */}
      <section id="agents" className="section-padding">
        <div className="container text-center space-y-content">
          <div className="space-y-element max-w-4xl mx-auto">
            <h3 className="text-h1">
              How It Works
            </h3>
            <div className="space-y-4">
              <p className="text-lead">
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
      <section id="who-we-help" className="section-padding bg-muted/40">
        <div className="container text-center mb-16">
          <h3 className="text-h1 mb-6">
            Built for Real People with Real Needs
          </h3>
          <div className="space-y-2 max-w-3xl mx-auto">
            <p className="text-lead">
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
      <Icon className="h-8 w-8 text-primary mx-auto" />
      <div className="text-display-sm text-primary">{number}</div>
      <p className="text-body-sm text-muted-foreground">{label}</p>
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
    <Card className="h-full card-shadow hover:card-shadow-lg transition-slow hover-lift-sm group">
      <CardContent className="p-8 space-y-element">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-smooth">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-h5">{title}</h4>
            <p className="text-body-sm text-muted-foreground italic">{nickname}</p>
          </div>
        </div>
        <p className="text-body-base text-muted-foreground">{desc}</p>
        <div className="space-y-2">
          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-center gap-3 text-body-sm">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
              <span className="text-muted-foreground">{capability}</span>
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
    <Card className="h-full">
      <CardContent className="p-6 text-center">
        <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
        <h4 className="text-h5 mb-3">{title}</h4>
        <p className="text-body-sm text-muted-foreground mb-4">{desc}</p>
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-body-xs">
              <span className="text-green-600">✓</span>
              <span className="text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
