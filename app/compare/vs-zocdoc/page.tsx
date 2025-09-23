import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, ArrowRight, DollarSign, Calendar, Brain, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SIE Wellness vs Zocdoc: Which Healthcare App is Better?',
  description: 'Compare SIE Wellness and Zocdoc for finding affordable healthcare. SIE offers price transparency and free clinic access that Zocdoc lacks.',
  keywords: ['SIE Wellness vs Zocdoc', 'Zocdoc alternative', 'affordable healthcare vs Zocdoc', 'healthcare price comparison'],
}

export default function VsZocdocPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              SIE Wellness vs Zocdoc
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              While Zocdoc focuses on appointment booking for insured patients, 
              SIE Wellness helps everyone find affordable care with transparent pricing
            </p>
          </div>
          
          {/* Quick Comparison */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-emerald-500 shadow-xl">
              <div className="bg-emerald-600 text-white text-center py-3">
                <span className="text-sm font-medium">BEST FOR AFFORDABLE CARE</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">SIE Wellness</h2>
                  <p className="text-slate-600">AI Healthcare Navigator</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Shows actual prices upfront</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Finds free & low-cost clinics</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />No insurance required</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />AI understands your needs</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Sliding scale options</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />100% free to use</li>
                </ul>
                <Button asChild className="w-full mt-6" size="lg">
                  <Link href="/copilot">
                    Try SIE Wellness Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <div className="bg-slate-600 text-white text-center py-3">
                <span className="text-sm font-medium">BEST FOR APPOINTMENTS</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Zocdoc</h2>
                  <p className="text-slate-600">Appointment Booking Platform</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No price information</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No free clinic listings</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Insurance verification</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />Limited for uninsured</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No sliding scale search</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Free for patients</li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6" size="lg">
                  <Link href="https://zocdoc.com" target="_blank">
                    Visit Zocdoc
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Differences */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Differences That Matter</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <DollarSign className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Price Transparency</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-emerald-600">SIE Wellness ✓</div>
                  <p>Shows exact costs before you book</p>
                  <div className="font-semibold text-slate-400 pt-2">Zocdoc ✗</div>
                  <p>No pricing information available</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Free Clinic Access</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-emerald-600">SIE Wellness ✓</div>
                  <p>3,000+ free & low-cost clinics</p>
                  <div className="font-semibold text-slate-400 pt-2">Zocdoc ✗</div>
                  <p>Focuses on private practices</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">AI Assistance</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-emerald-600">SIE Wellness ✓</div>
                  <p>AI copilot understands your needs</p>
                  <div className="font-semibold text-slate-400 pt-2">Zocdoc ✗</div>
                  <p>Basic search filters only</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Appointment Booking</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-emerald-600">SIE Wellness ✓</div>
                  <p>Contact info & directions</p>
                  <div className="font-semibold text-emerald-600 pt-2">Zocdoc ✓</div>
                  <p>Integrated booking system</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Case Scenarios */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">When to Use Each Platform</h2>
          
          <div className="space-y-8">
            <Card className="border-emerald-500">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 text-emerald-600">Choose SIE Wellness When You:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Need to know costs upfront before committing to care
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Don&apos;t have insurance or have high-deductible plans
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Want to find free clinics or sliding scale providers
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Need help understanding what type of care you need
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Want to compare prices across multiple providers
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 text-slate-600">Consider Zocdoc When You:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Have good insurance coverage and don&apos;t worry about costs
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Know exactly which specialist you need to see
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Want integrated online appointment booking
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    Prefer to see patient reviews of doctors
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real User Scenarios */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Real Cost Comparisons</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Sarah needs a dental cleaning</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">With SIE Wellness:</div>
                    <p className="text-sm mt-1">Found cleaning for $75 at community dental clinic</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <div className="font-semibold text-slate-600">With Zocdoc:</div>
                    <p className="text-sm mt-1">Booked appointment, discovered $300 cost at visit</p>
                  </div>
                  <div className="text-center pt-4 border-t">
                    <div className="text-2xl font-bold text-emerald-600">Saved $225</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">James lost his insurance</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">With SIE Wellness:</div>
                    <p className="text-sm mt-1">Located FQHC with $20 sliding scale visits</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <div className="font-semibold text-slate-600">With Zocdoc:</div>
                    <p className="text-sm mt-1">Most doctors require insurance, self-pay $200+</p>
                  </div>
                  <div className="text-center pt-4 border-t">
                    <div className="text-2xl font-bold text-emerald-600">Saved $180</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Maria needs therapy</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">With SIE Wellness:</div>
                    <p className="text-sm mt-1">Found therapist with $40 sliding scale rate</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <div className="font-semibold text-slate-600">With Zocdoc:</div>
                    <p className="text-sm mt-1">No price info, therapists charge $150-300</p>
                  </div>
                  <div className="text-center pt-4 border-t">
                    <div className="text-2xl font-bold text-emerald-600">Saved $110/session</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Healthcare Price Transparency?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Stop guessing about costs. Find affordable care with upfront pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
              <Link href="/copilot">
                Try SIE Wellness Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-emerald-900 dark:text-white hover:bg-white/10">
              <Link href="/compare">
                Compare All Platforms
              </Link>
            </Button>
          </div>
          <p className="text-sm mt-6 text-white/70">
            No credit card required • 100% free • Find care in seconds
          </p>
        </div>
      </section>
    </div>
  )
}
