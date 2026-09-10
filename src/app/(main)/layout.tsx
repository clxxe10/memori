'use client'
import TabBar from '@/components/layout/TabBar'
import ToastContainer from '@/components/ui/Toast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main style={{ minHeight: '100vh' }}>
        {/*
          pageEnter(transform) 금지: transform이 있는 조상은 position:fixed 자손의
          containing block이 되어 FAB/모달이 뷰포트 대신 스크롤 영역에 붙음.
          opacity-only pageFadeIn 사용.
        */}
        <div style={{
          width: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          animation: 'pageFadeIn 0.25s ease both',
        }}>
          {children}
        </div>
        <ToastContainer />
      </main>
      <TabBar />
    </>
  )
}
