import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { AppHeader } from '@/app/app/header'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | SIE Wellness',
  description: 'Answers about using SIE Wellness to find free & low‑cost care: how search works, eligibility, SSN, uninsured, languages, hours, and telehealth.',
  alternates: { canonical: '/resources/faq' },
}

const faqs = [
  {
    q: 'What is SIE Wellness?',
    a: 'An intelligent search experience to find free & low‑cost healthcare providers and services near you.'
  },
  {
    q: 'How does it work?',
    a: 'We aggregate and enhance provider data, then let you filter by service, location, uninsured/SSN, languages, and telehealth.'
  },
  {
    q: 'Is it free?',
    a: 'Yes. The search is free for everyone.'
  },
  {
    q: 'Is SSN required?',
    a: 'Many clinics do not require a Social Security Number. We label providers where “No SSN” is available.'
  },
  {
    q: 'What about accuracy?',
    a: 'We refresh data regularly and show contact info so you can confirm details with providers.'
  },
  {
    q: 'How do I find free services?',
    a: 'Use filters for “Accepts uninsured” and look for services marked free/discounted on provider pages.'
  },
  {
    q: 'Can I use telehealth?',
    a: 'Yes—filter for telehealth to find virtual visit options.'
  },
  {
    q: 'Do you cover the DMV?',
    a: 'Yes. Start with our DMV quick links on the homepage footer.'
  },
  {
    q: 'Where can I see upcoming features?',
    a: 'We share product updates and upcoming features on our roadmap page.'
  }
]

// Future product FAQs are intentionally excluded from JSON-LD to avoid SEO indexing
const futureProductSections = [
  {
    title: 'Automated Phone Scheduling',
    items: [
      {
        q: 'What is Automated Phone Scheduling?',
        a: 'A smart system that books your medical appointments for you — no more waiting on hold.'
      },
      {
        q: 'How does it save me time?',
        a: 'It finds open appointment slots with any provider, confirms your booking, and sends you instant confirmation.'
      },
      {
        q: 'Can I use it for any provider?',
        a: 'Yes — our launch will connect you to all providers, from primary care to specialists, across our network.'
      },
      {
        q: 'Will I get reminders?',
        a: 'Yes, you’ll receive confirmation and reminders by phone, text, or email.'
      },
      {
        q: 'Does it cost extra?',
        a: 'Basic scheduling is included with your membership; premium scheduling features may be added later.'
      }
    ]
  },
  {
    title: 'Preventive Care Plan',
    items: [
      {
        q: 'What is the Preventive Care Plan?',
        a: 'A bundled package of annual check-ups, screenings, and wellness services designed to keep you healthy.'
      },
      {
        q: 'Why is preventive care important?',
        a: 'It helps detect potential health issues early, when they’re easiest to treat.'
      },
      {
        q: 'What services are included?',
        a: 'We’re building a plan with common screenings, primary care visits, and wellness checks — final details will be shared before launch.'
      },
      {
        q: 'Do I need insurance to join?',
        a: 'No — it’s designed for the uninsured and underinsured.'
      }
    ]
  }
]

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }

  return (
    <main>
      <AppHeader />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_-10%,#E6F7EF_25%,transparent),radial-gradient(700px_350px_at_80%_-5%,#E9F1FF_25%,transparent)] -z-10" />
        <div className="container py-14 md:py-20 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/SIE Prim_teal.png"
              alt="SIE Wellness"
              width={180}
              height={72}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-display-lg mb-3">Frequently Asked Questions</h1>
          <p className="text-body-base text-muted-foreground max-w-2xl mx-auto">
            About SIE Wellness search, data freshness, and finding care fast.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/resources/roadmap">View roadmap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="container max-w-3xl pb-16">
        <h2 className="sr-only">FAQs</h2>
        <Accordion type="multiple" className="rounded-2xl border bg-card card-shadow-lg">
          {faqs.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="px-4 sm:px-6">
              <AccordionTrigger className="text-base md:text-lg py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.q === 'Where can I see upcoming features?' ? (
                  <>
                    <p className="mb-2">{item.a}</p>
                    <Link className="underline" href="/resources/roadmap">View roadmap</Link>
                  </>
                ) : (
                  <p>{item.a}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Future products (coming soon) — visible to users, excluded from JSON-LD and snippet generation */}
        <div className="mt-12" data-nosnippet>
          <h2 className="text-2xl font-semibold">Future products (coming soon)</h2>

          {futureProductSections.map((section, sectionIdx) => (
            <div key={section.title} className="mt-6">
              <h3 className="text-lg font-medium">{section.title}</h3>
              <Accordion type="multiple" className="rounded-2xl border bg-card card-shadow-lg mt-2">
                {section.items.map((qa, qaIdx) => (
                  <AccordionItem key={`${sectionIdx}-${qaIdx}`} value={`${sectionIdx}-${qaIdx}`} className="px-4 sm:px-6">
                    <AccordionTrigger className="text-base md:text-lg py-5">
                      {qa.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <p>{qa.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            Still have questions?{' '}
            <Link className="underline" href="mailto:hello@siewellness.org">Contact us</Link>.
          </p>
        </div>

        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </section>
    </main>
  )
}


