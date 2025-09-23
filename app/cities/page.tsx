import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { MapPin, Search, ArrowRight } from 'lucide-react'
import { US_CITIES } from '@/lib/city-data'

export const metadata: Metadata = {
  title: 'Find Affordable Healthcare by City | All US Locations',
  description: 'Browse affordable healthcare providers by city. Find free clinics, sliding scale services, and transparent pricing in 500+ US cities.',
  keywords: ['healthcare by city', 'free clinics near me', 'affordable healthcare locations', 'medical care by city'],
}

// Group cities by state for better navigation
function groupCitiesByState() {
  const grouped: { [key: string]: typeof US_CITIES } = {}
  
  US_CITIES.forEach(city => {
    if (!grouped[city.state]) {
      grouped[city.state] = []
    }
    grouped[city.state].push(city)
  })
  
  // Sort states alphabetically
  return Object.keys(grouped)
    .sort()
    .map(state => ({
      state,
      cities: grouped[state].sort((a, b) => a.name.localeCompare(b.name))
    }))
}

export default function CitiesIndexPage() {
  const stateGroups = groupCitiesByState()
  const topCities = US_CITIES.slice(0, 12) // Top 12 cities for quick access
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Find Affordable Healthcare in Your City
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Browse healthcare providers, free clinics, and affordable medical services in {US_CITIES.length}+ cities across the United States
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search your city..."
                className="w-full px-6 py-4 pr-12 text-lg rounded-full border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none dark:bg-slate-800"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{US_CITIES.length}+</div>
              <div className="text-sm text-slate-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">3,000+</div>
              <div className="text-sm text-slate-600">Healthcare Providers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">500+</div>
              <div className="text-sm text-slate-600">Free Clinics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Cities Quick Access */}
      <section className="py-12 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popular Cities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topCities.map(city => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="group p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-md transition-all hover:border-emerald-500 border-2 border-transparent"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600">
                      {city.name}
                    </div>
                    <div className="text-sm text-slate-600">{city.state}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                {city.metro && (
                  <div className="text-xs text-slate-500 mt-1">{city.metro}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Cities by State */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Browse All Cities by State
          </h2>
          
          {/* State Navigation */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {stateGroups.map(group => (
              <a
                key={group.state}
                href={`#${group.state.toLowerCase()}`}
                className="px-3 py-1 text-sm bg-white dark:bg-slate-800 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors"
              >
                {group.state} ({group.cities.length})
              </a>
            ))}
          </div>
          
          {/* Cities Grid by State */}
          <div className="space-y-12">
            {stateGroups.map(group => (
              <div key={group.state} id={group.state.toLowerCase()}>
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-emerald-600" />
                  {group.state}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {group.cities.map(city => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all hover:text-emerald-600 group"
                    >
                      <div className="font-medium group-hover:text-emerald-600">
                        {city.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Pop: {city.population}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can&apos;t Find Your City?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Our AI copilot can help you find affordable healthcare anywhere in the US
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
              <Link href="/copilot">
                Start AI Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-emerald-900 dark:text-white hover:bg-white/10">
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
            "@type": "CollectionPage",
            "name": "Healthcare Provider Cities",
            "description": "Directory of cities with affordable healthcare providers",
            "url": "https://www.sie2.com/cities",
            "numberOfItems": US_CITIES.length,
            "itemListElement": US_CITIES.slice(0, 10).map((city, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `https://www.sie2.com/cities/${city.slug}`,
              "name": `${city.name}, ${city.state}`
            }))
          })
        }}
      />
    </div>
  )
}
