'use client'
export default function Slide1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 28px 48px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '8px' }}>
          <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1.5px' }}>Memori</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-text-primary)', marginBottom: '4px', display: 'inline-block' }} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', lineHeight: 1.2, textAlign: 'center', margin: 0 }}>
          단어 학습,<br/>더 스마트하게
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
          사진 한 장으로 단어장을 만들고<br/>나만의 방식으로 외워요
        </p>
      </div>
      <button onClick={onNext} style={{
        width: '100%', height: '52px',
        background: 'var(--color-text-primary)', color: 'var(--color-bg)',
        border: 'none', borderRadius: '14px',
        fontSize: '16px', fontWeight: 800, cursor: 'pointer',
      }}>
        시작하기 →
      </button>
    </div>
  )
}
