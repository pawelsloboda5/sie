'use client'
import Link from "next/link";
import { ArrowRight, HeartHandshake, MapPin, Stethoscope, Users, Search, Bot, Shield, Zap, Clock, Globe, FileText, CreditCard, Building, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { SimpleHeroSection } from "@/components/home-page/SimpleHeroSection";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-screen-xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary transition-colors group-hover:bg-primary/90">
              <span className="text-primary-foreground text-base font-semibold">♥</span>
            </div>
            <span className="sr-only">SieWell home</span>
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight">SieWell</h1>
              <p className="text-[11px] font-medium text-muted-foreground">AI‑Powered Healthcare Discovery</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#agents" className="hover:text-foreground/90 transition-colors">AI Agents</Link>
            <Link href="#who-we-help" className="hover:text-foreground/90 transition-colors">Who We Help</Link>
            <Link href="#how-it-works" className="hover:text-foreground/90 transition-colors">How It Works</Link>
            <Link href="#impact" className="hover:text-foreground/90 transition-colors">Impact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="tel:911" className="hidden sm:inline-flex text-sm text-destructive font-semibold hover:underline">Emergency 911</Link>
            <Link href="tel:988" className="hidden sm:inline-flex text-sm text-blue-600 font-semibold hover:underline">Crisis 988</Link>
            <Button asChild className="hidden md:inline-flex">
              <Link href="/app">
                Launch App <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ---------- Hero with Search ---------- */}
      <section className="pt-16 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-30"></div>
        <div className="container max-w-screen-lg px-4 md:px-6 mx-auto relative">
          <Badge variant="secondary" className="mb-6 animate-pulse">
            <Bot className="w-3 h-3 mr-1" />
            6 AI Agents Working 24/7
          </Badge>
          <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Healthcare That&nbsp;
            <span className="text-primary">Finds You</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg md:text-xl text-muted-foreground mb-8">
            Our AI agents never sleep, constantly scanning thousands of clinics to instantly connect you with free, low-cost, and accessible healthcare—no insurance, no documentation, no barriers.
          </p>
          
          {/* Search CTA */}
          <div className="max-w-2xl mx-auto mb-8">
            <SimpleHeroSection />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" size="lg" asChild>
              <Link href="#agents">Meet Our AI Agents</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- Quick Stats ---------- */}
      <section className="py-12 border-y bg-muted/40">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="2,300+" label="Healthcare Providers" icon={Building} />
          <Stat number="68,000+" label="Verified Services" icon={Stethoscope} />
          <Stat number="24/7" label="AI Monitoring" icon={Clock} />
          <Stat number="100%" label="Free to Use" icon={HeartHandshake} />
        </div>
      </section>

      {/* ---------- AI Agents Section ---------- */}
      <section id="agents" className="py-24">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered Intelligence
          </Badge>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Meet Your AI Healthcare Team
          </h3>
          <p className="max-w-4xl mx-auto text-muted-foreground text-lg md:text-xl">
            Six specialized AI agents work around the clock, each one a digital expert that never sleeps, never takes breaks, and never stops helping you find the care you need.
          </p>
        </div>
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section id="who-we-help" className="py-24 bg-muted/40">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Built for Real People with Real Needs
          </h3>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
            From individuals seeking care to organizations serving communities, our AI makes healthcare accessible for everyone.
          </p>
        </div>
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* ---------- How It Works ---------- */}
      <section id="how-it-works" className="py-24">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Bot className="w-3 h-3 mr-1" />
            Autonomous Intelligence
          </Badge>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            While You Sleep, We Work
          </h3>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
            Our AI agents operate in a sophisticated pipeline, constantly monitoring and extracting healthcare data so you always have the most current information.
          </p>
        </div>
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessStep 
              step="01"
              title="Continuous Discovery"
              desc="Our agents scan thousands of healthcare provider websites every night, identifying new services, updated policies, and changing requirements."
            />
            <ProcessStep 
              step="02"
              title="Intelligent Extraction"
              desc="Six specialized agents work in parallel, each extracting different types of information—services, insurance, eligibility, accessibility, and free care options."
            />
            <ProcessStep 
              step="03"
              title="Instant Access"
              desc="When you search, our vector database instantly matches your needs with the most relevant providers, filtered by your specific requirements and location."
            />
          </div>
        </div>
      </section>

      {/* ---------- Impact Stories ---------- */}
      <section id="impact" className="py-24 bg-muted/40">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Real Impact, Real Stories
          </h3>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
            See how CareFind transforms healthcare access for individuals and organizations across the country.
          </p>
        </div>
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <ImpactCard 
            metric="89%"
            title="Faster Resource Discovery"
            desc="Social workers find relevant healthcare resources 89% faster than traditional methods, spending more time with clients instead of researching."
          />
          <ImpactCard 
            metric="2,400+"
            title="People Helped Weekly"
            desc="Individuals successfully connected to free and low-cost healthcare services through our platform every week."
          />
          <ImpactCard 
            metric="$847K"
            title="Healthcare Savings"
            desc="Estimated savings in healthcare costs by connecting people to free and sliding-scale services instead of emergency care."
          />
        </div>
      </section>

      {/* ---------- Why Choose CareFind ---------- */}
      <section className="py-24">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="outline" className="mb-4">
              <Globe className="w-3 h-3 mr-1" />
              Trusted by Communities
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Why Organizations Choose CareFind
            </h3>
            <div className="space-y-6">
              <Feature 
                title="Always Current"
                desc="Our AI agents work 24/7, ensuring you always have the most up-to-date provider information."
              />
              <Feature 
                title="Comprehensive Coverage"
                desc="From insurance requirements to language support, we capture every detail that matters for access."
              />
              <Feature 
                title="Vulnerable Population Focus"
                desc="Specifically designed to serve undocumented immigrants, uninsured individuals, and other marginalized communities."
              />
              <Feature 
                title="Scalable Impact"
                desc="Whether you're helping one person or hundreds, our platform scales to meet your organization's needs."
              />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl"></div>
            <Card className="relative border-0 shadow-2xl">
              <CardContent className="p-8">
                <h4 className="text-xl font-semibold mb-4">Start Using CareFind Today</h4>
                <p className="text-muted-foreground mb-6">
                  Join thousands of social workers, healthcare navigators, and community organizations already using CareFind to transform healthcare access.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/app">
                      Launch CareFind App
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href="mailto:hello@carefind.org">
                      Schedule a Demo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="mt-auto border-t bg-background/80 py-16">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Link href="#" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <span className="text-primary-foreground text-sm font-semibold">♥</span>
                </div>
                <span className="text-lg font-bold">CareFind</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered healthcare discovery for everyone.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Platform</h5>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/app" className="block hover:underline">Search Providers</Link>
                <Link href="#agents" className="block hover:underline">AI Agents</Link>
                <Link href="#how-it-works" className="block hover:underline">How It Works</Link>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Resources</h5>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/docs" className="block hover:underline">Documentation</Link>
                <Link href="/api" className="block hover:underline">API Access</Link>
                <Link href="/support" className="block hover:underline">Support</Link>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Emergency</h5>
              <div className="space-y-2 text-sm">
                <Link href="tel:911" className="block text-destructive font-semibold hover:underline">Emergency 911</Link>
                <Link href="tel:988" className="block text-blue-600 font-semibold hover:underline">Crisis Line 988</Link>
                <Link href="tel:211" className="block text-green-600 font-semibold hover:underline">Community Resources 211</Link>
              </div>
            </div>
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CareFind. Built with ♥ for communities in need.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="/terms" className="hover:underline">Terms</Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href="mailto:hello@carefind.org" className="hover:underline">Contact</Link>
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
      <div className="text-3xl md:text-4xl font-extrabold text-primary">{number}</div>
      <p className="text-muted-foreground text-sm">{label}</p>
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
    <Card className="h-full shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground italic">{nickname}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{desc}</p>
        <div className="space-y-1">
          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
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
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className="text-muted-foreground text-sm mb-4">{desc}</p>
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="text-green-600">✓</span>
              <span className="text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProcessStep({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4">
        {step}
      </div>
      <h4 className="text-xl font-semibold mb-3">{title}</h4>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function ImpactCard({ metric, title, desc }: { metric: string; title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="text-4xl font-extrabold text-primary mb-2">{metric}</div>
        <h4 className="text-lg font-semibold mb-3">{title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
      <div>
        <h5 className="font-semibold mb-1">{title}</h5>
        <p className="text-muted-foreground text-sm">{desc}</p>
      </div>
    </div>
  );
}