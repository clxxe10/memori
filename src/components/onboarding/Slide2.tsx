'use client'

export default function Slide2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const features = [
    {
      icon: '📸',
      title: 'AI 사진 단어 추출',
      desc: '사진 한 장으로 단어장 완성',
      mockup: (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(var(--color-text-primary-rgb, 0,0,0), 0.07)',
              border: '0.5px solid rgba(var(--color-text-primary-rgb, 0,0,0), 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                <rect x="1" y="3.5" width="18" height="14" rx="3.5" stroke="var(--color-text-primary)" strokeWidth="1.3" opacity="0.6"/>
                <path d="M6.5 3.5 L7.5 1.5 L12.5 1.5 L13.5 3.5" stroke="var(--color-text-primary)" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
                <circle cx="10" cy="10.5" r="3.5" stroke="var(--color-text-primary)" strokeWidth="1.3" opacity="0.6"/>
                <circle cx="10" cy="10.5" r="1.2" fill="var(--color-text-primary)" opacity="0.4"/>
              </svg>
            </div>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4h6M5 2l2 2-2 2" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ height: '5px', borderRadius: '3px', background: 'var(--color-border)', width: '100%' }} />
              <div style={{ height: '5px', borderRadius: '3px', background: 'var(--color-border)', width: '80%' }} />
              <div style={{ height: '5px', borderRadius: '3px', background: 'var(--color-border)', width: '90%' }} />
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: '🃏',
      title: '8가지 학습 모드',
      desc: '모두 무료',
      mockup: (
        <div style={{ width: '100%', marginTop: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '8px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '4px' }}>
            <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginBottom: '4px', width: '60%' }} />
            <div style={{ height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', width: '80%' }} />
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '8px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transform: 'translateX(8px) rotate(2deg)', opacity: 0.6 }}>
            <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginBottom: '4px', width: '70%' }} />
            <div style={{ height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', width: '50%' }} />
          </div>
        </div>
      ),
    },
    {
      icon: '🔁',
      title: '장기기억 복습',
      desc: 'SRS 알고리즘',
      mockup: (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {[0,1,2,0,1,3,2, 1,0,2,3,1,0,2, 2,3,1,2,0,1,3].map((level, i) => (
              <div key={i} style={{
                aspectRatio: '1',
                borderRadius: '3px',
                background: level === 0 ? 'rgba(0,0,0,0.06)' :
                            level === 1 ? 'rgba(0,122,255,0.2)' :
                            level === 2 ? 'rgba(0,122,255,0.5)' : '#007AFF',
              }} />
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: '🎨',
      title: '마이컬러',
      desc: '내 취향대로 꾸며요',
      mockup: (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '3px', borderRadius: '8px', overflow: 'hidden' }}>
              {['#FF3B30','#FF9500','#FFCC00','#34C759','#007AFF','#AF52DE'].map(c => (
                <div key={c} style={{ flex: 1, height: '12px', background: c }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#007AFF', outline: '2px solid rgba(0,122,255,0.3)', outlineOffset: '2px', flexShrink: 0 }} />
              <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: '#007AFF', opacity: 0.3 }} />
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--color-bg)',
      padding: '52px 20px 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* 도트 */}
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '24px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '4px', borderRadius: '2px', background: i === 2 ? 'var(--color-text-primary)' : 'var(--color-border)', width: i === 2 ? '20px' : '4px', transition: 'all 0.3s' }} />
        ))}
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '20px' }}>
        암기의 방식을<br/>완전히 바꿔드려요
      </h1>

      {/* 카드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '18px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{f.icon}</span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{f.title}</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: '4px' }}>{f.desc}</div>
            {f.mockup}
          </div>
        ))}
      </div>

      {/* 화살표 버튼 */}
      <button onClick={onNext} style={{
        position: 'fixed', bottom: '40px', right: '28px',
        width: '52px', height: '52px', borderRadius: '50%',
        background: 'var(--color-text-primary)', color: 'var(--color-bg)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 100,
      }}>
        →
      </button>
    </div>
  )
}
