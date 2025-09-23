import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LucideIcon } from 'lucide-react'
import { 
  Pill, Heart, Baby, Eye, Activity, 
  Syringe, Users, Home, Shield, Phone, ArrowRight, Check, DollarSign 
} from 'lucide-react'

type PageParams = { service: string }
type PageProps = { params: Promise<PageParams> }

async function unwrapParams<T>(p: T | Promise<T>): Promise<T> { return await p }

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

function titleize(key: string) {
  return key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface ServiceConfig {
  icon: LucideIcon
  title: string
  description: string
  priceRange: string
  metaDescription: string
  features: string[]
  conditions: string[]
}

// Service configuration data
const serviceData: Record<string, ServiceConfig> = {
  'urgent-care': {
    icon: Activity,
    title: 'Urgent Care',
    description: 'Walk-in clinics for non-emergency medical issues',
    priceRange: '$50-150',
    metaDescription: 'Find affordable urgent care clinics. Walk-in medical care for non-emergency issues. No appointment needed.',
    features: ['No appointment needed', 'Minor injuries', 'Illness treatment', 'X-rays available'],
    conditions: ['Sprains', 'Cuts', 'Infections', 'Flu', 'Minor burns', 'Allergic reactions']
  },
  'womens-health': {
    icon: Baby,
    title: "Women's Health",
    description: 'OB/GYN services, prenatal care, and reproductive health',
    priceRange: '$25-100',
    metaDescription: 'Affordable womens health services including OB/GYN, prenatal care, and reproductive health.',
    features: ['Prenatal care', 'Family planning', 'Wellness exams', 'Free clinics available'],
    conditions: ['Pregnancy', 'Birth control', 'STI screening', 'Mammograms', 'Pap smears']
  },
  'vision-care': {
    icon: Eye,
    title: 'Vision Care',
    description: 'Eye exams, glasses, and vision health services',
    priceRange: '$35-85',
    metaDescription: 'Affordable eye care including exams, glasses, and contacts. Find low-cost vision services.',
    features: ['Free eye exams', 'Discount glasses', 'Contact lenses', 'Vision screening'],
    conditions: ['Nearsightedness', 'Farsightedness', 'Astigmatism', 'Eye infections', 'Glaucoma screening']
  },
  'pediatrics': {
    icon: Users,
    title: 'Pediatrics',
    description: "Children's healthcare and immunizations",
    priceRange: '$20-60',
    metaDescription: 'Affordable pediatric care for children. Immunizations, check-ups, and sick visits.',
    features: ['Well-child visits', 'Vaccinations', 'Development checks', 'School physicals'],
    conditions: ['Growth monitoring', 'Immunizations', 'Common childhood illnesses', 'Behavioral concerns']
  },
  'lab-tests': {
    icon: Syringe,
    title: 'Lab Tests & Diagnostics',
    description: 'Blood work, diagnostics, and health screenings',
    priceRange: '$15-50',
    metaDescription: 'Affordable lab tests and diagnostic services. Blood work, STI testing, and health screenings.',
    features: ['Basic panels', 'STI testing', 'Health screenings', 'Quick results'],
    conditions: ['Blood tests', 'Cholesterol', 'Diabetes screening', 'Thyroid tests', 'STI tests']
  },
  'pharmacy': {
    icon: Pill,
    title: 'Pharmacy Services',
    description: 'Prescription medications and discount programs',
    priceRange: 'Varies',
    metaDescription: 'Find affordable prescription medications. Generic drugs, discount programs, and pharmacy services.',
    features: ['Generic drugs', 'Discount programs', 'Mail order', 'Free delivery'],
    conditions: ['Prescription fills', 'Generic alternatives', 'Medication counseling', 'Immunizations']
  },
  'specialty-care': {
    icon: Shield,
    title: 'Specialty Care',
    description: 'Specialists and advanced medical care',
    priceRange: '$75-200',
    metaDescription: 'Find affordable specialists including cardiology, dermatology, and orthopedics.',
    features: ['Cardiology', 'Dermatology', 'Orthopedics', 'Neurology'],
    conditions: ['Heart conditions', 'Skin disorders', 'Joint problems', 'Neurological issues']
  },
  'home-health': {
    icon: Home,
    title: 'Home Health Services',
    description: 'In-home care and support services',
    priceRange: '$30-80/hr',
    metaDescription: 'Affordable home health services including nursing care, physical therapy, and medical equipment.',
    features: ['Nursing care', 'Physical therapy', 'Medical equipment', 'Respite care'],
    conditions: ['Post-surgery care', 'Chronic conditions', 'Mobility issues', 'Elder care']
  },
  'telehealth': {
    icon: Phone,
    title: 'Telehealth Services',
    description: 'Virtual doctor visits and online care',
    priceRange: '$20-60',
    metaDescription: 'Affordable telehealth and virtual doctor visits. Online healthcare from home.',
    features: ['Video consultations', '24/7 availability', 'E-prescriptions', 'Mental health'],
    conditions: ['Common illnesses', 'Prescription refills', 'Mental health', 'Follow-ups']
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service } = await unwrapParams(params)
  const config = serviceData[service]
  const serviceName = config?.title ?? titleize(service)
  const title = `Affordable ${serviceName} | Find Low-Cost Care`
  const description = config?.metaDescription ?? `Find affordable ${serviceName.toLowerCase()} services. Compare prices and find free or low-cost providers near you.`
  
  return {
    title,
    description,
    keywords: [`affordable ${service}`, `cheap ${service}`, `low cost ${service}`, `${service} without insurance`],
    alternates: { canonical: `/services/${service}` },
    openGraph: { title, description, url: `${siteUrl}/services/${service}` },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { service } = await unwrapParams(params)
  const config = serviceData[service]
  
  // If we don't have specific data for this service, show a general page
  if (!config) {
    const serviceName = titleize(service)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <Header />
        <section className="pt-24 pb-12 px-4">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                {serviceName} Services
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
                Find affordable {serviceName.toLowerCase()} providers in your area. 
                Compare prices, find free clinics, and discover sliding scale options.
              </p>
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/copilot">
                  Find {serviceName} Providers
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
              <Icon className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              Affordable {config.title}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {config.description}. Find providers with transparent pricing, 
              sliding scale fees, and options for uninsured patients.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{config.priceRange}</div>
                <div className="text-sm text-slate-600">Average Cost</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm text-slate-600">Providers</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">No Insurance</div>
                <div className="text-sm text-slate-600">Accepted</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">Free Options</div>
                <div className="text-sm text-slate-600">Available</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main CTA */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/copilot?service=${service}`}>
                  Find {config.title} Providers
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/services">
                  Browse All Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Features */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What&apos;s Included
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {config.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <Check className="w-5 h-5 text-green-600 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conditions Treated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {config.conditions.map((condition: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Find Care */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Find Affordable {config.title}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="font-bold mb-2">Tell Us Your Needs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Share your location and what type of care you need
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-bold mb-2">Compare Options</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                See prices, locations, and availability for providers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-bold mb-2">Get Care</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Contact providers or book appointments directly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Affordable {config.title}?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Our AI copilot will help you find the best options for your budget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
              <Link href={`/copilot?service=${service}`}>
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/cities">
                Browse by Location
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}


