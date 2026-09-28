import { createClient } from '@/lib/supabase/client'

// 프리미엄 여부 확인
export async function isPremium(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    return user.user_metadata?.is_premium === true
  } catch {
    return false
  }
}

// 오늘 사진 추출 횟수
export function getTodayExtractCount(): number {
  const today = new Date().toISOString().split('T')[0]
  return Number(localStorage.getItem(`extract_${today}`) || 0)
}

// 사진 추출 횟수 증가
export function incrementExtractCount(): void {
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(`extract_${today}`, String(getTodayExtractCount() + 1))
}

export function getTodayPdfCount(): number {
  const today = new Date().toISOString().split('T')[0]
  return Number(localStorage.getItem(`pdf_extract_${today}`) || 0)
}

export function incrementPdfCount(): void {
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem(`pdf_extract_${today}`, String(getTodayPdfCount() + 1))
}

// 사진 추출 가능 여부
export async function canUsePhotoExtract(): Promise<{
  canUse: boolean
  isPremiumUser: boolean
  needAd: boolean
  remaining: number
}> {
  const premium = await isPremium()
  if (premium) return { canUse: true, isPremiumUser: true, needAd: false, remaining: 999 }
  const count = getTodayExtractCount()
  if (count < 3) return { canUse: true, isPremiumUser: false, needAd: false, remaining: 3 - count }
  return { canUse: false, isPremiumUser: false, needAd: true, remaining: 0 }
}

// PDF 추출 가능 여부
export async function canUsePdfExtract(): Promise<{
  canUse: boolean
  isPremiumUser: boolean
  needAd: boolean
}> {
  const premium = await isPremium()
  if (premium) return { canUse: true, isPremiumUser: true, needAd: false }
  const count = getTodayPdfCount()
  if (count < 1) return { canUse: true, isPremiumUser: false, needAd: false }
  return { canUse: false, isPremiumUser: false, needAd: true }
}
