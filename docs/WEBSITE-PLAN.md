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

Programmatic city/service pages (new)
- Route: `/find/[service]/[city]`
- Above‑the‑fold: headline with city + service, quick filters, map toggle (later), count of free services
- Body: featured free/low‑cost providers, FAQs, nearby cities/neighborhoods, links to provider pages

Resources hub
- Route: `/resources`
- Cards for: Cost & Eligibility Guides, “No SSN” explainer, How to find care fast, Insurance tips
- Short blog posts (MDX) with related links to service/city pages

Imagery and brand assets
- Use the 2D mark for brand clarity; reserve the 3D “S” sparingly as a hero accent.
- Create consistent OG image templates for articles and programmatic pages.

Accessibility (WCAG 2.2 AA)
- Color contrast AA for all text and controls
- Keyboard navigation for menus, filters, dialogs
- Visible focus states (already present via `.focus-ring*` utilities)
- Semantic landmarks and headings; descriptive alt text

Performance
- Optimize `next/image` sizes; avoid layout shifts; lazy‑load below fold
- Cache programmatic pages with ISR; prefetch provider pages from lists
- Audit CWV regularly (Lighthouse/PSI) and fix regressions

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

Design QA checklist
- [ ] Consistent spacing scale and container widths
- [ ] Heading hierarchy correct and unique per page
- [ ] All buttons have clear text, aria‑labels where icons are used
- [ ] Images have alt text; decorative images are marked appropriately
- [ ] Mobile nav is reachable and operable with keyboard/screen reader


