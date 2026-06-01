'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Play, BookOpen, Clock, ChevronRight } from 'lucide-react'
import { CONTENT_MAX_WIDTH, useIsDesktop, usePagePadding } from '@/lib/responsive'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [masteredWords, setMasteredWords] = useState(0)
  const [studyTimeToday, setStudyTimeToday] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [folders, setFolders] = useState<Array<{ id: string; name: string; icon: string; color?: string; word_count: number }>>([])
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({})
  const [todayWord, setTodayWord] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pagePadding = usePagePadding()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUser(user)

        const now = new Date()
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

        // 전체 단어 통계
        const { data: words } = await supabase
          .from('words')
          .select('correct_count, next_review_date, difficulty, created_at, word, meaning, part_of_speech, pronunciation')
          .eq('user_id', user.id)

        if (words) {
          setTotalWords(words.length)
          setMasteredWords(words.filter(w => (w.correct_count || 0) >= 1).length)

          const reviewWords = words.filter(w => {
            if (w.difficulty === 'hard') return true
            if (!w.next_review_date) return false
            return w.next_review_date <= today
          })
          setReviewCount(reviewWords.length)

          const latestWord = words.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
          if (latestWord) setTodayWord(latestWord)
        }

        const { data: todayStudy } = await supabase
          .from('user_daily_study')
          .select('study_time')
          .eq('user_id', user.id)
          .eq('study_date', today)
          .maybeSingle()

        setStudyTimeToday(todayStudy?.study_time || 0)

        const { data: folderData } = await supabase
          .from('folders')
          .select('id, name, icon, color')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (folderData) {
          const foldersWithCount = await Promise.all(
            folderData.map(async (f) => {
              const { count } = await supabase
                .from('words')
                .select('*', { count: 'exact', head: true })
                .eq('folder_id', f.id)
              return { ...f, word_count: count || 0 }
            })
          )
          setFolders(foldersWithCount)
        }

        // 학습 통계
        const { data: stats } = await supabase
          .from('user_learning_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (stats) {
          setStreakDays(stats.streak_days || 0)
        } else {
          setStreakDays(0)
        }
      } catch (e) {
        console.error('홈 데이터 로딩 오류:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const handleFocus = () => fetchData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  useEffect(() => {
    const fetchMonthData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const year = calendarMonth.getFullYear()
      const month = calendarMonth.getMonth()
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data: monthData } = await supabase
        .from('user_daily_study')
        .select('study_date, words_studied')
        .eq('user_id', user.id)
        .gte('study_date', firstDay)
        .lte('study_date', lastDay)

      if (monthData) {
        const dataMap: Record<string, number> = {}
        monthData.forEach(d => { dataMap[d.study_date] = d.words_studied || 0 })
        setMonthlyData(dataMap)
      }
    }
    fetchMonthData()
  }, [calendarMonth])

  const nickname = user?.user_metadata?.nickname ||
    user?.user_metadata?.full_name?.split(' ')[0] || '사용자'

  const progress = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0

  const hours = Math.floor(studyTimeToday / 3600)
  const minutes = Math.floor((studyTimeToday % 3600) / 60)
  const timeDisplay = studyTimeToday < 60 ? `${studyTimeToday}s` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding: pagePadding }}>

        {/* 상단 인사말 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px', margin: 0 }}>안녕하세요 👋</p>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', margin: '4px 0 0' }}>
              {nickname}님
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'var(--color-my)', borderRadius: '20px', padding: '5px 10px',
            }}>
              <span style={{ fontSize: '12px' }}>🔥</span>
              <span style={{ fontSize: '11px', color: 'var(--color-my-contrast)', fontWeight: 700 }}>{streakDays}일</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E8EAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{nickname[0]?.toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>

        {/* 복습 배너 카드 */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-my-light) 0%, color-mix(in srgb, var(--color-surface) 60%, transparent) 100%)',
          borderRadius: '22px', padding: '20px', marginBottom: '12px',
          border: '1.5px solid var(--color-my-light)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', margin: 0 }}>오늘 복습할 단어</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '40px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{reviewCount}</span>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>개</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/study/review')}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Play size={12} fill="currentColor" />
              복습 시작
            </button>
          </div>
          <div style={{ height: '5px', background: 'var(--color-track)', borderRadius: '5px', marginBottom: '6px' }}>
            <div style={{ height: '5px', background: 'var(--color-my)', borderRadius: '5px', width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
            전체 {totalWords}개 중 {masteredWords}개 마스터 · {progress}%
          </p>
        </div>

        {totalWords === 0 && (
          <div
            onClick={() => router.push('/vocabulary')}
            style={{
              background: 'var(--color-surface)',
              borderRadius: '20px', padding: '20px',
              border: '1.5px dashed var(--color-border)',
              textAlign: 'center', cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📚</div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              첫 단어장을 만들어볼까요?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px', whiteSpace: 'pre-line' }}>
              사진 한 장으로 단어를 추출하거나{'\n'}직접 입력해서 시작해보세요
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--color-my)', color: 'var(--color-my-contrast)',
              padding: '10px 20px', borderRadius: '20px',
              fontSize: '14px', fontWeight: 600,
            }}>
              단어장 만들기 →
            </div>
          </div>
        )}

        {/* 통계 카드 2개 */}
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr 1fr 1fr' : '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { icon: BookOpen, label: '마스터 단어', value: masteredWords.toString() },
            { icon: Clock, label: '총 학습시간', value: timeDisplay },
          ].map((item) => (
            <div key={item.label} style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px', border: '1px solid var(--color-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '22px', height: '3px', background: 'var(--color-my)', borderRadius: '3px', marginBottom: '8px' }} />
              <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.3px', marginBottom: '3px', margin: 0 }}>
                {item.value}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* 내 단어장 바로가기 */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--color-border)', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>내 단어장</p>
            <span
              onClick={() => router.push('/vocabulary')}
              style={{ fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            >
              전체보기 →
            </span>
          </div>

          {folders.length === 0 ? (
            <div
              onClick={() => router.push('/vocabulary')}
              style={{ textAlign: 'center', padding: '16px 0', cursor: 'pointer' }}
            >
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>단어장을 만들어보세요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {folders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => router.push(`/vocabulary/${folder.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px',
                    background: 'var(--color-surface-2)',
                    borderRadius: '12px', cursor: 'pointer',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: folder.color ? `${folder.color}60` : 'rgba(28,28,30,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                  }}>
                    {folder.icon || '📚'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {folder.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                      {folder.word_count}개 단어
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--color-text-tertiary)" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 학습 캘린더 */}
        {(() => {
          const year = calendarMonth.getFullYear()
          const month = calendarMonth.getMonth()
          const firstDayOfWeek = new Date(year, month, 1).getDay()
          const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const today = new Date()
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

          const monthStudyDays = Object.keys(monthlyData).filter(d => monthlyData[d] > 0).length
          const monthTotalWords = Object.values(monthlyData).reduce((a, b) => a + b, 0)
          const attendanceRate = daysInMonth > 0 ? Math.round((monthStudyDays / Math.min(today.getDate(), daysInMonth)) * 100) : 0

          const maxWords = Math.max(...Object.values(monthlyData), 1)

          const getLevel = (dateStr: string) => {
            const w = monthlyData[dateStr] || 0
            if (w === 0) return 0
            if (w < maxWords * 0.25) return 1
            if (w < maxWords * 0.5) return 2
            if (w < maxWords * 0.75) return 3
            return 4
          }

          const levelColors = [
            'var(--color-surface-2)',
            'rgba(28,28,30,0.15)',
            'rgba(28,28,30,0.35)',
            'rgba(28,28,30,0.60)',
            'rgba(28,28,30,0.85)',
          ]
          const levelTextColors = ['var(--color-text-tertiary)', 'var(--color-text-primary)', '#fff', '#fff', '#fff']

          return (
            <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--color-border)', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>📅 학습 캘린더</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                    style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'var(--color-surface-2)', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >‹</button>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {year}년 {month + 1}월
                  </span>
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                    disabled={year === today.getFullYear() && month >= today.getMonth()}
                    style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'var(--color-surface-2)', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: year === today.getFullYear() && month >= today.getMonth() ? 0.3 : 1 }}
                  >›</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
                {['월', '화', '수', '목', '금', '토', '일'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '10px' }}>
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const level = getLevel(dateStr)
                  const isToday = dateStr === todayStr
                  const isFuture = dateStr > todayStr
                  return (
                    <div key={day} style={{
                      aspectRatio: '1',
                      borderRadius: '5px',
                      background: isFuture ? 'transparent' : levelColors[level],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', fontWeight: 500,
                      color: isFuture ? 'var(--color-text-tertiary)' : levelTextColors[level],
                      outline: isToday ? '2px solid var(--color-my)' : 'none',
                      outlineOffset: '1px',
                      opacity: isFuture ? 0.3 : 1,
                    }}>
                      {day}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '10px' }}>
                <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>적음</span>
                {levelColors.map((c, i) => (
                  <div key={i} style={{ width: '12px', height: '12px', borderRadius: '3px', background: c, border: i === 0 ? '1px solid var(--color-border)' : 'none' }} />
                ))}
                <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>많음</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { val: `${monthStudyDays}일`, lbl: '학습일' },
                  { val: `${monthTotalWords}개`, lbl: '학습 단어' },
                  { val: `${attendanceRate}%`, lbl: '출석률' },
                ].map(s => (
                  <div key={s.lbl} style={{ background: 'var(--color-surface-2)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.val}</div>
                    <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        <div
          onClick={() => router.push('/study/speed')}
          style={{
            background: 'var(--color-surface)',
            borderRadius: '16px', padding: '14px 16px',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer', marginBottom: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(251,191,36,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
            🚀
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>스피드 모드</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#B45309', background: 'rgba(251,191,36,0.12)', borderRadius: '6px', padding: '1px 6px' }}>NEW</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>단어가 내려오기 전에 맞혀보세요!</p>
          </div>
          <ChevronRight size={16} color="var(--color-text-tertiary)" />
        </div>

        {/* 오늘의 단어 */}
        {todayWord && (
          <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-my)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px', margin: '0 0 6px' }}>오늘의 단어</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{todayWord.word}</span>
              {todayWord.part_of_speech && (
                <span style={{ background: 'rgba(28,28,30,0.07)', color: 'var(--color-text-primary)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', fontWeight: 600 }}>
                  {todayWord.part_of_speech}
                </span>
              )}
            </div>
            {todayWord.pronunciation && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '2px', margin: '2px 0' }}>{todayWord.pronunciation}</p>}
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>{todayWord.meaning}</p>
          </div>
        )}

      </div>
    </main>
  )
}
