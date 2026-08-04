'use client'
import { useEffect, useState } from 'react'

interface Props {
  onNext: () => void
  onBack: () => void
  name: string
  setName: (v: string) => void
}

export default function Slide2Name({ onNext, onBack, name, setName }: Props) {
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
      @keyframes s2nFadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s2n-title-anim { animation: s2nFadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s2n-card-anim { animation: s2nFadeUp 700ms cubic-bezier(0.32,0.72,0,1) 120ms both; }
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
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'
  const inputShadow = isDark ? 'inset 0 1px 2px rgba(0,0,0,0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.04)'
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.7)'
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
            <div style={{ width: '50%', height: '100%', borderRadius: '9999px', background: trackFill }} />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="s2n-title-anim" style={{ marginBottom: '28px', marginTop: 'auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: titleColor, letterSpacing: '-0.8px', margin: '0 0 10px', lineHeight: 1.15 }}>
            어떻게 불러드릴까요?
          </h1>
          <p style={{ fontSize: '17px', color: subColor, margin: 0, lineHeight: 1.4 }}>
            닉네임을 입력해주세요
          </p>
        </div>

        {/* 글라스 카드 */}
        <div className="s2n-card-anim" style={{
          background: panelBg, borderRadius: '32px',
          border: panelBorder, boxShadow: panelShadow,
          padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          marginBottom: 'auto',
        }}>
          <input
            type="text"
            placeholder="닉네임"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%', padding: '17px 20px',
              borderRadius: '9999px', fontSize: '16px',
              border: inputBorder, background: inputBg,
              color: titleColor, outline: 'none',
              boxShadow: inputShadow,
              boxSizing: 'border-box' as const,
            }}
          />

          <button
            onClick={() => { if (name.trim()) onNext() }}
            style={{
              width: '100%', padding: '17px',
              background: name.trim() ? ctaBg : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
              color: name.trim() ? ctaColor : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
              borderRadius: '9999px', border: 'none',
              boxShadow: name.trim() ? ctaShadow : 'none',
              cursor: name.trim() ? 'pointer' : 'default',
              fontSize: '17px', fontWeight: 700,
              transition: 'all 300ms ease',
            }}>
            다음
          </button>
        </div>
      </div>
    </div>
  )
}
