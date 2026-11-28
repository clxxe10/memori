'use client'

import { useEffect } from 'react'
import { AdMob } from '@capacitor-community/admob'
import { migrateLegacyDefaultTheme, refreshMyColor } from '@/lib/colorUtils'
import { createClient } from '@/lib/supabase/client'
import { initRevenueCat } from '@/lib/revenuecat'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateLegacyDefaultTheme()

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
    applyTheme(savedTheme)
    refreshMyColor()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (localStorage.getItem('app_theme') === '시스템') {
        applyTheme('시스템')
        refreshMyColor()
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const initAdMob = async () => {
      try {
        await AdMob.initialize({
          testingDevices: [],
          initializeForTesting: false,
        })
      } catch (e) {
        console.error('AdMob 초기화 실패:', e)
      }
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        await initRevenueCat(user?.id)
      } catch (e) {
        console.error('RevenueCat 초기화 실패:', e)
      }
    }
    initAdMob()
  }, [])

  return <>{children}</>
}

export { ThemeProvider }
