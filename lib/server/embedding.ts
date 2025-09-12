import 'server-only'

// Shared Azure OpenAI embedding utility for server-side usage

const EMBED_TIMEOUT_MS = 5000
const EMBED_RETRIES = 2

const embedCache = new Map<string, number[]>()

function normalizeQuery(q: string) {
	return q.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function generateEmbedding(text: string): Promise<number[]> {
	const key = normalizeQuery(text)
	const cached = embedCache.get(key)
	if (cached) return cached

	const endpoint = process.env.AZURE_OPENAI_ENDPOINT
	const apiKey = process.env.AZURE_OPENAI_API_KEY
	const model = process.env.AZURE_OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
	if (!endpoint || !apiKey) throw new Error('Azure OpenAI credentials not configured')

	const url = `${endpoint}/openai/deployments/${model}/embeddings?api-version=2023-05-15`
	for (let attempt = 0; attempt <= EMBED_RETRIES; attempt++) {
		try {
			const ctrl = new AbortController()
			const t = setTimeout(() => ctrl.abort(), EMBED_TIMEOUT_MS)
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
				body: JSON.stringify({ input: text, model }),
				signal: ctrl.signal
			})
			clearTimeout(t)
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
			const data = await res.json()
			const emb = data.data[0].embedding as number[]
			if (Array.isArray(emb) && emb.length === 1536) {
				embedCache.set(key, emb)
				// LRU trim (simple) if >500 entries
				if (embedCache.size > 500) {
					const first = embedCache.keys().next().value
					if (first) embedCache.delete(first)
				}
				return emb
			}
			throw new Error('Invalid embedding payload')
		} catch (e) {
			if (attempt === EMBED_RETRIES) {
				console.error('Embedding failed, returning zero vector:', e)
				return new Array(1536).fill(0)
			}
			await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
		}
	}
	return new Array(1536).fill(0)
}


