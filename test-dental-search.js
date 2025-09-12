// Test specifically for dental provider search
const { MongoClient } = require('mongodb')

async function testDentalSearch() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const dbName = process.env.MONGODB_DB || 'sie-db'
  
  console.log('Testing Dental Search...')
  console.log('Database:', dbName)
  
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('✓ Connected to MongoDB')
    
    const db = client.db(dbName)
    const collection = db.collection('prices-only')
    
    // Test 1: Count all documents
    const totalCount = await collection.countDocuments()
    console.log(`\n1. Total documents: ${totalCount}`)
    
    // Test 2: Find providers with "Dentist" category
    const dentistCategory = await collection.countDocuments({ category: 'Dentist' })
    console.log(`\n2. Providers with category "Dentist": ${dentistCategory}`)
    
    // Test 3: Find providers with dental-related categories (case-insensitive)
    const dentalCategories = await collection.find({ 
      category: /dent/i 
    }).limit(5).toArray()
    
    console.log(`\n3. Providers with "dent" in category: ${dentalCategories.length}`)
    dentalCategories.forEach(p => {
      console.log(`   - ${p.name} (${p.category})`)
    })
    
    // Test 4: Find services with dental in name
    const dentalServices = await collection.find({
      'services.name': /dent/i
    }).limit(5).toArray()
    
    console.log(`\n4. Providers with dental services: ${dentalServices.length}`)
    dentalServices.forEach(p => {
      const dentalSvc = p.services.filter(s => /dent/i.test(s.name))
      console.log(`   - ${p.name}: ${dentalSvc.map(s => s.name).join(', ')}`)
    })
    
    // Test 5: Combined dental query (similar to copilot search)
    const combinedQuery = {
      $or: [
        { category: /dent/i },
        { 'services.name': /dent/i },
        { 'services.category': /dent/i }
      ]
    }
    
    const combinedCount = await collection.countDocuments(combinedQuery)
    console.log(`\n5. Total providers matching dental (combined): ${combinedCount}`)
    
    // Test 6: Sample dental providers with prices
    const dentalWithPrices = await collection.find(combinedQuery).limit(3).toArray()
    console.log(`\n6. Sample dental providers with prices:`)
    
    dentalWithPrices.forEach(p => {
      console.log(`\n   ${p.name} (${p.category})`)
      console.log(`   Location: ${p.city}, ${p.state}`)
      console.log(`   Services: ${p.services.length}`)
      
      // Show first 3 services with prices
      const firstServices = p.services.slice(0, 3)
      firstServices.forEach(s => {
        let priceStr = 'Price not specified'
        if (s.isFree) {
          priceStr = 'FREE'
        } else if (s.price) {
          if (s.price.flat) {
            priceStr = `$${s.price.flat}`
          } else if (s.price.min && s.price.max) {
            priceStr = `$${s.price.min}-${s.price.max}`
          } else if (s.price.min) {
            priceStr = `from $${s.price.min}`
          }
        }
        console.log(`     - ${s.name}: ${priceStr}`)
      })
    })
    
    // Test 7: Check for low-cost dental (not free only)
    const affordableDental = await collection.find({
      $and: [
        combinedQuery,
        {
          $or: [
            { 'services.isFree': true },
            { 'services.price.min': { $lte: 100 } },
            { 'services.price.flat': { $lte: 100 } }
          ]
        }
      ]
    }).limit(3).toArray()
    
    console.log(`\n7. Dental providers with services under $100 or free: ${affordableDental.length}`)
    affordableDental.forEach(p => {
      const affordableServices = p.services.filter(s => 
        s.isFree || 
        (s.price && (s.price.min <= 100 || s.price.flat <= 100))
      )
      console.log(`   - ${p.name}: ${affordableServices.length} affordable services`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
    console.log('\n✓ Connection closed')
  }
}

testDentalSearch()
