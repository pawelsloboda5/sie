AI Copilot – Implementation Plan

Overview
- Goal: Add an AI Copilot experience that answers healthcare questions concisely, asks clarifying follow-ups, and displays recommended providers from the providers collection.
- Scope: New UI page and components, POST /api/copilot endpoint, provider retrieval, Azure OpenAI short answer, responsive UX.

User Experience
- Landing section: Title “AI Healthcare Copilot” and subtext.
- Chat window: User (right), AI (left), typing indicator, scrollable history, theme colors, dark/light.
- Input area: Text box, Send, Enter submit; mic button reserved for future.
- Provider recommendations: Horizontal scroll/grid under each AI answer, showing name, address, phone, badges, CTA.
- Empty state: Prompts like “I need a free mammogram in DC”, gradient background.
- Layout: Mobile-first chat; Desktop split-screen (chat left, providers right).

Architecture
- UI: New route sie/app/copilot/page.tsx with container using existing AppHeader. Components in sie/components/copilot/:
  - CopilotChat.tsx: renders messages (user/AI), typing indicator, provider cards section per AI message.
  - CopilotInput.tsx: text input + send. Emits onSubmit(query: string).
  - ProviderCards.tsx: thin adapter that reuses results/ProviderCard.tsx with a compact layout.
- API: sie/app/api/copilot/route.ts – POST only.
  - Input: { query: string, conversation: Message[] }
  - Output: { answer: string, providers: Provider[] }
  - Behavior: Always returns providers using MongoDB query, optionally vector-assisted later. AI answer uses Azure OpenAI for a 1–2 sentence summary. No streaming initially.
- Data: Reuse provider shape from /api/search and /api/filter. Project only needed fields for cards.

Backend Details
- Mongo connection: Reuse the getDb pattern from sie/app/api/search/route.ts to avoid per-request connect/close.
- Provider fetch: Start with simple text relevance on summary_text/name and optional heuristic sort (rating desc, free_services desc), limit 8–12.
- AI response: Use generateEmbedding later if we route to vector search; for v1, call Azure OpenAI chat with a short system instruction (concise, 1–2 sentences, propose 1 follow-up question when ambiguous).
- Safety: Validate query, cap tokens, 8s timeout, surface friendly error but still return providers.

Interactions
- On submit: append user message; call /api/copilot; show typing indicator; render AI message and provider cards.
- Follow-ups: Client can maintain conversation state (array of {role, content}). Server sends concise reply; client may continue thread.

Reusability & Consistency
- Provider cards: Reuse components/results/ProviderCard.tsx in compact mode.
- Colors and typography: inherit from globals and UI kit.

Routes & Files
- sie/app/copilot/page.tsx – page wrapper.
- sie/components/copilot/CopilotChat.tsx – conversation UI.
- sie/components/copilot/CopilotInput.tsx – input bar.
- sie/components/copilot/ProviderCards.tsx – adapter over ProviderCard.
- sie/app/api/copilot/route.ts – endpoint stub.
- sie/components/copilot/CLAUDE.md – context for this feature.

Analytics
- Later: add simple client events on send, response, provider card click.

Open Questions
- Should we scope providers by user geolocation by default? For v1, include optional location in message parsing; later use browser geolocation.
- Do we want streaming AI responses? Out of scope for v1.

Risks & Mitigations
- Azure Responses API quirks: Prefer stable Chat Completions; keep output length constrained. If AI fails, still return providers.
- Latency: Cache last 1–2 answers client-side; keep provider query efficient with projections and indexes.

Phased Delivery
1. Scaffolding (routes, components, header nav) – this PR.
2. API stub returning placeholder answer and top providers (no AI yet) – quick verification.
3. Wire Azure OpenAI for concise responses.
4. Optional: conversation-aware retrieval and vector re-ranking using existing embedding utilities.

### Homepage Revamp Plan — Focus on Starting a Search

Objectives
- Primary: Increase clickthrough from `/` to `/app` (start a search) and to programmatic `/find/[service]/[city]` pages.
- Secondary: Strengthen internal links to key city/service pages aligned with early GSC demand.

Scope (MVP)
- Simplify above-the-fold to a single clear action: start a search.
- Promote “Use my location” in the hero.
- Add curated quick links to `/find/[service]/[city]` based on your picks + data.
- Keep dev/Open Source banner but move it further below the fold.
- Add a sticky mobile “Start search” CTA.
- Ensure sitelinks searchbox structured data is present (already in layout).

Curated links (first set)
- Free STI testing — Colesville: `/find/free-sti-testing/colesville-md`
- Free STI testing — Silver Spring: `/find/free-sti-testing/silver-spring-md`
- Free mammograms — Rockville: `/find/womens-health/rockville-md`
- Urgent care — Washington DC: `/find/urgent-care/washington-dc`
- Vision care — Gaithersburg: `/find/vision-care/gaithersburg-md`
- Immunizations — Fairfax: `/find/immunizations/fairfax-va`

Deliverables
1) Update `sie/app/page.tsx`
   - Keep current hero but make the next action obvious: add a “Browse by City/Service” grid directly under the hero with the 6 links above.
   - Add top-of-fold quick chips that deep-link to `/app?q=...` (we’ll reuse existing quick chips already in `SimpleHeroSection`).
   - Add a sticky mobile bottom CTA to “Start a search” → `/app`.
   - Ensure Open Source banner remains but is clearly below the fold.

2) Validate structured data
   - `WebSite` + `SearchAction` already present in `layout.tsx` (no change needed). Confirm `metadataBase` is correct.

Out of scope (this pass)
- GA4 custom events (explicitly declined for now).
- Full header/nav redesign.
- Geo-IP based server-side personalization.

Acceptance criteria
- Above-the-fold presents a single, obvious primary action to start a search.
- The six curated city/service links appear directly below the hero.
- Sticky mobile CTA appears and links to `/app`.
- Existing `/app` route remains `noindex,follow` (no SEO regressions).
- `WebSite` `SearchAction` schema present on root.

Risks & mitigations
- Too many links can distract: we constrain to six curated links; revisit monthly.
- Open Source banner competing for attention: placed lower on page.

Rollout & measurement
- Monitor GA4 “Pages and screens” and GSC for `/` → `/app` path growth and impressions/clicks on the six `/find/...` URLs.


Status (2025-08-17)
- Done:
  - Homepage curated links block added under hero (6 items).
  - Open Source banner confirmed below the fold.
  - `/app` robots meta corrected to `noindex,follow` per SEO plan.
- Pending/Next (minimal, robust steps):
  1) Extract curated links to a tiny config object and reuse in footer (keeps homepage slim; optional).
  2) Add small copy above hero clarifying value proposition in one line (A/B vs current).
  3) Validate `WebSite` SearchAction with Google Rich Results Test; no code change expected.
  4) Monitor GSC and GA4 for homepage → search CTR uplift; iterate links monthly.


