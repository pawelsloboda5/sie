import Link from "next/link"

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Simple Static Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-primary-foreground text-sm">♥</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">CareFind</h1>
              <p className="text-xs text-muted-foreground">Free & Low-Cost Healthcare</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="tel:911" className="text-sm text-red-600 font-medium hover:underline">
              Emergency: 911
            </a>
            <a href="tel:988" className="text-sm text-blue-600 font-medium hover:underline">
              Crisis: 988
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Find Free & Low-Cost Healthcare Near You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover accessible healthcare services in your area, regardless of insurance status. 
            Search by service, condition, or location to find the care you need.
          </p>
          
          {/* CTA Button */}
          <div className="mb-12">
            <Link 
              href="/app"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              Start Finding Healthcare
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Services</h3>
              <p className="text-muted-foreground">Find completely free healthcare services and clinics in your area.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🏥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">All Provider Types</h3>
              <p className="text-muted-foreground">Community health centers, urgent care, clinics, and more.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Location-Based</h3>
              <p className="text-muted-foreground">Search by your location to find nearby healthcare options.</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 py-8 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1,800+</div>
              <p className="text-muted-foreground">Healthcare Providers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
              <p className="text-muted-foreground">Available Services</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Free to Use</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with ❤️ to help everyone access healthcare. 
            <Link href="/app" className="text-primary hover:underline ml-1">
              Start your search →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
