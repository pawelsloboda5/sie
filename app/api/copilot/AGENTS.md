AI Copilot – System Architecture and Flow

Overview
- This document describes how the AI Copilot processes any user query end to end, including state tracking, retrieval, summarization, selection of providers, and UI wiring. It also lists robustness improvements for handling thousands of diverse queries reliably.

Step‑by‑step flow
1) Client collects the conversation and current local state
   - Components: `ChatWindow`, `InputBar`, `StatePanel`, `ProviderCards`
   - Local storage keys: `sie:copilot:conversation`, `sie:copilot:state`
   - On send, the client posts `{ query, conversation, state }` to `/api/copilot`.

2) Server extracts and merges user state
   - File: `sie/app/api/copilot/route.ts`
   - Model extraction: Azure Responses API with strict `STATE_SCHEMA`
   - Heuristic fallback: parses the latest user message for common intents (e.g., mammogram, STI testing, dental, mental health, free, Medicaid, uninsured, city hints)
   - Merge strategy: `mergeState(previous, extracted)` then merge heuristic → yields final `UserState`

3) Optional geocode
   - If `state.location_text` is set, call `/api/geo/forward` to obtain `{ latitude, longitude }`

4) Build effective query and filters
   - `effective_query = [ state.free_only ? 'free' : null, ...state.service_terms ].join(' ') || original query`
   - Filters: `{ acceptsUninsured, acceptsMedicaid, freeOnly }` pulled from state

5) Retrieve providers and services
   - Endpoint: `/api/search` (vector search over providers/services, distance, services aggregation, scoring)
   - Returns: providers array (with `services` and `freeServicePreview`) and flattened services array for UI

6) Summarize with full search JSON (always)
   - Function: `summarizeWithSearchContext(question, effective_query, state, searchJson)`
   - Model prompt produces: `{ answer, follow_up_question, selected_provider_ids[] }`
   - Deterministic fallback if model returns no text or IDs:
     - Rank using state preferences (Medicaid, Uninsured, free services, rating, featured service)
     - Generate a concise answer naming top 2–3 providers and counts (e.g., "3 accept uninsured")

7) Finalize response
   - Order/filter providers by `selected_provider_ids`
   - Return `{ answer, follow_up_question, providers, state, debug, conversation }`
   - `debug` contains: `effective_query`, `filters_used`, `location_used`, `selected_provider_ids`, counts

8) Client renders
   - `ChatWindow` shows the assistant message, `ProviderCards` render for that message
   - `StatePanel` displays `state` and `debug` for observability
   - Conversation and state are persisted to local storage

Sequence (runtime interactions)
```mermaid
sequenceDiagram
  participant U as User
  participant C as Client (ChatWindow)
  participant A as API /api/copilot
  participant S as Search /api/search
  participant G as Geo /api/geo/forward

  U->>C: Type message
  C->>A: POST { query, conversation, state }
  A->>A: Extract state (model) + Heuristic merge
  alt state.location_text
    A->>G: Geocode
    G-->>A: { lat, lon }
  end
  A->>S: POST { effective_query, location?, filters }
  S-->>A: { providers[], services[] }
  A->>A: Summarize with SEARCH_JSON (Responses API)
  A->>A: Fallback selection & summary (if needed)
  A-->>C: { answer, selected_provider_ids, providers, state, debug }
  C->>C: Render bubble + ordered ProviderCards; update StatePanel
  C->>C: Persist conversation + state
```

Decision flow (server)
```mermaid
flowchart TD
  Q[Incoming query] --> E[Extract state (model)]
  E --> H[Heuristic enrich]
  H --> M[Merge state]
  M -->|location_text| G[Geocode]
  M -->|no location_text| B[Build effective query]
  G --> B[Build effective query]
  B --> R[Vector search /api/search]
  R --> SUM[Summarize with SEARCH_JSON]
  SUM -->|has text & IDs| RESP[Return]
  SUM -->|missing text or IDs| FB[Fallback rank + summary]
  FB --> RESP
```

Data contracts
```ts
type UserState = {
  service_terms: string[] | null
  free_only: boolean | null
  accepts_medicaid: boolean | null
  accepts_uninsured: boolean | null
  location_text: string | null
}

type DebugInfo = {
  effective_query: string
  filters_used: Record<string, unknown>
  location_used: { latitude: number; longitude: number } | null
  selected_provider_ids: string[] | null
  provider_count: number
  service_count: number
}

// Response shape (abridged)
{
  answer: string
  follow_up_question: string | null
  providers: any[]      // ordered by selected ids
  state: UserState
  debug: DebugInfo
  conversation: { role: 'user' | 'assistant', content: string }[]
}
```

Key behaviors
- Always summarize: model-based first; deterministic fallback guarantees a concise sentence naming top picks and intent satisfaction (uninsured/Medicaid/free).
- Provider selection: model’s `selected_provider_ids` wins; otherwise picked by state-aware ranker.
- State is mutable each turn: follow-ups (e.g., "I have Medicaid") update the state and reshape search + summary.
- Frontend shows exactly the providers selected by the AI and the state/debug for transparency.

Operational notes
- Token discipline: summarizer receives a compacted `SEARCH_JSON` (top provider fields + featured services) to keep latency and cost bounded.
- Fail-closed: if search or summarization fail, respond with a safe text and empty providers; UI still renders consistently.

Robustness roadmap (recommended)
1) State schema expansion
   - Add: `max_distance`, `telehealth_preferred`, `language`, `age_group`, `urgency`, `insurance_carrier[]`, `city_state`
   - Feed these through effective_query and filters; expose in `StatePanel`.
2) Service taxonomy normalization
   - Canonical tag mapping for 1000+ intents (mammogram → breast screening; dental → specific procedures).
   - Use embeddings + rules to map paraphrases to tags; maintain a small synonyms table.
3) Result quality guards
   - If < N suitable providers or weak scores, ask one targeted follow-up (location, insurance, distance, telehealth).
   - Minimum-one free/Medicaid pick when user implies affordability.
4) Ranking tuning
   - Increase weight for affordability (uninsured/Medicaid) and availability (phone/website present), modest distance penalty.
   - Prefer providers with a semantically relevant featured service.
5) Summarization improvements
   - Include short reason tags in answer (e.g., "free mammogram", "accepts uninsured", distance bucket).
   - Add streaming for faster perceived responsiveness.
6) Data freshness & accuracy
   - Ingest structured Medicaid/Uninsured acceptance from authoritative sources when available.
   - Service-level insurance acceptance (not only provider-level).
7) Caching & retries
   - Cache embeddings and search results by `(effective_query, location, filters)` with TTL; retry policy for Azure requests.
8) Observability & evals
   - Log state evolution, effective queries, selected IDs, and downstream clicks; build dashboards and regression evals with a query suite.
9) Internationalization & locales
   - Language detection, translated templates, location normalization by country.
10) Safety & guardrails
   - Never generate medical advice; keep guidance + provider recommendation style; allow disclaimers for urgent symptoms.

This architecture ensures each turn is self-consistent: state drives retrieval, retrieval drives summarization, and summarization drives the ordered provider cards shown to the user.


