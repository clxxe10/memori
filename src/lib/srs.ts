// Supabase SQL Editor에서 아래 실행 필요:
// alter table words add column if not exists next_review_date date;
// alter table words add column if not exists review_interval int default 0;
// alter table words add column if not exists ease_factor float default 2.5;
// alter table user_learning_stats add column if not exists streak_days int default 0;
// alter table user_learning_stats add column if not exists last_study_date date;

// SM-2 기반 간격반복 알고리즘
export function calculateNextReview(
  correctCount: number,
  currentInterval: number,
  easeFactor: number,
  isCorrect: boolean
): { nextInterval: number; nextEaseFactor: number; nextReviewDate: string } {
  let newInterval = currentInterval
  let newEaseFactor = easeFactor || 2.5

  if (isCorrect) {
    if (currentInterval === 0) newInterval = 1
    else if (currentInterval === 1) newInterval = 3
    else newInterval = Math.round(currentInterval * newEaseFactor)
    newEaseFactor = Math.max(1.3, newEaseFactor + 0.1)
  } else {
    newInterval = 0
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2)
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + newInterval)
  const nextReviewDate = nextDate.toISOString().split('T')[0]

  return { nextInterval: newInterval, nextEaseFactor: newEaseFactor, nextReviewDate }
}

export function getTodayReviewCount(words: Array<{
  next_review_date: string | null
  correct_count: number
}>): number {
  const today = new Date().toISOString().split('T')[0]
  return words.filter(w => {
    if (!w.next_review_date) return true
    return w.next_review_date <= today
  }).length
}
