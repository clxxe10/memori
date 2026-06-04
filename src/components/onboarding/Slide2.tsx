'use client'

const features = [
  {
    icon: '📸',
    title: '사진 한 장으로 단어장 완성',
    desc: '하나하나 입력할 필요 없어요',
    badge: 'AI 자동 추출',
  },
  {
    icon: null,
    title: '8가지 학습 모드, 모두 무료',
    desc: '플래시카드부터 스피드까지',
    badge: '모두 무료',
    grid: true,
  },
  {
    icon: null,
    title: '장기기억 복습 시스템',
    desc: '잊을 때 딱 알려줘요',
    badge: 'SRS 알고리즘',
    srs: true,
  },
  {
    icon: null,
    title: '나만의 컬러 커스터마이징',
    desc: '내 취향대로 꾸며요',
    badge: '무료 제공',
    color: true,
  },
]

export default function Slide2({ onNext, onSkip: _onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '52px 24px 40px' }}>

      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: '5px', borderRadius: '3px',
            background: i === 2 ? 'var(--color-text-primary)' : 'var(--color-border)',
            width: i === 2 ? '18px' : '5px',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '20px' }}>
        암기의 방식을<br/>완전히 바꿔드려요
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1, marginBottom: '20px' }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '14px 12px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.5) inset',
          }}>
            <div style={{ fontSize: '24px', lineHeight: 1 }}>
              {f.icon && f.icon}
              {f.grid && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', width: '28px' }}>
                  {['🃏', '⚡', '🎯', '✏️'].map((e, j) => <span key={j} style={{ fontSize: '12px' }}>{e}</span>)}
                </div>
              )}
              {f.srs && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12 C4 7.6 7.6 4 12 4 C16.4 4 20 7.6 20 12" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 12 C20 16.4 16.4 20 12 20 C7.6 20 4 16.4 4 12" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2"/>
                  <polyline points="17,2 20,5 17,5" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {f.color && (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="var(--color-border)" strokeWidth="6"/>
                  <path d="M12 3 A9 9 0 0 1 21 12" stroke="#FF6B6B" strokeWidth="6" fill="none"/>
                  <path d="M21 12 A9 9 0 0 1 12 21" stroke="#FFD93D" strokeWidth="6" fill="none"/>
                  <path d="M12 21 A9 9 0 0 1 3 12" stroke="#6BCB77" strokeWidth="6" fill="none"/>
                  <path d="M3 12 A9 9 0 0 1 12 3" stroke="#4D96FF" strokeWidth="6" fill="none"/>
                  <circle cx="12" cy="12" r="4" fill="var(--color-surface)"/>
                </svg>
              )}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px', lineHeight: 1.3 }}>{f.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>{f.desc}</div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(28,28,30,0.07)', borderRadius: '20px',
              padding: '2px 8px', fontSize: '10px', fontWeight: 600,
              color: 'var(--color-text-primary)', width: 'fit-content',
            }}>
              {f.badge}
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
