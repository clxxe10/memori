// Supabase SQL Editor에서 실행:
// alter table user_daily_study add column if not exists study_time int default 0;
// alter table user_learning_stats add column if not exists daily_goal int default 10;
// alter table user_learning_stats add column if not exists notification_enabled boolean default true;
// alter table user_learning_stats add column if not exists notification_time text default '오전 8:00';
// alter table user_learning_stats add column if not exists total_study_time int default 0;
// alter table user_learning_stats add column if not exists total_words int default 0;

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

export async function recordStudyProgress(wordsStudied: number) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = getLocalToday()

    const { data: existing } = await supabase
      .from('user_daily_study')
      .select('*')
      .eq('user_id', user.id)
      .eq('study_date', today)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('user_daily_study')
        .update({ words_studied: (existing.words_studied || 0) + wordsStudied })
        .eq('user_id', user.id)
        .eq('study_date', today)
    } else {
      await supabase
        .from('user_daily_study')
        .insert({ user_id: user.id, study_date: today, words_studied: wordsStudied, study_time: 0 })
    }

    const yesterdayStr = getLocalYesterday()

    const { data: stats } = await supabase
      .from('user_learning_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    let newStreak = 1
    if (stats) {
      const last = stats.last_study_date
      console.log('last_study_date:', last, 'today:', today, 'yesterday:', yesterdayStr)

      if (last === today) {
        newStreak = stats.streak_days || 1
      } else if (last === yesterdayStr) {
        newStreak = (stats.streak_days || 0) + 1
      } else {
        newStreak = 1
      }

      const { error } = await supabase
        .from('user_learning_stats')
        .update({
          last_study_date: today,
          streak_days: newStreak,
          total_words: (stats.total_words || 0) + wordsStudied,
        })
        .eq('user_id', user.id)
      if (error) console.error('stats update 오류:', error)
      else console.log('스트릭 업데이트:', newStreak, '일')
    } else {
      const { error } = await supabase
        .from('user_learning_stats')
        .insert({
          user_id: user.id,
          last_study_date: today,
          streak_days: 1,
          total_words: wordsStudied,
          total_study_time: 0,
        })
      if (error) console.error('stats insert 오류:', error)
      else console.log('첫 학습 기록 완료')
    }
    console.log('단어 기록 완료:', wordsStudied, '개')
  } catch (e) {
    console.error('recordStudyProgress 오류:', e)
  }
}
