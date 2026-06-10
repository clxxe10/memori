'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const GOALS = ['5개', '10개', '15개', '20개', '30개', '50개']
const TIMES = ['오전 7:00', '오전 8:00', '오전 9:00', '오후 6:00', '오후 8:00', '오후 10:00']

export default function Slide4({ onNext, onBack, email, name }: { onNext: () => void; onBack: () => void; email: string; name: string }) {
  const [goal, setGoal] = useState('10개')
  const [notifOn, setNotifOn] = useState(true)
  const [time, setTime] = useState('오전 8:00')
  const [myColor, setMyColor] = useState('#1C1C1E')
  const [showGoalDrop, setShowGoalDrop] = useState(false)
  const [showTimeDrop, setShowTimeDrop] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleNext = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_learning_stats').upsert({
          user_id: user.id,
          daily_goal: parseInt(goal.replace('개', '')),
          notification_enabled: notifOn,
          notification_time: time,
        }, { onConflict: 'user_id' })
      }
      localStorage.setItem('my-color', myColor)
      document.documentElement.style.setProperty('--color-my', myColor)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
      onNext()
    }
  }

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
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '24px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '5px', borderRadius: '3px', background: i === 4 ? 'var(--color-text-primary)' : 'var(--color-border)', width: i === 4 ? '18px' : '5px' }} />
        ))}
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '6px' }}>
        나만의 루틴을<br/>설정해봐요
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>나중에 언제든지 바꿀 수 있어요</p>

      {/* 하루 목표 */}
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <div onClick={() => { setShowGoalDrop(p => !p); setShowTimeDrop(false) }}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>하루 목표</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(28,28,30,0.07)', borderRadius: '8px', padding: '5px 10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{goal}</span>
            <span style={{ fontSize: '10px' }}>{showGoalDrop ? '▲' : '▼'}</span>
          </div>
        </div>
        {showGoalDrop && (
          <div style={{ position: 'absolute', top: '58px', left: 0, right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50 }}>
            {GOALS.map((g, i) => (
              <button key={g} onClick={() => { setGoal(g); setShowGoalDrop(false) }}
                style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: goal === g ? 'var(--color-surface-2)' : 'transparent', border: 'none', borderBottom: i < GOALS.length - 1 ? '1px solid var(--color-border)' : 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: goal === g ? 700 : 400 }}>
                {g}{goal === g && <span style={{ color: 'var(--color-my)' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 알림 */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '14px 16px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: notifOn ? '12px' : 0 }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>학습 알림</span>
          <div onClick={() => setNotifOn(p => !p)} style={{ width: '44px', height: '24px', borderRadius: '20px', background: notifOn ? 'var(--color-text-primary)' : 'var(--color-border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: '3px', left: notifOn ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: notifOn ? 'var(--color-bg)' : 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
          </div>
        </div>
        {notifOn && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--color-border)', position: 'relative' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>알림 시간</span>
            <div onClick={() => { setShowTimeDrop(p => !p); setShowGoalDrop(false) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(28,28,30,0.07)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{time}</span>
              <span style={{ fontSize: '10px' }}>{showTimeDrop ? '▲' : '▼'}</span>
            </div>
            {showTimeDrop && (
              <div style={{ position: 'absolute', top: '44px', right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '140px' }}>
                {TIMES.map((t, i) => (
                  <button key={t} onClick={() => { setTime(t); setShowTimeDrop(false) }}
                    style={{ width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: time === t ? 'var(--color-surface-2)' : 'transparent', border: 'none', borderBottom: i < TIMES.length - 1 ? '1px solid var(--color-border)' : 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: time === t ? 700 : 400 }}>
                    {t}{time === t && <span style={{ color: 'var(--color-my)' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 마이컬러 */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '14px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>마이컬러</p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>앱 포인트 색상을 설정해요</p>
          </div>
          <div style={{ position: 'relative', width: '36px', height: '36px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: myColor, border: '2px solid var(--color-border)' }} />
            <input type="color" value={myColor} onChange={e => setMyColor(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['#1C1C1E','#007AFF','#34C759','#FF9500','#FF3B30','#AF52DE','#FF2D55','#5AC8FA'].map(color => (
            <div key={color} onClick={() => setMyColor(color)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, cursor: 'pointer', border: myColor === color ? '2px solid var(--color-text-primary)' : '2px solid transparent', boxShadow: myColor === color ? `0 0 0 2px var(--color-bg), 0 0 0 4px ${color}` : '0 1px 4px rgba(0,0,0,0.15)', transition: 'all 0.15s' }} />
          ))}
          <div style={{ position: 'relative', width: '28px', height: '28px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'conic-gradient(#ffb3c6,#ffd6a5,#fdffb6,#caffbf,#a0c4ff,#bdb2ff,#ffb3c6)', border: '2px solid var(--color-border)' }} />
            <input type="color" value={myColor} onChange={e => setMyColor(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      <button onClick={handleNext} disabled={saving} style={{ width: '100%', height: '52px', background: 'var(--color-text-primary)', color: 'var(--color-bg)', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
        {saving ? '저장 중...' : '다음 →'}
      </button>
      </div>
    </div>
  )
}
