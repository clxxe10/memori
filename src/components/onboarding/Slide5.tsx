'use client'
import { useEffect } from 'react'

export default function Slide5({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slide5FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes slide5CheckIn {
        0%   { opacity: 0; transform: scale(0.5); }
        70%  { opacity: 1; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
      }
      .s5-badge { animation: slide5CheckIn 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s5-card { animation: slide5FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 100ms both; }
      .s5-btn1 { animation: slide5FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 200ms both; }
      .s5-btn2 { animation: slide5FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 300ms both; }
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
          .s5-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .s5-card-inner { background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)) !important; border-color: rgba(255,255,255,0.12) !important; }
          .s5-title { color: #FFFFFF !important; }
          .s5-sub { color: rgba(235,235,245,0.6) !important; }
          .s5-dot { background: rgba(235,235,245,0.22) !important; }
          .s5-skip { color: rgba(235,235,245,0.5) !important; }
        }
      `}</style>

      <div className="s5-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      }} />

      {/* 상단 인디케이터 */}
      <div style={{
        position: 'fixed', top: '66px', left: '20px', right: '20px',
        height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className={i !== 5 ? 's5-dot' : ''} style={{
              width: i === 5 ? '18px' : '6px', height: '6px',
              borderRadius: '9999px',
              background: i === 5 ? 'var(--color-my)' : 'rgba(60,60,67,0.18)',
              transition: 'width 300ms cubic-bezier(0.32,0.72,0,1)',
            }} />
          ))}
        </div>
      </div>

      {/* 글래스 카드 */}
      <div className="s5-card s5-card-inner" style={{
        width: 'calc(100% - 48px)', maxWidth: '360px',
        background: 'linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        padding: '38px 26px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '20px',
        position: 'relative', zIndex: 1,
      }}>
        {/* 체크 배지 */}
        <div className="s5-badge" style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'var(--color-my)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>✓</div>

        <div style={{ textAlign: 'center' }}>
          <h2 className="s5-title" style={{
            fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px',
            margin: '0 0 8px', color: '#0B0B0C',
          }}>준비 완료!</h2>
          <p className="s5-sub" style={{
            fontSize: '14px', fontWeight: 500,
            color: 'rgba(60,60,67,0.55)', margin: 0, lineHeight: 1.5,
          }}>단어 공부 시작할 준비가 됐어요.<br/>첫 단어장을 만들어볼까요?</p>
        </div>
      </div>

      {/* 하단 버튼들 */}
      <button className="s5-btn1" onClick={onFinish} style={{
        position: 'fixed',
        bottom: 'max(100px, calc(env(safe-area-inset-bottom) + 80px))',
        left: '28px', right: '28px',
        height: '52px', borderRadius: '9999px',
        background: 'var(--color-my)',
        color: 'var(--color-my-contrast)',
        border: 'none', cursor: 'pointer',
        fontSize: '16px', fontWeight: 600,
        letterSpacing: '-0.2px', zIndex: 10,
      }}>
        첫 단어장 만들기
      </button>

      <button className="s5-btn2 s5-skip" onClick={onFinish} style={{
        position: 'fixed',
        bottom: 'max(52px, calc(env(safe-area-inset-bottom) + 32px))',
        left: '28px', right: '28px',
        height: '32px', background: 'transparent', border: 'none',
        cursor: 'pointer', fontSize: '13px',
        color: 'rgba(60,60,67,0.5)', zIndex: 10,
      }}>
        홈으로 바로 가기
      </button>
    </div>
  )
}
