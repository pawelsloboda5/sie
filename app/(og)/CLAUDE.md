Context notes for OG image routes

What exists
- Providers: `app/(og)/providers/[slug]/opengraph-image.tsx`
- City/service: `app/(og)/find/[service]/[city]/opengraph-image.tsx`
- Service hub: `app/(og)/services/[service]/opengraph-image.tsx`

Usage
- Metadata for provider, city/service, and service hub pages now includes `openGraph.images` pointing to these routes.
- Edge runtime for fast generation; simple branded design for now.

Next
- Add caching headers if needed and refine layout/branding.

