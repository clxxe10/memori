'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { applyMyColor } from '@/lib/colorUtils'
import { usePagePadding } from '@/lib/responsive'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import AlertModal from '@/components/AlertModal'
import { useTranslation } from '@/lib/i18n'

export default function ProfilePage() {
  const router = useRouter()
  const pagePadding = usePagePadding()
  const bp = useBreakpoint()
  const { lang, setLang, t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ mastered: 0, streak: 0, total: 0 })
  const [theme, setTheme] = useState('시스템')
  const [myColor, setMyColor] = useState('#1C1C1E')
  const [useDefaultColor, setUseDefaultColor] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('app_my_color') === null ||
      !localStorage.getItem('app_my_color')
  })
  const [showThemeSheet, setShowThemeSheet] = useState(false)
  const [showColorSheet, setShowColorSheet] = useState(false)
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const [showNotifSheet, setShowNotifSheet] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [showLogoutSheet, setShowLogoutSheet] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(10)
  const [notificationTime, setNotificationTime] = useState('09:00')
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      let user = null

      // 1차 시도
      const { data: { user: user1 } } = await supabase.auth.getUser()
      if (user1) {
        user = user1
      } else {
        // 2차: refreshSession 후 재시도
        await supabase.auth.refreshSession()
        await new Promise(resolve => setTimeout(resolve, 300))
        const { data: { user: user2 } } = await supabase.auth.getUser()
        if (user2) {
          user = user2
        } else {
          // 3차: getSession에서 직접 추출
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            user = session.user
          }
        }
      }

      if (!user) { router.push('/login'); return }
      setUser(user)
      const name = user.user_metadata?.nickname
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.user_metadata?.preferred_username
        || user.email?.split('@')[0]
        || '사용자'
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
      const savedNotif = localStorage.getItem('notification_enabled')
      const savedNotifTime = localStorage.getItem('notification_time')
      setTheme(savedTheme)
      setMyColor(savedColor)
      applyMyColor(savedColor)
      if (savedGoal) setDailyGoal(Number(savedGoal))
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

  const handleDefaultToggle = () => {
    const next = !useDefaultColor
    setUseDefaultColor(next)
    if (next) {
      const isDark = document.documentElement.classList.contains('dark')
      const defaultColor = isDark ? '#FFFFFF' : '#1C1C1E'
      handleColorChange(defaultColor)
      localStorage.setItem('app_theme', '기본')
    } else {
      localStorage.setItem('app_theme', theme)
      handleColorChange(myColor)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/onboarding')
  }

  const groupTitleStyle = {
    fontSize: '13px', fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: '8px', letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  }

  const groupCardStyle = {
    background: 'var(--color-surface)',
    borderRadius: '22px',
    overflow: 'hidden' as const,
    marginBottom: '8px',
  }

  const menuRowStyle = (isLast = false) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '15px 16px',
    borderBottom: isLast ? 'none' : '0.5px solid var(--color-border)',
    cursor: 'pointer',
  })

  return (
    <main style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: bp === 'mobile' ? '100%' : '600px', margin: '0 auto', padding: pagePadding }}>

        {/* 헤더 */}
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', marginBottom: '20px' }}>
          {t.profile.title}
        </h1>

        {/* 프로필 히어로 카드 */}
        <div style={{
          background: `linear-gradient(160deg, var(--color-my) 0%, color-mix(in srgb, var(--color-my) 70%, #000) 100%)`,
          borderRadius: '28px',
          padding: '24px 20px 20px',
          marginBottom: '20px',
          boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 상단: 아바타 + 이름/이메일 + 화살표 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}
            onClick={() => router.push('/profile/edit')}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: '#FFFFFF',
              flexShrink: 0,
            }}>
              {nickname.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                {nickname}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
          </div>

          {/* 하단: 통계 3개 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { label: t.profile.mastered, value: stats.mastered },
              { label: t.profile.streak, value: `${stats.streak}일` },
              { label: t.profile.total, value: stats.total },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.14)',
                borderRadius: '14px', padding: '12px 10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memori+ 배너 */}
        <div onClick={() => router.push('/profile/premium')} style={{
          background: 'var(--color-surface)',
          borderRadius: '22px', padding: '16px',
          marginBottom: '24px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '14px',
          border: '0.5px solid var(--color-border)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="memori-plus-icon-box" style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '20px', color: '#FFFFFF', lineHeight: 1 }}>✦</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
              Memori+
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {t.profile.premiumDesc}
            </div>
          </div>
          <button style={{
            background: 'var(--color-text-primary)', color: 'var(--color-bg)',
            border: 'none', borderRadius: '9999px',
            padding: '8px 16px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}>{t.profile.upgrade}</button>
        </div>

        {/* 내 계정 */}
        <p style={groupTitleStyle}>{t.profile.myAccount}</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => router.push('/profile/edit')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.editProfile}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => router.push('/profile/password')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.changePassword}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 학습 및 화면 */}
        <p style={groupTitleStyle}>{t.profile.learningScreen}</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => setShowGoalSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.dailyGoal}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => setShowNotifSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.notifications}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => setShowThemeSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.theme}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => setShowColorSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.myColor}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => setShowLangSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.language}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 지원 */}
        <p style={groupTitleStyle}>{t.profile.support}</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => router.push('/profile/support')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.contact}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => window.open('https://apps.apple.com/app/memori/id6785504180', '_blank')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.rateApp}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => router.push('/profile/notices')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.notices}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 로그아웃 - 별도 카드 */}
        <div style={{ ...groupCardStyle, marginTop: '8px' }}>
          <div style={{ ...menuRowStyle(true), justifyContent: 'center' }}
            onClick={() => setShowLogoutSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.profile.logout}</span>
          </div>
        </div>

        {/* 계정 탈퇴 - 맨 아래 텍스트 링크 */}
        <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '20px' }}>
          <button onClick={() => setShowDeleteSheet(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', color: 'var(--color-text-secondary)',
            textDecoration: 'underline',
          }}>{t.profile.deleteAccount}</button>
        </div>

      </div>

      {/* 로그아웃 확인 바텀시트 */}
      {showLogoutSheet && (
        <AlertModal
          title={t.profile.logoutConfirm}
          description={t.profile.logoutDesc}
          confirmText={t.profile.logout}
          isDestructive={true}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutSheet(false)}
        />
      )}

      {/* 테마 모달 */}
      {showThemeSheet && (
        <>
          <div onClick={() => setShowThemeSheet(false)} style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: document.documentElement.classList.contains('dark') ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.16)',
          }} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 201,
            background: document.documentElement.classList.contains('dark')
              ? 'linear-gradient(165deg, rgba(70,68,80,0.5), rgba(20,18,26,0.55))'
              : '#FEFEFF',
            backdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            WebkitBackdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            boxShadow: document.documentElement.classList.contains('dark')
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.16), 0 24px 48px rgba(0,0,0,0.6)'
              : '0 24px 48px rgba(31,38,60,0.18)',
            border: document.documentElement.classList.contains('dark')
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(0,0,0,0.04)',
            borderRadius: '26px',
            padding: '24px 20px 20px',
            maxHeight: '80vh', overflowY: 'auto' as const,
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>{t.profile.theme}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: '시스템', label: t.profile.system },
                { value: '라이트', label: t.profile.light },
                { value: '다크', label: t.profile.dark },
              ].map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className={`setting-option${theme === opt.value ? ' selected' : ''}`}
                >
                  <span>{opt.label}</span>
                  {theme === opt.value && <Check size={18} className="check-icon" color="currentColor" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 마이컬러 모달 */}
      {showColorSheet && (
        <>
          <div onClick={() => setShowColorSheet(false)} style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: document.documentElement.classList.contains('dark') ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.16)',
          }} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 201,
            background: document.documentElement.classList.contains('dark')
              ? 'linear-gradient(165deg, rgba(70,68,80,0.5), rgba(20,18,26,0.55))'
              : '#FEFEFF',
            backdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            WebkitBackdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            boxShadow: document.documentElement.classList.contains('dark')
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.16), 0 24px 48px rgba(0,0,0,0.6)'
              : '0 24px 48px rgba(31,38,60,0.18)',
            border: document.documentElement.classList.contains('dark')
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(0,0,0,0.04)',
            borderRadius: '26px',
            padding: '24px 20px 20px',
            maxHeight: '80vh', overflowY: 'auto' as const,
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>{t.profile.myColor}</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: '14px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.profile.defaultMode}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{t.profile.defaultModeDesc}</div>
              </div>
              <div onClick={handleDefaultToggle} style={{
                width: '44px', height: '24px', borderRadius: '20px',
                background: useDefaultColor ? 'var(--color-text-primary)' : 'var(--color-border)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: useDefaultColor ? '23px' : '3px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: useDefaultColor ? 'var(--color-bg)' : 'var(--color-surface)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                }} />
              </div>
            </div>
            {!useDefaultColor && (
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
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{t.profile.colorSelect}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: myColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{myColor}</span>
                </div>
              </div>
            </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
              밝은 색상 선택 시 텍스트가 자동으로 검정색으로 바뀌어요
            </p>
          </div>
        </>
      )}

      {/* 언어 설정 모달 */}
      {showLangSheet && (
        <>
          <div onClick={() => setShowLangSheet(false)} style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: document.documentElement.classList.contains('dark') ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.16)',
          }} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 201,
            background: document.documentElement.classList.contains('dark')
              ? 'linear-gradient(165deg, rgba(70,68,80,0.5), rgba(20,18,26,0.55))'
              : '#FEFEFF',
            backdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            WebkitBackdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            boxShadow: document.documentElement.classList.contains('dark')
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.16), 0 24px 48px rgba(0,0,0,0.6)'
              : '0 24px 48px rgba(31,38,60,0.18)',
            border: document.documentElement.classList.contains('dark')
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(0,0,0,0.04)',
            borderRadius: '26px',
            padding: '24px 20px 20px',
            maxHeight: '80vh', overflowY: 'auto' as const,
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>{t.profile.language}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {['한국어', 'English'].map(language => (
                <div
                  key={language}
                  onClick={() => {
                    const newLang = language === 'English' ? 'en' : 'ko'
                    setLang(newLang)
                    setShowLangSheet(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    border: `1.5px solid ${(language === '한국어' && lang === 'ko') || (language === 'English' && lang === 'en') ? 'var(--color-my)' : 'var(--color-border)'}`,
                    background: (language === '한국어' && lang === 'ko') || (language === 'English' && lang === 'en') ? 'var(--color-my)' : document.documentElement.classList.contains('dark') ? 'rgba(120,120,128,0.24)' : '#F5F5F7',
                  }}
                >
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: (language === '한국어' && lang === 'ko') || (language === 'English' && lang === 'en') ? 'var(--color-my-contrast)' : 'var(--color-text-primary)',
                  }}>
                    {language}
                  </span>
                  {((language === '한국어' && lang === 'ko') || (language === 'English' && lang === 'en')) &&
                    <Check size={18} color="var(--color-my-contrast)" />
                  }
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
              {t.profile.multiLangNote}
            </p>
          </div>
        </>
      )}

      {/* 학습 목표 모달 */}
      {showGoalSheet && (
        <>
          <div onClick={() => setShowGoalSheet(false)} style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: document.documentElement.classList.contains('dark') ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.16)',
          }} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 201,
            background: document.documentElement.classList.contains('dark')
              ? 'linear-gradient(165deg, rgba(70,68,80,0.5), rgba(20,18,26,0.55))'
              : '#FEFEFF',
            backdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            WebkitBackdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            boxShadow: document.documentElement.classList.contains('dark')
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.16), 0 24px 48px rgba(0,0,0,0.6)'
              : '0 24px 48px rgba(31,38,60,0.18)',
            border: document.documentElement.classList.contains('dark')
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(0,0,0,0.04)',
            borderRadius: '26px',
            padding: '24px 20px 20px',
            maxHeight: '80vh', overflowY: 'auto' as const,
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>{t.profile.dailyGoal}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>하루에 몇 개의 단어를 학습할까요?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {[5, 10, 15, 20, 30, 50].map(n => (
                <button
                  key={n}
                  onClick={() => setDailyGoal(n)}
                  className={`goal-option${dailyGoal === n ? ' selected' : ''}`}
                >
                  {n}개
                </button>
              ))}
            </div>
            <button
              className="btn-neutral-solid"
              onClick={() => {
                localStorage.setItem('daily_goal', String(dailyGoal))
                setShowGoalSheet(false)
              }}
              style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '15px' }}
            >
              {t.profile.saveGoal}
            </button>
          </div>
        </>
      )}

      {/* 알림 설정 모달 */}
      {showNotifSheet && (
        <>
          <div onClick={() => setShowNotifSheet(false)} style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: document.documentElement.classList.contains('dark') ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.16)',
          }} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 201,
            background: document.documentElement.classList.contains('dark')
              ? 'linear-gradient(165deg, rgba(70,68,80,0.5), rgba(20,18,26,0.55))'
              : '#FEFEFF',
            backdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            WebkitBackdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            boxShadow: document.documentElement.classList.contains('dark')
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.16), 0 24px 48px rgba(0,0,0,0.6)'
              : '0 24px 48px rgba(31,38,60,0.18)',
            border: document.documentElement.classList.contains('dark')
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(0,0,0,0.04)',
            borderRadius: '26px',
            padding: '24px 20px 20px',
            maxHeight: '80vh', overflowY: 'auto' as const,
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>{t.profile.notifications}</h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: '14px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{t.profile.dailyReminder}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{t.profile.dailyReminderDesc}</p>
              </div>
              <div onClick={() => {
                const next = !notificationEnabled
                setNotificationEnabled(next)
                localStorage.setItem('notification_enabled', String(next))
              }}
                className={notificationEnabled ? 'toggle-on' : undefined}
                style={{ width: '44px', height: '26px', borderRadius: '20px', background: notificationEnabled ? undefined : 'var(--color-track)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: notificationEnabled ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            {notificationEnabled && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{t.profile.notifTime}</p>
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
              className="btn-neutral-solid"
              onClick={() => setShowNotifSheet(false)}
              style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '15px' }}
            >
              {t.common.done}
            </button>
          </div>
        </>
      )}

      {/* 계정 탈퇴 바텀시트 */}
      {showDeleteSheet && (
        <AlertModal
          title={t.profile.deleteConfirm}
          description={t.profile.deleteDesc}
          confirmText="탈퇴하기"
          isDestructive={true}
          onConfirm={async () => {
            try {
              const supabase = createClient()
              if (!user) { alert('로그인 상태를 확인해주세요.'); return }
              await supabase.from('words').delete().eq('user_id', user.id)
              await supabase.from('folders').delete().eq('user_id', user.id)
              await supabase.from('user_learning_stats').delete().eq('user_id', user.id)
              await supabase.from('user_daily_study').delete().eq('user_id', user.id)
              let session = (await supabase.auth.getSession()).data.session
              if (!session) {
                const { data } = await supabase.auth.refreshSession()
                session = data.session
              }
              if (session?.access_token) {
                await fetch('/api/delete-account', {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${session.access_token}` }
                })
              }
              await supabase.auth.signOut()
              router.push('/onboarding')
            } catch (e) {
              console.error('탈퇴 오류:', e)
              alert('탈퇴 처리 중 오류가 발생했어요.')
            }
          }}
          onCancel={() => setShowDeleteSheet(false)}
        />
      )}

    </main>
  )
}
