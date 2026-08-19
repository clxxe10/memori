'use client'
import { X } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

type Props = { mode: string; onClose: () => void }

const getHelpContent = (lang: string) => ({
  flashcard: {
    title: lang === 'en' ? 'Flashcard' : '플래시카드',
    steps: lang === 'en' ? [
      'Tap the card to flip it',
      'Swipe right or tap Know → next card',
      'Swipe left or tap Don\'t Know → added to review',
    ] : [
      '카드를 탭하면 뒤집혀요',
      '오른쪽 스와이프 또는 알아요 → 다음 카드',
      '왼쪽 스와이프 또는 몰라요 → 복습 대상 추가',
    ],
    tips: lang === 'en' ? [
      'Tap Don\'t Know to include words in review',
      'The more you tap Know, the longer the review interval',
    ] : [
      '모르는 단어는 몰라요를 눌러야 복습에 포함돼요',
      '알아요를 많이 누를수록 복습 간격이 늘어나요',
    ],
  },
  blink: {
    title: lang === 'en' ? 'Blink' : '깜빡이',
    steps: lang === 'en' ? [
      'Words and meanings auto-advance',
      'Adjust speed from 0.5x to 3x',
      'Memorize naturally by watching',
    ] : [
      '단어와 뜻이 자동으로 넘어가요',
      '속도를 0.5x ~ 3x 로 조절할 수 있어요',
      '눈으로 보며 자연스럽게 암기해요',
    ],
    tips: lang === 'en' ? [
      'Start slow, then speed up as you get comfortable',
      'Great for repeated viewing before sleep',
    ] : [
      '처음엔 느리게, 익숙해지면 빠르게 설정해보세요',
      '잠들기 전 반복 시청에 효과적이에요',
    ],
  },
  quiz: {
    title: lang === 'en' ? 'Quiz' : '객관식 퀴즈',
    steps: lang === 'en' ? [
      'See the word and choose from 4 options',
      'Green for correct, red for wrong',
      'Wrong answers show the correct one',
    ] : [
      '단어를 보고 4개 보기 중 뜻을 선택해요',
      '정답이면 초록, 오답이면 빨간색으로 표시돼요',
      '오답을 누르면 정답이 표시돼요',
    ],
    tips: lang === 'en' ? [
      'Great for building test-taking intuition',
      'Wrong words are automatically added to review',
    ] : [
      '실전 시험 전 감각을 익히기 좋아요',
      '틀린 단어는 자동으로 복습 대상이 돼요',
    ],
  },
  typing: {
    title: lang === 'en' ? 'Typing' : '타이핑',
    steps: lang === 'en' ? [
      'See the meaning and type the English word',
      'Correct input moves to next word',
      'Wrong answers show the correct word',
    ] : [
      '뜻을 보고 영어 단어를 직접 입력해요',
      '정확히 입력하면 다음 단어로 넘어가요',
      '틀리면 정답이 표시돼요',
    ],
    tips: lang === 'en' ? [
      'Best for memorizing spellings perfectly',
      'Case-insensitive',
    ] : [
      '스펠링을 완벽히 외우고 싶을 때 효과적이에요',
      '대소문자는 구분하지 않아요',
    ],
  },
  listening: {
    title: lang === 'en' ? 'Listening' : '리스닝',
    steps: lang === 'en' ? [
      'Listen to the word pronunciation and type the meaning',
      'Tap the replay button to listen again',
      'Learn pronunciation and meaning simultaneously',
    ] : [
      '단어 발음을 듣고 뜻을 입력해요',
      '다시 듣기 버튼으로 반복 청취 가능해요',
      '발음과 뜻을 동시에 익힐 수 있어요',
    ],
    tips: lang === 'en' ? [
      'Great for training your ear to real pronunciation',
      'Effective for listening test prep',
    ] : [
      '실제 발음에 귀를 익히기 좋아요',
      '영어 듣기 시험 대비에 효과적이에요',
    ],
  },
  review: {
    title: lang === 'en' ? 'Review' : '복습',
    steps: lang === 'en' ? [
      'Flashcard, quiz, and typing appear randomly',
      'Focuses on words you got wrong or don\'t know',
      'Complete when all words are correct',
    ] : [
      '플래시카드, 객관식, 타이핑이 랜덤으로 나와요',
      '틀리거나 몰라요 한 단어 위주로 출제돼요',
      '모든 단어를 맞히면 완료예요',
    ],
    tips: lang === 'en' ? [
      'Daily review stores words in long-term memory',
      'SRS algorithm shows reviews at optimal timing',
    ] : [
      '매일 복습하면 장기기억에 저장돼요',
      'SRS 알고리즘으로 최적의 타이밍에 복습해요',
    ],
  },
  speed: {
    title: lang === 'en' ? 'Speed Mode' : '스피드 모드',
    steps: lang === 'en' ? [
      'Words fall from the top of the screen',
      'Type the meaning before it hits the bottom',
      'Game over when lives reach 0',
    ] : [
      '단어가 위에서 아래로 떨어져요',
      '바닥에 닿기 전에 뜻을 입력해서 없애요',
      '목숨이 0이 되면 게임 종료예요',
    ],
    tips: lang === 'en' ? [
      'Keep combos going to multiply your score fast',
      'Spacing is OK — close matches count',
    ] : [
      '콤보를 이어가면 점수가 빠르게 올라가요',
      '띄어쓰기 없이 입력해도 정답 인정돼요',
    ],
  },
  pdf: {
    title: lang === 'en' ? 'PDF Test Sheet' : 'PDF 시험지',
    steps: lang === 'en' ? [
      'Select vocabulary and words',
      'Choose test format (word→meaning or meaning→word)',
      'Generate and download PDF',
    ] : [
      '단어장과 단어를 선택해요',
      '시험 형식을 선택해요 (단어→뜻, 뜻→단어)',
      'PDF를 생성하고 다운로드해요',
    ],
    tips: lang === 'en' ? [
      'Import to GoodNotes and solve by hand',
      'First generation is free',
    ] : [
      '굿노트에 불러와서 손으로 풀 수 있어요',
      '처음 1회는 무료로 생성할 수 있어요',
    ],
  },
})

export default function HelpSheet({ mode, onClose }: Props) {
  const { lang } = useTranslation()
  const HELP_CONTENT = getHelpContent(lang) as Record<string, { title: string; steps: string[]; tips: string[] }>
  const content = HELP_CONTENT[mode]
  if (!content) return null

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.16)',
      }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: '320px', zIndex: 1000,
        background: isDark
          ? 'linear-gradient(165deg, rgba(70,68,80,0.5), rgba(20,18,26,0.55))'
          : '#FEFEFF',
        backdropFilter: isDark ? 'blur(28px)' : 'none',
        WebkitBackdropFilter: isDark ? 'blur(28px)' : 'none',
        boxShadow: isDark
          ? 'inset 0 1.5px 0 rgba(255,255,255,0.16), 0 24px 48px rgba(0,0,0,0.6)'
          : '0 24px 48px rgba(31,38,60,0.18), 0 2px 8px rgba(31,38,60,0.06)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : '1px solid rgba(0,0,0,0.04)',
        borderRadius: '26px',
        padding: '24px 20px 20px',
        maxHeight: '75vh', overflowY: 'auto' as const,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            {content.title} {lang === 'en' ? 'Guide' : '사용법'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px', letterSpacing: '0.3px' }}>
          {lang === 'en' ? 'How to Use' : '사용 방법'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {content.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'var(--color-text-primary)', color: 'var(--color-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.5, margin: 0, paddingTop: '2px' }}>{step}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'var(--color-surface-2)',
          borderRadius: '14px', padding: '14px 16px',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--color-border)',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px', letterSpacing: '0.3px' }}>
            {lang === 'en' ? '💡 Tips' : '💡 꿀팁'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {content.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>•</span>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
