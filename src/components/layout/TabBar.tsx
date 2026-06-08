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
    const check = () => setIsDesktop(window.innerWidth >= 1280)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isActive = (path: string) => pathname.startsWith(path)

  if (isDesktop) {
    return (
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '240px', background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        padding: '32px 16px', zIndex: 100,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '40px', paddingLeft: '12px' }}>
          Memori
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {TABS.map(tab => {
            const active = isActive(tab.path)
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '12px', border: 'none',
                  background: active ? 'var(--color-my)' : 'transparent',
                  color: active ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)',
                  cursor: 'pointer', fontSize: '15px', fontWeight: active ? 700 : 400,
                  transition: 'all 0.15s', textAlign: 'left' as const, width: '100%',
                }}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>
    )
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 20, left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--color-surface)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '40px', padding: '10px 8px',
      display: 'flex', justifyContent: 'space-around',
      alignItems: 'center', gap: '4px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      zIndex: 100,
      width: 'min(calc(100% - 48px), 500px)',
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
              background: active ? 'var(--color-my)' : 'transparent',
              color: active ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)',
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
