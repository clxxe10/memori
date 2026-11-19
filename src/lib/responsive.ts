'use client'

import { useEffect, useState } from 'react'

export const CONTENT_MAX_WIDTH = 'min(680px, 100%)'

/** Top padding includes iOS safe-area so headers clear the status bar */
export function getPadding(bottom = '0'): string {
  const topMobile = 'max(52px, calc(env(safe-area-inset-top) + 16px))'
  const topTablet = 'max(48px, calc(env(safe-area-inset-top) + 16px))'
  const topDesktop = 'max(40px, calc(env(safe-area-inset-top) + 16px))'
  if (typeof window === 'undefined') return `${topMobile} 20px ${bottom}`
  if (window.innerWidth >= 1024) return `${topDesktop} 40px ${bottom}`
  if (window.innerWidth >= 768) return `${topTablet} 32px ${bottom}`
  return `${topMobile} 20px ${bottom}`
}

export function usePagePadding(bottom = '0') {
  const [padding, setPadding] = useState(
    `max(52px, calc(env(safe-area-inset-top) + 16px)) 20px ${bottom}`
  )

  useEffect(() => {
    const update = () => setPadding(getPadding(bottom))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [bottom])

  return padding
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isDesktop
}
