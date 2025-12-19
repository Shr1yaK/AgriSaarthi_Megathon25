import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sourceLanguage, targetLanguage } = body

    // Forward to backend service
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bhashini/mt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage
      })
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend MT error: ${backendResponse.status}`)
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('MT API Error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
