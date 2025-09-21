SIE Wellness — AI Healthcare Copilot and Search

This repository contains a Next.js application with an AI Copilot that helps users find affordable healthcare (free and low-cost options), alongside search and programmatic pages.

## Getting Started

First, set environment variables and run the development server:

```powershell
# Minimal env (copy to .env.local)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=sie-db
AZURE_OPENAI_ENDPOINT=<your-endpoint>
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_CHAT_MODEL=gpt-4.1
AZURE_OPENAI_API_VERSION=2025-04-01-preview

# Copilot vector defaults (optional)
COPILOT_SERVER_VECTOR=true
COPILOT_MAX_DISTANCE_MI=100

# Run dev server
npm run dev
```

Open `http://localhost:3000` with your browser.

Key routes:

- `/copilot` – AI Copilot chat UI (with streaming answers)
- `/app` – Interactive search application (client)
- Programmatic discovery pages under `/find` and provider details under `/providers`

## Copilot Architecture (High Level)

- Client: `app/copilot/page.tsx` with components in `components/copilot` (`ChatWindow`, `InputBar`, `ProviderCards`, `StatePanel`)
- API: `app/api/copilot/route.ts` orchestrates state extraction, retrieval, and summarization (Azure Responses)
- Search: `app/api/copilot/search/route.ts` (server-side vector search by default; geo/text + client rerank fallback)
- Filter: `app/api/copilot/filter/route.ts` (filter-only queries)
- Provider by name: `app/api/copilot/provider/route.ts`

## Useful Docs

- `app/api/copilot/AGENTS.md` – System architecture and flow
- `app/api/copilot/CLAUDE.md` – API endpoints and environment
- `COPILOT_TROUBLESHOOTING.md` – Common issues and fixes
- `COPILOT_VERIFICATION.md` – How to verify setup
- `COPILOT_LOCATION_SETUP.md` – Location UX and distance cap
- `VECTOR-SEARCH-PLAN.md` and `VECTOR_EMBEDDING_GENERATION_PLAN.md` – Vector strategy

## Deployment

Deploy to your preferred platform (Vercel compatible). Ensure all environment variables above are set in the hosting environment.
