import { NextRequest, NextResponse } from 'next/server'

/**
 * ElevenLabs TTS Streaming Endpoint
 * --------------------------------
 * Provides streaming text-to-speech for voice agent conversations
 * - Supports two distinct voices for caller and receptionist
 * - Optimized for low latency streaming
 * - Proxies ElevenLabs streaming API
 */

// ================== Environment & Config ==================
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

// Voice IDs for the two agents
const VOICE_ID_CALLER = process.env.VOICE_ID_CALLER || 'EXAVITQu4vr4xnSDxMaL' // Jessica
const VOICE_ID_RECEPTIONIST = process.env.VOICE_ID_RECEPTIONIST || 'ThT5KcBeYPX3keUQqHPh' // Sarah

// ElevenLabs configuration for optimal streaming
const TTS_CONFIG = {
  model_id: 'eleven_turbo_v2_5', // Low latency model
  output_format: 'mp3_44100_64', // Optimized for streaming
  voice_settings: {
    stability: 0.3,              // More expressive
    similarity_boost: 0.75,      // Clear voice quality
    style: 0.0,                  // Neutral style
    use_speaker_boost: true      // Enhanced clarity
  }
}

// ================== Types ==================
interface TTSRequest {
  text: string
  speaker: 'caller' | 'receptionist'
  voiceId?: string // Optional override
}

// ================== TTS Streaming Handler ==================
export async function POST(request: NextRequest) {
  try {
    // Check if TTS audio is enabled
    if (process.env.ENABLE_TTS_AUDIO !== 'true') {
      console.log('🔇 TTS audio disabled, returning silence')
      // Return a minimal audio response (short silence)
      const silenceBuffer = new ArrayBuffer(0)
      return new Response(silenceBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': '0'
        }
      })
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ 
        error: 'ElevenLabs API key not configured' 
      }, { status: 500 })
    }

    const body: TTSRequest = await request.json()
    const { text, speaker, voiceId } = body

    // Validate required fields
    if (!text || !speaker) {
      return NextResponse.json({ 
        error: 'Text and speaker are required' 
      }, { status: 400 })
    }

    // Determine voice ID based on speaker
    const selectedVoiceId = voiceId || (speaker === 'caller' ? VOICE_ID_CALLER : VOICE_ID_RECEPTIONIST)

    // Call ElevenLabs streaming API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        ...TTS_CONFIG
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', error)
      return NextResponse.json({ 
        error: 'Failed to generate speech',
        details: error
      }, { status: response.status })
    }

    // Stream the audio response with appropriate headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('TTS streaming error:', error)
    return NextResponse.json({ 
      error: 'Failed to process TTS request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ================== CORS Support ==================
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}