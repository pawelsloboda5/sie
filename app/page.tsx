'use client'
import Link from "next/link";
import { ArrowRight, HeartHandshake, MapPin, Stethoscope, Users, Shield, Clock, Globe, CreditCard, Building, Phone } from "lucide-react";
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
      <SimpleHeroSection />

      {/* ---------- Preventive Care Service ---------- */}
      <section className="relative flex flex-col items-center justify-center min-h-[50vh] px-4 py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HeartHandshake className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Coming Soon</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              SIE Wellness Preventative Healthcare Coverage
            </h2>
            
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed mb-8">
              We&apos;re excited to announce the upcoming launch of SIE Wellness Preventative Healthcare Coverage, 
              designed to proactively support your wellness with annual physicals, dental cleanings, essential 
              lab tests, and personalized add-on services. Our plans are highly affordable with flexible 
              payment options to fit your budget.
            </p>
            
            <p className="max-w-2xl mx-auto text-base text-muted-foreground mb-12">
              Sign up today to receive updates, exclusive early access opportunities, and news about our official start date!
            </p>
          </div>

          {/* Email Signup */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-3 p-2 bg-background/80 backdrop-blur border rounded-full shadow-lg">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 border-0 bg-transparent px-4 py-3 rounded-l-full focus:ring-0"
              />
              <Button 
                size="lg" 
                className="px-6 py-3 font-semibold rounded-r-full bg-primary hover:bg-primary/90 transition-all"
              >
                Join Waitlist
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Annual Physicals</h4>
              <p className="text-sm text-muted-foreground">Comprehensive yearly checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <HeartHandshake className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Dental Care</h4>
              <p className="text-sm text-muted-foreground">Regular cleanings and checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Lab Tests</h4>
              <p className="text-sm text-muted-foreground">Essential health screenings</p>
            </div>
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
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Meet Your AI Healthcare Team
          </h3>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl">
            Six specialized AI agents work around the clock, each one a digital expert that
          </p>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl">
            never sleeps, never takes breaks, and never stops helping you find the care you need.
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
            From individuals seeking care to organizations serving communities, 
          </p>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
            our AI makes healthcare accessible for everyone.
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


      {/* ---------- Impact Stories ---------- */}
      <section id="impact" className="py-24 bg-muted/40">
        <div className="container max-w-screen-xl px-4 md:px-6 mx-auto text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Real Impact, Real Stories
          </h3>
          <p className="max-w-4xl mx-auto text-muted-foreground text-lg">
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