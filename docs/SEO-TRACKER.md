### SIE Wellness — SEO Tracker

Purpose: single place to track actions, status, goals, timelines, and outcomes.

---

Milestones (status)
- Domain verified in Google Search Console (GSC) — done
- Sitemaps submitted — done
  - Root: https://www.sie2.com/sitemap.xml
  - Provider index: https://www.sie2.com/sitemaps/providers/index → child `1.xml` shows 3,567 URLs (Success)
  - Cities/services: https://www.sie2.com/sitemaps/cities-services → 276 URLs (Success)
- Programmatic pages live — done
  - Providers: `/providers/[slug]` (RSC, JSON‑LD, OG)
  - City/service: `/find/[service]/[city]` (ItemList + FAQPage JSON‑LD)
  - Service hubs: `/services/[service]`
- FAQ on homepage with FAQPage JSON‑LD — done
- GA4 installed — done

Open tasks (next 7–14 days)
- Request indexing in batches (10–20/day): homepage, key city/service, mix of provider pages — in progress
- Add internal links on homepage/footer to top services and cities (DMV/GA/SF) — todo
- Breadcrumb JSON‑LD already on provider pages; extend to city/service pages — todo
- Add `<lastmod>` to sitemaps (index + URL sets) — todo
- Publish first 2 MDX resources (FAQ/guide) and wire `/rss.xml` — todo
- Add related links block on city/service pages — todo

KPIs & targets
- Discovery: 3,000–5,000 URLs discovered in first week (providers + cities/services) — baseline: 3,843+ discovered
- Index coverage: 25–40% of discovered indexed by 4–6 weeks
- Impressions: 10k–50k in 4–8 weeks; CTR 3–6% on programmatic pages
- Sessions (organic):
  - 3 days: minimal (0–200) expected while crawling starts
  - 1 week: 300–1,000 sessions if crawl continues and first pages index
  - 4–6 weeks: 5k–15k sessions with ongoing interlinking and submissions

Benchmarks (external research)
- New or low‑authority sites often take days to weeks for first indexation after sitemaps and URL submissions; coverage grows steadily with strong internal links and clear sitemaps (GSC and industry guidance).
- FAQ and ItemList structured data can lift CTR when rich results show; several industry summaries report material CTR gains when FAQ rich results appear.

Daily/weekly operating cadence
- Daily (10–15 minutes)
  - GSC → Sitemaps: check fetch + discovered counts
  - URL Inspection: request indexing for 10–20 mixed URLs
  - Fix any 404/soft‑404 surfaced
- Weekly
  - Add 30–60 internal links from homepage, hubs, and resources to city/service pages
  - Publish 1–2 resources (MDX) and interlink
  - Review “Pages” coverage; nudge by requesting indexing for non‑indexed high‑value URLs

Risk & mitigations
- Crawl budget/coverage: ensure strong internal links to city/service pages; keep sitemaps fresh with `<lastmod>`
- Thin content flags: add short human intros on top city/service pages; maintain accurate provider details
- Performance regressions: monitor CWV in GSC after 28 days; keep images optimized and client JS minimal

Notes
- `/app` route is intentionally `noindex,follow` — do not request indexing
- Keep NEXT_PUBLIC_SITE_URL accurate in prod; OG and canonical rely on it


