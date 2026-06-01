export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { image } = await request.json()
    if (!image) {
      return Response.json({ error: '이미지가 없어요' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image,
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
      const errorData = await response.text()
      console.error('Anthropic API 오류:', response.status, errorData)
      return Response.json({ error: 'AI API 오류: ' + response.status }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    const words = JSON.parse(clean)
    return Response.json({ words })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    console.error('extract-words 오류:', e)
    return Response.json({ error: message }, { status: 500 })
  }
}
