/**
 * Azure OpenAI Connection Test
 * ============================
 * This script tests your Azure OpenAI configuration to ensure
 * the voice agent will be able to generate dynamic responses.
 * 
 * Run with: node test-azure-openai.js
 */

require('dotenv').config({ path: '.env.local' })

async function testAzureOpenAI() {
  console.log('🧪 Testing Azure OpenAI Connection...\n')
  
  // Check environment variables
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const chatModel = process.env.AZURE_OPENAI_CHAT_MODEL || 'gpt-35-turbo'
  
  console.log('📋 Configuration:')
  console.log(`   Endpoint: ${endpoint ? '✅ Set' : '❌ Missing'}`)
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Model: ${chatModel}`)
  console.log()
  
  if (!endpoint || !apiKey) {
    console.error('❌ Missing required environment variables!')
    console.log('Please ensure these are set in your .env.local:')
    console.log('   AZURE_OPENAI_ENDPOINT=your-endpoint')
    console.log('   AZURE_OPENAI_API_KEY=your-api-key')
    console.log('   AZURE_OPENAI_CHAT_MODEL=your-model (optional)')
    return
  }
  
  // Test URL construction
  const url = `${endpoint}/openai/deployments/${chatModel}/chat/completions?api-version=2025-04-01-preview`
  console.log(`🔗 Request URL: ${url}\n`)
  
  // Test messages (simulating voice agent conversation)
  const testMessages = [
    {
      role: 'system',
      content: 'You are an AI healthcare appointment scheduling agent. You are professional and concise.'
    },
    {
      role: 'user', 
      content: 'Generate a greeting to call Mercy Health Clinic to schedule a mammogram appointment for a patient with Medicaid.'
    }
  ]
  
  console.log('📤 Sending test request...')
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: testMessages,
        max_tokens: 100,
        temperature: 0.7
      })
    })
    
    console.log(`📥 Response Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:')
      console.error(errorText)
      return
    }
    
    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('✅ SUCCESS! Azure OpenAI is working correctly.\n')
      console.log('🤖 AI Response:')
      console.log(`"${data.choices[0].message.content.trim()}"\n`)
      
      console.log('📊 Usage Stats:')
      console.log(`   Prompt tokens: ${data.usage?.prompt_tokens || 'N/A'}`)
      console.log(`   Completion tokens: ${data.usage?.completion_tokens || 'N/A'}`)
      console.log(`   Total tokens: ${data.usage?.total_tokens || 'N/A'}`)
      
      console.log('\n🎉 Your voice agent should now generate dynamic AI responses!')
    } else {
      console.error('❌ Unexpected response format:')
      console.error(JSON.stringify(data, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Connection Error:')
    console.error(error.message)
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Troubleshooting tips:')
      console.log('   - Check if your Azure OpenAI endpoint URL is correct')
      console.log('   - Verify your deployment name matches AZURE_OPENAI_CHAT_MODEL')
      console.log('   - Ensure your API key has the correct permissions')
    }
  }
}

// Run the test
testAzureOpenAI().catch(console.error)