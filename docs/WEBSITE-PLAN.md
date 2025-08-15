### SIE Wellness — Website & UX Plan (Modern, Accessible, Consistent)

Brand intent
- Authentic, human, and hopeful. Modern and sleek, but approachable.
- Visual identity anchored in brand green `#068282` with calm neutrals and generous whitespace.

Primary outcomes
- Help users find the right care in < 30 seconds.
- Increase trust and engagement via clarity, accessibility, and consistency.

Top‑level IA (tabs / nav)
- Home
- Find Care (app)
- Services (hub → service pages)
- Providers (directory → provider pages)
- Resources (Guides, Blog, FAQs)
- About + Contact

Design system (consistency)
- Typography
  - Headings: Geist Sans (already in use) with tight tracking; sizes mapped to `.text-display-*` and `.text-h*` utilities in `globals.css`.
  - Body: Geist Sans; minimum 16px on mobile.
- Color
  - Primary: `#068282`; semantic scales already defined in CSS variables; ensure WCAG AA contrast for text.
  - Accents: soft teals and neutrals; reserve vibrant tones for CTAs.
- Components
  - Buttons: primary/secondary/ghost with consistent radii and focus states
  - Cards: elevation tokens (`card-shadow`, `-lg`, `-xl`)
  - Chips/Badges for accessibility flags (uninsured, telehealth, no SSN)
  - Breadcrumbs across provider and programmatic pages
  - Tabs for provider sub‑sections (Overview, Services, Hours, Contact)
- Motion
  - Micro‑interactions on hover/focus; subtle entrance transitions; respect reduced‑motion preference.
- Dark mode
  - Already supported by tokens; ensure imagery and icons adapt.

Component library upgrades (React 19 / Next.js 15)
- Prefer React Server Components (RSC) for data‑driven, read‑only sections (provider pages, city/service pages) to minimize JS.
- Client components only where interactivity is required (filters, dialogs, carousels).
- Use Next’s new metadata APIs and `next/og` for dynamic OG images.
- Image handling via `next/image` with `sizes`/`priority` tuned; avoid layout shift.

Hero and homepage
- Replace static hero with brand “S” logomark + wordmark and a concise promise statement.
- Keep the powerful search, but add 3 curated quick‑start buttons (Free STI Testing, Free Dental, Mental Health).
- Add trust signals: “How it works”, data coverage, and communities served.

Provider page UX (new)
- Route: `/providers/[slug]`
- Layout
  - Header: name, category, city, primary CTA group (Call, Directions, Visit Website)
  - Left column: overview, services (grouped by category, free/discounted labels), pricing notes, eligibility
  - Right column: sticky card with contact, hours, languages, insurance info, accessibility flags
  - Footer section: related providers, neighborhood areas, feedback/contact link
  - Breadcrumbs: Providers > City > Provider Name
  - Optional: short success stories or tips (what to bring, documents)

 Implementation notes (dev)
 - Server component for main page; client subcomponents for map, “Call” button analytics, and collapsible sections.
 - Prefetch adjacent provider pages on hover/viewport (Next Link prefetch) from lists.
 - Add `generateMetadata` to build dynamic title/description and Open Graph.
 - Render JSON‑LD via a small server component that outputs `<script type="application/ld+json">` safely.

Programmatic city/service pages (new)
- Route: `/find/[service]/[city]`
- Above‑the‑fold: headline with city + service, quick filters, map toggle (later), count of free services
- Body: featured free/low‑cost providers, FAQs, nearby cities/neighborhoods, links to provider pages

 Implementation notes (dev)
 - Use RSC with streaming for fast TTFB; hydrate only filters.
 - Add breadcrumbs, internal links to service hub and provider pages.
 - Include `ItemList` and optional `FAQPage` JSON‑LD.

Resources hub
- Route: `/resources`
- Cards for: Cost & Eligibility Guides, “No SSN” explainer, How to find care fast, Insurance tips
- Short blog posts (MDX) with related links to service/city pages

 MDX/blog system
 - Store in `content/blog/` with frontmatter (title, description, tags, date, reviewedBy).
 - Build an index page with filters by region (DC/MD/VA/GA/SF) and service.
 - Generate RSS at `/rss.xml`.

Imagery and brand assets
- Use the 2D mark for brand clarity; reserve the 3D “S” sparingly as a hero accent.
- Create consistent OG image templates for articles and programmatic pages.

Accessibility (WCAG 2.2 AA)
- Color contrast AA for all text and controls
- Keyboard navigation for menus, filters, dialogs
- Visible focus states (already present via `.focus-ring*` utilities)
- Semantic landmarks and headings; descriptive alt text
 - Form labels and errors: connect with `aria-describedby`; ensure logical tab order
 - Motion: respect `prefers-reduced-motion` in all animated components

Performance
- Optimize `next/image` sizes; avoid layout shifts; lazy‑load below fold
- Cache programmatic pages with ISR; prefetch provider pages from lists
- Audit CWV regularly (Lighthouse/PSI) and fix regressions
 - Avoid client‑side heavy libraries on programmatic pages; prefer CSS and native elements
 - Target budgets: LCP < 2.5s, INP < 200ms, CLS < 0.1 on mobile 75th percentile

Implementation roadmap
- Milestone 1 (Weeks 1–2):
  - Provider detail route + UI composition
  - City/service programmatic route + template
  - Breadcrumbs + consistent header/footer navigation
- Milestone 2 (Weeks 3–4):
  - OG image generator per page type
  - Resources hub + 4 starter articles (MDX)
  - Polish component library: badges, tabs, cards, CTAs
- Milestone 3 (Weeks 5–6):
  - A/B titles and CTA copy; refine spacing and typography rhythm
  - Dark‑mode visual QA; accessibility fixes from audit
 - Milestone 4 (Weeks 7–8):
   - Map enhancements and city landing page expansions
   - Add error states, empty states, and loading skeletons for all major routes

Design QA checklist
- [ ] Consistent spacing scale and container widths
- [ ] Heading hierarchy correct and unique per page
- [ ] All buttons have clear text, aria‑labels where icons are used
- [ ] Images have alt text; decorative images are marked appropriately
- [ ] Mobile nav is reachable and operable with keyboard/screen reader

Regional focus (current data)
- DMV (DC/MD/VA), Georgia, and San Francisco-specific quick links on homepage/footer.
- Service presets for these regions in search chips.

Tech references
- Next.js 15 App Router: metadata, `robots.ts`, `sitemap.ts`, RSC/streaming, `next/og`.
- React 19: concurrent rendering default, `use` for data fetching in RSC where applicable.



