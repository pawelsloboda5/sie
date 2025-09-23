import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, ArrowRight, DollarSign, Brain, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Compare Healthcare Navigation Tools | SIE Wellness vs Competitors',
  description: 'Compare SIE Wellness with Zocdoc, GoodRx, and other healthcare apps. See why our AI copilot with price transparency is the best choice for affordable care.',
  keywords: ['SIE Wellness vs Zocdoc', 'healthcare app comparison', 'best healthcare finder', 'affordable care apps', 'medical price comparison tools'],
}

const competitors = [
  {
    name: 'SIE Wellness',
    logo: '🏥',
    tagline: 'AI Healthcare Navigator for Affordable Care',
    pricing: 'Free',
    users: '300+',
    highlighted: true,
    features: {
      'AI-Powered Copilot': true,
      'Price Transparency': true,
      'Free Clinic Finder': true,
      'No Insurance Required': true,
      'Sliding Scale Search': true,
      'Real-Time Availability': true,
      'Prescription Savings': true,
      'Telehealth Options': true,
      'Multilingual Support': true,
      'Cost Comparison': true,
      'Payment Plans Info': true,
      'Mental Health Focus': true,
    },
    pros: [
      'Complete price transparency',
      'Focuses on affordability',
      'AI understands your needs',
      'No account required',
      'Covers all healthcare types',
      'Free to use forever'
    ],
    cons: [
      'Newer platform',
      'Growing provider network'
    ],
    bestFor: 'Uninsured, underinsured, or anyone seeking affordable healthcare',
    cta: 'Start Saving Now',
    ctaLink: '/copilot'
  },
  {
    name: 'Zocdoc',
    logo: '📅',
    tagline: 'Online Medical Appointment Booking',
    pricing: 'Free for patients',
    users: '6M+',
    features: {
      'AI-Powered Copilot': false,
      'Price Transparency': false,
      'Free Clinic Finder': false,
      'No Insurance Required': false,
      'Sliding Scale Search': false,
      'Real-Time Availability': true,
      'Prescription Savings': false,
      'Telehealth Options': true,
      'Multilingual Support': false,
      'Cost Comparison': false,
      'Payment Plans Info': false,
      'Mental Health Focus': false,
    },
    pros: [
      'Large provider network',
      'Easy appointment booking',
      'Patient reviews',
      'Insurance verification'
    ],
    cons: [
      'No price information',
      'Requires insurance for most',
      'Limited free clinic options',
      'No cost comparison'
    ],
    bestFor: 'Insured patients looking for convenient appointment booking'
  },
  {
    name: 'GoodRx',
    logo: '💊',
    tagline: 'Prescription Drug Savings',
    pricing: 'Free / Gold $9.99/mo',
    users: '20M+',
    features: {
      'AI-Powered Copilot': false,
      'Price Transparency': true,
      'Free Clinic Finder': false,
      'No Insurance Required': true,
      'Sliding Scale Search': false,
      'Real-Time Availability': false,
      'Prescription Savings': true,
      'Telehealth Options': true,
      'Multilingual Support': false,
      'Cost Comparison': true,
      'Payment Plans Info': false,
      'Mental Health Focus': false,
    },
    pros: [
      'Excellent for prescriptions',
      'Clear drug pricing',
      'Pharmacy comparison',
      'Discount coupons'
    ],
    cons: [
      'Prescription-only focus',
      'No medical care finder',
      'No free clinic info',
      'Limited to medications'
    ],
    bestFor: 'People needing prescription discounts and drug price comparison'
  },
  {
    name: 'Castlight',
    logo: '🏢',
    tagline: 'Enterprise Healthcare Navigation',
    pricing: 'Employer-sponsored',
    users: 'Enterprise',
    features: {
      'AI-Powered Copilot': false,
      'Price Transparency': true,
      'Free Clinic Finder': false,
      'No Insurance Required': false,
      'Sliding Scale Search': false,
      'Real-Time Availability': false,
      'Prescription Savings': true,
      'Telehealth Options': true,
      'Multilingual Support': false,
      'Cost Comparison': true,
      'Payment Plans Info': false,
      'Mental Health Focus': false,
    },
    pros: [
      'Personalized to employer plan',
      'Cost estimates',
      'Quality ratings',
      'Integrated with benefits'
    ],
    cons: [
      'Employer-only access',
      'Not for uninsured',
      'No free clinic info',
      'Complex interface'
    ],
    bestFor: 'Employees at companies that provide Castlight'
  }
]

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Compare Healthcare Navigation Tools
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            See why SIE Wellness is the best choice for finding affordable healthcare. 
            Compare features, pricing, and capabilities with other popular healthcare apps.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['Price Transparency', 'AI-Powered', 'Free Clinics', 'No Insurance Needed'].map((feature) => (
              <span key={feature} className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
                <Check className="w-4 h-4 mr-2" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left p-6">Feature</th>
                  {competitors.map(comp => (
                    <th key={comp.name} className={`text-center p-6 ${comp.highlighted ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                      <div className="text-2xl mb-2">{comp.logo}</div>
                      <div className="font-bold text-lg">{comp.name}</div>
                      {comp.highlighted && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">OUR SOLUTION</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(competitors[0].features).map((feature) => (
                  <tr key={feature} className="border-b dark:border-slate-700">
                    <td className="p-6 font-medium">{feature}</td>
                    {competitors.map(comp => (
                      <td key={comp.name} className={`text-center p-6 ${comp.highlighted ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                        {comp.features[feature as keyof typeof comp.features] ? (
                          <Check className="w-6 h-6 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-slate-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-6 font-medium">Pricing</td>
                  {competitors.map(comp => (
                    <td key={comp.name} className={`text-center p-6 font-bold ${comp.highlighted ? 'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600' : ''}`}>
                      {comp.pricing}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Detailed Comparisons */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Detailed Platform Comparison</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {competitors.map(comp => (
              <Card key={comp.name} className={comp.highlighted ? 'border-emerald-500 shadow-xl' : ''}>
                {comp.highlighted && (
                  <div className="bg-emerald-600 text-white text-center py-2 text-sm font-medium">
                    RECOMMENDED CHOICE
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <span className="text-3xl">{comp.logo}</span>
                        {comp.name}
                      </CardTitle>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{comp.tagline}</p>
                    </div>
                    {comp.users && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">{comp.users}</div>
                        <div className="text-sm text-slate-600">users</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ Pros</h4>
                    <ul className="space-y-1">
                      {comp.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                          <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">❌ Cons</h4>
                    <ul className="space-y-1">
                      {comp.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                          <X className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm">
                      <span className="font-semibold">Best for:</span> {comp.bestFor}
                    </p>
                  </div>
                  
                  {comp.cta && (
                    <Button asChild className="w-full" size="lg" variant={comp.highlighted ? 'default' : 'outline'}>
                      <Link href={comp.ctaLink || '#'}>
                        {comp.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SIE Wellness */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Why Healthcare Professionals Recommend SIE Wellness
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6">
                <Brain className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">AI That Understands</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Our copilot understands complex healthcare needs and finds personalized solutions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <DollarSign className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">True Price Transparency</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  See actual costs before you go. No surprises, no hidden fees
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Privacy First</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  HIPAA compliant. We never sell your data. Use anonymously if preferred
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <blockquote className="text-lg italic mb-4">
            &quot;SIE Wellness is the only platform that truly addresses the affordability crisis in healthcare. 
              While others focus on convenience or prescriptions, SIE helps patients find care they can actually afford.&quot;
            </blockquote>
            <cite className="text-sm text-slate-600 dark:text-slate-400">
              - Dr. Sarah Chen, Community Health Advocate
            </cite>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Save on Healthcare?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds who save an average of $2,400 per year with SIE Wellness
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100">
              <Link href="/copilot">
                Try SIE Wellness Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-emerald-900 dark:text-white hover:bg-white/10">
              <Link href="/blog/sie-wellness-vs-zocdoc">
                Read Full Comparison
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
