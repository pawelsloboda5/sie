import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import type { Service as ServiceType } from '@/lib/types/copilot'

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'sie-db'

export async function GET() {
  let client: MongoClient | null = null
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    // Check prices-only collection
    const hasPricesOnly = collectionNames.includes('prices-only')
    
    let pricesOnlyInfo = null
    let sampleProviders = []
    let dentalProviders = []
    
    if (hasPricesOnly) {
      const collection = db.collection('prices-only')
      
      // Get collection stats
      const count = await collection.countDocuments()
      
      // Get sample documents
      const samples = await collection.find({}).limit(3).toArray()
      sampleProviders = samples.map(p => ({
        name: p.name,
        category: p.category,
        city: p.city,
        state: p.state,
        servicesCount: p.services?.length || 0
      }))
      
      // Find dental providers
      const dentalQuery = {
        $or: [
          { category: /dent/i },
          { 'services.name': /dent/i }
        ]
      }
      const dentalCount = await collection.countDocuments(dentalQuery)
      const dentalSamples = await collection.find(dentalQuery).limit(3).toArray()
      dentalProviders = dentalSamples.map(p => ({
        name: p.name,
        category: p.category,
        city: p.city,
        state: p.state,
        servicesCount: p.services?.length || 0,
        hasFreeServices: p.services?.some((s: ServiceType) => s.isFree) || false
      }))
      
      pricesOnlyInfo = {
        documentCount: count,
        dentalCount,
        sampleProviders,
        dentalProviders
      }
    }
    
    // Return diagnostic info
    return NextResponse.json({
      success: true,
      database: {
        uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
        dbName: MONGODB_DB,
        connected: true
      },
      collections: {
        available: collectionNames,
        hasPricesOnly,
        count: collectionNames.length
      },
      pricesOnlyCollection: pricesOnlyInfo,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        dbName: MONGODB_DB,
        connected: false
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
    
  } finally {
    if (client) {
      await client.close()
    }
  }
}
