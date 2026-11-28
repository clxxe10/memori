import { requireUser } from '@/lib/server/requireUser'

export const maxDuration = 60

const MAX_BASE64_CHARS = 3 * 1024 * 1024 // ~3MB raw base64
const ALLOWED_MEDIA = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response

  try {
    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const body = payload as { image?: unknown; media_type?: unknown }
    const image = typeof body.image === 'string' ? body.image.trim() : ''
    if (!image) {
      return Response.json({ error: 'Image required' }, { status: 400 })
    }

    // Strip accidental data-URL prefix
    const base64 = image.includes(',') ? image.slice(image.indexOf(',') + 1) : image
    if (base64.length > MAX_BASE64_CHARS) {
      return Response.json({ error: 'Image too large' }, { status: 413 })
    }

    const mediaType =
      typeof body.media_type === 'string' && body.media_type
        ? body.media_type
        : 'image/jpeg'
    if (!ALLOWED_MEDIA.has(mediaType)) {
      return Response.json({ error: 'Unsupported image type' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('extract-words: ANTHROPIC_API_KEY missing')
      return Response.json({ error: 'Server error' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `이 이미지에서 영어 단어들을 추출해줘. 
              각 단어에 대해 JSON 배열로 반환해줘.
              형식: [{"word": "단어", "meaning": "한국어뜻", "part_of_speech": "품사", "pronunciation": "발음기호", "example": "예문"}]
              JSON만 반환하고 다른 텍스트는 포함하지 마.`,
            },
          ],
        }],
      }),
    })

    if (!response.ok) {
      console.error('extract-words: Anthropic status', response.status)
      return Response.json({ error: 'AI request failed' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text
    if (typeof text !== 'string') {
      return Response.json({ error: 'AI response invalid' }, { status: 500 })
    }
    const clean = text.replace(/```json|```/g, '').trim()
    const words = JSON.parse(clean)
    return Response.json({ words })
  } catch (e: unknown) {
    console.error('extract-words 오류:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Request failed' }, { status: 500 })
  }
}
