'use client'
const features = [
  { icon: '📸', title: 'AI 사진 단어 추출', desc: '사진 한 장으로 단어장 완성' },
  { icon: '🃏', title: '8가지 학습 모드', desc: '플래시카드부터 스피드까지 무료' },
  { icon: '🔁', title: '장기기억 복습', desc: 'SRS 알고리즘으로 최적 타이밍' },
  { icon: '🎨', title: '나만의 커스터마이징', desc: '컬러, 목표, 알림 내 맘대로' },
]
export default function Slide2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '52px 24px 40px' }}>
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '24px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '5px', borderRadius: '3px', background: i === 2 ? 'var(--color-text-primary)' : 'var(--color-border)', width: i === 2 ? '18px' : '5px' }} />
        ))}
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '20px' }}>
        암기의 방식을<br/>완전히 바꿔드려요
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1, marginBottom: '20px' }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <span style={{ fontSize: '24px' }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '3px' }}>{f.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNext} style={{ width: '100%', height: '52px', background: 'var(--color-text-primary)', color: 'var(--color-bg)', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>
        다음 →
      </button>
    </div>
  )
}
