'use client'
import { X } from 'lucide-react'

type Props = { mode: string; onClose: () => void }

const HELP_CONTENT: Record<string, { title: string; steps: string[]; tips: string[] }> = {
  flashcard: {
    title: '플래시카드',
    steps: ['카드를 탭하면 뒤집혀요', '오른쪽 스와이프 또는 알아요 → 다음 카드', '왼쪽 스와이프 또는 몰라요 → 복습 대상 추가'],
    tips: ['모르는 단어는 몰라요를 눌러야 복습에 포함돼요', '알아요를 많이 누를수록 복습 간격이 늘어나요'],
  },
  blink: {
    title: '깜빡이',
    steps: ['단어와 뜻이 자동으로 넘어가요', '속도를 0.5x ~ 3x 로 조절할 수 있어요', '눈으로 보며 자연스럽게 암기해요'],
    tips: ['처음엔 느리게, 익숙해지면 빠르게 설정해보세요', '잠들기 전 반복 시청에 효과적이에요'],
  },
  quiz: {
    title: '객관식 퀴즈',
    steps: ['단어를 보고 4개 보기 중 뜻을 선택해요', '정답이면 초록, 오답이면 빨간색으로 표시돼요', '오답을 누르면 정답이 표시돼요'],
    tips: ['실전 시험 전 감각을 익히기 좋아요', '틀린 단어는 자동으로 복습 대상이 돼요'],
  },
  typing: {
    title: '타이핑',
    steps: ['뜻을 보고 영어 단어를 직접 입력해요', '정확히 입력하면 다음 단어로 넘어가요', '틀리면 정답이 표시돼요'],
    tips: ['스펠링을 완벽히 외우고 싶을 때 효과적이에요', '대소문자는 구분하지 않아요'],
  },
  listening: {
    title: '리스닝',
    steps: ['단어 발음을 듣고 뜻을 입력해요', '다시 듣기 버튼으로 반복 청취 가능해요', '발음과 뜻을 동시에 익힐 수 있어요'],
    tips: ['실제 발음에 귀를 익히기 좋아요', '영어 듣기 시험 대비에 효과적이에요'],
  },
  review: {
    title: '복습',
    steps: ['플래시카드, 객관식, 타이핑이 랜덤으로 나와요', '틀리거나 몰라요 한 단어 위주로 출제돼요', '모든 단어를 맞히면 완료예요'],
    tips: ['매일 복습하면 장기기억에 저장돼요', 'SRS 알고리즘으로 최적의 타이밍에 복습해요'],
  },
  speed: {
    title: '스피드 모드',
    steps: ['단어가 위에서 아래로 떨어져요', '바닥에 닿기 전에 뜻을 입력해서 없애요', '목숨이 0이 되면 게임 종료예요'],
    tips: ['콤보를 이어가면 점수가 빠르게 올라가요', '띄어쓰기 없이 입력해도 정답 인정돼요'],
  },
  pdf: {
    title: 'PDF 시험지',
    steps: ['단어장과 단어를 선택해요', '시험 형식을 선택해요 (단어→뜻, 뜻→단어)', 'PDF를 생성하고 다운로드해요'],
    tips: ['굿노트에 불러와서 손으로 풀 수 있어요', '처음 1회는 무료로 생성할 수 있어요'],
  },
}

export default function HelpSheet({ mode, onClose }: Props) {
  const content = HELP_CONTENT[mode]
  if (!content) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
        padding: '20px 24px 100px', zIndex: 1000,
        maxHeight: '75vh', overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ width: '36px', height: '4px', background: 'var(--color-border)', borderRadius: '4px', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            {content.title} 사용법
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px', letterSpacing: '0.3px' }}>
          사용 방법
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

        <div style={{ background: 'var(--color-surface-2)', borderRadius: '14px', padding: '14px 16px', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px', letterSpacing: '0.3px' }}>
            💡 꿀팁
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
