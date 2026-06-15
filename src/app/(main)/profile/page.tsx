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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const groupTitleStyle = {
    fontSize: '12px', fontWeight: 700,
    color: 'var(--color-text-secondary)',
    marginBottom: '8px', letterSpacing: '0.3px',
  }

  const groupCardStyle = {
    background: 'var(--vocab-card-bg)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: '18px',
    border: '0.5px solid var(--vocab-card-border)',
    borderTop: '1px solid var(--vocab-card-border-top)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
    overflow: 'hidden' as const,
    marginBottom: '16px',
  }

  const menuRowStyle = (isLast = false) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
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

        {/* 프로필 카드 */}
        <div style={{
          background: 'var(--vocab-card-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '22px', padding: '24px 20px',
          border: '0.5px solid var(--vocab-card-border)',
          borderTop: '1px solid var(--vocab-card-border-top)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
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

        </div>

        {/* 그룹 1 — 내 계정 */}
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

        {/* 그룹 2 — Memori+ */}
        <p style={groupTitleStyle}>Memori+</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle(true)} onClick={() => router.push('/profile/premium')}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Memori+ 구독</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isPremiumUser ? (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#065F46', background: '#D1FAE5', borderRadius: '6px', padding: '2px 8px' }}>구독 중</span>
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-my-contrast)', background: 'var(--color-my)', borderRadius: '6px', padding: '2px 8px' }}>업그레이드</span>
              )}
              <ChevronRight size={16} color="var(--color-text-tertiary)" />
            </div>
          </div>
        </div>

        {/* 그룹 3 — 학습 설정 */}
        <p style={groupTitleStyle}>학습 설정</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => setShowGoalSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>하루 학습 목표</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => setShowNotifSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>학습 알림</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
        </div>

        {/* 그룹 4 — 화면 */}
        <p style={groupTitleStyle}>화면</p>
        <div style={groupCardStyle}>
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

        {/* 그룹 5 — 지원 */}
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

        {/* 계정 */}
        <p style={groupTitleStyle}>계정</p>
        <div style={groupCardStyle}>
          <div style={menuRowStyle()} onClick={() => setShowDeleteSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#E24B4A' }}>계정 탈퇴</span>
            <ChevronRight size={16} color="#E24B4A" />
          </div>
          <div style={menuRowStyle(true)} onClick={() => setShowLogoutSheet(true)}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>로그아웃</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </div>
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
              {['한국어', 'English', '日本語', '中文'].map(lang => (
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
                  const res = await fetch('/api/delete-account', { method: 'DELETE' })
                  if (res.ok) {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    router.push('/login')
                  } else {
                    alert('탈퇴 처리 중 오류가 발생했어요. 다시 시도해주세요.')
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
