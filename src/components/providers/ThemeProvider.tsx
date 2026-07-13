'use client'

import { useEffect } from 'react'
import { applyMyColor } from '@/lib/colorUtils'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 테마 적용
    const applyTheme = (savedTheme: string) => {
      if (savedTheme === '다크') {
        document.documentElement.classList.add('dark')
      } else if (savedTheme === '라이트') {
        document.documentElement.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        prefersDark
          ? document.documentElement.classList.add('dark')
          : document.documentElement.classList.remove('dark')
      }
    }

    const savedTheme = localStorage.getItem('app_theme') || '시스템'
    const savedColor = localStorage.getItem('app_my_color') || '#1C1C1E'
    applyTheme(savedTheme)

    if (savedTheme === '기본') {
      const isDark = document.documentElement.classList.contains('dark')
      applyMyColor(isDark ? '#FFFFFF' : '#1C1C1E')
    } else {
      applyMyColor(savedColor)
    }

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (localStorage.getItem('app_theme') === '시스템') {
        applyTheme('시스템')
        applyMyColor(localStorage.getItem('app_my_color') || '#1C1C1E')
      }
      if (localStorage.getItem('app_theme') === '기본') {
        applyTheme('기본')
        const isDark = document.documentElement.classList.contains('dark')
        applyMyColor(isDark ? '#FFFFFF' : '#1C1C1E')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <>{children}</>
}

export { ThemeProvider }
