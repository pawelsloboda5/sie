'use client'

import Image from 'next/image'
import Link from 'next/link'

interface NewHeroSectionProps {
  isAboveTheFold?: boolean
}

export function NewHeroSection({ isAboveTheFold = false }: NewHeroSectionProps) {
  return (
    <section className="relative">
      {/* Plain page background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 min-h-[100svh] lg:min-h-[55vh] xl:min-h-[50vh]">
        {/* Rocket Money-style HERO CARD */}
        <div className="relative rounded-[40px] sm:rounded-[48px] bg-neutral-100/90 dark:bg-gray-900/80 ring-1 ring-black/5 dark:ring-white/10 shadow-xl px-6 sm:px-10 lg:px-14 pt-10 pb-0 sm:pt-14 sm:pb-0 lg:pt-16 lg:pb-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* LEFT: Text block */}
            <div className="order-1 lg:order-none">
              <h1 className="font-bold text-gray-900 dark:text-white leading-tight tracking-[-0.02em] text-4xl sm:text-5xl lg:text-[56px]">
                The AI healthcare copilot that
                <br className="hidden sm:block" />
                {' '}works for you
              </h1>

              <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                Managing healthcare is hard, but you don&apos;t have to do it alone. SIE
                Copilot helps you find affordable providers, see real prices,
                and take back control of your health.
              </p>

              <div className="mt-8">
                <Link
                  href="/copilot"
                  className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 sm:px-7 py-3 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-400/30"
                  // Alternative with brand colors:
                  // className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 px-6 sm:px-7 py-3 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/30"
                >
                  Try for free
                </Link>
              </div>
            </div>

            {/* RIGHT: Phone mockup (inside the card, keep the top visible) */}
            <div className="relative order-2 lg:order-none h-[330px] sm:h-[450px] lg:h-[570px] overflow-hidden mt-0">
              <div className="absolute inset-x-0 top-0 mx-auto lg:mx-0 lg:ml-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[460px]">
                <Image
                  src="/iPhone-mockup.svg"
                  alt="SIE Copilot showing nearby affordable providers"
                  width={520}
                  height={1025}
                  className="w-full h-auto drop-shadow-2xl"
                  priority={isAboveTheFold}
                  sizes="(min-width:1024px) 460px, 80vw"
                  quality={90}
                />
              </div>
            </div>
          </div>

          {/* Subtle ring overlay for depth */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[40px] sm:rounded-[48px] ring-1 ring-black/5 dark:ring-white/10"
            aria-hidden="true"
          />
        </div>
        
      </div>
    </section>
  )
}

export default NewHeroSection
