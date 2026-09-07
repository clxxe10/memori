'use client'
import TabBar from '@/components/layout/TabBar'
import ToastContainer from '@/components/ui/Toast'
import { usePathname } from 'next/navigation'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <>
      <main style={{ minHeight: '100vh' }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          animation: 'pageEnter 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}>
          {children}
        </div>
        <ToastContainer />
      </main>
      <TabBar />
    </>
  )
}
