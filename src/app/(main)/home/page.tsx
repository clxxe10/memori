'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Play, BookOpen, Clock } from 'lucide-react'
import { CONTENT_MAX_WIDTH, useIsDesktop, usePagePadding } from '@/lib/responsive'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reviewCount, setReviewCount] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [masteredWords, setMasteredWords] = useState(0)
  const [studyTimeToday, setStudyTimeToday] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [weeklyData, setWeeklyData] = useState<number[]>([0,0,0,0,0,0,0])
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

        // 주간 학습 데이터
        const { data: dailyStudy } = await supabase
          .from('user_daily_study')
          .select('study_date, words_studied, study_time')
          .eq('user_id', user.id)
          .order('study_date', { ascending: false })
          .limit(7)

        console.log('주간 데이터:', dailyStudy)

        if (dailyStudy && dailyStudy.length > 0) {
          const weekData = [0, 0, 0, 0, 0, 0, 0]
          const todayDate = new Date()

          dailyStudy.forEach(d => {
            const date = new Date(d.study_date)
            const diffTime = todayDate.getTime() - date.getTime()
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays < 7) {
              let dayIdx = date.getDay() - 1
              if (dayIdx < 0) dayIdx = 6
              weekData[dayIdx] = (weekData[dayIdx] || 0) + (d.words_studied || 0)
            }
          })

          console.log('weekData:', weekData)
          setWeeklyData(weekData)
        }

        const todayStudy = dailyStudy?.find(d => d.study_date === today)
        if (todayStudy) {
          setStudyTimeToday(todayStudy.study_time || 0)
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
  }, [])

  const nickname = user?.user_metadata?.nickname ||
    user?.user_metadata?.full_name?.split(' ')[0] || '사용자'

  const maxWeekly = Math.max(...weeklyData, 1)
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

        {/* 주간 차트 */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '16px', border: '1px solid var(--color-border)', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', margin: '0 0 12px' }}>이번 주 학습량</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '52px', marginBottom: '6px' }}>
            {weeklyData.map((val, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: '5px 5px 0 0',
                background: val > 0 ? 'var(--color-my)' : 'var(--color-track)',
                height: `${Math.max((val / maxWeekly) * 100, val > 0 ? 10 : 5)}%`,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {DAYS.map((d) => (
              <div key={d} style={{ flex: 1, fontSize: '9px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>{d}</div>
            ))}
          </div>
        </div>

        {/* 오늘의 단어 */}
        {todayWord && (
          <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-my)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
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
