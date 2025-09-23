import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, Heart, DollarSign, Users, Shield, MapPin, Clock, ArrowRight, Check, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Affordable Primary Care | Family Doctors & Clinics',
  description: 'Find affordable primary care doctors, family physicians, and community health centers. Free clinics, sliding scale fees, no insurance needed.',
  keywords: ['affordable primary care', 'cheap doctor visit', 'family doctor without insurance', 'free health clinics', 'community health centers'],
}

export default function PrimaryCare() {
  const services = [
    {
      icon: Stethoscope,
      title: 'Annual Check-ups',
      description: 'Preventive care and routine physical exams',
      priceRange: '$20-75',
      features: ['Health screenings', 'Vaccinations', 'Lab work included']
    },
    {
      icon: Heart,
      title: 'Chronic Disease Management',
      description: 'Ongoing care for diabetes, hypertension, and more',
      priceRange: '$30-80',
      features: ['Medication management', 'Regular monitoring', 'Care coordination']
    },
    {
      icon: Shield,
      title: 'Preventive Care',
      description: 'Immunizations, screenings, and wellness visits',
      priceRange: 'Often FREE',
      features: ['Flu shots', 'Cancer screenings', 'Health education']
    },
    {
      icon: Clock,
      title: 'Same-Day Sick Visits',
      description: 'Treatment for acute illnesses and minor injuries',
      priceRange: '$25-60',
      features: ['Walk-in available', 'Quick diagnosis', 'Prescription services']
    }
  ]

  const clinicTypes = [
    {
      name: 'Federally Qualified Health Centers (FQHCs)',
      description: 'Government-funded centers with sliding scale fees',
      avgCost: '$20-40',
      benefits: ['Income-based pricing', 'No one turned away', 'Comprehensive services']
    },
    {
      name: 'Free Clinics',
      description: 'Volunteer-run clinics offering no-cost care',
      avgCost: 'FREE',
      benefits: ['No insurance needed', 'No SSN required', 'Walk-ins welcome']
    },
    {
      name: 'Community Health Centers',
      description: 'Local centers serving all patients',
      avgCost: '$30-60',
      benefits: ['Payment plans', 'Multiple locations', 'Family care']
    },
    {
      name: 'Retail Clinics',
      description: 'Convenient care in pharmacies and stores',
      avgCost: '$40-75',
      benefits: ['No appointment', 'Evening hours', 'Basic care']
    }
  ]

  const commonConditions = [
    'Cold & Flu',
    'Allergies',
    'Diabetes',
    'High Blood Pressure',
    'Asthma',
    'Arthritis',
    'Infections',
    'Skin Conditions',
    'Digestive Issues',
    'Back Pain',
    'Headaches',
    'Minor Injuries'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Stethoscope className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              Affordable Primary Care Near You
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Find family doctors, community health centers, and free clinics offering 
              quality primary care at prices you can afford. No insurance? No problem.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">$20-75</div>
                <div className="text-sm text-slate-600">Average Visit Cost</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">1,400+</div>
                <div className="text-sm text-slate-600">FQHC Locations</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">28M+</div>
                <div className="text-sm text-slate-600">Patients Served Annually</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">FREE</div>
                <div className="text-sm text-slate-600">Preventive Services</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main CTA */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/copilot?service=primary-care">
                  Find Primary Care Providers
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
        </div>
      </section>

      {/* Types of Clinics */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Types of Affordable Primary Care
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {clinicTypes.map((type, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{type.name}</CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {type.avgCost}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="text-sm flex items-center">
                        <Check className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Primary Care Services Available
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <service.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {service.description}
                  </p>
                  <Badge className="mb-3">{service.priceRange}</Badge>
                  <ul className="space-y-1 mt-3">
                    {service.features.map((feature, fidx) => (
                      <li key={fidx} className="text-xs text-slate-600 dark:text-slate-400">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions Treated */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Conditions Treated in Primary Care
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Primary care providers can diagnose and treat a wide range of health conditions
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {commonConditions.map((condition, idx) => (
              <Badge key={idx} variant="outline" className="px-4 py-2 text-sm">
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Primary Care Cost Comparison
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Emergency Room</h3>
                <div className="text-3xl font-bold text-red-600 mb-2">$1,200+</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  For non-emergency primary care issues
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <X className="w-4 h-4 text-red-600 mr-2" />
                    Long wait times
                  </div>
                  <div className="flex items-center">
                    <X className="w-4 h-4 text-red-600 mr-2" />
                    Expensive for basic care
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-emerald-500">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 text-center">
                <Badge className="bg-emerald-600 text-white">BEST VALUE</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Community Health Center</h3>
                <div className="text-3xl font-bold text-emerald-600 mb-2">$20-75</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Comprehensive primary care services
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Sliding scale fees
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Same-day appointments
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Private Practice</h3>
                <div className="text-3xl font-bold text-amber-600 mb-2">$150-400</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Without insurance coverage
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <X className="w-4 h-4 text-red-600 mr-2" />
                    No sliding scale
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Choice of provider
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Find Care */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Find Affordable Primary Care
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-bold mb-2">Enter Your Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We&apos;ll find clinics and doctors near you
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-bold mb-2">Filter by Cost</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Find free clinics or sliding scale options
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-bold mb-2">Check Eligibility</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                See what documents you need to bring
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-bold mb-2">Get Care</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Call or visit for affordable treatment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is a Federally Qualified Health Center (FQHC)?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  FQHCs are community-based healthcare providers that receive federal funding to provide 
                  primary care services in underserved areas. They offer sliding fee scales based on 
                  income and family size, and they cannot turn away patients due to inability to pay.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Can I get primary care without insurance?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes! Community health centers, free clinics, and many FQHCs provide care regardless of 
                  insurance status. They offer sliding scale fees based on your income, with many services 
                  available for $20-40 per visit or even free for those who qualify.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>What services are typically included in primary care?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Primary care includes preventive services (check-ups, vaccinations), treatment for common 
                  illnesses, management of chronic conditions, basic lab work, health screenings, referrals 
                  to specialists, and health education. Many clinics also offer mental health and dental services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Health Shouldn&apos;t Wait for Insurance
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Find affordable primary care providers near you today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-slate-100">
              <Link href="/copilot?service=primary-care">
                Find Primary Care Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-blue-900 dark:text-white hover:bg-white/10">
              <Link href="/services">
                Browse All Services
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": "Affordable Primary Care Services",
            "description": "Find affordable primary care doctors, family physicians, and community health centers",
            "specialty": "Primary Care",
            "medicalAudience": {
              "@type": "MedicalAudience",
              "audienceType": "Patient"
            }
          })
        }}
      />
    </div>
  )
}
