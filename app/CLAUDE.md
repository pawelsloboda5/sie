Context notes for SIE Wellness — app/ directory

Why these files were added first
- `robots.ts`: Enables search engines to crawl the site while disallowing API routes and points them to our sitemap. Uses `NEXT_PUBLIC_SITE_URL` if present.
- `sitemap.ts`: Minimal root sitemap for launch. Will expand to child sitemaps for programmatic pages (providers, city/service, blog) as routes are added.

Planned structure (aligned with docs/SEO-PLAN.md)
- app/providers/[slug]/
- app/find/[service]/[city]/
- app/services/[service]/
- app/blog/[slug]/
- app/sitemaps/providers/[index]/route.ts (chunked)
- app/sitemaps/cities-services/route.ts
- app/sitemaps/blog/route.ts
- app/(og)/**/opengraph-image.tsx (dynamic OG images)

Sitemaps implemented so far
- Root sitemap: `app/sitemap.ts` (minimal)
- Provider sitemap: `app/sitemaps/providers/route.ts` (single file for now; chunk later)
- City/service sitemap: `app/sitemaps/cities-services/route.ts` (seed regions)
- Blog sitemap: `app/sitemaps/blog/route.ts` (placeholder)

OG images
- See `app/(og)/**/opengraph-image.tsx`; pages now reference these in `openGraph.images`.

Environment
- `NEXT_PUBLIC_SITE_URL` should point to the public origin (e.g., https://www.siewellness.org). In dev, it can be omitted.

Robots policy
- Allow crawling of public routes
- Disallow `/api/*`
- Add further disallows for staging or internal preview paths when introduced


