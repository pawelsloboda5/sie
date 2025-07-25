"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HeartHandshake, Stethoscope, Users } from "lucide-react"

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ---------- Preventive Care Service ---------- */}
      <section className="py-24 bg-gradient-to-br from-teal-50/30 via-white to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-teal-900/10">
        <div className="container space-y-12">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <HeartHandshake className="h-4 w-4 text-[#068282] dark:text-teal-400" />
              <span className="text-sm font-semibold text-[#068282] dark:text-teal-400">Coming Soon</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              SIE Wellness Preventative Healthcare Coverage
            </h2>
            
            <div className="space-y-6 mt-8">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                We&apos;re excited to announce the upcoming launch of SIE Wellness Preventative Healthcare Coverage, 
                designed to proactively support your wellness with annual physicals, dental cleanings, essential 
                lab tests, and personalized add-on services.
              </p>
              
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Our plans are highly affordable with flexible payment options to fit your budget. 
                Sign up today to receive updates, exclusive early access opportunities, and news about our official start date!
              </p>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-lg mx-auto mt-12">
            <div className="flex gap-3 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 border-0 bg-transparent text-base py-4 px-4 focus:outline-none focus:ring-0 placeholder:text-gray-400"
              />
              <Button 
                size="lg" 
                className="px-6 py-4 bg-[#068282] hover:bg-[#0f766e] text-white rounded-xl transition-all duration-300"
              >
                Join Waitlist
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6">
                <Stethoscope className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Annual Physicals</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive yearly checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6">
                <HeartHandshake className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Dental Care</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Regular cleanings and checkups</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 mb-6">
                <Users className="h-8 w-8 text-[#068282] dark:text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Lab Tests</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Essential health screenings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
