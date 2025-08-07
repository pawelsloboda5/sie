"use client"

import { HeartHandshake, Stethoscope, Users, MapPin } from "lucide-react"
import { ProvidersHeader } from "./header"
import { ProviderApplicationForm } from "@/components/provider/ProviderApplicationForm"

export default function ProvidersPage() {

  return (
    <div className="min-h-screen bg-background">
      <ProvidersHeader />
      {/* ---------- Provider Network Section ---------- */}
      <section className="py-24 bg-gradient-to-br from-teal-50/30 via-white to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-teal-900/10">
        <div className="container space-y-12">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <HeartHandshake className="h-4 w-4 text-[#068282] dark:text-teal-400" />
              <span className="text-sm font-semibold text-[#068282] dark:text-teal-400">Provider Network</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Join the SIE Wellness Provider Network
            </h1>
            
            <div className="space-y-6 mt-8">
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                SIE Wellness is building a network of dedicated healthcare professionals to deliver preventative care to our members. We offer proactive healthcare coverage designed to improve patient outcomes, reduce long-term costs, and expand access to essential services.
              </p>
            </div>
          </div>

          {/* Opportunities List */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8 text-center">
              As part of our network, you will have the opportunity to:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20">
                    <Stethoscope className="h-6 w-6 text-[#068282] dark:text-teal-400" />
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Provide preventive services including screenings, routine check-ups, and patient education
                </p>
              </div>

              <div className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20">
                    <Users className="h-6 w-6 text-[#068282] dark:text-teal-400" />
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Serve uninsured and underinsured populations in the Atlanta metropolitan area and Twin Cities, Minnesota
                </p>
              </div>

              <div className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20">
                    <HeartHandshake className="h-6 w-6 text-[#068282] dark:text-teal-400" />
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Collaborate with a growing platform supported by AI-driven tools for patient matching and care coordination
                </p>
              </div>

              <div className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20">
                    <MapPin className="h-6 w-6 text-[#068282] dark:text-teal-400" />
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Benefit from competitive reimbursement rates and flexible scheduling options
                </p>
              </div>
            </div>
          </div>

          {/* Provider Application Form */}
          <div className="max-w-2xl mx-auto">
            <ProviderApplicationForm />
          </div>
        </div>
      </section>
    </div>
  )
}
