import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Stethoscope, Brain, Pill, Heart, Baby, Eye, Activity, 
  Syringe, Users, Home, Shield, ArrowRight 
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Healthcare Services Directory | Find Affordable Care by Category',
  description: 'Browse affordable healthcare services including primary care, mental health, dental, urgent care, and specialty services. Find providers with transparent pricing.',
  keywords: ['healthcare services', 'medical services directory', 'affordable healthcare categories', 'find doctors by specialty'],
}

const services = [
  {
    icon: Stethoscope,
    name: 'Primary Care',
    slug: 'primary-care',
    description: 'Family doctors, check-ups, and preventive care',
    priceRange: '$20-75',
    popular: true,
    features: ['Annual physicals', 'Sick visits', 'Chronic disease management']
  },
  {
    icon: Brain,
    name: 'Mental Health',
    slug: 'mental-health',
    description: 'Therapy, counseling, and psychiatric services',
    priceRange: '$40-80',
    popular: true,
    features: ['Sliding scale therapy', 'Group sessions', 'Crisis support']
  },
  {
    icon: Activity,
    name: 'Urgent Care',
    slug: 'urgent-care',
    description: 'Walk-in clinics for non-emergency issues',
    priceRange: '$50-150',
    popular: true,
    features: ['No appointment needed', 'Minor injuries', 'Quick treatment']
  },
  {
    icon: Heart,
    name: 'Dental Care',
    slug: 'dental-care',
    description: 'Cleanings, fillings, and oral health',
    priceRange: '$30-100',
    popular: false,
    features: ['Free cleanings', 'Payment plans', 'Emergency dental']
  },
  {
    icon: Eye,
    name: 'Vision Care',
    slug: 'vision-care',
    description: 'Eye exams, glasses, and vision health',
    priceRange: '$35-85',
    popular: false,
    features: ['Free eye exams', 'Discount glasses', 'Contact lenses']
  },
  {
    icon: Baby,
    name: "Women's Health",
    slug: 'womens-health',
    description: 'OB/GYN, prenatal, and reproductive health',
    priceRange: '$25-100',
    popular: false,
    features: ['Prenatal care', 'Family planning', 'Wellness exams']
  },
  {
    icon: Users,
    name: 'Pediatrics',
    slug: 'pediatrics',
    description: "Children's healthcare and immunizations",
    priceRange: '$20-60',
    popular: false,
    features: ['Well-child visits', 'Vaccinations', 'Development checks']
  },
  {
    icon: Syringe,
    name: 'Lab Tests',
    slug: 'lab-tests',
    description: 'Blood work, diagnostics, and screenings',
    priceRange: '$15-50',
    popular: false,
    features: ['Basic panels', 'STI testing', 'Health screenings']
  },
  {
    icon: Pill,
    name: 'Pharmacy',
    slug: 'pharmacy',
    description: 'Prescription medications and discounts',
    priceRange: 'Varies',
    popular: false,
    features: ['Generic drugs', 'Discount programs', 'Mail order']
  },
  {
    icon: Shield,
    name: 'Specialty Care',
    slug: 'specialty-care',
    description: 'Specialists and advanced medical care',
    priceRange: '$75-200',
    popular: false,
    features: ['Cardiology', 'Dermatology', 'Orthopedics']
  },
  {
    icon: Home,
    name: 'Home Health',
    slug: 'home-health',
    description: 'In-home care and support services',
    priceRange: '$30-80/hr',
    popular: false,
    features: ['Nursing care', 'Physical therapy', 'Medical equipment']
  },
  {
    icon: Activity,
    name: 'Telehealth',
    slug: 'telehealth',
    description: 'Virtual doctor visits and online care',
    priceRange: '$20-60',
    popular: false,
    features: ['Video consultations', '24/7 availability', 'E-prescriptions']
  }
]

export default function ServicesPage() {
  const popularServices = services.filter(s => s.popular)
  const allServices = services

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Healthcare Services Directory
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Find affordable healthcare providers by service type. Compare prices, find free clinics, 
            and discover sliding scale options for every medical need.
          </p>
          
          {/* Quick Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/copilot">
                Ask AI for Help
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/cities">
                Browse by Location
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-12 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Most Popular Services</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`} className="group">
                <Card className="h-full hover:shadow-lg transition-all hover:border-emerald-500 border-2 border-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <service.icon className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                        {service.priceRange}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-1">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center text-emerald-600 font-medium">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Services Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            All Healthcare Services
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Browse our complete directory of healthcare services. Each category includes 
            price comparisons, free options, and providers that accept uninsured patients.
          </p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allServices.map((service) => (
              <Link 
                key={service.slug} 
                href={`/services/${service.slug}`}
                className="group p-6 bg-white dark:bg-slate-800 rounded-lg hover:shadow-lg transition-all hover:scale-105"
              >
                <service.icon className="w-8 h-8 text-emerald-600 mb-3" />
                <h3 className="font-bold mb-1">{service.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {service.description}
                </p>
                <span className="text-sm font-semibold text-emerald-600">
                  {service.priceRange}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Find the Right Care at the Right Price
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="font-bold mb-2">Choose Service</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select the type of healthcare you need
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="font-bold mb-2">Compare Providers</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                See prices and available options
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="font-bold mb-2">Filter by Cost</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Find free, sliding scale, or low-cost care
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">4</span>
              </div>
              <h3 className="font-bold mb-2">Get Care</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Contact providers or book appointments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Links */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Quick Access
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Emergency Resources</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  24/7 crisis lines and emergency care
                </p>
                <Button asChild variant="destructive">
                  <Link href="/services/mental-health#crisis">
                    Get Crisis Help
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Free Clinics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Find no-cost healthcare near you
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/copilot?filter=free">
                    Find Free Care
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Compare Solutions</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  See how we stack up against others
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/compare">
                    View Comparisons
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Help Finding the Right Service?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Our AI copilot can guide you to the most affordable options for your specific needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
              <Link href="/copilot">
                Talk to AI Copilot
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-emerald-900 dark:text-white hover:bg-white/10">
              <Link href="/cities">
                Browse by City
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
