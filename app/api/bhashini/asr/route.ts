import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audio, sourceLanguage, targetLanguage } = body

    // Forward to backend service
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bhashini/asr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio,
        sourceLanguage,
        targetLanguage
      })
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend ASR error: ${backendResponse.status}`)
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('ASR API Error:', error)
    return NextResponse.json(
      { error: 'ASR processing failed' },
      { status: 500 }
    )
  }
}
