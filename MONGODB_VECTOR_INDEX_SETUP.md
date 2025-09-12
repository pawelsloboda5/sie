# MongoDB Atlas Vector Search Index Setup

## Overview
This document provides step-by-step instructions for creating vector search indexes in MongoDB Atlas for the `prices-only` collection.

## 1. Prerequisites

### 1.1 Requirements
- MongoDB Atlas M10+ cluster (vector search not available on free tier)
- Collection: `sie-db.prices-only` 
- Embeddings already generated in documents
- Atlas admin or project owner access

### 1.2 Verify Embeddings Exist
```javascript
// Run in MongoDB Compass or Shell
db.getSiblingDB('sie-db').getCollection('prices-only').findOne(
  { embedding: { $exists: true } },
  { name: 1, embedding: { $slice: 5 } }
)
```

## 2. Atlas UI Index Creation

### 2.1 Navigate to Search
1. Log into MongoDB Atlas
2. Select your cluster
3. Click "Atlas Search" in left sidebar
4. Click "Create Search Index"
5. Choose "JSON Editor" (not Visual Editor)

### 2.2 Provider-Level Vector Index
```json
{
  "name": "provider_vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "insurance.medicaid"
      },
      {
        "type": "filter",
        "path": "insurance.medicare"
      },
      {
        "type": "filter",
        "path": "insurance.selfPayOptions"
      },
      {
        "type": "filter",
        "path": "state"
      },
      {
        "type": "filter",
        "path": "city"
      },
      {
        "type": "filter",
        "path": "category"
      }
    ]
  }
}
```

### 2.3 Service-Level Vector Index
```json
{
  "name": "service_vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "services.embedding",
        "numDimensions": 1536,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "services.isFree"
      },
      {
        "type": "filter",
        "path": "services.category"
      },
      {
        "type": "filter",
        "path": "insurance.medicaid"
      },
      {
        "type": "filter",
        "path": "insurance.selfPayOptions"
      },
      {
        "type": "filter",
        "path": "state"
      }
    ]
  }
}
```

### 2.4 Hybrid Search Index (Text + Vector)
```json
{
  "name": "hybrid_search_index",
  "type": "search",
  "definition": {
    "mappings": {
      "dynamic": false,
      "fields": {
        "name": {
          "type": "string",
          "analyzer": "lucene.standard"
        },
        "category": {
          "type": "string",
          "analyzer": "lucene.standard"
        },
        "services": {
          "type": "document",
          "fields": {
            "name": {
              "type": "string",
              "analyzer": "lucene.standard"
            },
            "description": {
              "type": "string",
              "analyzer": "lucene.standard"
            }
          }
        },
        "embedding": {
          "type": "knnVector",
          "dimensions": 1536,
          "similarity": "cosine"
        },
        "location": {
          "type": "geo"
        }
      }
    }
  }
}
```

## 3. Programmatic Index Creation

### 3.1 Using MongoDB Driver
```javascript
// create-indexes.js
const { MongoClient } = require('mongodb');

async function createVectorIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  const db = client.db('sie-db');
  const collection = db.collection('prices-only');
  
  // Check if indexes exist
  const indexes = await collection.listSearchIndexes().toArray();
  console.log('Existing indexes:', indexes.map(i => i.name));
  
  // Create provider vector index
  if (!indexes.find(i => i.name === 'provider_vector_index')) {
    await collection.createSearchIndex({
      name: 'provider_vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [{
          type: 'vector',
          path: 'embedding',
          numDimensions: 1536,
          similarity: 'cosine'
        }]
      }
    });
    console.log('✓ Created provider_vector_index');
  }
  
  // Create service vector index
  if (!indexes.find(i => i.name === 'service_vector_index')) {
    await collection.createSearchIndex({
      name: 'service_vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [{
          type: 'vector',
          path: 'services.embedding',
          numDimensions: 1536,
          similarity: 'cosine'
        }]
      }
    });
    console.log('✓ Created service_vector_index');
  }
  
  await client.close();
}
```

## 4. Vector Search Queries

### 4.1 Basic Provider Search
```javascript
async function searchProviders(queryEmbedding, limit = 10) {
  const pipeline = [
    {
      $vectorSearch: {
        index: "provider_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: limit * 10,
        limit: limit
      }
    },
    {
      $project: {
        name: 1,
        category: 1,
        city: 1,
        state: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ];
  
  return await collection.aggregate(pipeline).toArray();
}
```

### 4.2 Service-Level Search with Filters
```javascript
async function searchServices(queryEmbedding, filters = {}) {
  const pipeline = [
    {
      $vectorSearch: {
        index: "service_vector_index",
        path: "services.embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 50,
        filter: {
          $and: [
            filters.state ? { state: filters.state } : {},
            filters.freeOnly ? { "services.isFree": true } : {},
            filters.medicaid ? { "insurance.medicaid": true } : {}
          ].filter(f => Object.keys(f).length > 0)
        }
      }
    },
    {
      $unwind: "$services"
    },
    {
      $match: {
        "services.embedding": { $exists: true }
      }
    },
    {
      $project: {
        providerId: "$_id",
        providerName: "$name",
        serviceName: "$services.name",
        servicePrice: "$services.price",
        isFree: "$services.isFree",
        score: { $meta: "vectorSearchScore" }
      }
    }
  ];
  
  return await collection.aggregate(pipeline).toArray();
}
```

### 4.3 Hybrid Search (Text + Vector)
```javascript
async function hybridSearch(query, queryEmbedding, location) {
  const pipeline = [
    {
      $search: {
        index: "hybrid_search_index",
        compound: {
          should: [
            // Text search
            {
              text: {
                query: query,
                path: ["name", "category", "services.name"],
                score: { boost: { value: 2 } }
              }
            },
            // Vector search
            {
              knnBeta: {
                vector: queryEmbedding,
                path: "embedding",
                k: 50,
                score: { boost: { value: 3 } }
              }
            }
          ]
        }
      }
    },
    // Add distance calculation if location provided
    ...(location ? [{
      $addFields: {
        distance: {
          $sqrt: {
            $add: [
              { $pow: [{ $subtract: [{ $arrayElemAt: ["$location.coordinates", 0] }, location.longitude] }, 2] },
              { $pow: [{ $subtract: [{ $arrayElemAt: ["$location.coordinates", 1] }, location.latitude] }, 2] }
            ]
          }
        }
      }
    }] : []),
    {
      $sort: {
        score: -1,
        distance: 1
      }
    },
    { $limit: 12 }
  ];
  
  return await collection.aggregate(pipeline).toArray();
}
```

## 5. Index Management

### 5.1 Monitor Index Status
```javascript
// Check index building status
async function checkIndexStatus() {
  const indexes = await collection.listSearchIndexes().toArray();
  
  for (const index of indexes) {
    console.log(`Index: ${index.name}`);
    console.log(`  Status: ${index.status}`);
    console.log(`  Queryable: ${index.queryable}`);
    console.log(`  Latest Definition:`, JSON.stringify(index.latestDefinition, null, 2));
  }
}
```

### 5.2 Update Index Definition
```javascript
async function updateIndex(indexName, newDefinition) {
  await collection.updateSearchIndex(indexName, newDefinition);
  console.log(`Updated ${indexName}`);
  
  // Wait for index to rebuild
  let status = 'BUILDING';
  while (status === 'BUILDING') {
    await new Promise(resolve => setTimeout(resolve, 5000));
    const indexes = await collection.listSearchIndexes({ name: indexName }).toArray();
    status = indexes[0]?.status;
    console.log(`  Status: ${status}`);
  }
}
```

### 5.3 Delete Index
```javascript
async function deleteIndex(indexName) {
  await collection.dropSearchIndex(indexName);
  console.log(`Deleted ${indexName}`);
}
```

## 6. Performance Optimization

### 6.1 Index Size Estimates
- Provider embeddings: 548 docs × 1536 floats × 4 bytes = 3.4 MB
- Service embeddings: ~5,480 docs × 1536 floats × 4 bytes = 33.6 MB
- Total index size: ~40-50 MB (with overhead)

### 6.2 Query Performance Tips
1. **Use Pre-filters**: Apply filters before vector search
2. **Limit Candidates**: Set appropriate `numCandidates` (10x limit)
3. **Project Early**: Only return needed fields
4. **Cache Common Queries**: Store embeddings for frequent searches

### 6.3 Monitoring Queries
```javascript
// Log slow queries
db.setProfilingLevel(1, { slowms: 100 });

// View slow query log
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty();
```

## 7. Testing Vector Search

### 7.1 Test Script
```javascript
// test-vector-search.js
const { OpenAI } = require('openai');

async function testVectorSearch() {
  const testQueries = [
    "affordable dental cleaning",
    "free mammogram screening",
    "mental health therapy medicaid",
    "urgent care near me"
  ];
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`);
    
    // Generate embedding for query
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });
    const queryEmbedding = response.data[0].embedding;
    
    // Search
    const results = await searchProviders(queryEmbedding, 5);
    
    console.log('Results:');
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.category}) - Score: ${r.score.toFixed(4)}`);
    });
  }
}
```

## 8. Troubleshooting

### 8.1 Common Issues

#### Index Not Building
```javascript
// Check cluster tier
// Vector search requires M10+ tier
```

#### Poor Search Results
```javascript
// Verify embeddings exist and are valid
const sample = await collection.findOne({ embedding: { $exists: true } });
console.log('Embedding dimensions:', sample.embedding.length);
console.log('All numbers?:', sample.embedding.every(x => typeof x === 'number'));
```

#### Slow Queries
```javascript
// Check index usage
const explain = await collection.aggregate(pipeline).explain('executionStats');
console.log(explain.stages);
```

## 9. Backup & Recovery

### 9.1 Export Index Definitions
```javascript
async function exportIndexes() {
  const indexes = await collection.listSearchIndexes().toArray();
  require('fs').writeFileSync(
    'search-indexes-backup.json',
    JSON.stringify(indexes, null, 2)
  );
  console.log('Indexes exported to search-indexes-backup.json');
}
```

### 9.2 Restore Indexes
```javascript
async function restoreIndexes() {
  const indexes = JSON.parse(
    require('fs').readFileSync('search-indexes-backup.json')
  );
  
  for (const index of indexes) {
    await collection.createSearchIndex({
      name: index.name,
      type: index.type,
      definition: index.latestDefinition
    });
    console.log(`Restored ${index.name}`);
  }
}
```

## 10. Next Steps

1. **Create Indexes**: Use Atlas UI or programmatic approach
2. **Verify Indexes**: Ensure status is "READY"
3. **Test Queries**: Run test searches to validate
4. **Integrate API**: Update `/api/copilot/search` to use vector search
5. **Monitor Performance**: Track query times and accuracy
6. **Iterate**: Adjust similarity thresholds and filters based on results
