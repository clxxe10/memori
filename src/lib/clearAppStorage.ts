import { clearAllTabCache } from '@/lib/tabCache'

/** Clear Memori app keys from localStorage (call after account deletion). */
export function clearAppLocalStorage(): void {
  if (typeof window === 'undefined') return
  clearAllTabCache()

  const exactKeys = [
    'daily_goal',
    'study_favorites',
    'app_theme',
    'app_my_color',
    'app_language',
    'notification_enabled',
    'notification_time',
    'tutorial_done',
    'coach_home_done',
    'coach_vocab_done',
    'coach_study_done',
    'coach_search_done',
    'speed_best_score',
  ]

  for (const key of exactKeys) {
    localStorage.removeItem(key)
  }

  const prefixes = ['extract_month_', 'extract_bonus_', 'pdf_extract_', 'pdf_bonus_', 'coach_']
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    if (prefixes.some((p) => key.startsWith(p))) toRemove.push(key)
  }
  for (const key of toRemove) {
    localStorage.removeItem(key)
  }
}
