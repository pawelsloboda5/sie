/**
 * Hospital Data API Integration - Example Usage & Tests
 * 
 * This file demonstrates how to use the hospital cost data API
 * and provides manual testing examples.
 */

import { queryHospitalData, formatHospitalSummary, formatHospitalCost } from './hospitalDataApi'

/**
 * Example 1: Basic hospital cost query
 */
async function example1_BasicQuery() {
  console.log('Example 1: Basic hospital cost query\n')
  
  const response = await queryHospitalData(
    'What are the cheapest hospitals for knee replacement in California?',
    5
  )
  
  console.log('Success:', response.success)
  console.log('Count:', response.count)
  console.log('Message:', response.message)
  
  if (response.data.length > 0) {
    console.log('\nFirst result:')
    console.log('Provider:', response.data[0].provider_name)
    console.log('Location:', response.data[0].provider_city, response.data[0].provider_state)
    console.log('Average Charges:', formatHospitalCost(response.data[0].average_covered_charges))
    console.log('Procedure:', response.data[0].drg_description)
  }
  
  console.log('\n---\n')
}

/**
 * Example 2: Format complete response as summary
 */
async function example2_FormattedSummary() {
  console.log('Example 2: Formatted summary for chatbot\n')
  
  const response = await queryHospitalData(
    'Show me hospital costs for heart surgery in Texas',
    3
  )
  
  const summary = formatHospitalSummary(response)
  console.log(summary)
  
  console.log('\n---\n')
}

/**
 * Example 3: Error handling - empty query
 */
async function example3_ErrorHandling() {
  console.log('Example 3: Error handling\n')
  
  const response = await queryHospitalData('', 10)
  
  console.log('Success:', response.success)
  console.log('Error:', response.error)
  console.log('Message:', response.message)
  
  console.log('\n---\n')
}

/**
 * Example 4: State-specific queries
 */
async function example4_StateSpecific() {
  console.log('Example 4: State-specific queries\n')
  
  const states = ['New York', 'Florida', 'California']
  
  for (const state of states) {
    const response = await queryHospitalData(
      `Average cost of hip replacement in ${state}`,
      2
    )
    
    console.log(`${state}:`)
    if (response.data.length > 0) {
      const avg = response.data.reduce((sum, r) => 
        sum + (r.average_total_payments || 0), 0) / response.data.length
      console.log(`  Average payment: ${formatHospitalCost(avg)}`)
    }
  }
  
  console.log('\n---\n')
}

/**
 * Example 5: Testing chatbot integration
 * This simulates how the copilot will use the API
 */
async function example5_ChatbotSimulation() {
  console.log('Example 5: Chatbot integration simulation\n')
  
  const userQueries = [
    'What hospitals in Virginia have the best safety ratings?',
    'Compare hip replacement costs between Texas and Florida',
    'Find affordable providers for diabetes care in New York'
  ]
  
  for (const query of userQueries) {
    console.log(`User: "${query}"`)
    const response = await queryHospitalData(query, 5)
    
    if (response.success && response.data.length > 0) {
      console.log(`Assistant: Found ${response.count} results`)
      console.log(`Top result: ${response.data[0].provider_name}`)
    } else {
      console.log(`Assistant: ${response.message}`)
    }
    console.log()
  }
  
  console.log('\n---\n')
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('='.repeat(60))
  console.log('Hospital Data API - Integration Examples')
  console.log('='.repeat(60))
  console.log()
  
  try {
    await example1_BasicQuery()
    await example2_FormattedSummary()
    await example3_ErrorHandling()
    await example4_StateSpecific()
    await example5_ChatbotSimulation()
    
    console.log('All examples completed successfully!')
  } catch (error) {
    console.error('Error running examples:', error)
  }
}

/**
 * Manual test checklist:
 * 
 * 1. Network connectivity:
 *    - Test with valid API endpoint
 *    - Test with timeout (slow network)
 *    - Test with unreachable endpoint
 * 
 * 2. Data validation:
 *    - Test with queries returning many results
 *    - Test with queries returning no results
 *    - Test with malformed queries
 * 
 * 3. Edge cases:
 *    - Empty string query
 *    - Very long query (>1000 chars)
 *    - Special characters in query
 *    - Limit = 0, 1, 100, 1000
 * 
 * 4. Response handling:
 *    - Verify all fields are properly typed
 *    - Test formatHospitalCost with various inputs
 *    - Test formatHospitalSummary with 0, 1, 10+ results
 * 
 * 5. Integration with copilot:
 *    - Test hospital query detection in router
 *    - Test streaming vs non-streaming paths
 *    - Verify proper error messages displayed to user
 *    - Check conversation state is preserved
 */

// Uncomment to run examples:
// runAllExamples()

export {
  example1_BasicQuery,
  example2_FormattedSummary,
  example3_ErrorHandling,
  example4_StateSpecific,
  example5_ChatbotSimulation,
  runAllExamples
}

