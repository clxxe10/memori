'use client'
import { useEffect, useState } from 'react'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function Slide3({ onNext, onBack }: Props) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      const savedTheme = localStorage.getItem('app_theme') || '시스템'
      if (savedTheme === '다크') setIsDark(true)
      else if (savedTheme === '라이트') setIsDark(false)
      else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    checkDark()
    const style = document.createElement('style')
    style.textContent = `
      @keyframes s3FadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s3-title-anim { animation: s3FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s3-card-anim { animation: s3FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 120ms both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const bg = isDark
    ? 'linear-gradient(160deg, #27242F 0%, #161420 30%, #0B0B11 65%, #000000 100%)'
    : 'linear-gradient(160deg, #FFFFFF 0%, #ECEDF4 35%, #E1E5EF 65%, #D3D9EB 100%)'
  const titleColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const subColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)'
  const panelBg = isDark
    ? 'linear-gradient(165deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))'
    : 'linear-gradient(165deg, rgba(255,255,255,0.75), rgba(255,255,255,0.35))'
  const panelShadow = isDark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -1px 2px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.5)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.04), 0 20px 40px rgba(31,38,60,0.1)'
  const panelBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)'
  const trackBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
  const trackFill = isDark ? 'linear-gradient(90deg, #fff, #C7C7CC)' : 'linear-gradient(90deg, #1C1C1E, #48484A)'
  const backBg = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))'
  const backShadow = isDark
    ? 'inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -2px 3px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.3)'
    : 'inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.08)'
  const backBorder = isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.6)'
  const ctaBg = isDark
    ? 'linear-gradient(180deg, #FFFFFF 0%, #EDEDF0 100%)'
    : 'linear-gradient(180deg, #333335 0%, #1C1C1E 55%, #0E0E0F 100%)'
  const ctaColor = isDark ? '#1C1C1E' : '#FFFFFF'
  const ctaShadow = isDark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -3px 6px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.45)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.25), inset 0 -6px 10px rgba(0,0,0,0.3), 0 12px 24px rgba(0,0,0,0.25)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.06)'
  const featureBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(120,120,128,0.08)'

  const features = [
    { emoji: '📸', title: 'AI 사진 단어 추출', desc: '교재 사진 한 장으로 단어장 완성' },
    { emoji: '🎓', title: '8가지 학습 모드', desc: '플래시카드, 퀴즈, 타이핑 등 다양하게' },
    { emoji: '🔥', title: '암기세트', desc: '4단계로 완벽하게 암기해요' },
    { emoji: '📄', title: 'PDF 시험지', desc: '굿노트에서 바로 풀 수 있어요' },
    { emoji: '🌐', title: '단어장 공유', desc: '다른 사람 단어장도 가져와요' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' as const,
      }}>
        {/* 네비게이션 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0' }}>
          <button onClick={onBack} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: backBg, border: backBorder, boxShadow: backShadow,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDark ? 'rgba(255,255,255,0.8)' : '#1C1C1E', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{
            flex: 1, height: '6px', borderRadius: '9999px',
            background: trackBg, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            <div style={{ width: '60%', height: '100%', borderRadius: '9999px', background: trackFill }} />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="s3-title-anim" style={{ marginBottom: '28px', marginTop: 'auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: titleColor, letterSpacing: '-0.8px', margin: '0 0 10px', lineHeight: 1.15 }}>
            Memori로 할 수 있는 것들
          </h1>
          <p style={{ fontSize: '17px', color: subColor, margin: 0, lineHeight: 1.4 }}>
            단어 공부가 이렇게 쉬워져요
          </p>
        </div>

        {/* 글라스 카드 */}
        <div className="s3-card-anim" style={{
          background: panelBg, borderRadius: '32px',
          border: panelBorder, boxShadow: panelShadow,
          padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '0',
          marginBottom: 'auto',
        }}>
          {features.map((f, i) => (
            <div key={f.title}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 4px',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  background: featureBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                }}>{f.emoji}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: titleColor, marginBottom: '2px' }}>{f.title}</div>
                  <div style={{ fontSize: '13px', color: subColor }}>{f.desc}</div>
                </div>
              </div>
              {i < features.length - 1 && (
                <div style={{ height: '0.5px', background: dividerColor, marginLeft: '62px' }} />
              )}
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div style={{ paddingTop: '20px' }}>
          <button onClick={onNext} style={{
            width: '100%', padding: '17px',
            background: ctaBg, color: ctaColor,
            borderRadius: '9999px', border: 'none',
            boxShadow: ctaShadow,
            cursor: 'pointer', fontSize: '17px', fontWeight: 700,
          }}>다음</button>
        </div>
      </div>
    </div>
  )
}
