import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, sourceLanguage, targetLanguage } = body

    // Forward to backend service
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bhashini/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        sourceLanguage,
        targetLanguage
      })
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend OCR error: ${backendResponse.status}`)
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('OCR API Error:', error)
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    )
  }
}
