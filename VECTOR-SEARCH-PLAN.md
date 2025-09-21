# Vector Search Implementation Plan for AI Copilot

## Overview
This document outlines the strategy for implementing and operating vector search using embeddings to improve the AI Copilot's ability to find relevant healthcare providers and services. The current system enables server-side vector search by default when supported by the database (Cosmos `cosmosSearch`), with a fallback to geo/text filtering plus client-side reranking.

## 1. Fields to Index for Vector Search

### Primary Embedding Fields (High Priority)

#### 1.1 Service-Level Embeddings
Each service in the `services` array should have its own embedding:
```javascript
services: [{
  name: "Dental Cleaning",
  category: "General",
  description: "Professional teeth cleaning...",
  embedding: [/* 1536-dim vector */]  // <-- Primary search target
}]
```

**Concatenate for embedding:**
- `name + " " + category + " " + description`
- Include price context: "costs $X" or "free service"
- Include insurance context if available

#### 1.2 Provider-Level Embedding
One embedding per provider for general searches:
```javascript
{
  name: "Rinse Dental",
  category: "Dentist",
  embedding: [/* 1536-dim vector */]  // <-- Secondary search target
}
```

**Concatenate for embedding:**
- `name + " " + category`
- Top 5 service names
- Insurance acceptance (e.g., "accepts Medicaid Medicare self-pay")
- Location context (city, state)

### Secondary Embedding Fields (Medium Priority)

#### 1.3 Searchable Keywords Embedding
From `source.searchKeywords`:
```javascript
source: {
  searchKeywords: ["walk-in clinic", "sliding scale", "annual wellness"],
  searchKeywordsEmbedding: [/* vector */]
}
```

## 2. Embedding Generation Strategy

### 2.1 Model Selection
- **Recommended**: OpenAI `text-embedding-3-small` (1536 dimensions)
  - Cost-effective: $0.02 per 1M tokens
  - Good performance for semantic search
  - Smaller storage footprint

- **Alternative**: OpenAI `text-embedding-3-large` (3072 dimensions)
  - Better accuracy but 2x storage cost
  - Use if precision is critical

### 2.2 Text Preparation

#### Service Text Template:
```
[SERVICE_NAME] - [CATEGORY]
[DESCRIPTION]
Price: [PRICE_INFO or "Free" or "$MIN-$MAX"]
Insurance: [accepts Medicaid/Medicare/Self-pay]
Provider: [PROVIDER_NAME] ([PROVIDER_CATEGORY])
Location: [CITY], [STATE]
```

Example:
```
Dental Cleaning - General
Professional teeth cleaning and oral examination
Price: FREE with insurance or membership
Insurance: Accepts most dental insurance plans
Provider: Rinse Dental (Dentist)
Location: San Francisco, CA
```

#### Provider Text Template:
```
[PROVIDER_NAME] - [CATEGORY]
Services: [TOP_5_SERVICE_NAMES]
Insurance: [MEDICAID], [MEDICARE], [SELF_PAY]
Location: [FULL_ADDRESS]
Specialties: [EXTRACTED_KEYWORDS]
```

### 2.3 Batch Processing Script

```javascript
// Pseudocode for embedding generation
async function generateEmbeddings() {
  const providers = await db.collection('prices-only').find().toArray()
  
  for (const provider of providers) {
    // Generate provider-level embedding
    const providerText = formatProviderText(provider)
    provider.embedding = await openai.createEmbedding(providerText)
    
    // Generate service-level embeddings
    for (const service of provider.services) {
      const serviceText = formatServiceText(service, provider)
      service.embedding = await openai.createEmbedding(serviceText)
    }
    
    // Save updated provider
    await db.collection('prices-only').updateOne(
      { _id: provider._id },
      { $set: provider }
    )
  }
}
```

## 3. MongoDB Vector Search Configuration (Atlas or Cosmos)

### 3.1 Index Definition (Atlas example)
```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      },
      "services": {
        "type": "document",
        "fields": {
          "embedding": {
            "type": "knnVector",
            "dimensions": 1536,
            "similarity": "cosine"
          }
        }
      }
    }
  }
}
```

### 3.2 Search Pipeline (Atlas example)
```javascript
// Vector search aggregation pipeline
[
  {
    $search: {
      "index": "vector_index",
      "knnBeta": {
        "vector": queryEmbedding,
        "path": "services.embedding",
        "k": 100,
        "filter": {
          // Apply filters (location, insurance, etc.)
        }
      }
    }
  },
  {
    $addFields: {
      "score": { "$meta": "searchScore" }
    }
  },
  // Additional stages for filtering, sorting
]
```

## 4. Hybrid Search Strategy

### 4.1 Combine Vector + Traditional Search
```javascript
async function hybridSearch(query, location, filters) {
  // 1. Generate query embedding
  const queryEmbedding = await openai.createEmbedding(query)
  
  // 2. Vector search (semantic)
  const vectorResults = await vectorSearch(queryEmbedding, filters)
  
  // 3. Text search (keyword)
  const textResults = await textSearch(query, filters)
  
  // 4. Combine and re-rank
  const combined = mergeResults(vectorResults, textResults)
  
  // 5. Apply location-based sorting
  return sortByDistanceAndRelevance(combined, location)
}
```

### 4.2 Scoring Formula
```
finalScore = (0.6 * vectorScore) + 
             (0.2 * keywordScore) + 
             (0.1 * distanceScore) + 
             (0.1 * priceScore)
```

## 5. Query Enhancement

### 5.1 Query Expansion
Before embedding, expand queries:
- "cheap dental" → "affordable low-cost budget dental dentist teeth cleaning"
- "mammogram" → "mammogram breast cancer screening women's health mammography"
- "therapy" → "therapy counseling mental health psychologist psychiatrist"

### 5.2 Context Injection
Add context to queries based on state:
```javascript
function enhanceQuery(query, state) {
  let enhanced = query
  
  if (state.free_only) {
    enhanced += " free no-cost charity sliding-scale"
  }
  if (state.accepts_medicaid) {
    enhanced += " medicaid medical"
  }
  if (state.accepts_uninsured) {
    enhanced += " uninsured self-pay cash"
  }
  
  return enhanced
}
```

## 6. Implementation Phases

### Phase 1: Service Embeddings (Week 1)
- Generate embeddings for all services
- Implement basic vector search
- Test with common queries

### Phase 2: Provider Embeddings (Week 2)
- Generate provider-level embeddings
- Implement hybrid search
- Add query enhancement

### Phase 3: Optimization (Week 3)
- Fine-tune scoring weights
- Add caching for common queries
- Implement re-ranking based on user feedback

## 7. Storage & Performance Considerations

### 7.1 Storage Estimates
- Per service: ~6KB (1536 floats × 4 bytes)
- Per provider: ~6KB
- Total for 548 providers × 10 services avg = ~66MB

### 7.2 Performance Optimizations
- **Pre-filter**: Apply insurance/location filters before vector search
- **Cache embeddings**: Cache common query embeddings
- **Batch operations**: Process embeddings in batches of 100
- **Approximate search**: Use ANN (Approximate Nearest Neighbors) for speed

## 8. Testing & Evaluation

### 8.1 Test Queries
```javascript
const testQueries = [
  "free dental cleaning",
  "mammogram near me",
  "affordable mental health",
  "urgent care accepts medicaid",
  "spanish speaking doctor",
  "weekend clinic hours"
]
```

### 8.2 Evaluation Metrics
- **Relevance**: Do results match the query intent?
- **Diversity**: Are different provider types represented?
- **Accuracy**: Are the cheapest/closest options ranked first?
- **Speed**: < 500ms response time

## 9. Future Enhancements

### 9.1 Multi-language Support
- Generate embeddings in multiple languages
- Support Spanish queries natively

### 9.2 Personalization
- Learn from user clicks
- Adjust weights based on user preferences
- Store user embedding preferences

### 9.3 Advanced Features
- Semantic similarity for "find similar providers"
- Clustering for provider recommendations
- Anomaly detection for pricing outliers

## 10. Code Example: Search Implementation

```javascript
// /api/copilot/vector-search/route.ts
export async function vectorSearch(
  query: string,
  location?: { lat: number; lon: number },
  filters?: SearchFilters
) {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query)
  
  // Build aggregation pipeline
  const pipeline = [
    {
      $search: {
        index: "default",
        knnBeta: {
          vector: queryEmbedding,
          path: "services.embedding",
          k: 50,
          filter: buildFilters(filters)
        }
      }
    },
    {
      $addFields: {
        searchScore: { $meta: "searchScore" }
      }
    },
    // Add distance calculation if location provided
    ...(location ? [calculateDistanceStage(location)] : []),
    {
      $sort: {
        searchScore: -1,
        "priceRange.min": 1,
        distance: 1
      }
    },
    { $limit: 12 }
  ]
  
  return await db.collection('prices-only')
    .aggregate(pipeline)
    .toArray()
}
```

## Conclusion

Vector search will significantly improve the AI Copilot's ability to:
1. Understand semantic intent (e.g., "tooth pain" → dental services)
2. Find relevant providers even with misspellings or alternate terms
3. Rank results by semantic relevance, not just keyword matches
4. Provide more accurate responses to complex, multi-faceted queries

The implementation should be done in phases, starting with service-level embeddings for maximum impact on search quality.
