### SIE Wellness — SEO Plan (Programmatic, Scalable, 2025-ready)

Goal: Become the home for 1,000,000 monthly organic users by surfacing accurate, accessible care options fast.

Success metrics (90–180 days)
- Organic sessions: 0 → 200k/mo (90d), 500k+/mo (180d)
- Indexed pages: 2k+ provider pages + 1k+ city/service pages + blog/resources
- CTR: ≥ 6% on core programmatic pages
- Core Web Vitals: pass sitewide; LCP < 2.5s, INP < 200ms, CLS < 0.1

What’s changed in SEO (2024–2025 essentials)
- Helpful Content is folded into core updates: people-first content, source transparency, and experience (E‑E‑A‑T) matter most.
- Site reputation abuse crackdown: all content must be owned, reviewed, and consistent with mission.
- Page Experience and Core Web Vitals remain important tie‑breakers.

Geography and scope (current data coverage)
- Regions: District of Columbia, Maryland, Virginia, Georgia, and San Francisco (city).
- Prioritize programmatic pages for the top cities/metros in these regions first, then expand.
- Localized copy must reflect local terminology (DMV, Bay Area) and state programs where referenced.

Programmatic SEO architecture
1) Provider detail pages (2,000+)
   - Route: `app/providers/[slug]/page.tsx`
   - Canonical: `/providers/{provider-slug}`
   - Content blocks per page (unique, templated + data-backed):
     - Overview: name, category, short description in human language
     - Address, `GeoCoordinates`, phone, hours, languages
     - Accessibility and coverage chips (accepts uninsured, Medicaid/Medicare, SSN required, telehealth)
     - Services list with “free/discounted” labels + price info
     - Map embed and directions
     - Contact CTAs, appointment guidance, “What to bring” tips
     - Related providers (same service/city), breadcrumbs
   - Structured data (JSON‑LD): choose the most specific type based on category
     - `MedicalClinic` or `Physician` where applicable; else `LocalBusiness`
     - Include `address` (`PostalAddress`), `geo`, `telephone`, `openingHoursSpecification`, `priceRange`, `areaServed`
     - Optional: `AggregateRating` when we have real ratings (omit if not reliable)
   - Open Graph/Twitter: dynamic images (`opengraph-image.tsx`) with brand and provider name/city.
   - Indexable. Long‑tail keywords: “free [service] near me”, “[provider] [city] address & hours”, “no SSN clinic [city]”.

2) City + service landing pages (programmatic scale)
   - Route: `app/find/[service]/[city]/page.tsx`
   - Seed set v1: top 100 US cities × 12 high‑intent services (1,200 pages). Scale later to 1,000+ cities as crawl budget allows.
   - Content per page: intro paragraph (human‑written template), featured providers grid, FAQs, neighborhoods, nearby cities internal links.
   - Structured data: `CollectionPage` + `ItemList` of providers; FAQ with `FAQPage` when present.
   - Indexable; use clean, stable URLs and canonical to self.

3) Service category hubs
   - Route: `app/services/[service]/page.tsx`
   - Educational copy, eligibility guidance, cost expectations, links to city pages and top providers.

4) Blog + Guides + Glossary
   - Route: `app/blog/[slug]` (MDX). Voice & tone: plain‑language, humane, action‑oriented.
   - Content mix (weekly cadence):
     - How‑to guides: “Find free dental care in [state] in 30 minutes”
     - Explainers: “What clinics mean by ‘no SSN required’”
     - Provider spotlights and success stories (E‑E‑A‑T)
   - Add RSS feed; interlink with service/city pages.

Technical SEO (Next.js 15 app router)
- Metadata
  - `generateMetadata` for provider and programmatic pages with dynamic `title`, `description`, `alternates.canonical`, `openGraph`, `twitter`.
- Index management
  - Search results `/app` pages with query params: `robots: { index: false, follow: true }`.
  - Index provider, service, city pages by default.
- Sitemaps
  - `app/robots.ts` allowing all (block only internal preview routes).
  - `app/sitemap.ts` for core pages + child sitemaps:
    - `/sitemaps/providers-1.xml`, `/sitemaps/providers-2.xml` … (chunk ~5k URLs each)
    - `/sitemaps/cities-services.xml`, `/sitemaps/blog.xml`
  - Rebuild sitemaps daily or on data change; ping Search Console.
- Structured data
  - Global `Organization`/`WebSite` (`SearchAction` for site search) on root.
  - Per page: `MedicalClinic`/`Physician`/`LocalBusiness`, `BreadcrumbList`, `FAQPage`, `ItemList`.
- Performance
  - Image optimization with `next/image`; pre-generate OG images at edge.
  - Split code by route; use React Server Components by default.
  - Cache/API: ISR with `revalidate: 86400` (tune per freshness), SWR on client for minor UI updates.
  - Ensure font optimization (Geist already used); set `display: swap` and preconnect.
- Internationalization (phase 2)
  - Add `hreflang` once localization is available.

Information architecture and internal linking
- From provider cards, link to `/providers/[slug]` (not external sites). Keep "Visit Website" as a secondary action.
- On provider pages, link to parent category and city pages, and to 5–8 related providers.
- On service and city pages, link to at least 10 provider pages and 3 sibling pages.
- Use breadcrumb nav across all detail pages.

Local SEO considerations
- Consistent NAP (name, address, phone) formatting.
- Embed map and `GeoCoordinates` where accurate.
- If in scope, collect first‑party reviews with moderation and clear policies; otherwise omit ratings schema.

Content governance & E‑E‑A‑T
- All medical claims must be reviewed by qualified editors; add bylines, last‑reviewed dates, and reviewer credentials.
- Create an editorial style guide and fact‑checking checklist.

Analytics & monitoring
- Set up Google Search Console and Bing Webmaster Tools on day 1; submit sitemaps.
- Add GA4 later (planned); for now, capture server logs of impressions/clicks where applicable.
- Track keyword cohorts for each service/city and top providers.

Rollout plan (12 weeks)
- Weeks 1–2
  - Build provider pages route with dynamic metadata and JSON‑LD.
  - Ship `robots.ts`, first `sitemap.ts`, and provider sitemaps.
  - Convert results list CTAs to deep link into provider pages.
- Weeks 3–4
  - Launch 1,200 city/service pages (100 cities × 12 services) with FAQ and ItemList schema.
  - Create 12 service hubs with evergreen educational copy.
- Weeks 5–8
  - Publish 2 posts/week (8 posts) + 4 long‑form guides.
  - Add OG image generator per page type; implement breadcrumbs and related links.
  - Optimize CWV (image sizes, preconnects, route chunking).
- Weeks 9–12
  - Expand to 5k+ programmatic pages where crawl budget allows.
  - Iterate titles/meta based on GSC CTR; scale internal links from hubs.

Implementation checklist (dev)
- [ ] `app/robots.ts` and `app/sitemap.ts` with child sitemap routes
- [ ] `app/providers/[slug]/page.tsx` + `generateMetadata` + JSON‑LD
- [ ] `app/find/[service]/[city]/page.tsx` + `generateMetadata` + `ItemList`/`FAQPage` schema
- [ ] Replace “View Details” modal with link to provider page, retain modal for quick view if desired
- [ ] Canonicals + `noindex` for `/app` query pages
- [ ] OG/Twitter dynamic images per page type
- [ ] GSC/Bing verification files (or DNS)

Editorial checklist (content)
- [ ] Human‑written intros on all programmatic pages (avoid thin/duplication)
- [ ] Clear eligibility, cost, and privacy notes
- [ ] Bylines + last updated; cite official sources
- [ ] Alt text on all images; plain‑language summaries for complex topics

References and further reading
- Google Search Central: Helpful content guidance, Core updates, CWV, structured data
- Next.js App Router SEO: metadata, `robots.ts`, `sitemap.ts`, dynamic OG images
- Schema.org: `MedicalClinic`, `Physician`, `LocalBusiness`, `FAQPage`, `ItemList`, `BreadcrumbList`, `Organization`, `WebSite`



---

Deep‑dive implementation details

Provider detail pages — data mapping and page contract
- Input shape (aligned with current app types):
  - id, name, category, address, phone, website, email?, rating?, accepts_uninsured, medicaid, medicare, ssn_required, telehealth_available, insurance_providers[], services[] with flags (is_free, is_discounted), coordinates {lat, lon}
- UI sections → fields
  - Header: name, category, city; primary CTAs (call, directions, website)
  - Quick facts: chips from accepts_uninsured/medicaid/medicare/!ssn_required/telehealth_available
  - Services: list services grouped by category; highlight free/discounted; include price_info if present
  - Hours & languages: from dataset when present
  - Map: coordinates; fallback to address geocoding when missing coords
  - Related providers: same category in same city (top 6 by free services, then proximity)
- JSON‑LD fields (example set)
  - `@type`: `MedicalClinic` | `Physician` | `LocalBusiness`
  - `name`, `url`, `telephone`, `address` (`PostalAddress`), `geo` (`GeoCoordinates`), `openingHoursSpecification`, `sameAs` (official website), `priceRange` ("Free"/"Low‑cost"), `knowsAbout` (service tags)
  - `hasOfferCatalog` with `OfferCatalog` → `Offer` for notable free/discounted services (optional)
- Thin/low‑confidence guardrails
  - If address or phone is missing, keep page indexable but include “Call to confirm” banner and omit unverifiable blocks
  - Do not output `AggregateRating` unless we store reliable ratings

City + service pages — selection logic and UX
- Seed cities (v1) from regions DC/MD/VA/GA/SF; expand when coverage improves
- Services (v1 12): Free STI Testing, Urgent Care, Mental Health, Free Dental, Women’s Health, Pregnancy Care, Community Health Center, Vision Care, Pharmacy (low‑cost), Labs/Blood Testing, Immunizations, Telehealth
- Page anatomy
  - H1: `Find Free & Low‑Cost {Service} in {City}`
  - Intro: 2–3 sentences human‑written, city‑specific
  - Filters: uninsured, Medicaid/Medicare, no‑SSN, telehealth, distance
  - Featured providers: prioritize providers with free services; show total free counts
  - FAQ: 3–6 Q&As (eligibility, cost, documents to bring) with `FAQPage` schema
  - Nearby cities/neighborhoods: internal links (improves crawl paths)
- `CollectionPage` + `ItemList` structured data with `itemListElement` of provider URLs

Service hubs — content blueprint (MDX)
- Frontmatter: `title`, `description`, `serviceKey`, `lastReviewed`, `reviewedBy`
- Sections: What this service covers, Who qualifies, Cost & free options, How to prepare, Links to official sources, Popular questions

Blog/Guides — editorial operations
- Calendar (first 6 weeks):
  - Week 1: "How to find free STI testing in DC"; "What 'no SSN required' means at clinics"
  - Week 2: "Free dental options in Atlanta"; provider spotlight (community health center)
  - Week 3: "Low‑cost urgent care in Northern Virginia"; "Telehealth: what’s covered without insurance"
  - Weeks 4–6: replicate for Baltimore, Richmond, San Francisco, Savannah
- Add `/rss.xml` route; include latest 20 posts

Technical SEO — concrete files
- `app/robots.ts` (allow all; disallow `/app?*` and staging routes)
- `app/sitemap.ts` (index of child sitemaps)
- `app/sitemaps/providers/[index]/route.ts` (chunked by 5k)
- `app/sitemaps/cities-services/route.ts`
- `app/sitemaps/blog/route.ts`
- OG images: `app/(og)/providers/[slug]/opengraph-image.tsx`, `app/(og)/find/[service]/[city]/opengraph-image.tsx`, `app/(og)/blog/[slug]/opengraph-image.tsx`

Performance budgets
- Images ≤ 150KB above the fold, ≤ 1MB total per page at FMP
- JavaScript ≤ 170KB gzip per route (initial), aim lower on programmatic pages
- LCP target < 2.5s on 75th percentile mobile; INP < 200ms

Internal linking patterns
- From homepage: direct links to top services per region (DMV/GA/SF)
- From provider pages: parent city/service, 5–8 neighbors, and resources article relevant to category
- Footer: state/city quicklinks and emergency numbers

Monitoring & operations
- Search Console: submit all sitemaps; monitor coverage, enhancement reports, CWV
- Log `notFound` rates on provider routes; add 301s when merging duplicates
- Track CTR by title pattern; A/B test titles via content updates (no cloaking)

Wins, outcomes, and expectations

| Area | What we shipped | Expected impact (0–6 weeks) | 6–12 week outlook |
|---|---|---|---|
| Sitemaps | Root sitemap with child indices; provider sitemap index + 5k‑URL chunk routes; city/service + blog sitemaps | Fast discovery and crawling of core routes; reduced 404s | Majority of provider URLs discovered; coverage steadily rises in GSC |
| Robots | `robots.ts` allowing crawl, disallowing `/api/*`; `/app` results set to `noindex,follow` | Prevents low‑value result pages from indexing; protects crawl budget | Cleaner index; stronger focus on detail pages |
| Programmatic pages | Provider detail route with canonical, JSON‑LD, OG images; city/service pages with `ItemList` + `FAQPage`; service hubs | Eligible for rich results; long‑tail queries start to rank | Indexation of thousands of pages; early long‑tail traffic |
| Structured data | `MedicalClinic`/`Physician`/`LocalBusiness`, `ItemList`, `FAQPage`, `Breadcrumb` UX | Enhanced SERP appearance; better understanding by Google | Higher CTR on pages with FAQs/collections |
| OG images | Dynamic OG for providers, city/service, service hubs | Higher shareability and improved social previews | Brand consistency; better social CTR |
| Performance | RSC usage, ISR defaults, image optimization | Faster FCP/LCP → ranking tie‑breaker benefits | Stable CWV pass sitewide |
| Internal linking | Cards link to provider pages; related providers; breadcrumbs | Stronger crawl paths and topical clusters | Better depth crawling and ranking for clusters |
| Geocoding | Server proxy to avoid CORS | Improved UX → longer dwell time and conversions | Indirect positive engagement signals |

Traffic expectations (based on similar programmatic healthcare directories)

- Indexation: With 2k+ provider pages + seeded city/service pages, expect 40–60% of pages discovered and 25–40% indexed within 4–6 weeks (varies with domain history and link equity). Adding internal links/feeds will accelerate.
- Impressions: Initial long‑tail impressions in the tens of thousands within 6–8 weeks as Google tests page quality. CTR should average 3–6% on programmatic pages; FAQ‑enhanced pages can hit 6–10%.
- Sessions: Conservative ramp to 5–15k monthly organic sessions by weeks 8–12, assuming consistent crawl, no indexation blockers, and continued content improvements. With additional city/service coverage and links, 25–50k/mo by 4–6 months is achievable. Scaling beyond 100k+/mo will depend on link acquisition and continued page growth/quality.
- Coverage risks: Thin pages (few providers per city/service) may be de‑prioritized. We’ve guarded by generating content and FAQs; continue enriching copy and interlinks.

How good is SEO now?

- Technical baseline: Strong. Metadata, canonicals, OG, JSON‑LD, robots, sitemaps (with chunking), and RSC performance are in place. CWV should pass given current footprint; monitor in GSC/PSI after deploy.
- Content quality: Good foundation. Provider pages show rich, deduplicated data with cross‑referenced business info. City/service pages include `ItemList` and FAQs; expand human intros for top markets to avoid thin content flags.
- IA/linking: Solid start with breadcrumbs, related providers, and programmatic links. Next lift is adding more in‑context links from service hubs and blog posts.
- Authority: Early stage. Begin outreach to local orgs, gov/NGO directories, and healthcare blogs for mentions/links. Publish helpful guides to attract organic links.

Next levers to accelerate
- Scale city/service coverage steadily (ensure each has ≥5–10 providers). Add neighborhood pages for top metros.
- Add editorial intros to top 100 city/service pages and 12 service hubs.
- Ship OG images for blog; add `/rss.xml`; publish 2 posts/week and 1 guide/week for 6–8 weeks.
- Start link outreach to local coalitions and non‑profits; list in relevant directories.

FAQ strategy (including Preventive Care)
- Homepage: keep FAQ strictly about the live search product (what it is, how it works, free/uninsured/SSN/telehealth/accuracy). Mark up with FAQPage JSON‑LD.
- Dedicated page: add `/resources/faq` with expanded FAQs (no JSON‑LD) and link to it from header/footer. Treat “coming soon” topics (AI scheduler, Preventive Care Plan) here only, clearly labeled, and avoid structured‑data markup until launch.
- Programmatic pages: include 3–5 contextual FAQs per city/service page with FAQPage JSON‑LD (already implemented), focused on eligibility, cost, documents, and how to use filters.
