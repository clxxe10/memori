'use client'

import TabBar from '@/components/layout/TabBar'
import ToastContainer from '@/components/ui/Toast'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1280)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <TabBar />
      <main style={{
        flex: 1,
        marginLeft: isDesktop ? '240px' : '0',
        transition: 'margin-left 0.2s',
      }}>
        <div key={pathname} className="page-enter">
          {children}
        </div>
        <ToastContainer />
      </main>
    </div>
  )
}
