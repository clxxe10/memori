/** 공개 단어장용 최소 금칙어 필터 (Apple 1.2) — 오탐 최소화 */

const EN_BLOCKED = [
  'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy',
  'cunt', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'retard',
]

/** 명백한 한국어 욕설만 (짧은 부분문자열 오탐 주의) */
const KO_BLOCKED = [
  '씨발', '시발', '병신', '지랄', '개새끼', '개새키', '느금마', '엠창',
  '장애인년', '니애미', 'ㅅㅂ', 'ㅂㅅ', 'ㅈㄹ', 'ㅄ', 'ㅅㄲ',
]

/** 금칙어를 포함하지만 정상인 표현 */
const KO_SAFE_EXCEPTIONS = [
  '시발점',
]

export type BlockHit = {
  /** 걸린 금칙어 */
  term: string
  /** 검사에 걸린 원문 조각 */
  source: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 영어: 단어 경계(\b) 일치만 */
function findEnglishHit(text: string): BlockHit | null {
  for (const term of EN_BLOCKED) {
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i')
    if (re.test(text)) {
      return { term, source: text.trim() }
    }
  }
  return null
}

/** 한국어: 포함 검사이되 예외 문구는 통과 */
function findKoreanHit(text: string): BlockHit | null {
  const raw = text.trim()
  if (!raw) return null

  // 예외 문구가 있으면 그 구간을 마스킹한 뒤 검사
  let masked = raw
  for (const safe of KO_SAFE_EXCEPTIONS) {
    if (masked.includes(safe)) {
      masked = masked.split(safe).join('□'.repeat(safe.length))
    }
  }

  for (const term of KO_BLOCKED) {
    if (masked.includes(term)) {
      return { term, source: raw }
    }
  }
  return null
}

/** 단일 텍스트에서 금칙어 hit 반환 (없으면 null) */
export function findBlockedContent(text: string | null | undefined): BlockHit | null {
  if (!text?.trim()) return null
  return findEnglishHit(text) || findKoreanHit(text)
}

/**
 * 여러 텍스트 검사. hit이 있으면 첫 번째를 반환.
 * labels[i]가 있으면 source 표시에 사용 (예: 단어 "shipping")
 */
export function findBlockedInList(
  texts: Array<string | null | undefined>,
  labels?: Array<string | null | undefined>,
): BlockHit | null {
  for (let i = 0; i < texts.length; i++) {
    const hit = findBlockedContent(texts[i])
    if (hit) {
      const label = labels?.[i]?.trim()
      return label ? { ...hit, source: label } : hit
    }
  }
  return null
}

/** @deprecated 호환용 — findBlockedContent 사용 권장 */
export function containsBlockedContent(text: string | null | undefined): boolean {
  return findBlockedContent(text) !== null
}

/** @deprecated 호환용 */
export function containsBlockedInList(texts: Array<string | null | undefined>): boolean {
  return findBlockedInList(texts) !== null
}
