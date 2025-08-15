import type { Metadata } from 'next'

type PageParams = { service: string }
type PageProps = { params: Promise<PageParams> }

async function unwrapParams<T>(p: T | Promise<T>): Promise<T> { return await p }

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sie2.com'

function titleize(key: string) {
  return key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service } = await unwrapParams(params)
  const serviceName = titleize(service)
  const title = `${serviceName} | Service Overview`
  const description = `Learn about ${serviceName} options and find free & low‑cost providers near you.`
  return {
    title,
    description,
    alternates: { canonical: `/services/${service}` },
    openGraph: { title, description, url: `${siteUrl}/services/${service}`, images: [`${siteUrl}/services/${service}/opengraph-image`] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ServiceHubPage({ params }: PageProps) {
  const { service } = await unwrapParams(params)
  const serviceName = titleize(service)
  return (
    <main className="container py-10">
      <h1 className="text-display-lg mb-4">{serviceName}</h1>
      <p className="text-body-base text-muted-foreground">
        Educational content and links coming soon.
      </p>
    </main>
  )
}


