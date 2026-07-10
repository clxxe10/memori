'use client'
import { useEffect } from 'react'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function Slide2({ onNext, onBack }: Props) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slide2FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s2-card { animation: slide2FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <style>{`
        @media (prefers-color-scheme: dark) {
          .s2-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .s2-card-inner { background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)) !important; border-color: rgba(255,255,255,0.12) !important; }
          .s2-title { color: #FFFFFF !important; }
          .s2-sub { color: rgba(235,235,245,0.6) !important; }
          .s2-input { background: rgba(120,120,128,0.24) !important; border-color: rgba(255,255,255,0.10) !important; color: #FFFFFF !important; }
          .s2-back { background: rgba(120,120,128,0.24) !important; color: rgba(255,255,255,0.7) !important; }
        }
      `}</style>

      {/* 배경 */}
      <div className="s2-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      }} />

      {/* 상단 바 */}
      <div style={{
        position: 'fixed', top: '66px', left: '20px', right: '20px',
        height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 10,
      }}>
        <button className="s2-back" onClick={onBack} style={{
          width: '32px', height: '32px', borderRadius: '9999px',
          background: 'rgba(120,120,128,0.10)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', color: 'rgba(60,60,67,0.65)',
        }}>←</button>

        {/* 점 인디케이터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: i === 2 ? '18px' : '6px', height: '6px',
              borderRadius: '9999px',
              background: i === 2 ? 'var(--color-my)' : 'rgba(60,60,67,0.18)',
              transition: 'width 300ms cubic-bezier(0.32,0.72,0,1)',
            }} />
          ))}
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* 글래스 카드 */}
      <div className="s2-card s2-card-inner" style={{
        width: 'calc(100% - 48px)', maxWidth: '360px',
        background: 'linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        padding: '34px 26px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '18px',
        position: 'relative', zIndex: 1,
      }}>
        {/* 아이콘 배지 */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.9), rgba(255,255,255,.5))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>👤</div>

        <div style={{ textAlign: 'center' }}>
          <h2 className="s2-title" style={{
            fontSize: '21px', fontWeight: 700,
            letterSpacing: '-0.4px', margin: '0 0 8px',
            color: '#0B0B0C',
          }}>어떻게 불러드릴까요?</h2>
          <p className="s2-sub" style={{
            fontSize: '14px', fontWeight: 500,
            color: 'rgba(60,60,67,0.55)', margin: 0,
          }}>닉네임을 입력해주세요</p>
        </div>

        {/* 기존 닉네임 입력 필드 — 기존 state/로직 그대로 연결 */}
        <input
          className="s2-input"
          placeholder="닉네임"
          style={{
            width: '100%', height: '50px',
            borderRadius: '16px', padding: '0 16px',
            fontSize: '16px', border: '1px solid rgba(60,60,67,0.08)',
            background: 'rgba(120,120,128,0.12)',
            color: '#0B0B0C', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* 하단 버튼 */}
      <button onClick={onNext} style={{
        position: 'fixed',
        bottom: 'max(52px, calc(env(safe-area-inset-bottom) + 32px))',
        left: '28px', right: '28px',
        height: '52px', borderRadius: '9999px',
        background: 'var(--color-my)',
        color: 'var(--color-my-contrast)',
        border: 'none', cursor: 'pointer',
        fontSize: '16px', fontWeight: 600,
        letterSpacing: '-0.2px', zIndex: 10,
      }}>
        다음
      </button>
    </div>
  )
}
