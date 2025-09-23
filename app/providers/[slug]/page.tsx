import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerDb } from '@/lib/server/db'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Globe, Star, DollarSign, Heart, Shield, Users, Check, ArrowRight } from 'lucide-react'

type PageProps = { 
  params: Promise<{ slug: string }>
}

async function unwrapParams<T>(p: T | Promise<T>): Promise<T> { 
  return await p 
}

// Extract provider ID from slug
function extractProviderIdFromSlug(slug: string): string | null {
  const match = slug.match(/-p-([a-f0-9]{6})$/)
  return match ? match[1] : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await unwrapParams(params)
  const shortId = extractProviderIdFromSlug(slug)
  
  if (!shortId) {
    return { title: 'Provider Not Found' }
  }
  
  const db = await getServerDb()
  
  // Find provider by partial ID match
  const providers = await db
    .collection('providers')
    .find({}, { projection: { _id: 1, name: 1, category: 1, address: 1, summary_text: 1 } })
    .toArray()
  
  const provider = providers.find(p => String(p._id).endsWith(shortId))
  
  if (!provider) {
    return { title: 'Provider Not Found' }
  }
  
  const title = `${provider.name} | Affordable Healthcare Provider`
  const description = provider.summary_text || `${provider.name} - ${provider.category} providing affordable healthcare services. View services, pricing, hours, and patient information.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/providers/${slug}`
    }
  }
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { slug } = await unwrapParams(params)
  const shortId = extractProviderIdFromSlug(slug)
  
  if (!shortId) {
    notFound()
  }
  
  const db = await getServerDb()
  
  // Find provider by partial ID match
  const providers = await db.collection('providers').find({}).toArray()
  const provider = providers.find(p => String(p._id).endsWith(shortId))
  
  if (!provider) {
    notFound()
  }
  
  // Fetch services for this provider
  const services = await db
    .collection('services')
    .find({ provider_id: provider._id })
    .toArray()
  
  // Categorize services
  const freeServices = services.filter(s => s.is_free)
  const discountedServices = services.filter(s => s.is_discounted)
  const regularServices = services.filter(s => !s.is_free && !s.is_discounted)
  
  // Extract location info
  const addressParts = provider.address?.split(',') || []
  const city = addressParts[1]?.trim() || 'City'
  const state = provider.state || addressParts[2]?.trim()?.split(' ')[0] || 'State'
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Breadcrumb */}
      <nav className="pt-20 px-4" aria-label="Breadcrumb">
        <div className="container max-w-7xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm text-slate-600">
            <li><Link href="/" className="hover:text-emerald-600">Home</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/providers" className="hover:text-emerald-600">Providers</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-slate-900 font-medium truncate max-w-xs">{provider.name}</li>
          </ol>
        </div>
      </nav>
      
      {/* Provider Header */}
      <section className="pt-8 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                      {provider.name}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                      {provider.category}
                    </p>
                  </div>
                  {provider.rating && (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-lg">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-lg font-semibold">{provider.rating}</span>
                    </div>
                  )}
                </div>
                
                {/* Key Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {provider.accepts_uninsured && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Check className="w-3 h-3 mr-1" />
                      Accepts Uninsured
                    </Badge>
                  )}
                  {provider.medicaid && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Shield className="w-3 h-3 mr-1" />
                      Medicaid
                    </Badge>
                  )}
                  {provider.medicare && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Shield className="w-3 h-3 mr-1" />
                      Medicare
                    </Badge>
                  )}
                  {!provider.ssn_required && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <Users className="w-3 h-3 mr-1" />
                      No SSN Required
                    </Badge>
                  )}
                  {provider.telehealth_available && (
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <Globe className="w-3 h-3 mr-1" />
                      Telehealth Available
                    </Badge>
                  )}
                  {freeServices.length > 0 && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Heart className="w-3 h-3 mr-1" />
                      {freeServices.length} Free Services
                    </Badge>
                  )}
                </div>
                
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>{provider.address}</span>
                  </div>
                  {provider.phone && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Phone className="w-5 h-5 flex-shrink-0" />
                      <a href={`tel:${provider.phone}`} className="hover:text-emerald-600">
                        {provider.phone}
                      </a>
                    </div>
                  )}
                  {provider.website && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <Globe className="w-5 h-5 flex-shrink-0" />
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 truncate">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="lg:w-80">
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20">
                    <CardTitle className="text-lg">Get Started</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <Button asChild className="w-full" size="lg">
                      <a href={`tel:${provider.phone}`}>
                        <Phone className="mr-2 w-5 h-5" />
                        Call Now
                      </a>
                    </Button>
                    {provider.website && (
                      <Button asChild variant="outline" className="w-full" size="lg">
                        <a href={provider.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-2 w-5 h-5" />
                          Visit Website
                        </a>
                      </Button>
                    )}
                    <Button asChild variant="secondary" className="w-full" size="lg">
                      <Link href={`/copilot?provider=${slug}`}>
                        Ask AI About This Provider
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Services Offered</h2>
          
          {/* Free Services */}
          {freeServices.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-green-600" />
                Free Services
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {freeServices.map((service, idx) => (
                  <Card key={idx} className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                    <CardContent className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white mb-1">
                        {service.name}
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {service.description}
                        </p>
                      )}
                      <Badge className="mt-2 bg-green-600 text-white">FREE</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Discounted Services */}
          {discountedServices.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                Discounted Services
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discountedServices.map((service, idx) => (
                  <Card key={idx} className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardContent className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white mb-1">
                        {service.name}
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {service.description}
                        </p>
                      )}
                      {service.price_info && (
                        <Badge className="mt-2 bg-blue-600 text-white">{service.price_info}</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Regular Services */}
          {regularServices.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">All Services</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularServices.map((service, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white mb-1">
                        {service.name}
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {service.description}
                        </p>
                      )}
                      {service.category && (
                        <Badge variant="secondary" className="mt-2">{service.category}</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {services.length === 0 && (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
              Service information is being updated. Please call for current services and pricing.
            </p>
          )}
        </div>
      </section>

      {/* Additional Information */}
      {(provider.specialties?.length > 0 || provider.conditions_treated?.length > 0 || provider.eligibility_requirements?.length > 0) && (
        <section className="py-12 bg-slate-50 dark:bg-slate-900">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Specialties */}
              {provider.specialties?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((specialty: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Conditions Treated */}
              {provider.conditions_treated?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Conditions Treated</h3>
                  <ul className="space-y-2">
                    {provider.conditions_treated.map((condition: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                        <Check className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Eligibility */}
              {provider.eligibility_requirements?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {provider.eligibility_requirements.map((req: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                        <Check className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related Providers CTA */}
      <section className="py-12 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Find More Providers Like This</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
            Looking for similar healthcare options in {city}? Our AI copilot can help you compare providers and find the best fit for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href={`/find/${provider.category?.toLowerCase().replace(/\s+/g, '-')}/${city?.toLowerCase().replace(/\s+/g, '-')}`}>
                More {provider.category} in {city}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/copilot">
                Ask AI for Recommendations
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
            "@type": provider.category?.includes('Dental') ? "Dentist" : "MedicalClinic",
            "name": provider.name,
            "description": provider.summary_text,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": addressParts[0]?.trim(),
              "addressLocality": city,
              "addressRegion": state,
              "postalCode": addressParts[2]?.trim()?.split(' ')[1]
            },
            "telephone": provider.phone,
            "url": provider.website,
            "geo": provider.location ? {
              "@type": "GeoCoordinates",
              "latitude": provider.location.coordinates[1],
              "longitude": provider.location.coordinates[0]
            } : undefined,
            "aggregateRating": provider.rating ? {
              "@type": "AggregateRating",
              "ratingValue": provider.rating,
              "bestRating": "5",
              "worstRating": "1"
            } : undefined,
            "priceRange": freeServices.length > 0 ? "$" : "$$",
            "acceptsInsurance": provider.medicaid || provider.medicare,
            "paymentAccepted": "Cash, Check, Credit Card",
            "medicalSpecialty": provider.specialties
          })
        }}
      />
    </div>
  )
}