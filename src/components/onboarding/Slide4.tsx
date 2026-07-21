'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyMyColor } from '@/lib/colorUtils'

export default function Slide4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [myColor, setMyColor] = useState('#007AFF')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slide4FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s4-card { animation: slide4FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const handleNext = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_learning_stats').upsert({
          user_id: user.id,
          daily_goal: 10,
          notification_enabled: false,
          notification_time: '오전 8:00',
        }, { onConflict: 'user_id' })
      }
      localStorage.setItem('app_my_color', myColor)
      applyMyColor(myColor)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
      onNext()
    }
  }

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
          .s4-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .s4-card-inner { background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)) !important; border-color: rgba(255,255,255,0.12) !important; }
          .s4-title { color: #FFFFFF !important; }
          .s4-sub { color: rgba(235,235,245,0.6) !important; }
          .s4-back { background: rgba(120,120,128,0.24) !important; color: rgba(255,255,255,0.7) !important; }
          .s4-dot { background: rgba(235,235,245,0.22) !important; }
          .s4-hex { color: rgba(235,235,245,0.6) !important; }
        }
      `}</style>

      <div className="s4-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      }} />

      {/* 상단 바 */}
      <div style={{
        position: 'fixed', top: '66px', left: '20px', right: '20px',
        height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 10,
      }}>
        <button className="s4-back" onClick={onBack} style={{
          width: '32px', height: '32px', borderRadius: '9999px',
          background: 'rgba(120,120,128,0.10)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', color: 'rgba(60,60,67,0.65)',
        }}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className={i !== 4 ? 's4-dot' : ''} style={{
              width: i === 4 ? '18px' : '6px', height: '6px',
              borderRadius: '9999px',
              background: i === 4 ? myColor : 'rgba(60,60,67,0.18)',
              transition: 'width 300ms cubic-bezier(0.32,0.72,0,1), background 200ms ease',
            }} />
          ))}
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* 글래스 카드 */}
      <div className="s4-card s4-card-inner" style={{
        width: 'calc(100% - 48px)', maxWidth: '360px',
        background: 'linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        padding: '32px 26px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '20px',
        position: 'relative', zIndex: 1,
      }}>
        {/* 아이콘 배지 */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.9), rgba(255,255,255,.5))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>🎨</div>

        <div style={{ textAlign: 'center' }}>
          <h2 className="s4-title" style={{
            fontSize: '21px', fontWeight: 700, letterSpacing: '-0.4px',
            margin: '0 0 6px', color: '#0B0B0C',
          }}>나만의 컬러를 골라보세요</h2>
          <p className="s4-sub" style={{
            fontSize: '14px', color: 'rgba(60,60,67,0.55)', margin: 0,
          }}>앱 전체에 적용되는 포인트 색상이에요</p>
        </div>

        {/* 컬러 휠 */}
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <input
            type="color"
            value={myColor}
            onChange={e => setMyColor(e.target.value)}
            style={{
              width: '150px', height: '150px', borderRadius: '50%',
              border: 'none', cursor: 'pointer', padding: 0,
              position: 'absolute', inset: 0, opacity: 0, zIndex: 1,
            }}
          />
          <div style={{
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'conic-gradient(#ffb3c6, #ffd6a5, #fdffb6, #caffbf, #a0c4ff, #bdb2ff, #ffb3c6)',
            border: '2px solid rgba(60,60,67,0.12)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: myColor, border: '3px solid #fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              transition: 'background 200ms ease',
            }} />
          </div>
        </div>

        {/* HEX 프리뷰 */}
        <p className="s4-hex" style={{
          fontSize: '13px', color: 'rgba(60,60,67,0.55)',
          margin: 0, letterSpacing: '0.5px',
        }}>{myColor.toUpperCase()}</p>
      </div>

      {/* 하단 버튼 */}
      <button onClick={handleNext} disabled={saving} style={{
        position: 'fixed',
        bottom: 'max(52px, calc(env(safe-area-inset-bottom) + 32px))',
        left: '28px', right: '28px',
        height: '52px', borderRadius: '9999px',
        background: myColor,
        color: '#FFFFFF',
        border: 'none', cursor: 'pointer',
        fontSize: '16px', fontWeight: 600,
        letterSpacing: '-0.2px', zIndex: 10,
        opacity: saving ? 0.7 : 1,
        transition: 'background 200ms ease',
      }}>
        {saving ? '저장 중...' : '다음'}
      </button>
    </div>
  )
}
