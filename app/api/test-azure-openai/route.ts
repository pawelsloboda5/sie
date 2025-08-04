import { NextRequest, NextResponse } from 'next/server'

/**
 * Azure OpenAI Connection Test API Route
 * ======================================
 * Test your Azure OpenAI setup by visiting:
 * http://localhost:3000/api/test-azure-openai
 * 
 * This will verify the same configuration used by the voice agent.
 */

export async function GET(request: NextRequest) {
  const results: string[] = []
  
  const log = (message: string) => {
    console.log(message)
    results.push(message)
  }
  
  try {
    log('🧪 Testing Azure OpenAI Connection...')
    
    // Check environment variables
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const chatModel = process.env.AZURE_OPENAI_CHAT_MODEL || 'gpt-35-turbo'
    
    log('\n📋 Configuration:')
    log(`   Endpoint: ${endpoint ? '✅ Set' : '❌ Missing'}`)
    log(`   API Key: ${apiKey ? '✅ Set (hidden)' : '❌ Missing'}`)
    log(`   Model: ${chatModel}`)
    
    if (!endpoint || !apiKey) {
      log('\n❌ Missing required environment variables!')
      return NextResponse.json({
        success: false,
        error: 'Missing Azure OpenAI credentials',
        logs: results,
        required: [
          'AZURE_OPENAI_ENDPOINT',
          'AZURE_OPENAI_API_KEY', 
          'AZURE_OPENAI_CHAT_MODEL (optional)'
        ]
      }, { status: 400 })
    }
    
    // Test URL construction (same as voice agent)
    const url = `${endpoint}/openai/deployments/${chatModel}/chat/completions?api-version=2025-04-01-preview`
    log(`\n🔗 Request URL: ${url}`)
    
    // Test messages (simulating voice agent conversation)
    const testMessages = [
      {
        role: 'system',
        content: 'You are an AI healthcare appointment scheduling agent calling a medical provider. You are professional, concise, and focused on scheduling appointments.'
      },
      {
        role: 'user', 
        content: 'Generate a professional greeting to call Mercy Health Clinic to schedule a mammogram appointment for a patient with Medicaid insurance. Keep it under 50 words.'
      }
    ]
    
    log('\n📤 Sending test request...')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: testMessages,
        max_completion_tokens: 100
      })
    })
    
    log(`📥 Response Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      log(`❌ API Error: ${errorText}`)
      
      return NextResponse.json({
        success: false,
        error: 'Azure OpenAI API request failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        logs: results
      }, { status: 500 })
    }
    
    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      log('\n✅ SUCCESS! Azure OpenAI is working correctly.')
      log('\n🤖 AI Generated Response:')
      const aiResponse = data.choices[0].message.content.trim()
      log(`"${aiResponse}"`)
      
      log('\n📊 Usage Stats:')
      log(`   Prompt tokens: ${data.usage?.prompt_tokens || 'N/A'}`)
      log(`   Completion tokens: ${data.usage?.completion_tokens || 'N/A'}`)
      log(`   Total tokens: ${data.usage?.total_tokens || 'N/A'}`)
      
      log('\n🎉 Your voice agent should now generate dynamic AI responses!')
      
      return NextResponse.json({
        success: true,
        message: 'Azure OpenAI connection successful!',
        aiResponse,
        usage: data.usage,
        logs: results,
        config: {
          endpoint: endpoint.replace(/\/+$/, ''), // Remove trailing slashes for display
          model: chatModel,
          apiVersion: '2025-04-01-preview'
        }
      })
      
    } else {
      log('❌ Unexpected response format')
      log(JSON.stringify(data, null, 2))
      
      return NextResponse.json({
        success: false,
        error: 'Unexpected response format from Azure OpenAI',
        response: data,
        logs: results
      }, { status: 500 })
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    log(`❌ Connection Error: ${errorMessage}`)
    
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      log('\n💡 Troubleshooting tips:')
      log('   - Check if your Azure OpenAI endpoint URL is correct')
      log('   - Verify your deployment name matches AZURE_OPENAI_CHAT_MODEL')
      log('   - Ensure your API key has the correct permissions')
      log('   - Check if there are any network/firewall issues')
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      logs: results,
      troubleshooting: [
        'Verify AZURE_OPENAI_ENDPOINT is correct',
        'Check AZURE_OPENAI_CHAT_MODEL matches your deployment name',
        'Ensure API key has proper permissions',
        'Check network connectivity to Azure'
      ]
    }, { status: 500 })
  }
}