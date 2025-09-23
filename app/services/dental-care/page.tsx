import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Affordable Dental Care | Cheap Dentists Near You',
  description: 'Find affordable dentists and free dental clinics near you. Cleanings from $30, fillings from $50. No dental insurance needed. Payment plans available.',
  keywords: ['cheap dentist', 'affordable dental care', 'free dental clinic', 'low cost dental', 'dental cleaning'],
}

export default function DentalCarePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Affordable Dental Care Near You
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Find cheap dentists, free dental clinics, and low-cost dental services. 
            Save up to 80% on dental care with transparent pricing.
          </p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/copilot">
              Find Dental Providers
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
