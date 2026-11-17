import { checkPremium } from '@/lib/revenuecat'

export const FREE_PHOTO_EXTRACT_PER_MONTH = 3

/** 로컬 시간 기준 연-월 키 (예: '2026-11') */
export function getMonthKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// 프리미엄 여부 확인
export async function isPremium(): Promise<boolean> {
  try {
    return await checkPremium()
  } catch (e) {
    return false
  }
}

// 이번 달 사진 추출 사용 횟수
export function getMonthExtractCount(): number {
  return Number(localStorage.getItem(`extract_month_${getMonthKey()}`) || 0)
}

// 사진 추출 횟수 증가
export function incrementExtractCount(): void {
  localStorage.setItem(
    `extract_month_${getMonthKey()}`,
    String(getMonthExtractCount() + 1),
  )
}

// 이번 달 광고 보상 보너스 횟수
export function getMonthExtractBonus(): number {
  return Number(localStorage.getItem(`extract_bonus_${getMonthKey()}`) || 0)
}

// 광고 1회 = 보너스 1회 추가
export function addExtractBonus(): void {
  localStorage.setItem(
    `extract_bonus_${getMonthKey()}`,
    String(getMonthExtractBonus() + 1),
  )
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
  const count = getMonthExtractCount()
  const bonus = getMonthExtractBonus()
  const limit = FREE_PHOTO_EXTRACT_PER_MONTH + bonus
  if (count < limit) {
    return {
      canUse: true,
      isPremiumUser: false,
      needAd: false,
      remaining: limit - count,
    }
  }
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
