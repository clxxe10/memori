'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Check, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { applyMyColor } from '@/lib/colorUtils'
import { isPremium } from '@/lib/premium'
import { usePagePadding } from '@/lib/responsive'
import { useBreakpoint } from '@/hooks/useBreakpoint'

export default function ProfilePage() {
  const router = useRouter()
  const pagePadding = usePagePadding()
  const bp = useBreakpoint()
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
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(10)
  const [notificationTime, setNotificationTime] = useState('09:00')
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      let { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // 세션 복구 시도
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { user: retryUser } } = await supabase.auth.getUser()
        if (!retryUser) return
        user = retryUser
      }
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
      const savedNotif = localStorage.getItem('notification_enabled')
      const savedNotifTime = localStorage.getItem('notification_time')
      setTheme(savedTheme)
      setMyColor(savedColor)
      applyMyColor(savedColor)
      if (savedGoal) setDailyGoal(Number(savedGoal))
      if (savedNotif !== null) setNotificationEnabled(savedNotif === 'true')
      if (savedNotifTime) setNotificationTime(savedNotifTime)

      setIsPremiumUser(await isPremium())
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
          프로필
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
              { label: '마스터 단어', value: stats.mastered },
              { label: '연속 학습일', value: `${stats.streak}일` },
              { label: '전체 단어', value: stats.total },
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
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '20px' }}>✦</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
              Memori+
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              광고 없이, 무제한으로 사용해요
            </div>
          </div>
          <button style={{
            background: 'var(--color-text-primary)', color: 'var(--color-bg)',
            border: 'none', borderRadius: '9999px',
            padding: '8px 16px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}>업그레이드</button>
        </div>

        {/* 내 계정 */}
        <p style={groupTitleStyle}>내 계정</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => router.push('/profile/edit')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>프로필 편집</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => router.push('/profile/password')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>비밀번호 변경</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 학습 및 화면 */}
        <p style={groupTitleStyle}>학습 및 화면</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => setShowGoalSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>하루 학습 목표</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => setShowNotifSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>학습 알림</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => setShowThemeSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>테마</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => setShowColorSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>마이컬러</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => setShowLangSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>언어 설정</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 지원 */}
        <p style={groupTitleStyle}>지원</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => router.push('/profile/support')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>문의하기</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle()} onClick={() => {}}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>앱 평가하기</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => router.push('/profile/notices')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>공지사항</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 로그아웃 - 별도 카드 */}
        <div style={{ ...groupCardStyle, marginTop: '8px' }}>
          <div style={{ ...menuRowStyle(true), justifyContent: 'center' }}
            onClick={() => setShowLogoutSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>로그아웃</span>
          </div>
        </div>

        {/* 계정 탈퇴 - 맨 아래 텍스트 링크 */}
        <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '20px' }}>
          <button onClick={() => setShowDeleteSheet(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', color: 'var(--color-text-secondary)',
            textDecoration: 'underline',
          }}>계정 탈퇴</button>
        </div>

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
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>테마</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['시스템', '라이트', '다크'].map(t => (
                <div key={t} onClick={() => handleThemeChange(t)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                    border: `1.5px solid ${theme === t ? 'var(--color-my)' : 'var(--color-border)'}`,
                    background: theme === t ? 'var(--color-my)' : 'var(--color-surface)',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 600, color: theme === t ? 'var(--color-my-contrast)' : 'var(--color-text-primary)' }}>{t}</span>
                  {theme === t && <Check size={18} color="var(--color-my-contrast)" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 마이컬러 바텀시트 */}
      {showColorSheet && (
        <>
          <div onClick={() => setShowColorSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>마이컬러</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: '14px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>기본 모드</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>라이트=검정, 다크=흰색 자동 적용</div>
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
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>컬러 선택</div>
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

      {/* 언어 설정 바텀시트 */}
      {showLangSheet && (
        <>
          <div onClick={() => setShowLangSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 201,
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>언어 설정</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {['한국어', 'English'].map(lang => (
                <div key={lang}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '14px',
                    border: `1.5px solid ${lang === '한국어' ? 'var(--color-my)' : 'var(--color-border)'}`,
                    background: lang === '한국어' ? 'var(--color-my)' : 'var(--color-surface)',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 600, color: lang === '한국어' ? 'var(--color-my-contrast)' : 'var(--color-text-primary)' }}>{lang}</span>
                  {lang === '한국어' && <Check size={18} color="var(--color-my-contrast)" />}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
              다국어 지원은 업데이트 예정이에요
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
      {showNotifSheet && (
        <>
          <div onClick={() => setShowNotifSheet(false)}
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
              onClick={() => setShowNotifSheet(false)}
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
                  try {
                    const supabase = createClient()

                    // user state에서 직접 가져오기 (이미 fetchData에서 setUser 완료된 상태)
                    if (!user) {
                      alert('로그인 상태를 확인해주세요.')
                      return
                    }

                    // 데이터 삭제
                    await supabase.from('words').delete().eq('user_id', user.id)
                    await supabase.from('folders').delete().eq('user_id', user.id)
                    await supabase.from('user_learning_stats').delete().eq('user_id', user.id)
                    await supabase.from('user_daily_study').delete().eq('user_id', user.id)

                    // Auth 계정 삭제 시도 (세션 있을 때만)
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session?.access_token) {
                      await fetch('/api/delete-account', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${session.access_token}` }
                      })
                    }

                    await supabase.auth.signOut()
                    router.push('/login')
                  } catch (e) {
                    console.error('탈퇴 오류:', e)
                    alert('탈퇴 처리 중 오류가 발생했어요.')
                  }
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
