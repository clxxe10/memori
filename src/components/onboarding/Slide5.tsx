'use client'
import { useEffect } from 'react'

export default function Slide5({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes checkPop {
        0% { transform: scale(0); opacity: 0; }
        60% { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes checkDraw {
        0% { stroke-dashoffset: 30; opacity: 0; }
        20% { opacity: 1; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes fadeUp {
        0% { transform: translateY(12px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      .check-pop { animation: checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
      .check-draw { stroke-dasharray: 30; stroke-dashoffset: 30; animation: checkDraw 0.4s ease-out 0.6s forwards; }
      .fade-up-1 { animation: fadeUp 0.4s ease-out 0.8s both; }
      .fade-up-2 { animation: fadeUp 0.4s ease-out 1s both; }
      .fade-up-3 { animation: fadeUp 0.4s ease-out 1.2s both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100dvh',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100dvh',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 24px 40px',
      }}>
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '0' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '5px', borderRadius: '3px', background: 'var(--color-text-primary)', width: i === 5 ? '18px' : '5px' }} />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div className="check-pop" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path className="check-draw" d="M7 16.5L13 22.5L25 9.5" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="fade-up-1" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', marginBottom: '8px' }}>준비 완료! 🎉</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>지금 바로 첫 단어장을<br/>만들어봐요</p>
        </div>
        <div className="fade-up-2" style={{ display: 'flex', gap: '10px', width: '100%' }}>
          {[{ val: '8가지', lbl: '학습 모드' }, { val: '무료', lbl: '모든 기능' }, { val: 'AI', lbl: '단어 추출' }].map(s => (
            <div key={s.lbl} style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '12px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-text-primary)' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px', paddingBottom: '8px' }}>
        <button onClick={onFinish} style={{ width: '100%', height: '52px', background: 'var(--color-text-primary)', color: 'var(--color-bg)', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>
          첫 단어장 만들기 →
        </button>
        <button onClick={onFinish} style={{ width: '100%', height: '44px', background: 'transparent', border: '1.5px solid var(--color-border)', borderRadius: '14px', fontSize: '14px', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
          나중에 할게요
        </button>
      </div>
      </div>
    </div>
  )
}
