import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, MapPin, DollarSign, Clock, Star } from 'lucide-react'
import { Header } from '@/components/layout/Header'

// City data with SEO-optimized content
type TopService = {
  name: string
  type: string
  savings: string
}

type CityInfo = {
  name: string
  state: string
  population: string
  avgSavings: string
  providers: number
  freeClinic: number
  description: string
  neighborhoods: string[]
  topServices: TopService[]
}

const cityData: Record<string, CityInfo> = {
  'new-york': {
    name: 'New York',
    state: 'NY',
    population: '8.3M',
    avgSavings: '$3,200',
    providers: 287,
    freeClinic: 42,
    description: 'Find affordable healthcare in New York City. Access free clinics in Manhattan, Brooklyn, Queens, Bronx, and Staten Island.',
    neighborhoods: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
    topServices: [
      { name: 'NYC Health + Hospitals', type: 'Public System', savings: 'Free-$100' },
      { name: 'Community Healthcare Network', type: 'FQHC', savings: '$20-60' },
      { name: 'Ryan Health', type: 'Community Clinic', savings: '$15-75' }
    ]
  },
  'los-angeles': {
    name: 'Los Angeles',
    state: 'CA',
    population: '3.9M',
    avgSavings: '$2,800',
    providers: 234,
    freeClinic: 38,
    description: 'Affordable medical care in Los Angeles. Find free health clinics, low-cost dental care, and sliding scale mental health services.',
    neighborhoods: ['Downtown LA', 'Hollywood', 'Santa Monica', 'Pasadena', 'Long Beach'],
    topServices: [
      { name: 'LA County Health Services', type: 'County System', savings: 'Free-$80' },
      { name: 'Venice Family Clinic', type: 'Community Clinic', savings: '$0-50' },
      { name: 'APLA Health', type: 'FQHC', savings: '$20-70' }
    ]
  },
  'chicago': {
    name: 'Chicago',
    state: 'IL',
    population: '2.7M',
    avgSavings: '$2,600',
    providers: 198,
    freeClinic: 31,
    description: 'Chicago affordable healthcare guide. Free medical clinics, cheap urgent care, and low-cost specialists throughout Cook County.',
    neighborhoods: ['Loop', 'North Side', 'South Side', 'West Side', 'Northwest Side'],
    topServices: [
      { name: 'Cook County Health', type: 'Public Hospital', savings: 'Free-$90' },
      { name: 'Erie Family Health', type: 'FQHC', savings: '$15-60' },
      { name: 'Heartland Health Centers', type: 'Community Clinic', savings: '$25-80' }
    ]
  }
}

export async function generateStaticParams() {
  return Object.keys(cityData).map((city) => ({
    city: city,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: cityKey } = await params
  const city = cityData[cityKey] || cityData['new-york']
  
  return {
    title: `Affordable Healthcare in ${city.name}, ${city.state} | Free Clinics & Low-Cost Medical Care`,
    description: `Find affordable healthcare in ${city.name}. ${city.providers}+ verified providers, ${city.freeClinic} free clinics. Save ${city.avgSavings} annually. Compare prices for medical, dental, mental health care.`,
    keywords: [
      `${city.name} free clinics`,
      `${city.name} affordable healthcare`,
      `${city.name} low cost medical care`,
      `${city.name} cheap dentist`,
      `${city.name} sliding scale therapy`,
      `${city.name} uninsured medical help`,
      `free healthcare ${city.name}`,
      `medicaid doctors ${city.name}`
    ],
    openGraph: {
      title: `${city.name} Affordable Healthcare | SIE Wellness`,
      description: city.description,
      images: [`/og-${cityKey}.png`],
    },
    alternates: {
      canonical: `https://www.sie2.com/find-care/${cityKey}`
    }
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: cityKey } = await params
  const city = cityData[cityKey] || cityData['new-york']
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section with Local SEO */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              Affordable Healthcare in {city.name}, {city.state}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {city.description}
            </p>
          </div>
          
          {/* Local Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{city.providers}+</div>
                <div className="text-sm text-slate-600">Verified Providers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{city.freeClinic}</div>
                <div className="text-sm text-slate-600">Free Clinics</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{city.avgSavings}</div>
                <div className="text-sm text-slate-600">Avg Annual Savings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">4.8★</div>
                <div className="text-sm text-slate-600">User Rating</div>
              </CardContent>
            </Card>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/copilot">
                <MapPin className="mr-2 w-5 h-5" />
                Find {city.name} Providers Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#providers">
                View All {city.name} Clinics
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top Providers Section */}
      <section id="providers" className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Top Affordable Healthcare Providers in {city.name}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {city.topServices.map((provider: TopService, idx: number) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{provider.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{provider.type}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-emerald-600">{provider.savings}</span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm">4.7</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Walk-ins Welcome
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Sliding Scale Available
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhood Coverage */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Healthcare Coverage Across {city.name} Neighborhoods
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {city.neighborhoods.map((neighborhood: string) => (
              <Link
                key={neighborhood}
                href={`/find-care/${cityKey}/${neighborhood.toLowerCase().replace(' ', '-')}`}
                className="p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow text-center"
              >
                <MapPin className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                <div className="font-medium">{neighborhood}</div>
                <div className="text-sm text-slate-600">15+ Providers</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Affordable Healthcare Services in {city.name}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Primary Care', price: 'From $20', count: '45 providers' },
              { name: 'Dental Care', price: 'From $30', count: '38 providers' },
              { name: 'Mental Health', price: 'From $40', count: '52 providers' },
              { name: 'Urgent Care', price: 'From $50', count: '23 providers' },
              { name: 'Women\'s Health', price: 'From $25', count: '31 providers' },
              { name: 'Pediatrics', price: 'From $20', count: '27 providers' },
              { name: 'Vision Care', price: 'From $35', count: '19 providers' },
              { name: 'Lab Tests', price: 'From $15', count: '41 providers' }
            ].map(service => (
              <Link
                key={service.name}
                href={`/services/${service.name.toLowerCase().replace(' ', '-')}?city=${cityKey}`}
                className="p-4 border rounded-lg hover:border-emerald-500 transition-colors"
              >
                <div className="font-semibold">{service.name}</div>
                <div className="text-emerald-600 font-bold">{service.price}</div>
                <div className="text-sm text-slate-600">{service.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Local SEO Content */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-4xl mx-auto px-4">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Finding Affordable Healthcare in {city.name}: Your Complete Guide</h2>
            
            <p>
              Living in {city.name} doesn&apos;t mean you have to sacrifice your health due to high medical costs. 
              With over {city.providers} verified affordable healthcare providers and {city.freeClinic} free clinics 
              throughout the metro area, quality medical care is more accessible than you might think.
            </p>

            <h3>Free and Low-Cost Medical Options in {city.name}</h3>
            <p>
              {city.name} residents have access to numerous Federally Qualified Health Centers (FQHCs) that offer 
              services on a sliding fee scale based on your income. These centers provide comprehensive primary care, 
              dental services, mental health counseling, and prescription assistance programs.
            </p>

            <h3>How to Qualify for Affordable Care in {city.name}</h3>
            <ul>
              <li>No insurance? Many clinics accept self-pay patients with discounted rates</li>
              <li>Medicaid and Medicare accepted at most community health centers</li>
              <li>Sliding scale fees available based on household income</li>
              <li>Free clinics available for those who qualify</li>
              <li>Payment plans offered at participating providers</li>
            </ul>

            <h3>Emergency vs. Urgent Care in {city.name}</h3>
            <p>
              Save hundreds of dollars by choosing urgent care over emergency rooms for non-life-threatening conditions. 
              {city.name} has numerous affordable urgent care centers that can treat common illnesses, minor injuries, 
              and provide basic diagnostic services at a fraction of ER costs.
            </p>

            <h3>Using SIE Wellness to Find {city.name} Healthcare</h3>
            <p>
              Our AI-powered copilot searches all {city.providers}+ providers in {city.name} to find the most 
              affordable options for your specific needs. Simply tell us what kind of care you need, and we&apos;ll 
              instantly compare prices, show available appointments, and guide you to the right provider.
            </p>
          </article>
        </div>
      </section>

      {/* FAQ Section with Local Focus */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions About {city.name} Healthcare
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `Where can I find free clinics in ${city.name}?`,
                a: `${city.name} has ${city.freeClinic} free clinics located throughout the city. Use our AI copilot to find the nearest one based on your location and specific healthcare needs.`
              },
              {
                q: `How much does a doctor visit cost in ${city.name} without insurance?`,
                a: `Without insurance, a basic doctor visit in ${city.name} typically costs $150-300. However, through our network of affordable providers, you can find visits starting at just $20-50.`
              },
              {
                q: `Can I get affordable dental care in ${city.name}?`,
                a: `Yes! ${city.name} has numerous low-cost dental clinics offering cleanings from $30, fillings from $50, and payment plans for major work. Many dental schools also offer discounted services.`
              },
              {
                q: `Are there Spanish-speaking doctors in ${city.name}?`,
                a: `Many providers in our ${city.name} network offer multilingual services including Spanish. Our AI copilot can filter results to show only providers that speak your preferred language.`
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Saving on {city.name} Healthcare Today
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of {city.name} residents who save an average of {city.avgSavings} per year on medical costs
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
            <Link href="/copilot">
              Find Affordable Care Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Local Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": `SIE Wellness ${city.name}`,
            "areaServed": {
              "@type": "City",
              "name": city.name,
              "containedIn": {
                "@type": "State",
                "name": city.state
              }
            },
            "medicalSpecialty": [
              "Primary Care",
              "Dental Care",
              "Mental Health",
              "Urgent Care"
            ],
            "availableService": {
              "@type": "MedicalProcedure",
              "name": "Affordable Healthcare Services",
              "description": `Find affordable medical care in ${city.name}`
            }
          })
        }}
      />
    </div>
  )
}
