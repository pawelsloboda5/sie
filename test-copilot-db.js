// Test script to verify MongoDB connection and data
const { MongoClient } = require('mongodb')

async function testDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const dbName = process.env.MONGODB_DB || 'sie-db'
  
  console.log('Connecting to MongoDB...')
  console.log('URI:', uri)
  console.log('Database:', dbName)
  
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('✓ Connected successfully')
    
    const db = client.db(dbName)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('\nAvailable collections:')
    collections.forEach(col => {
      console.log(`  - ${col.name}`)
    })
    
    // Check prices-only collection
    const collection = db.collection('prices-only')
    const count = await collection.countDocuments()
    console.log(`\nDocuments in prices-only: ${count}`)
    
    // Find dental providers
    const dentalQuery = {
      $or: [
        { category: /dent/i },
        { 'services.name': /dent/i },
        { 'services.category': /dent/i }
      ]
    }
    
    const dentalProviders = await collection.find(dentalQuery).limit(5).toArray()
    console.log(`\nFound ${dentalProviders.length} dental providers:`)
    
    dentalProviders.forEach(p => {
      console.log(`\n  ${p.name} (${p.category})`)
      console.log(`    Location: ${p.city}, ${p.state}`)
      console.log(`    Services: ${p.services?.length || 0}`)
      
      // Show first few services with prices
      if (p.services?.length > 0) {
        const firstServices = p.services.slice(0, 3)
        firstServices.forEach(s => {
          let price = 'Price not specified'
          if (s.isFree) {
            price = 'FREE'
          } else if (s.price?.flat) {
            price = `$${s.price.flat}`
          } else if (s.price?.min && s.price?.max) {
            price = `$${s.price.min}-${s.price.max}`
          }
          console.log(`      - ${s.name}: ${price}`)
        })
      }
    })
    
    // Check for any free dental services
    const freeDentalQuery = {
      $and: [
        { $or: [
          { category: /dent/i },
          { 'services.name': /dent/i }
        ]},
        { 'services.isFree': true }
      ]
    }
    
    const freeDentalCount = await collection.countDocuments(freeDentalQuery)
    console.log(`\nProviders with free dental services: ${freeDentalCount}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
    console.log('\n✓ Connection closed')
  }
}

testDatabase()
