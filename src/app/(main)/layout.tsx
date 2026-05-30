import type { ReactNode } from 'react'

import TabBar from '@/components/layout/TabBar'

type MainLayoutProps = {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-bg pb-24">
      <main className="mx-auto w-full max-w-md px-5 py-6">{children}</main>
      <TabBar />
    </div>
  )
}
