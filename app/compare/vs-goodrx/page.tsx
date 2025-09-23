import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, ArrowRight, Users, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SIE Wellness vs GoodRx: Beyond Prescription Savings',
  description: 'Compare SIE Wellness and GoodRx. While GoodRx saves on prescriptions, SIE helps find affordable doctors, dentists, and complete medical care.',
  keywords: ['SIE Wellness vs GoodRx', 'GoodRx alternative', 'affordable healthcare vs GoodRx', 'medical care vs prescription savings'],
}

export default function VsGoodRxPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              SIE Wellness vs GoodRx
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              GoodRx helps you save on prescriptions. SIE Wellness helps you find affordable doctors, 
              dentists, therapists, and complete medical care - not just medications.
            </p>
          </div>
          
          {/* Quick Comparison */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-emerald-500 shadow-xl">
              <div className="bg-emerald-600 text-white text-center py-3">
                <span className="text-sm font-medium">COMPLETE HEALTHCARE SOLUTION</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">SIE Wellness</h2>
                  <p className="text-slate-600">Full Healthcare Navigator</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Find affordable doctors & clinics</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Dental care pricing</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Mental health providers</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Free clinic locations</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />AI healthcare copilot</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Complete care coordination</li>
                </ul>
                <Button asChild className="w-full mt-6" size="lg">
                  <Link href="/copilot">
                    Find Complete Care
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <div className="bg-yellow-600 text-white text-center py-3">
                <span className="text-sm font-medium">PRESCRIPTION SAVINGS ONLY</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">GoodRx</h2>
                  <p className="text-slate-600">Prescription Discount App</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No doctor finding</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No dental services</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No therapy options</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No free clinic info</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Great drug discounts</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Pharmacy comparisons</li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6" size="lg">
                  <Link href="https://goodrx.com" target="_blank">
                    Visit GoodRx
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem with Prescription-Only Solutions */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Prescription Savings Aren&apos;t Enough
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold mb-2">Can&apos;t Get Prescriptions Without a Doctor</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  GoodRx saves on medications, but you still need to find and pay for a doctor visit first. That could be $200+.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-bold mb-2">Missing 80% of Healthcare Needs</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Medications are just one part. What about finding affordable checkups, dental care, therapy, or emergency care?
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">No Help Finding Care</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  GoodRx doesn&apos;t help you find free clinics, sliding scale providers, or doctors who accept uninsured patients.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real Scenario Comparison */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Real Healthcare Scenarios: SIE vs GoodRx
          </h2>
          
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20">
                  <h3 className="font-bold text-lg mb-4 text-emerald-700 dark:text-emerald-400">
                    &quot;I need blood pressure medication&quot;
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm"><strong>With SIE Wellness:</strong></p>
                    <ul className="text-sm space-y-2 ml-4">
                      <li>✓ Find free clinic for $0 doctor visit</li>
                      <li>✓ Get prescription from provider</li>
                      <li>✓ Use our pharmacy discount for medication</li>
                      <li>✓ Total cost: $15 for medication only</li>
                    </ul>
                    <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">Total Saved: $185</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-slate-100 dark:bg-slate-800">
                  <h3 className="font-bold text-lg mb-4 text-slate-600">
                    Same scenario with GoodRx
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm"><strong>With GoodRx:</strong></p>
                    <ul className="text-sm space-y-2 ml-4">
                      <li>✗ Find doctor yourself</li>
                      <li>✗ Pay $200 for doctor visit</li>
                      <li>✓ Get prescription</li>
                      <li>✓ Save on medication with coupon</li>
                    </ul>
                    <div className="mt-4 p-3 bg-slate-200 dark:bg-slate-700 rounded-lg">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Total Cost: $200+ visit</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20">
                  <h3 className="font-bold text-lg mb-4 text-emerald-700 dark:text-emerald-400">
                    &quot;My child needs a dental cleaning&quot;
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm"><strong>With SIE Wellness:</strong></p>
                    <ul className="text-sm space-y-2 ml-4">
                      <li>✓ Find community dental clinic</li>
                      <li>✓ Sliding scale cleaning for $40</li>
                      <li>✓ Preventive care included</li>
                    </ul>
                    <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">Problem Solved: $40</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-slate-100 dark:bg-slate-800">
                  <h3 className="font-bold text-lg mb-4 text-slate-600">
                    Same scenario with GoodRx
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm"><strong>With GoodRx:</strong></p>
                    <ul className="text-sm space-y-2 ml-4">
                      <li>✗ No dental services</li>
                      <li>✗ Can&apos;t help find dentists</li>
                      <li>✗ No price information</li>
                    </ul>
                    <div className="mt-4 p-3 bg-slate-200 dark:bg-slate-700 rounded-lg">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Can&apos;t Help</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Complete Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left py-4 px-4">Healthcare Need</th>
                  <th className="text-center py-4 px-4">SIE Wellness</th>
                  <th className="text-center py-4 px-4">GoodRx</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Find Affordable Doctors', true, false],
                  ['Prescription Discounts', true, true],
                  ['Dental Care', true, false],
                  ['Mental Health Providers', true, false],
                  ['Free Clinic Finder', true, false],
                  ['Urgent Care Pricing', true, false],
                  ['Telehealth Options', true, true],
                  ['AI Healthcare Assistant', true, false],
                  ['Insurance Navigation', true, false],
                  ['Sliding Scale Search', true, false],
                  ['Lab Test Pricing', true, false],
                  ['Specialty Care', true, false],
                ].map(([feature, sie, goodrx], idx) => (
                  <tr key={idx} className="border-b dark:border-slate-700">
                    <td className="py-3 px-4 text-sm">{feature as string}</td>
                    <td className="py-3 px-4 text-center">
                      {sie ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {goodrx ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Complete Healthcare Solutions, Not Just Drug Discounts
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Find doctors, dentists, therapists, and yes - save on prescriptions too
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
              <Link href="/copilot">
                Start Finding Complete Care
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-emerald-900 dark:text-white hover:bg-white/10">
              <Link href="/compare">
                Compare All Options
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
