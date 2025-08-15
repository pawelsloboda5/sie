Context notes for sitemap routes

Implemented
- Root sitemap: `app/sitemap.ts` (lists key routes and child sitemaps)
- Providers: 
  - `app/sitemaps/providers/index/route.ts` (sitemap index that computes page count with 5k chunk size)
  - `app/sitemaps/providers/[page]/route.ts` (serves each chunk)
- Cities/services: `app/sitemaps/cities-services/route.ts` (region/service matrix)
- Blog: `app/sitemaps/blog/route.ts` (placeholder; will iterate MDX posts)

Planned (chunking)
- Done. Chunk size is 5000. Root sitemap includes discovery links for index.

