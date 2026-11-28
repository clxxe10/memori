import { requireUser } from '@/lib/server/requireUser'

export const maxDuration = 30

const MAX_WORD = 100
const MAX_MEANING = 200

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

    const body = payload as { word?: unknown; meaning?: unknown }
    const word = typeof body.word === 'string' ? body.word.trim() : ''
    if (!word) {
      return Response.json({ error: 'Word required' }, { status: 400 })
    }
    if (word.length > MAX_WORD) {
      return Response.json({ error: 'Word too long' }, { status: 400 })
    }

    let meaning: string | undefined
    if (body.meaning !== undefined && body.meaning !== null) {
      if (typeof body.meaning !== 'string') {
        return Response.json({ error: 'Invalid meaning' }, { status: 400 })
      }
      const trimmed = body.meaning.trim()
      // empty meaning is treated as omitted (client often sends "")
      if (trimmed) {
        if (trimmed.length > MAX_MEANING) {
          return Response.json({ error: 'Meaning too long' }, { status: 400 })
        }
        meaning = trimmed
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('generate-word-info: ANTHROPIC_API_KEY missing')
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
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `단어 "${word}"${meaning ? ` (뜻: ${meaning})` : ''}에 대해 아래 JSON 형식으로만 응답해줘. 마크다운 없이 순수 JSON만.
{
  "part_of_speech": "품사 한국어로 (예: 명사, 동사, 형용사, 부사)",
  "pronunciation": "IPA 발음기호 (예: /æmˈbɪɡjuəs/)",
  "example": "짧고 자연스러운 영어 예문",
  "meaning": "한국어 뜻 (간결하게 1-2가지)"
}`,
        }],
      }),
    })

    if (!response.ok) {
      console.error('generate-word-info: Anthropic status', response.status)
      return Response.json({ error: 'AI request failed' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'AI response invalid' }, { status: 500 })
    }
    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (e: unknown) {
    console.error('generate-word-info 오류:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Request failed' }, { status: 500 })
  }
}
