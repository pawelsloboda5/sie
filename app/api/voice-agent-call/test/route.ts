import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint for voice agent call functionality
 * GET /api/voice-agent-call/test
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing voice agent call setup...')

    // Check environment variables
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const chatModel = process.env.AZURE_OPENAI_CHAT_MODEL || 'gpt-35-turbo'

    const results = {
      environment: {
        endpoint: endpoint ? 'Set' : 'Missing',
        apiKey: apiKey ? 'Set' : 'Missing',
        chatModel: chatModel
      },
      status: 'ready',
      message: 'Voice agent call system is ready to test'
    }

    if (!endpoint || !apiKey) {
      results.status = 'not_ready'
      results.message = 'Missing Azure OpenAI credentials'
    }

    console.log('✅ Test completed:', results)

    return NextResponse.json(results)
  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}