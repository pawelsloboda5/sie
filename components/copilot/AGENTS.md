AI Copilot – Agent Design

Problem
- Follow-up queries (e.g., “I have Medicaid, do any of those take it?”) lost the original intent (“free mammogram in DC”) causing the search to drift.
- The model sometimes returns provider cards without a crisp textual answer.

Goals
- Maintain conversation state: service_terms, affordability (free_only), insurance (accepts_medicaid / accepts_uninsured), and location.
- Always answer concisely (1–2 sentences) and, when ambiguous, append one follow-up question.
- Provider retrieval should target the latest service_terms, not literal follow-up wording.

Agent Strategy
1) State Extractor (Responses API, JSON schema)
   - Input: full conversation (user + assistant turns)
   - Output: { service_terms[], free_only, accepts_medicaid, accepts_uninsured, location_text }
   - Carries forward previous service_terms unless user changes topic.

2) Retrieval Caller
   - Builds `queryFromState = [free_only? 'free'] + service_terms`.
   - Optional geocode using location_text (via /api/geo/forward).
   - Calls /api/search with filters from state: acceptsMedicaid, acceptsUninsured, freeOnly.

3) Summarizer
   - If the primary tool loop returns no textual answer, call a small Responses prompt with top providers JSON to produce a concise answer + follow-up.

UX Rules
- Display provider cards for each AI answer.
- Persist conversation (localStorage) and keep sending it with each request.

Future Enhancements
- Confidence-aware clarifications (ask for location if missing, insurance if affordability implied).
- Service taxonomy normalization (e.g., map “mammogram” → service tags).
- Optional streaming.


