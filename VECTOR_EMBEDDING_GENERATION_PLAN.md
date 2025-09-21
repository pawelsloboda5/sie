# Vector Embedding Generation Plan

## Overview
This document provides the implementation plan for generating OpenAI embeddings for the `prices-only` MongoDB collection (548 providers). These embeddings are used by server-side vector search (Cosmos `cosmosSearch`) when enabled, with client-side reranking as a fallback.

## 1. Embedding Strategy

### 1.1 What We're Embedding

#### Provider-Level Embeddings
```javascript
// Each provider gets ONE embedding combining:
{
  text: "[NAME] [CATEGORY] in [CITY], [STATE]. Services: [TOP_5_SERVICES]. Accepts [INSURANCE_TYPES]"
  embedding: [1536-dimensional vector]
}
```

#### Service-Level Embeddings
```javascript
// Each service gets its own embedding:
{
  text: "[SERVICE_NAME] - [DESCRIPTION]. Price: [PRICE_INFO]. Provider: [PROVIDER_NAME] in [CITY]"
  embedding: [1536-dimensional vector]
}
```

### 1.2 Text Templates

#### Provider Text Template
```
{provider.name} - {provider.category}
Location: {city}, {state}
Services offered: {top 5 service names}
Insurance: {medicaid ? "Accepts Medicaid" : ""} {medicare ? "Accepts Medicare" : ""} {selfPay ? "Self-pay available" : ""}
Specialties: {extracted keywords from services}
```

#### Service Text Template
```
Service: {service.name}
Category: {service.category}
Description: {service.description || "Healthcare service"}
Price: {isFree ? "FREE" : price.flat || `$${price.min}-${price.max}` || "Contact for pricing"}
Provider: {provider.name} ({provider.category})
Location: {provider.city}, {provider.state}
Insurance accepted: {insurance summary}
```

## 2. Implementation Script

### 2.1 Dependencies
```json
{
  "dependencies": {
    "mongodb": "^6.3.0",
    "openai": "^4.24.0",
    "dotenv": "^16.3.1",
    "p-limit": "^3.1.0"
  }
}
```

### 2.2 Environment Variables
```bash
# .env file
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sie-db
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
COPILOT_SERVICE_COLLECTION=prices-only-services
BATCH_SIZE=10
RATE_LIMIT_DELAY=1000
```

### 2.3 Main Script Structure
```javascript
// generate-embeddings.js
const { MongoClient } = require('mongodb');
const { OpenAI } = require('openai');
const pLimit = require('p-limit');

class EmbeddingGenerator {
  constructor(config) {
    this.openai = new OpenAI({ apiKey: config.openaiKey });
    this.model = config.model || 'text-embedding-3-small';
    this.batchSize = config.batchSize || 10;
    this.limit = pLimit(3); // Max 3 concurrent API calls
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: "float"
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error(`Embedding error: ${error.message}`);
      return null;
    }
  }

  formatProviderText(provider) {
    // Implementation here
  }

  formatServiceText(service, provider) {
    // Implementation here
  }
}
```

## 3. Processing Flow

### 3.1 Main Processing Loop
```javascript
async function processProviders() {
  const stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    servicesProcessed: 0
  };

  // Get all providers
  const providers = await collection.find({}).toArray();
  stats.total = providers.length;

  for (const provider of providers) {
    try {
      // Skip if already has embeddings
      if (provider.embedding && provider.embeddingModel === EMBEDDING_MODEL) {
        stats.skipped++;
        continue;
      }

      // Generate provider embedding
      const providerEmbedding = await generator.generateEmbedding(
        generator.formatProviderText(provider)
      );

      // Generate service embeddings
      const updatedServices = await Promise.all(
        provider.services.map(async (service) => ({
          ...service,
          embedding: await generator.generateEmbedding(
            generator.formatServiceText(service, provider)
          )
        }))
      );

      // Update in database
      await collection.updateOne(
        { _id: provider._id },
        {
          $set: {
            embedding: providerEmbedding,
            services: updatedServices,
            embeddingModel: EMBEDDING_MODEL,
            embeddingGeneratedAt: new Date()
          }
        }
      );

      stats.processed++;
      stats.servicesProcessed += updatedServices.length;
      
      // Progress logging
      console.log(`✓ ${provider.name} - ${updatedServices.length} services`);
      
    } catch (error) {
      console.error(`✗ Failed: ${provider.name} - ${error.message}`);
      stats.errors++;
    }
    
    // Rate limiting
    await sleep(RATE_LIMIT_DELAY);
  }

  return stats;
}
```

## 4. Safety Features

### 4.1 Resume Capability
```javascript
// Check for existing embeddings before generating
if (provider.embedding && provider.embeddingModel === currentModel) {
  console.log(`Skipping ${provider.name} - already processed`);
  continue;
}
```

### 4.2 Validation
```javascript
function validateEmbedding(embedding) {
  return Array.isArray(embedding) && 
         embedding.length === 1536 && 
         embedding.every(x => typeof x === 'number');
}
```

### 4.3 Error Recovery
```javascript
// Retry logic for API failures
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

## 5. Cost Estimates

### 5.1 Token Counts
- Provider text: ~100 tokens average
- Service text: ~80 tokens average
- Total providers: 548
- Average services per provider: 10

### 5.2 API Calls & Costs
- Provider embeddings: 548 calls
- Service embeddings: ~5,480 calls
- Total embeddings: ~6,028
- Estimated tokens: ~500,000
- **Estimated cost: $0.01** (at $0.020 per 1M tokens)

## 6. Execution Commands

### 6.1 First Run
```bash
# Full generation
node generate-embeddings.js --collection prices-only --model text-embedding-3-small
```

### 6.2 Resume/Retry
```bash
# Resume from interruption
node generate-embeddings.js --collection prices-only --resume
```

### 6.3 Validation
```bash
# Validate all embeddings
node generate-embeddings.js --validate-only
```

## 7. Progress Tracking

### 7.1 Console Output
```
Starting embedding generation...
Model: text-embedding-3-small
Collection: prices-only
Total providers: 548

[1/548] ✓ Rinse Dental - 12 services (1.2s)
[2/548] ✓ Crown Dental Care - 8 services (0.9s)
[3/548] ✓ A Gentle Touch - 15 services (1.5s)
...
[548/548] ✓ Complete!

Summary:
- Processed: 545
- Skipped: 3 (already had embeddings)
- Errors: 0
- Total services: 5,480
- Time: 18 minutes
- Estimated cost: $0.01
```

## 8. Verification Script

```javascript
// verify-embeddings.js
async function verifyEmbeddings() {
  const collection = db.collection('prices-only');
  
  const stats = {
    totalProviders: 0,
    withEmbeddings: 0,
    withoutEmbeddings: 0,
    invalidEmbeddings: 0,
    servicesWithEmbeddings: 0,
    servicesWithoutEmbeddings: 0
  };

  const providers = await collection.find({}).toArray();
  
  for (const provider of providers) {
    stats.totalProviders++;
    
    if (provider.embedding) {
      stats.withEmbeddings++;
      if (!validateEmbedding(provider.embedding)) {
        stats.invalidEmbeddings++;
      }
    } else {
      stats.withoutEmbeddings++;
    }
    
    for (const service of provider.services) {
      if (service.embedding) {
        stats.servicesWithEmbeddings++;
      } else {
        stats.servicesWithoutEmbeddings++;
      }
    }
  }
  
  return stats;
}
```

## 9. Rollback Plan

```javascript
// Before starting, create backup
async function backupCollection() {
  const backup = db.collection('prices-only-backup-' + Date.now());
  const documents = await db.collection('prices-only').find({}).toArray();
  await backup.insertMany(documents);
  console.log(`Backup created: ${backup.collectionName}`);
}

// To remove embeddings if needed
async function removeEmbeddings() {
  await collection.updateMany(
    {},
    {
      $unset: {
        embedding: "",
        embeddingModel: "",
        embeddingGeneratedAt: ""
      }
    }
  );
  
  // Remove from services
  const providers = await collection.find({}).toArray();
  for (const provider of providers) {
    const cleanServices = provider.services.map(s => {
      delete s.embedding;
      return s;
    });
    await collection.updateOne(
      { _id: provider._id },
      { $set: { services: cleanServices } }
    );
  }
}
```

## 10. Next Steps

After embeddings are generated:
1. Create MongoDB Atlas vector search indexes
2. Implement vector search API endpoint
3. Update copilot search to use vector similarity
4. Test with various queries
5. Monitor performance and adjust
