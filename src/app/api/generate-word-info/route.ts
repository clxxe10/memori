export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const { word, meaning } = await request.json()
    if (!word) {
      return Response.json({ error: '단어가 없어요' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'API 키가 설정되지 않았어요' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
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
  "example": "짧고 자연스러운 영어 예문"
}`,
        }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Anthropic API 오류:', response.status, errorData)
      return Response.json({ error: 'AI API 오류: ' + response.status }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'JSON 파싱 실패' }, { status: 500 })
    }
    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    console.error('generate-word-info 오류:', e)
    return Response.json({ error: message }, { status: 500 })
  }
}
