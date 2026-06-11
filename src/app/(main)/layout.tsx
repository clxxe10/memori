'use client'
import TabBar from '@/components/layout/TabBar'
import ToastContainer from '@/components/ui/Toast'
import { usePathname } from 'next/navigation'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <>
      <main style={{ minHeight: '100vh' }}>
        <div key={pathname} className="page-enter">
          {children}
        </div>
        <ToastContainer />
      </main>
      <TabBar />
    </>
  )
}
