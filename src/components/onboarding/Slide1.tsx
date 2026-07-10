'use client'
import { useEffect } from 'react'

export default function Slide1({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slide1IconIn {
        0%   { opacity: 0; transform: scale(0.72); }
        60%  { opacity: 1; transform: scale(1.04); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes slide1FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s1-icon { animation: slide1IconIn 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s1-title { animation: slide1FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 150ms both; }
      .s1-sub { animation: slide1FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 250ms both; }
      .s1-btn { animation: slide1FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 350ms both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      padding: '40px 28px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <style>{`
        @media (prefers-color-scheme: dark) {
          .s1-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .s1-title-text { color: #FFFFFF !important; }
          .s1-sub-text { color: rgba(235,235,245,0.6) !important; }
        }
      `}</style>

      <div className="s1-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '24px', padding: '40px 36px',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {/* 앱 아이콘 */}
        <img
          src="/icons/icon-180.png"
          alt="Memori"
          className="s1-icon"
          style={{
            width: '84px', height: '84px',
            borderRadius: '22.37%',
            boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
          }}
        />

        {/* 텍스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <h1
            className="s1-title s1-title-text"
            style={{
              fontSize: '30px', fontWeight: 700,
              letterSpacing: '-0.5px', lineHeight: 1.2,
              textAlign: 'center', margin: 0,
              color: '#0B0B0C',
            }}
          >
            단어 학습,<br/>더 스마트하게
          </h1>
          <p
            className="s1-sub s1-sub-text"
            style={{
              fontSize: '15px', fontWeight: 500,
              letterSpacing: '-0.2px', lineHeight: 1.5,
              textAlign: 'center', margin: 0,
              color: 'rgba(60,60,67,0.55)',
            }}
          >
            사진 한 장으로 단어장을 만들고<br/>나만의 방식으로 외워요
          </p>
        </div>

        {/* 시작하기 버튼 */}
        <button
          className="s1-btn"
          onClick={onNext}
          style={{
            position: 'absolute',
            bottom: 'max(52px, calc(env(safe-area-inset-bottom) + 32px))',
            left: '28px', right: '28px',
            height: '52px', borderRadius: '9999px',
            background: 'var(--color-my)',
            color: 'var(--color-my-contrast)',
            border: 'none', cursor: 'pointer',
            fontSize: '16px', fontWeight: 600,
            letterSpacing: '-0.2px',
          }}
        >
          시작하기
        </button>
      </div>
    </div>
  )
}
