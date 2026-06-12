'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, BookOpen, GraduationCap, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'

const TABS = [
  { path: '/home', icon: Home, label: '홈' },
  { path: '/vocabulary', icon: BookOpen, label: '단어장' },
  { path: '/study', icon: GraduationCap, label: '학습' },
  { path: '/search', icon: Search, label: '검색' },
  { path: '/profile', icon: User, label: '프로필' },
]

export default function TabBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => {
      const isWide = window.innerWidth >= 1280
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
      setIsDesktop(isWide && !isTouchDevice)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isActive = (path: string) => pathname.startsWith(path)

  if (isDesktop) {
    return (
      <aside id="tab-bar" style={{
        position: 'fixed', top: '50%', left: '20px',
        transform: 'translateY(-50%)',
        width: '64px',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '0.5px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
        borderRadius: '32px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '8px',
        padding: '16px 8px',
        zIndex: 100,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }} className="tab-bar-container">
        {TABS.map(tab => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              title={tab.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '48px', height: '48px',
                borderRadius: '16px', border: 'none',
                background: active ? 'var(--color-tab-active)' : 'transparent',
                boxShadow: active ? 'inset 0 1px 3px rgba(0,0,0,0.12)' : 'none',
                backdropFilter: active ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: active ? 'blur(10px)' : 'none',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <tab.icon size={22} />
            </button>
          )
        })}
      </aside>
    )
  }

  return (
    <nav id="tab-bar" className="tab-bar-container" style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.3)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
      borderRadius: '40px', padding: '13px 8px',
      display: 'flex', flexDirection: 'row', flexWrap: 'nowrap',
      justifyContent: 'space-around',
      alignItems: 'center', gap: '4px',
      zIndex: 100,
      width: 'min(calc(100vw - 48px), 500px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {TABS.map(tab => {
        const active = isActive(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: active ? '8px 16px' : '8px',
              borderRadius: '30px', border: 'none',
              background: active ? 'var(--color-tab-active)' : 'transparent',
              boxShadow: active ? 'inset 0 1px 3px rgba(0,0,0,0.12)' : 'none',
              backdropFilter: active ? 'blur(10px)' : 'none',
              WebkitBackdropFilter: active ? 'blur(10px)' : 'none',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={18} />
            {active && (
              <span style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {tab.label}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
