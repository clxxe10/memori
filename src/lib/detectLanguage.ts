export function detectLanguage(word: string): string {
  if (!word || word.trim().length === 0) return '영어'
  const text = word.trim()

  // 한글
  if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text)) return '한국어'
  // 일본어 (히라가나/가타카나)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return '일본어'
  // 한자 (중국어/일본어 한자)
  if (/[\u4E00-\u9FFF]/.test(text)) return '중국어'
  // 키릴문자 (러시아어)
  if (/[\u0400-\u04FF]/.test(text)) return '러시아어'
  // 아랍문자
  if (/[\u0600-\u06FF]/.test(text)) return '아랍어'
  // 기본 라틴 → 영어
  return '영어'
}

export function languageToTTSCode(language: string): string {
  const map: Record<string, string> = {
    '영어': 'en-US',
    '한국어': 'ko-KR',
    '일본어': 'ja-JP',
    '중국어': 'zh-CN',
    '스페인어': 'es-ES',
    '프랑스어': 'fr-FR',
    '러시아어': 'ru-RU',
    '아랍어': 'ar-SA',
  }
  return map[language] || 'en-US'
}
