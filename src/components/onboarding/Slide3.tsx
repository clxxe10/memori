'use client'
import { useEffect } from 'react'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function Slide3({ onNext, onBack }: Props) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slide3FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s3-card { animation: slide3FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s3-item { animation: slide3FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

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
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <style>{`
        @media (prefers-color-scheme: dark) {
          .s3-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .s3-card-inner { background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)) !important; border-color: rgba(255,255,255,0.12) !important; }
          .s3-title { color: #FFFFFF !important; }
          .s3-sub { color: rgba(235,235,245,0.6) !important; }
          .s3-back { background: rgba(120,120,128,0.24) !important; color: rgba(255,255,255,0.7) !important; }
          .s3-dot { background: rgba(235,235,245,0.22) !important; }
          .s3-feature-title { color: #FFFFFF !important; }
          .s3-feature-desc { color: rgba(235,235,245,0.6) !important; }
          .s3-divider { background: rgba(255,255,255,0.08) !important; }
        }
      `}</style>

      <div className="s3-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      }} />

      {/* 상단 바 */}
      <div style={{
        position: 'fixed', top: '66px', left: '20px', right: '20px',
        height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 10,
      }}>
        <button className="s3-back" onClick={onBack} style={{
          width: '32px', height: '32px', borderRadius: '9999px',
          background: 'rgba(120,120,128,0.10)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', color: 'rgba(60,60,67,0.65)',
        }}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className={i !== 3 ? 's3-dot' : ''} style={{
              width: i === 3 ? '18px' : '6px', height: '6px',
              borderRadius: '9999px',
              background: i === 3 ? 'var(--color-my)' : 'rgba(60,60,67,0.18)',
              transition: 'width 300ms cubic-bezier(0.32,0.72,0,1)',
            }} />
          ))}
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* 글래스 카드 */}
      <div className="s3-card s3-card-inner" style={{
        width: 'calc(100% - 48px)', maxWidth: '360px',
        background: 'linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        padding: '28px 22px',
        display: 'flex', flexDirection: 'column',
        gap: '16px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 className="s3-title" style={{
            fontSize: '21px', fontWeight: 700,
            letterSpacing: '-0.4px', margin: '0 0 6px',
            color: '#0B0B0C',
          }}>Memori로 할 수 있는 것들</h2>
          <p className="s3-sub" style={{
            fontSize: '13px', color: 'rgba(60,60,67,0.55)', margin: 0,
          }}>단어 공부가 이렇게 쉬워져요</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {features.map((f, i) => (
            <div key={f.title}>
              <div className="s3-item" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 0',
                animationDelay: `${i * 80}ms`,
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: 'rgba(120,120,128,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                }}>{f.emoji}</div>
                <div>
                  <div className="s3-feature-title" style={{
                    fontSize: '14px', fontWeight: 600,
                    color: '#0B0B0C', marginBottom: '2px',
                  }}>{f.title}</div>
                  <div className="s3-feature-desc" style={{
                    fontSize: '12px', color: 'rgba(60,60,67,0.55)',
                  }}>{f.desc}</div>
                </div>
              </div>
              {i < features.length - 1 && (
                <div className="s3-divider" style={{
                  height: '1px', background: 'rgba(60,60,67,0.06)',
                }} />
              )}
            </div>
          ))}
        </div>
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
