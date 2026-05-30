'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

function getLocalToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLocalYesterday(): string {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TimeTracker() {
  const startTimeRef = useRef<number>(Date.now())
  const accumulatedRef = useRef<number>(0)
  const isVisibleRef = useRef<boolean>(true)

  const saveTime = async (seconds: number) => {
    if (seconds < 5) return
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const today = getLocalToday()

      const { data: existing, error: fetchError } = await supabase
        .from('user_daily_study')
        .select('id, study_time')
        .eq('user_id', user.id)
        .eq('study_date', today)
        .maybeSingle()

      if (fetchError) {
        console.error('TimeTracker fetch 오류:', fetchError)
        return
      }

      if (existing) {
        await supabase
          .from('user_daily_study')
          .update({ study_time: (existing.study_time || 0) + seconds })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('user_daily_study')
          .insert({
            user_id: user.id,
            study_date: today,
            words_studied: 0,
            study_time: seconds,
          })
      }

      const yesterdayStr = getLocalYesterday()

      const { data: stats, error: statsError } = await supabase
        .from('user_learning_stats')
        .select('id, total_study_time, last_study_date, streak_days')
        .eq('user_id', user.id)
        .maybeSingle()

      if (statsError) {
        console.error('TimeTracker stats 오류:', statsError)
        return
      }

      let newStreak = 1
      if (stats) {
        const last = stats.last_study_date
        if (last === today) newStreak = stats.streak_days || 1
        else if (last === yesterdayStr) newStreak = (stats.streak_days || 0) + 1
        else newStreak = 1

        await supabase
          .from('user_learning_stats')
          .update({
            total_study_time: (stats.total_study_time || 0) + seconds,
            last_study_date: today,
            streak_days: newStreak,
          })
          .eq('id', stats.id)
      } else {
        await supabase
          .from('user_learning_stats')
          .insert({
            user_id: user.id,
            total_study_time: seconds,
            last_study_date: today,
            streak_days: 1,
            total_words: 0,
          })
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      if (message.includes('fetch')) return
      console.error('TimeTracker 오류:', e)
    }
  }

  useEffect(() => {
    startTimeRef.current = Date.now()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        accumulatedRef.current += elapsed
        isVisibleRef.current = false
        void saveTime(accumulatedRef.current)
        accumulatedRef.current = 0
      } else {
        startTimeRef.current = Date.now()
        isVisibleRef.current = true
      }
    }

    const handleBeforeUnload = () => {
      if (isVisibleRef.current) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        accumulatedRef.current += elapsed
      }
    }

    const interval = setInterval(async () => {
      if (isVisibleRef.current) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        const total = accumulatedRef.current + elapsed
        await saveTime(total)
        accumulatedRef.current = 0
        startTimeRef.current = Date.now()
      }
    }, 60000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(interval)
      if (isVisibleRef.current) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        accumulatedRef.current += elapsed
      }
      saveTime(accumulatedRef.current)
    }
  }, [])

  return null
}
