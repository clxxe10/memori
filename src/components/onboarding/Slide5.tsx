'use client'
import { useEffect, useState } from 'react'

export default function Slide5({ onFinish }: { onFinish: () => void }) {
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
      @keyframes s5FadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes s5CheckPop {
        0%   { opacity: 0; transform: scale(0.5); }
        70%  { opacity: 1; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
      }
      .s5-badge-anim { animation: s5CheckPop 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s5-title-anim { animation: s5FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 150ms both; }
      .s5-card-anim { animation: s5FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 250ms both; }
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
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
      }}>
        {/* 체크 배지 */}
        <div className="s5-badge-anim" style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--color-neutral)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.4), 0 12px 28px rgba(0,0,0,0.2)',
          marginBottom: '24px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>

        {/* 타이틀 */}
        <div className="s5-title-anim" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: titleColor, letterSpacing: '-0.8px', margin: '0 0 10px' }}>
            준비 완료!
          </h1>
          <p style={{ fontSize: '17px', color: subColor, margin: 0, lineHeight: 1.4 }}>
            단어 공부 시작할 준비가 됐어요
          </p>
        </div>

        {/* 글라스 카드 - 완료된 단계 */}
        <div className="s5-card-anim" style={{
          background: panelBg, borderRadius: '32px',
          border: panelBorder, boxShadow: panelShadow,
          padding: '20px 24px',
          display: 'flex', flexWrap: 'wrap' as const,
          gap: '8px', justifyContent: 'center',
          width: '100%', maxWidth: '340px',
          marginBottom: '40px',
        }}>
          {['계정 생성', '기능 확인', '마이컬러'].map(step => (
            <div key={step} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              borderRadius: '9999px', padding: '8px 14px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              <span style={{ fontSize: '13px', fontWeight: 600, color: titleColor }}>{step}</span>
            </div>
          ))}
        </div>

        {/* 버튼들 */}
        <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={onFinish} style={{
            width: '100%', padding: '17px',
            background: ctaBg, color: ctaColor,
            borderRadius: '9999px', border: 'none',
            boxShadow: ctaShadow,
            cursor: 'pointer', fontSize: '17px', fontWeight: 700,
          }}>시작하기</button>

          <button onClick={onFinish} style={{
            width: '100%', padding: '14px',
            background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '14px',
            color: subColor, fontWeight: 500,
          }}>홈으로 바로 가기</button>
        </div>
      </div>
    </div>
  )
}
