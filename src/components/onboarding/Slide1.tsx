'use client'

export default function Slide1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '40px 28px',
    }}>
      {/* 로고 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '24px' }}>
        <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1.5px' }}>Memori</span>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-text-primary)', marginBottom: '4px', display: 'inline-block' }} />
      </div>

      {/* 헤드라인 */}
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', lineHeight: 1.2, textAlign: 'center', marginBottom: '12px' }}>
        단어 학습,<br/>더 스마트하게
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.6, marginBottom: '48px' }}>
        사진 한 장으로 단어장을 만들고<br/>나만의 방식으로 외워요
      </p>

      <button onClick={onNext} style={{
        position: 'fixed',
        bottom: '40px',
        right: '28px',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'var(--color-text-primary)',
        color: 'var(--color-bg)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: 100,
      }}>
        →
      </button>
    </div>
  )
}
