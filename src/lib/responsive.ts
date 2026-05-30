'use client'

import { useEffect, useState } from 'react'

export const CONTENT_MAX_WIDTH = 'min(680px, 100%)'

export function getPadding(bottom = '0'): string {
  if (typeof window === 'undefined') return `52px 20px ${bottom}`
  if (window.innerWidth >= 1024) return `40px 40px ${bottom}`
  if (window.innerWidth >= 768) return `48px 32px ${bottom}`
  return `52px 20px ${bottom}`
}

export function usePagePadding(bottom = '0') {
  const [padding, setPadding] = useState(`52px 20px ${bottom}`)

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
