Context notes for the search application route (`/app`)

Robots policy
- We explicitly mark `/app` as `noindex,follow` via `app/app/head.tsx` to avoid indexing result pages with volatile query parameters. This matches the SEO plan.

Future work
- When we introduce server-rendered landing pages for specific queries, those should live under `/find/[service]/[city]` and be indexable with canonical URLs.


2025-08-17 — Robots meta correction
- Updated `app/app/head.tsx` to `noindex,follow` (was `index,follow`).
- Reason: `/app` represents a dynamic search results page; keeping it out of the index preserves crawl budget and prevents thin/volatile content in SERPs.


