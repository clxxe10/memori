'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, BookOpen, GraduationCap, Search, User } from 'lucide-react'

const tabs = [
  { id: 'home', label: '홈', icon: Home, path: '/home' },
  { id: 'vocabulary', label: '단어장', icon: BookOpen, path: '/vocabulary' },
  { id: 'study', label: '학습', icon: GraduationCap, path: '/study' },
  { id: 'search', label: '검색', icon: Search, path: '/search' },
  { id: 'profile', label: '프로필', icon: User, path: '/profile' },
]

export default function TabBar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '0 16px 16px',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '40px',
        padding: '8px 8px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              style={{
                display: 'flex',
                flexDirection: isActive ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isActive ? '5px' : '0',
                padding: isActive ? '9px 16px' : '10px 14px',
                borderRadius: '30px',
                background: isActive ? 'var(--color-my)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: isActive ? 'auto' : '44px',
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)', flexShrink: 0 }}
              />
              {isActive && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-my-contrast)',
                  whiteSpace: 'nowrap',
                }}>
                  {tab.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
