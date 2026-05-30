console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '있음' : '없음')

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { word, meaning } = await req.json()
    if (!word) return NextResponse.json({ error: 'word required' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `단어 "${word}"${meaning ? ` (뜻: ${meaning})` : ''}에 대해 아래 JSON 형식으로만 응답해줘. 마크다운 없이 순수 JSON만.
{
  "part_of_speech": "품사 한국어로 (예: 명사, 동사, 형용사, 부사)",
  "pronunciation": "IPA 발음기호 (예: /æmˈbɪɡjuəs/)",
  "example": "짧고 자연스러운 영어 예문"
}`,
        }]
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return NextResponse.json({ error: 'API call failed' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')
    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (e) {
    console.error('generate-word-info error:', e)
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
