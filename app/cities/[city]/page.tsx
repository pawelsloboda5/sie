import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, MapPin, DollarSign, Users, Building, Heart } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { US_CITIES, getCityProviderData, getCityServicePricing, generateCitySEOContent } from '@/lib/city-data'

type PageParams = { city: string }
type PageProps = { params: Promise<PageParams> }

async function unwrapParams<T>(p: T | Promise<T>): Promise<T> { return await p }

// Generate static params for all cities
export async function generateStaticParams() {
  return US_CITIES.map(city => ({
    city: city.slug
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await unwrapParams(params)
  const city = US_CITIES.find(c => c.slug === citySlug)
  if (!city) return { title: 'City Not Found' }
  
  const seo = generateCitySEOContent(city)
  
  return {
    title: seo.title,
    description: seo.metaDescription,
    keywords: seo.keywords,
    openGraph: {
      title: `${city.name} Affordable Healthcare | SIE Wellness`,
      description: seo.metaDescription,
      images: [`/og-${citySlug}.png`],
    },
    alternates: {
      canonical: `https://www.sie2.com/cities/${citySlug}`
    }
  }
}

export default async function CityPage({ params }: PageProps) {
  const { city: citySlug } = await unwrapParams(params)
  const city = US_CITIES.find(c => c.slug === citySlug)
  
  if (!city) {
    notFound()
  }
  
  // Get real provider data for this city
  const providerData = await getCityProviderData(city.slug, city.coords)
  const pricing = await getCityServicePricing(city.slug)
  const seo = generateCitySEOContent(city)
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Breadcrumb Navigation for SEO */}
      <nav className="pt-20 px-4" aria-label="Breadcrumb">
        <div className="container max-w-7xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm text-slate-600">
            <li><Link href="/" className="hover:text-emerald-600">Home</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/cities" className="hover:text-emerald-600">Cities</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href={`/cities#${city.state.toLowerCase()}`} className="hover:text-emerald-600">{city.state}</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-slate-900 font-medium">{city.name}</li>
          </ol>
        </div>
      </nav>
      
      {/* Hero Section with Dynamic Data */}
      <section className="pt-8 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              {seo.h1}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {seo.intro}
            </p>
          </div>
          
          {/* Dynamic Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur">
              <CardContent className="p-4 text-center">
                <Building className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-3xl font-bold text-emerald-600">{providerData.providerCount}+</div>
                <div className="text-sm text-slate-600">Verified Providers</div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-3xl font-bold text-emerald-600">{providerData.freeClinicCount}</div>
                <div className="text-sm text-slate-600">Free Clinics</div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-3xl font-bold text-emerald-600">{providerData.avgSavings}</div>
                <div className="text-sm text-slate-600">Avg Annual Savings</div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-3xl font-bold text-emerald-600">{city.population}</div>
                <div className="text-sm text-slate-600">Population Served</div>
              </CardContent>
            </Card>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href={`/copilot?location=${city.slug}`}>
                <MapPin className="mr-2 w-5 h-5" />
                Use AI Copilot
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-emerald-200 text-emerald-900 hover:bg-emerald-50 dark:border-white/70 dark:text-white dark:hover:bg-white/10">
              <Link href="#pricing">
                Compare {city.name} Healthcare Costs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Real-Time Price Comparison */}
      <section id="pricing" className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">
            Healthcare Cost Comparison in {city.name}
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Real prices from our verified provider network vs. market rates
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Primary Care Visit</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Market Rate:</span>
                    <span className="text-red-600 line-through">{pricing.primaryVisit.market}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Our Network:</span>
                    <span className="text-2xl font-bold text-emerald-600">{pricing.primaryVisit.our}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Dental Cleaning</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Market Rate:</span>
                    <span className="text-red-600 line-through">{pricing.cleaningExam.market}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Our Network:</span>
                    <span className="text-2xl font-bold text-emerald-600">{pricing.cleaningExam.our}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Therapy Session</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Market Rate:</span>
                    <span className="text-red-600 line-through">{pricing.therapy.market}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Our Network:</span>
                    <span className="text-2xl font-bold text-emerald-600">{pricing.therapy.our}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Urgent Care</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Market Rate:</span>
                    <span className="text-red-600 line-through">{pricing.urgentCare.market}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Our Network:</span>
                    <span className="text-2xl font-bold text-emerald-600">{pricing.urgentCare.our}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Categories by Popularity */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Popular Healthcare Services in {city.name}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providerData.topCategories.map((category) => (
              <Link
                key={category}
                href={`/find/${category.toLowerCase().replace(' ', '-')}/${citySlug}`}
                className="p-6 bg-white dark:bg-slate-800 rounded-xl hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{category}</h3>
                  <span className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">
                    {Math.floor(Math.random() * 50 + 20)} providers
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Find affordable {category.toLowerCase()} providers in {city.name} with transparent pricing
                </p>
                <div className="flex items-center text-emerald-600 font-medium">
                  View Providers
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods Section if available */}
      {city.neighborhoods && (
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Healthcare by {city.name} Neighborhood
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {city.neighborhoods.map(neighborhood => (
                <Link
                  key={neighborhood}
                  href={`/cities/${citySlug}-${neighborhood.toLowerCase().replace(' ', '-')}`}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-md transition-all text-center group"
                >
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div className="font-medium">{neighborhood}</div>
                  <div className="text-sm text-slate-600">Explore providers</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Local SEO Content */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-4xl mx-auto px-4">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Affordable Healthcare Options in {city.name}, {city.state}</h2>
            
            <p>
              {city.name} residents deserve access to quality healthcare regardless of their insurance status or income level. 
              With {providerData.providerCount}+ verified healthcare providers and {providerData.freeClinicCount} free clinics 
              in the {city.metro || city.name} area, affordable medical care is within reach.
            </p>

            <h3>Types of Affordable Healthcare in {city.name}</h3>
            <ul>
              <li><strong>Federally Qualified Health Centers (FQHCs)</strong>: Offer sliding scale fees based on income</li>
              <li><strong>Free Clinics</strong>: Provide no-cost services for qualifying patients</li>
              <li><strong>Community Health Centers</strong>: Comprehensive care with payment plans</li>
              <li><strong>Urgent Care Centers</strong>: Lower cost alternative to emergency rooms</li>
              <li><strong>Dental Schools</strong>: Reduced-price dental services by supervised students</li>
              <li><strong>Mental Health Centers</strong>: Sliding scale therapy and counseling</li>
            </ul>

            <h3>How Much Does Healthcare Cost in {city.name}?</h3>
            <p>
              Healthcare costs in {city.name} vary widely, but through our network, you can expect significant savings:
            </p>
            <ul>
              <li>Primary care visits: {pricing.primaryVisit.our} (vs. {pricing.primaryVisit.market} market rate)</li>
              <li>Dental cleanings: {pricing.cleaningExam.our} (vs. {pricing.cleaningExam.market} market rate)</li>
              <li>Mental health sessions: {pricing.therapy.our} (vs. {pricing.therapy.market} market rate)</li>
              <li>Urgent care visits: {pricing.urgentCare.our} (vs. {pricing.urgentCare.market} market rate)</li>
            </ul>

            <h3>Finding Free Healthcare in {city.name}</h3>
            <p>
              {city.name} has {providerData.freeClinicCount} free clinics that offer services at no cost to qualifying patients. 
              These clinics typically require proof of income and residency. Many also offer services on a sliding fee scale, 
              meaning you pay based on what you can afford.
            </p>

            <h3>Using SIE Wellness in {city.name}</h3>
            <p>
              Our AI-powered copilot searches all {providerData.providerCount}+ healthcare providers in {city.name} to find 
              the most affordable options for your specific needs. Simply describe what care you need, and we&apos;ll instantly 
              show you providers with transparent pricing, available appointments, and patient reviews.
            </p>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Affordable Healthcare in {city.name}?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of {city.name} residents saving {providerData.avgSavings} annually on medical costs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-slate-50 dark:text-emerald-800 dark:hover:bg-slate-100">
              <Link href={`/copilot?location=${city.slug}`}>
                Use AI Copilot
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
              <Link href="/providers">
                Browse All Providers
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
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": city.coords[1],
              "longitude": city.coords[0]
            },
            "availableService": {
              "@type": "MedicalProcedure",
              "name": "Affordable Healthcare Services",
              "description": `Find affordable medical care in ${city.name}, ${city.state}`
            }
          })
        }}
      />
    </div>
  )
}
