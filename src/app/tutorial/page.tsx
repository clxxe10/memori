'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

const slides = [
  {
    img: '/tutorial/home-top.png',
    titleKo: '홈 화면',
    titleEn: 'Home',
    descKo: '🔥 연속 학습일, 오늘 복습할 단어 수, 학습 캘린더를 한눈에 확인해요',
    descEn: '🔥 Track your streak, words to review today, and study calendar at a glance',
  },
  {
    img: '/tutorial/wordbook.png',
    titleKo: '단어장',
    titleEn: 'Vocabulary',
    descKo: '➕ + 버튼으로 새 단어장을 만들고, 사진 한 장으로 AI가 단어를 자동 추출해요',
    descEn: '➕ Create a new vocabulary list and let AI extract words from a photo automatically',
  },
  {
    img: '/tutorial/study.png',
    titleKo: '학습 모드',
    titleEn: 'Study Modes',
    descKo: '🎓 암기세트부터 플래시카드, 퀴즈, 타이핑까지 8가지 방법으로 학습해요',
    descEn: '🎓 Study with 8 modes including Memory Set, Flashcard, Quiz, and Typing',
  },
  {
    img: '/tutorial/search.png',
    titleKo: '탐색',
    titleEn: 'Explore',
    descKo: '🌐 다른 사람이 만든 단어장을 검색하고 내 단어장에 바로 가져와요',
    descEn: '🌐 Search and import vocabulary lists made by other users',
  },
]

export default function TutorialPage() {
  const router = useRouter()
  const { lang } = useTranslation()
  const [current, setCurrent] = useState(0)

  const finish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorial_done', '1')
    }
    router.push('/home')
  }

  const next = () => {
    if (current < slides.length - 1) setCurrent(c => c + 1)
    else finish()
  }

  const prev = () => {
    if (current > 0) setCurrent(c => c - 1)
  }

  const slide = slides[current]
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <main style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--color-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 스킵 버튼 */}
      <button
        onClick={finish}
        style={{
          position: 'absolute', top: 16, right: 20, zIndex: 10,
          background: 'none', border: 'none',
          fontSize: 15, fontWeight: 500,
          color: 'var(--color-text-secondary)',
          cursor: 'pointer', padding: '8px',
        }}
      >
        {lang === 'en' ? 'Skip' : '스킵'}
      </button>

      {/* 스크린샷 */}
      <div style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px 0',
      }}>
        <img
          src={slide.img}
          alt=""
          style={{
            width: '100%', maxWidth: '320px',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            objectFit: 'contain',
            transition: 'opacity 0.25s ease',
          }}
        />
      </div>

      {/* 설명 카드 */}
      <div style={{
        padding: '24px 24px 40px',
        background: 'var(--color-bg)',
      }}>
        {/* 페이지 점 인디케이터 */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: 6, marginBottom: 20,
        }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              height: 6,
              width: current === i ? 18 : 6,
              borderRadius: 9999,
              background: current === i ? 'var(--color-text-primary)' : 'var(--color-border)',
              transition: 'all 250ms ease',
            }} />
          ))}
        </div>

        <h2 style={{
          fontSize: 24, fontWeight: 800,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.5px',
          margin: '0 0 10px',
        }}>
          {lang === 'en' ? slide.titleEn : slide.titleKo}
        </h2>
        <p style={{
          fontSize: 15, color: 'var(--color-text-secondary)',
          lineHeight: 1.6, margin: '0 0 24px',
          wordBreak: 'keep-all',
        }}>
          {lang === 'en' ? slide.descEn : slide.descKo}
        </p>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          {current > 0 && (
            <button
              onClick={prev}
              style={{
                flex: 1, height: 52, borderRadius: 9999,
                border: '1.5px solid var(--color-border)',
                background: 'none',
                fontSize: 16, fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {lang === 'en' ? 'Back' : '이전'}
            </button>
          )}
          <button
            onClick={next}
            style={{
              flex: 2, height: 52, borderRadius: 9999,
              border: 'none',
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg)',
              fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {current === slides.length - 1
              ? (lang === 'en' ? 'Get Started' : '시작하기')
              : (lang === 'en' ? 'Next' : '다음')}
          </button>
        </div>
      </div>
    </main>
  )
}
