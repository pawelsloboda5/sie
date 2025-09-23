import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'SIE Wellness vs Castlight: Healthcare for Everyone vs Enterprise Only',
  description: 'Compare SIE Wellness and Castlight Health. SIE is free for everyone while Castlight requires expensive employer contracts.',
  keywords: ['SIE Wellness vs Castlight', 'Castlight alternative', 'free vs enterprise healthcare', 'affordable healthcare platform'],
}

export default function VsCastlightPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              SIE Wellness vs Castlight
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Castlight is locked behind expensive employer contracts. SIE Wellness is free for everyone - 
              employed, unemployed, uninsured, or anyone seeking affordable care.
            </p>
          </div>
          
          {/* Quick Comparison */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-emerald-500 shadow-xl">
              <div className="bg-emerald-600 text-white text-center py-3">
                <span className="text-sm font-medium">FREE FOR EVERYONE</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">SIE Wellness</h2>
                  <p className="text-slate-600">Open Access Healthcare Platform</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Free for individuals</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />No employer required</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Works for uninsured</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Free clinic finder</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Instant access</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />AI assistance 24/7</li>
                </ul>
                <Button asChild className="w-full mt-6" size="lg">
                  <Link href="/copilot">
                    Start Free Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <div className="bg-slate-600 text-white text-center py-3">
                <span className="text-sm font-medium">ENTERPRISE ONLY</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Castlight</h2>
                  <p className="text-slate-600">Corporate Benefits Platform</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />Employer contract required</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />Not for individuals</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />Insurance required</li>
                  <li className="flex items-center"><X className="w-5 h-5 text-red-600 mr-3" />No free clinic info</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Benefits integration</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-600 mr-3" />Claims data</li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6" size="lg">
                  <Link href="https://castlighthealth.com" target="_blank">
                    Visit Castlight
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who Can Use Each Platform */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Who Can Actually Use Each Platform?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-6 text-emerald-600">SIE Wellness ✓ Everyone</h3>
              <div className="space-y-3">
                {[
                  'Self-employed & freelancers',
                  'Unemployed individuals',
                  'Uninsured patients',
                  'High-deductible plan holders',
                  'Medicare/Medicaid recipients',
                  'Students',
                  'Part-time workers',
                  'Small business employees',
                  'Anyone seeking affordable care'
                ].map((group, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-600 mr-3" />
                    <span>{group}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6 text-slate-600">Castlight ✗ Limited Access</h3>
              <div className="space-y-3">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <p className="font-medium mb-2">Only available if:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="text-sm">• Your employer pays for Castlight (rare)</li>
                    <li className="text-sm">• You have employer-sponsored insurance</li>
                    <li className="text-sm">• Your company is large enough</li>
                    <li className="text-sm">• IT department has set it up</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="font-medium text-red-700 dark:text-red-400 mb-2">Cannot use if:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="text-sm">• Unemployed or self-employed</li>
                    <li className="text-sm">• Small company employee</li>
                    <li className="text-sm">• Uninsured or underinsured</li>
                    <li className="text-sm">• Individual seeking care</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            The Real Cost Difference
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-emerald-500">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">SIE Wellness Pricing</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-4">$0</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Forever free for individuals
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                    Unlimited searches
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                    AI copilot included
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                    All features available
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Castlight for Employers</h3>
                <div className="text-4xl font-bold text-slate-600 mb-4">$3-7</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Per employee per month
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <X className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                    Minimum 500+ employees
                  </li>
                  <li className="flex items-start">
                    <X className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                    Annual contracts only
                  </li>
                  <li className="flex items-start">
                    <X className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                    Setup & integration fees
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Annual Cost (1000 employees)</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                    <div className="font-semibold">SIE Wellness</div>
                    <div className="text-2xl font-bold text-emerald-600">$0</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <div className="font-semibold">Castlight</div>
                    <div className="text-2xl font-bold text-slate-600">$60,000+</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Comparison: What You Actually Get
          </h2>
          
          <div className="space-y-6">
            {[
              {
                category: 'Access & Availability',
                features: [
                  ['Individual access', true, false],
                  ['No employer needed', true, false],
                  ['Works for uninsured', true, false],
                  ['Instant signup', true, false],
                ]
              },
              {
                category: 'Healthcare Finding',
                features: [
                  ['Free clinic finder', true, false],
                  ['Sliding scale search', true, false],
                  ['Price transparency', true, true],
                  ['Provider quality ratings', true, true],
                ]
              },
              {
                category: 'Support & Assistance',
                features: [
                  ['AI healthcare copilot', true, false],
                  ['24/7 availability', true, false],
                  ['Plain language help', true, false],
                  ['Benefits coaches', false, true],
                ]
              }
            ].map((section, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-lg mb-4">{section.category}</h3>
                <div className="space-y-2">
                  {section.features.map(([feature, sie, castlight], fidx) => (
                    <div key={fidx} className="grid grid-cols-3 gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                      <div className="text-sm">{feature as string}</div>
                      <div className="text-center">
                        {sie ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-300 mx-auto" />
                        )}
                      </div>
                      <div className="text-center">
                        {castlight ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-slate-300 mx-auto" />
                        )}
                      </div>
                    </div>
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
            Healthcare Navigation Should Be Free for Everyone
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Don&apos;t wait for your employer. Get instant access to affordable healthcare options now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
              <Link href="/copilot">
                Start Free - No Employer Needed
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-emerald-900 dark:text-white hover:bg-white/10">
              <Link href="/compare">
                See All Comparisons
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
