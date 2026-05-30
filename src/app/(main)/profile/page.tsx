'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Pencil, Check, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { applyMyColor } from '@/lib/colorUtils'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

export default function ProfilePage() {
  const router = useRouter()
  const pagePadding = usePagePadding()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ mastered: 0, streak: 0, total: 0 })
  const [theme, setTheme] = useState('시스템')
  const [myColor, setMyColor] = useState('#1C1C1E')
  const [showThemeSheet, setShowThemeSheet] = useState(false)
  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const [showNotificationSheet, setShowNotificationSheet] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [showLogoutSheet, setShowLogoutSheet] = useState(false)
  const [showPasswordSheet, setShowPasswordSheet] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(10)
  const [notificationTime, setNotificationTime] = useState('09:00')
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const name = user.user_metadata?.nickname || user.user_metadata?.full_name || '사용자'
      setNickname(name)

      const { data: words } = await supabase
        .from('words').select('correct_count').eq('user_id', user.id)
      const { data: statsData } = await supabase
        .from('user_learning_stats').select('*').eq('user_id', user.id).single()

      setStats({
        mastered: words?.filter(w => (w.correct_count || 0) >= 1).length || 0,
        streak: statsData?.streak_days || 0,
        total: words?.length || 0,
      })

      const savedTheme = localStorage.getItem('app_theme') || '시스템'
      const savedColor = localStorage.getItem('app_my_color') || '#1C1C1E'
      const savedGoal = localStorage.getItem('daily_goal')
      const savedSound = localStorage.getItem('sound_enabled')
      const savedNotif = localStorage.getItem('notification_enabled')
      const savedNotifTime = localStorage.getItem('notification_time')
      setTheme(savedTheme)
      setMyColor(savedColor)
      applyMyColor(savedColor)
      if (savedGoal) setDailyGoal(Number(savedGoal))
      if (savedSound !== null) setSoundEnabled(savedSound === 'true')
      if (savedNotif !== null) setNotificationEnabled(savedNotif === 'true')
      if (savedNotifTime) setNotificationTime(savedNotifTime)
    }
    fetchData()
  }, [])

  const handleThemeChange = (t: string) => {
    setTheme(t)
    localStorage.setItem('app_theme', t)
    if (t === '다크') document.documentElement.classList.add('dark')
    else if (t === '라이트') document.documentElement.classList.remove('dark')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      prefersDark
        ? document.documentElement.classList.add('dark')
        : document.documentElement.classList.remove('dark')
    }
    applyMyColor(myColor)
  }

  const handleColorChange = (color: string) => {
    setMyColor(color)
    localStorage.setItem('app_my_color', color)
    applyMyColor(color)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuSectionStyle = {
    background: 'var(--color-surface)', borderRadius: '18px',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    overflow: 'hidden' as const,
    marginBottom: '12px',
  }

  const menuItemStyle = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 16px', borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer',
  }

  const menuIconStyle = (bg: string) => ({
    width: '32px', height: '32px', borderRadius: '9px',
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, fontSize: '16px',
  })

  return (
    <main style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding: pagePadding }}>

        {/* 헤더 */}
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', marginBottom: '20px' }}>
          프로필
        </h1>

        {/* 프로필 카드 */}
        <div style={{
          background: 'var(--color-surface)', borderRadius: '22px', padding: '24px 20px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          textAlign: 'center', marginBottom: '20px',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--color-surface-2)', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={32} color="var(--color-text-secondary)" />
            )}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{nickname}</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{user?.email}</div>

          {/* 통계 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: '마스터', value: stats.mastered },
              { label: '연속 학습', value: `${stats.streak}일` },
              { label: '전체 단어', value: stats.total },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'var(--color-surface-2)', borderRadius: '12px', padding: '10px 6px' }}>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/profile/edit')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 24px', borderRadius: '20px',
              background: 'var(--color-my)', color: 'var(--color-my-contrast)',
              border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600,
            }}
          >
            <Pencil size={14} />
            프로필 편집
          </button>
        </div>

        {/* 계정 설정 섹션 */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.3px' }}>계정 설정</p>
        <div style={menuSectionStyle}>
          <div style={{ ...menuItemStyle }} onClick={() => setShowPasswordSheet(true)}>
            <div style={menuIconStyle('rgba(28,28,30,0.07)')}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>비밀번호 변경</div>
            </div>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={{ ...menuItemStyle, borderBottom: 'none', cursor: 'default' }}>
            <div style={menuIconStyle('rgba(28,28,30,0.07)')}>📧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>이메일</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* 설정 섹션 */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.3px' }}>설정</p>
        <div style={menuSectionStyle}>
          <div style={{ ...menuItemStyle, borderBottom: 'none' }} onClick={() => setShowThemeSheet(true)}>
            <div style={menuIconStyle('var(--color-surface-2)')}>🎨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>테마 및 색상</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{theme} · 마이컬러</div>
            </div>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 학습 설정 섹션 */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.3px' }}>학습 설정</p>
        <div style={menuSectionStyle}>
          <div style={{ ...menuItemStyle }} onClick={() => setShowGoalSheet(true)}>
            <div style={menuIconStyle('rgba(52,199,89,0.12)')}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>하루 학습 목표</div>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginRight: '6px' }}>{dailyGoal}개</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={{ ...menuItemStyle }} onClick={() => setShowNotificationSheet(true)}>
            <div style={menuIconStyle('rgba(255,149,0,0.12)')}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>학습 알림</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {notificationEnabled ? `매일 ${notificationTime}` : '꺼짐'}
              </div>
            </div>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={{ ...menuItemStyle, borderBottom: 'none' }}>
            <div style={menuIconStyle('rgba(0,199,190,0.12)')}>🔊</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>발음 소리</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>단어 학습 시 TTS 재생</div>
            </div>
            <div
              onClick={e => {
                e.stopPropagation()
                const next = !soundEnabled
                setSoundEnabled(next)
                localStorage.setItem('sound_enabled', String(next))
              }}
              style={{
                width: '44px', height: '26px', borderRadius: '20px',
                background: soundEnabled ? 'var(--color-my)' : 'var(--color-track)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '3px',
                left: soundEnabled ? '21px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>

        {/* 내 단어장 섹션 */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.3px' }}>내 공개 단어장</p>
        <div style={menuSectionStyle}>
          <div style={{ ...menuItemStyle, borderBottom: 'none' }} onClick={() => router.push('/search?my=true')}>
            <div style={menuIconStyle('rgba(37,99,235,0.12)')}>📚</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>공개한 단어장</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>다른 사용자와 공유 중인 단어장</div>
            </div>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 지원 섹션 */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.3px' }}>지원</p>
        <div style={menuSectionStyle}>
          <div style={{ ...menuItemStyle }} onClick={() => router.push('/profile/support')}>
            <div style={menuIconStyle('rgba(175,82,222,0.12)')}>💬</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>문의하기</div>
            </div>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={{ ...menuItemStyle }} onClick={() => window.open('https://apps.apple.com', '_blank')}>
            <div style={menuIconStyle('rgba(255,149,0,0.12)')}>⭐</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>앱 평가하기</div>
            </div>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={{ ...menuItemStyle, borderBottom: 'none' }} onClick={() => router.push('/profile/notices')}>
            <div style={menuIconStyle('rgba(28,28,30,0.07)')}>📢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>공지사항</div>
            </div>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 계정 섹션 */}
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.3px' }}>계정</p>
        <div style={menuSectionStyle}>
          <div style={{ ...menuItemStyle, borderBottom: 'none' }} onClick={() => setShowDeleteSheet(true)}>
            <div style={menuIconStyle('rgba(226,75,74,0.10)')}>🗑️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#E24B4A' }}>계정 탈퇴</div>
            </div>
            <ChevronRight size={16} color="#E24B4A" />
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={() => setShowLogoutSheet(true)}
          style={{
            width: '100%', height: '52px',
            background: 'rgba(226,75,74,0.08)', color: '#E24B4A',
            border: 'none', borderRadius: '14px',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          로그아웃
        </button>

      </div>

      {/* 로그아웃 확인 바텀시트 */}
      {showLogoutSheet && (
        <>
          <div onClick={() => setShowLogoutSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👋</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                로그아웃 할까요?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                다시 로그인하면 학습 데이터가<br />그대로 유지돼요
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', height: '52px',
                  background: '#E24B4A', color: '#fff',
                  border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                로그아웃
              </button>
              <button
                onClick={() => setShowLogoutSheet(false)}
                style={{
                  width: '100%', height: '52px',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-primary)',
                  border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                취소
              </button>
            </div>
          </div>
        </>
      )}

      {/* 비밀번호 변경 바텀시트 */}
      {showPasswordSheet && (
        <>
          <div onClick={() => setShowPasswordSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>비밀번호 변경</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>현재 비밀번호</p>
                <input
                  type="password"
                  placeholder="현재 비밀번호 입력"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPasswordMsg('') }}
                  style={{
                    width: '100%', height: '52px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px', padding: '0 16px',
                    fontSize: '15px', color: 'var(--color-text-primary)',
                    outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>새 비밀번호</p>
                <input
                  type="password"
                  placeholder="새 비밀번호 (6자 이상)"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordMsg('') }}
                  style={{
                    width: '100%', height: '52px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px', padding: '0 16px',
                    fontSize: '15px', color: 'var(--color-text-primary)',
                    outline: 'none', boxSizing: 'border-box' as const,
                  }}
                />
              </div>
            </div>
            {passwordMsg && (
              <p style={{ fontSize: '13px', color: passwordMsg.includes('✓') ? '#34C759' : '#E24B4A', marginBottom: '12px' }}>{passwordMsg}</p>
            )}
            <button
              onClick={async () => {
                if (!currentPassword) { setPasswordMsg('현재 비밀번호를 입력해주세요'); return }
                if (newPassword.length < 6) { setPasswordMsg('새 비밀번호는 6자 이상이어야 해요'); return }
                if (currentPassword === newPassword) { setPasswordMsg('현재 비밀번호와 새 비밀번호가 같아요'); return }

                setChangingPassword(true)
                const supabase = createClient()

                const { data: { user } } = await supabase.auth.getUser()
                if (!user?.email) { setPasswordMsg('사용자 정보를 찾을 수 없어요'); setChangingPassword(false); return }

                const { error: signInError } = await supabase.auth.signInWithPassword({
                  email: user.email,
                  password: currentPassword,
                })

                if (signInError) {
                  setPasswordMsg('현재 비밀번호가 올바르지 않아요')
                  setChangingPassword(false)
                  return
                }

                const { error } = await supabase.auth.updateUser({ password: newPassword })
                if (error) {
                  setPasswordMsg('변경 실패: ' + error.message)
                } else {
                  setPasswordMsg('비밀번호가 변경됐어요! ✓')
                  setCurrentPassword('')
                  setNewPassword('')
                  setTimeout(() => {
                    setShowPasswordSheet(false)
                    setPasswordMsg('')
                  }, 1200)
                }
                setChangingPassword(false)
              }}
              disabled={changingPassword || !currentPassword || newPassword.length < 6}
              style={{ width: '100%', height: '52px', background: (!currentPassword || newPassword.length < 6) ? 'var(--color-surface-2)' : 'var(--color-my)', color: (!currentPassword || newPassword.length < 6) ? 'var(--color-text-tertiary)' : 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: (!currentPassword || newPassword.length < 6) ? 'not-allowed' : 'pointer', opacity: changingPassword ? 0.6 : 1 }}
            >
              {changingPassword ? '변경 중...' : '변경하기'}
            </button>
          </div>
        </>
      )}

      {/* 테마 바텀시트 */}
      {showThemeSheet && (
        <>
          <div onClick={() => setShowThemeSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>테마 및 색상</h3>

            {/* 화면 모드 */}
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>화면 모드</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {['시스템', '라이트', '다크'].map(t => (
                <div key={t} onClick={() => handleThemeChange(t)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                    border: `1.5px solid ${theme === t ? 'var(--color-my)' : 'var(--color-border)'}`,
                    background: theme === t ? 'var(--color-my)' : 'var(--color-surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {t === '시스템' ? '📱' : t === '라이트' ? '☀️' : '🌙'}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: theme === t ? 'var(--color-my-contrast)' : 'var(--color-text-primary)' }}>{t}</span>
                  </div>
                  {theme === t && <Check size={18} color="var(--color-my-contrast)" />}
                </div>
              ))}
            </div>

            {/* 마이 컬러 */}
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>마이 컬러</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                <input
                  type="color"
                  value={myColor}
                  onChange={e => handleColorChange(e.target.value)}
                  style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    border: 'none', cursor: 'pointer', padding: 0,
                    position: 'absolute', inset: 0, opacity: 0, zIndex: 1,
                  }}
                />
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'conic-gradient(#ffb3c6, #ffd6a5, #fdffb6, #caffbf, #a0c4ff, #bdb2ff, #ffb3c6)',
                  border: '2px solid var(--color-border)', cursor: 'pointer',
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>컬러 선택</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: myColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{myColor}</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
              밝은 색상 선택 시 텍스트가 자동으로 검정색으로 바뀌어요
            </p>
          </div>
        </>
      )}

      {/* 학습 목표 바텀시트 */}
      {showGoalSheet && (
        <>
          <div onClick={() => setShowGoalSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>하루 학습 목표</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>하루에 몇 개의 단어를 학습할까요?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {[5, 10, 15, 20, 30, 50].map(n => (
                <button key={n} onClick={() => setDailyGoal(n)}
                  style={{
                    width: 'calc(33% - 7px)', height: '52px',
                    borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: dailyGoal === n ? 'var(--color-my)' : 'var(--color-surface-2)',
                    color: dailyGoal === n ? 'var(--color-my-contrast)' : 'var(--color-text-primary)',
                    fontSize: '16px', fontWeight: 700,
                  }}
                >
                  {n}개
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                localStorage.setItem('daily_goal', String(dailyGoal))
                setShowGoalSheet(false)
              }}
              style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
            >
              저장하기
            </button>
          </div>
        </>
      )}

      {/* 알림 설정 바텀시트 */}
      {showNotificationSheet && (
        <>
          <div onClick={() => setShowNotificationSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>학습 알림</h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: '14px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>매일 알림</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>설정한 시간에 학습 리마인더</p>
              </div>
              <div onClick={() => {
                const next = !notificationEnabled
                setNotificationEnabled(next)
                localStorage.setItem('notification_enabled', String(next))
              }}
                style={{ width: '44px', height: '26px', borderRadius: '20px', background: notificationEnabled ? 'var(--color-my)' : 'var(--color-track)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: notificationEnabled ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            {notificationEnabled && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>알림 시간</p>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={e => {
                    setNotificationTime(e.target.value)
                    localStorage.setItem('notification_time', e.target.value)
                  }}
                  style={{
                    width: '100%', height: '52px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px', padding: '0 16px',
                    fontSize: '18px', fontWeight: 700,
                    color: 'var(--color-text-primary)', outline: 'none',
                    boxSizing: 'border-box' as const,
                  }}
                />
              </div>
            )}

            <button
              onClick={() => setShowNotificationSheet(false)}
              style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
            >
              완료
            </button>
          </div>
        </>
      )}

      {/* 계정 탈퇴 바텀시트 */}
      {showDeleteSheet && (
        <>
          <div onClick={() => setShowDeleteSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>계정을 탈퇴할까요?</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                모든 단어장과 학습 데이터가<br />영구적으로 삭제돼요.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) return
                  await supabase.from('words').delete().eq('user_id', user.id)
                  await supabase.from('folders').delete().eq('user_id', user.id)
                  await supabase.from('user_learning_stats').delete().eq('user_id', user.id)
                  await supabase.from('user_daily_study').delete().eq('user_id', user.id)
                  await supabase.auth.signOut()
                  router.push('/login')
                }}
                style={{ width: '100%', height: '52px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
              >
                탈퇴하기
              </button>
              <button
                onClick={() => setShowDeleteSheet(false)}
                style={{ width: '100%', height: '52px', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                취소
              </button>
            </div>
          </div>
        </>
      )}

    </main>
  )
}
