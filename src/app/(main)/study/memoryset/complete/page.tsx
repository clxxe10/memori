'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MemorySetCompletePage() {
  const router = useRouter()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes completePop {
        0%   { opacity: 0; transform: scale(0.5) rotate(-10deg); }
        60%  { opacity: 1; transform: scale(1.2) rotate(5deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      @keyframes completeFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .cp-emoji { animation: completePop 800ms cubic-bezier(0.32,0.72,0,1) both; }
      .cp-title { animation: completeFadeUp 600ms cubic-bezier(0.32,0.72,0,1) 300ms both; }
      .cp-sub   { animation: completeFadeUp 600ms cubic-bezier(0.32,0.72,0,1) 400ms both; }
      .cp-cards { animation: completeFadeUp 600ms cubic-bezier(0.32,0.72,0,1) 500ms both; }
      .cp-btns  { animation: completeFadeUp 600ms cubic-bezier(0.32,0.72,0,1) 600ms both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '0 24px',
    }}>
      <div className="cp-emoji" style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>

      <h1 className="cp-title" style={{
        fontSize: '28px', fontWeight: 800,
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.5px', marginBottom: '10px', textAlign: 'center',
      }}>암기세트 완료!</h1>

      <p className="cp-sub" style={{
        fontSize: '15px', color: 'var(--color-text-secondary)',
        textAlign: 'center', marginBottom: '40px', lineHeight: 1.5,
      }}>
        플래시카드 → 깜빡이 → 퀴즈 → 타이핑<br/>
        4단계를 모두 완료했어요 🙌
      </p>

      {/* 완료된 모드 뱃지 */}
      <div className="cp-cards" style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: '40px',
      }}>
        {['플래시카드', '깜빡이', '퀴즈', '타이핑'].map(mode => (
          <div key={mode} style={{
            background: 'var(--color-my)',
            color: 'var(--color-my-contrast)',
            borderRadius: '9999px', padding: '6px 14px',
            fontSize: '13px', fontWeight: 600,
          }}>✓ {mode}</div>
        ))}
      </div>

      {/* 버튼 */}
      <div className="cp-btns" style={{
        display: 'flex', flexDirection: 'column',
        gap: '10px', width: '100%', maxWidth: '320px',
      }}>
        <button onClick={() => router.push('/study/memoryset')} style={{
          width: '100%', height: '52px',
          background: 'var(--color-my)', color: 'var(--color-my-contrast)',
          border: 'none', borderRadius: '14px',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer',
        }}>
          다시 암기세트 하기
        </button>
        <button onClick={() => router.push('/home')} style={{
          width: '100%', height: '52px',
          background: 'transparent', color: 'var(--color-text-secondary)',
          border: 'none', borderRadius: '14px',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        }}>
          홈으로 돌아가기
        </button>
      </div>
    </main>
  )
}
