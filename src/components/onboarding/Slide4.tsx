'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyMyColor } from '@/lib/colorUtils'

export default function Slide4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [myColor, setMyColor] = useState('#007AFF')
  const [saving, setSaving] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      const savedTheme = localStorage.getItem('app_theme') || '시스템'
      if (savedTheme === '다크') setIsDark(true)
      else if (savedTheme === '라이트') setIsDark(false)
      else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    checkDark()
    const style = document.createElement('style')
    style.textContent = `
      @keyframes s4FadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s4-title-anim { animation: s4FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s4-card-anim { animation: s4FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 120ms both; }
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

  const bg = isDark
    ? 'linear-gradient(160deg, #27242F 0%, #161420 30%, #0B0B11 65%, #000000 100%)'
    : 'linear-gradient(160deg, #FFFFFF 0%, #ECEDF4 35%, #E1E5EF 65%, #D3D9EB 100%)'
  const titleColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const subColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)'
  const panelBg = isDark
    ? 'linear-gradient(165deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))'
    : 'linear-gradient(165deg, rgba(255,255,255,0.75), rgba(255,255,255,0.35))'
  const panelShadow = isDark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -1px 2px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.5)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.04), 0 20px 40px rgba(31,38,60,0.1)'
  const panelBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)'
  const trackBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
  const trackFill = isDark ? 'linear-gradient(90deg, #fff, #C7C7CC)' : 'linear-gradient(90deg, #1C1C1E, #48484A)'
  const backBg = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))'
  const backShadow = isDark
    ? 'inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -2px 3px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.3)'
    : 'inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.08)'
  const backBorder = isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.6)'
  const hexColor = isDark ? 'rgba(235,235,245,0.5)' : 'rgba(60,60,67,0.5)'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
      }}>
        {/* 네비게이션 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0' }}>
          <button onClick={onBack} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: backBg, border: backBorder, boxShadow: backShadow,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDark ? 'rgba(255,255,255,0.8)' : '#1C1C1E', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{
            flex: 1, height: '6px', borderRadius: '9999px',
            background: trackBg, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            <div style={{ width: '80%', height: '100%', borderRadius: '9999px', background: trackFill }} />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="s4-title-anim" style={{ marginBottom: '28px', marginTop: 'auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: titleColor, letterSpacing: '-0.8px', margin: '0 0 10px', lineHeight: 1.15 }}>
            나만의 컬러를<br/>골라보세요
          </h1>
          <p style={{ fontSize: '17px', color: subColor, margin: 0, lineHeight: 1.4 }}>
            앱 전체에 적용되는 포인트 색상이에요
          </p>
        </div>

        {/* 글라스 카드 */}
        <div className="s4-card-anim" style={{
          background: panelBg, borderRadius: '32px',
          border: panelBorder, boxShadow: panelShadow,
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '20px',
          marginBottom: 'auto',
        }}>
          {/* 컬러 휠 */}
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <input
              type="color"
              value={myColor}
              onChange={e => setMyColor(e.target.value)}
              style={{
                width: '160px', height: '160px', borderRadius: '50%',
                border: 'none', cursor: 'pointer', padding: 0,
                position: 'absolute', inset: 0, opacity: 0, zIndex: 1,
              }}
            />
            <div style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'conic-gradient(#ffb3c6, #ffd6a5, #fdffb6, #caffbf, #a0c4ff, #bdb2ff, #ffb3c6)',
              border: isDark ? '2px solid rgba(255,255,255,0.12)' : '2px solid rgba(60,60,67,0.12)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isDark
                ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.3)'
                : 'inset 0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.08)',
            }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: myColor, border: '3px solid #fff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                transition: 'background 200ms ease',
              }} />
            </div>
          </div>

          {/* HEX 프리뷰 */}
          <p style={{ fontSize: '14px', color: hexColor, margin: 0, letterSpacing: '0.5px', fontWeight: 500 }}>
            {myColor.toUpperCase()}
          </p>

          {/* 기본 테마 버튼 */}
          <button
            onClick={() => {
              const defaultColor = isDark ? '#FFFFFF' : '#1C1C1E'
              setMyColor(defaultColor)
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(60,60,67,0.08)',
              color: isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)',
              fontSize: '14px', fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            기본 테마 사용하기
          </button>
        </div>

        {/* 하단 버튼 */}
        <div style={{ paddingTop: '20px' }}>
          <button onClick={handleNext} disabled={saving} style={{
            width: '100%', padding: '17px',
            background: myColor,
            color: '#FFFFFF',
            borderRadius: '9999px', border: 'none',
            boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.2)`,
            cursor: 'pointer', fontSize: '17px', fontWeight: 700,
            opacity: saving ? 0.7 : 1,
            transition: 'background 200ms ease',
          }}>
            {saving ? '저장 중...' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}
