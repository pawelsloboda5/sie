import { NextRequest, NextResponse } from 'next/server'

interface ProviderApplicationData {
  fullName: string
  email: string
  phone: string
  profession: string
  otherProfession: string
  location: string
  additionalInfo: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ProviderApplicationData = await request.json()
    
    // Validate required fields
    if (!data.fullName || !data.email || !data.phone || !data.profession || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare data for Google Sheets
    const sheetData = [
      new Date().toISOString(), // Timestamp
      data.fullName,
      data.email,
      data.phone,
      data.profession === 'Other' ? data.otherProfession : data.profession,
      data.location,
      data.additionalInfo || ''
    ]

    // Google Sheets API endpoint
    // You'll need to set up a Google Apps Script web app that accepts POST requests
    // and writes to your sheet. Here's the flow:
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL

    if (!GOOGLE_SCRIPT_URL) {
      console.error('Google Script URL not configured')
      return NextResponse.json(
        { error: 'Google Sheets integration not configured' },
        { status: 500 }
      )
    }

    // Send data to Google Sheets via Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: sheetData
      })
    })

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      id: result.id || 'unknown'
    })

  } catch (error) {
    console.error('Provider application submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}