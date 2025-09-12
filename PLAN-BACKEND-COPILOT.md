AI Copilot Backend Plan

Goals
- Use Azure OpenAI (deployment: gpt-5-mini) via Responses API with structured outputs.
- Enable tool calling to internal endpoints: /api/search, /api/geo/forward, /api/geo/reverse.
- Keep changes local to /api/copilot only; do not modify geo or search routes.
- Persist conversation context by echoing messages back to client to store.

System Prompt (high level)
- Role: Compassionate healthcare copilot for US users.
- Output: Concise 1–2 sentence answer plus optional follow-up question when ambiguous.
- Always attempt to provide provider recommendations via tools. Prefer free/Medicaid/No SSN when user suggests cost concerns. Respect query location or ask for it.
- Safety: Do not provide medical diagnosis; offer guidance and provider options.
- Tool policy: Use geo tools to resolve locations; use search tool for provider retrieval with query + inferred filters; never invent providers.

Structured Output Schema
- answer: string (<= 320 chars)
- follow_up_question?: string
- filters?: { freeOnly?: boolean; acceptsMedicaid?: boolean; acceptsUninsured?: boolean; telehealthAvailable?: boolean; ssnRequired?: boolean; serviceCategories?: string[]; maxDistance?: number }
- location_hint?: { text?: string, latitude?: number, longitude?: number }

Tools
- geo_forward(q: string) → { ok, latitude, longitude, raw }
- geo_reverse(lat, lon) → { ok, display, address }
- search_providers({ query, location?, filters?, limit? }) → forwards to /api/search POST; returns providers[]

Flow
1) Receive { query, conversation }.
2) Call Responses API with system prompt, messages, and available tools.
3) If tool calls requested, execute sequentially with timeouts (8s) and return tool outputs; loop until model returns a final.
4) Always fetch providers (either model called search_providers or we do a fallback search with the last query).
5) Return { answer, providers, conversation: updatedMessages }.

Performance
- Reuse Mongo client via existing helper in search route pattern.
- Keep timeouts short and parallelize where safe.

Security
- Read Azure endpoint/key from env: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT.

Incremental Plan
1) Implement Responses client and system prompt (this PR).
2) Add tool executor wrappers hitting our internal routes.
3) Echo updated conversation to client.
4) Tune prompts and filters.


