import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Heart, DollarSign, Users, Shield, Globe, ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Affordable Mental Health Services | Therapy & Counseling',
  description: 'Find affordable mental health care, sliding scale therapy, free counseling, and online therapy options. No insurance needed.',
  keywords: ['affordable therapy', 'sliding scale counseling', 'free mental health services', 'online therapy', 'mental health without insurance'],
}

export default function MentalHealthPage() {
  const services = [
    {
      icon: Brain,
      title: 'Individual Therapy',
      description: 'One-on-one counseling for anxiety, depression, trauma, and life changes',
      priceRange: '$40-80/session',
      features: ['Sliding scale available', 'Online options', 'Evening appointments']
    },
    {
      icon: Users,
      title: 'Group Therapy',
      description: 'Support groups for specific issues at lower costs',
      priceRange: '$20-40/session', 
      features: ['Peer support', 'Topic-focused', 'Weekly sessions']
    },
    {
      icon: Heart,
      title: 'Couples Counseling',
      description: 'Relationship therapy for couples and families',
      priceRange: '$60-100/session',
      features: ['Communication skills', 'Conflict resolution', 'Family therapy']
    },
    {
      icon: Shield,
      title: 'Crisis Support',
      description: '24/7 crisis lines and emergency mental health services',
      priceRange: 'FREE',
      features: ['24/7 hotlines', 'Text support', 'Immediate help']
    }
  ]

  const conditions = [
    'Anxiety Disorders',
    'Depression',
    'PTSD & Trauma',
    'Bipolar Disorder',
    'ADHD',
    'Substance Use',
    'Eating Disorders',
    'Grief & Loss',
    'Stress Management',
    'Relationship Issues',
    'Life Transitions',
    'Work Stress'
  ]

  const freeResources = [
    { name: '988 Suicide & Crisis Lifeline', phone: '988', available: '24/7', type: 'Crisis' },
    { name: 'Crisis Text Line', phone: 'Text HOME to 741741', available: '24/7', type: 'Crisis' },
    { name: 'SAMHSA National Helpline', phone: '1-800-662-HELP', available: '24/7', type: 'Substance Use' },
    { name: 'NAMI Helpline', phone: '1-800-950-NAMI', available: 'M-F 10am-10pm ET', type: 'Mental Health Info' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
              <Brain className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              Affordable Mental Health Care
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Find therapists, counselors, and mental health support with sliding scale fees, 
              free services, and options for uninsured patients. Your mental health matters.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">$40-80</div>
                <div className="text-sm text-slate-600">Sliding Scale Sessions</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-slate-600">Affordable Providers</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-slate-600">Online Therapy Available</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">FREE</div>
                <div className="text-sm text-slate-600">Crisis Support Lines</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main CTA */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/copilot?service=mental-health">
                  Find Mental Health Providers
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#crisis">
                  Get Crisis Support Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Mental Health Services We Help You Find
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <service.icon className="w-6 h-6 text-purple-600" />
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {service.priceRange}
                    </Badge>
                  </div>
                  <ul className="space-y-2">
                    {service.features.map((feature, fidx) => (
                      <li key={fidx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                        <Check className="w-4 h-4 text-emerald-600 mr-2" />
                        {feature}
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
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Conditions We Help You Find Treatment For
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Our network includes therapists and counselors specializing in various mental health conditions
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {conditions.map((condition, idx) => (
              <Badge key={idx} variant="outline" className="px-4 py-2 text-sm">
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Free Crisis Resources */}
      <section id="crisis" className="py-16 bg-red-50 dark:bg-red-900/10">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Free Crisis Support Available 24/7
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              If you&apos;re in crisis, these free resources are available immediately
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {freeResources.map((resource, idx) => (
              <Card key={idx} className="border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{resource.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{resource.type}</p>
                      <a href={`tel:${resource.phone.replace(/\D/g, '')}`} className="text-lg font-bold text-red-600 hover:text-red-700">
                        {resource.phone}
                      </a>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {resource.available}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Find Affordable Mental Health Care
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-bold mb-2">Tell Us Your Needs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Describe what type of support you&apos;re looking for and your budget constraints
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-bold mb-2">Get Matched</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Our AI finds therapists with sliding scale fees, free counseling, and online options
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-bold mb-2">Start Healing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Connect with affordable mental health professionals who understand your situation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Mental Health Care Cost Comparison
          </h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold mb-1">Traditional Private Therapy</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Standard out-of-pocket rates</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">$150-350</div>
                    <div className="text-sm text-slate-600">per session</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-emerald-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold mb-1">Sliding Scale Therapy</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Income-based pricing through our network</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">$40-80</div>
                    <div className="text-sm text-slate-600">per session</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold mb-1">Community Mental Health Centers</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Government-funded programs</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">$0-30</div>
                    <div className="text-sm text-slate-600">per session</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common Questions About Affordable Mental Health Care
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is sliding scale therapy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Sliding scale means the therapist adjusts their fee based on your income and ability to pay. 
                  Many therapists offer rates as low as $40-60 per session for those who qualify.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Can I get therapy without insurance?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes! Many therapists accept self-pay clients and offer reduced rates. Community mental health centers 
                  and training clinics also provide low-cost or free services regardless of insurance status.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Is online therapy as effective as in-person?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Research shows online therapy can be just as effective for many conditions. It&apos;s often more affordable 
                  and accessible, eliminating travel time and offering more flexible scheduling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Mental Health Can&apos;t Wait
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Find affordable therapy and counseling options today. No insurance required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-slate-100">
              <Link href="/copilot?service=mental-health">
                Find Mental Health Care Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-purple-900 dark:text-white hover:bg-white/10">
              <Link href="/services">
                Explore All Services
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
            "name": "Affordable Mental Health Services",
            "description": "Find affordable mental health care, sliding scale therapy, and free counseling services",
            "specialty": "Psychiatry",
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
