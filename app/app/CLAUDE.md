Context notes for the search application route (`/app`)

Robots policy
- We explicitly mark `/app` as `noindex,follow` via `app/app/head.tsx` to avoid indexing result pages with volatile query parameters. This matches the SEO plan.

Future work
- When we introduce server-rendered landing pages for specific queries, those should live under `/find/[service]/[city]` and be indexable with canonical URLs.


