'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Globe2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroPro() {
return (
<section className="relative overflow-hidden">
{/* Soft conic/gradient background */}
<div className="absolute inset-0 pointer-events-none">
<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] opacity-50 [mask-image:radial-gradient(600px_600px_at_center,black,transparent)]">
<div className="absolute inset-0 bg-[conic-gradient(from_220deg_at_50%_50%,#14b8a6_0%,#6ee7b7_20%,#22d3ee_45%,#14b8a6_60%,#06b6d4_80%,#14b8a6_100%)] opacity-[0.07] dark:opacity-[0.12]" />
</div>
</div>
<div className="container pt-12 md:pt-20 pb-12 md:pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
      {/* Text column */}
      <div>
        <Badge className="mb-4">AI-Powered Healthcare Discovery</Badge>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Find the right care,
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
            {' '}without barriers
          </span>
        </h1>

        <p className="mt-5 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl">
          Search clinics, mental health services, urgent care, and more—no insurance or documentation required. Built for individuals, social workers, and community organizations.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link href="/app">
              Search Providers
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-7">
            <Link href="#who-we-help">Who We Help</Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex -space-x-2">
            <Avatar seed="1" />
            <Avatar seed="2" />
            <Avatar seed="3" />
          </div>
          <span>Trusted by case managers and non-profits nationwide</span>
        </div>
      </div>

      {/* Visual column */}
      <div className="relative">
        <div className="relative rounded-2xl border bg-white dark:bg-gray-900 shadow-xl overflow-hidden ring-1 ring-black/[0.04]">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-5 md:p-7">
            <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300 font-medium">
              <Globe2 className="h-4 w-4" />
              Nationwide provider data with accessibility filters
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Preview skeleton of app search */}
            <div className="rounded-xl border bg-gray-50 dark:bg-gray-800 p-4">
              <div className="h-11 rounded-lg bg-white dark:bg-gray-900 border flex items-center px-3 text-gray-500">
                Try “free clinic near me” or “mental health services”
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Free STI Testing', 'Urgent Care', 'Mental Health', 'Free Dental', 'Women’s Health', 'Community Care'].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center justify-center rounded-full border bg-white dark:bg-gray-900 px-3 py-1 text-xs text-gray-700 dark:text-gray-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <Link href="/app" className="text-sm inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">
                Open search <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Floating labels */}
        <div className="absolute -bottom-6 -left-6 hidden md:block">
          <FloatingBadge text="Barrier-free" />
        </div>
        <div className="absolute -top-6 -right-6 hidden md:block">
          <FloatingBadge text="No Insurance Required" />
        </div>
      </div>
    </div>
  </div>
</section>
);
}

function Badge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-teal-700 border-teal-200 bg-teal-50 dark:text-teal-300 dark:border-teal-900/60 dark:bg-teal-900/20 ${className}`}
    >
      {children}
    </span>
  );
}

function FloatingBadge({ text }: { text: string }) {
return (
<div className="rounded-full border bg-white/80 dark:bg-gray-900/80 backdrop-blur px-4 py-2 text-sm shadow-sm">
{text}
</div>
);
}

function Avatar({ seed }: { seed: string }) {
  return (
    <div className="h-8 w-8 rounded-full border bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <Image
        src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}`}
        alt="user avatar"
        width={32}
        height={32}
      />
    </div>
  );
}
