'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const NOTICES = [
  {
    id: 1,
    title: 'Memori 1.0 출시!',
    date: '2026.05.29',
    content: '안녕하세요! Memori가 정식 출시됐어요.\n사진 한 장으로 단어를 추출하고, 다양한 학습 모드로 효율적인 단어 암기를 경험해보세요.\n앞으로도 더 좋은 서비스로 찾아뵐게요 😊',
    isNew: true,
  },
]

export default function NoticesPage() {
  const router = useRouter()
  const [openNotice, setOpenNotice] = useState<number | null>(1)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', paddingBottom: '40px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '52px 20px 0' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>공지사항</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NOTICES.map(notice => (
            <div key={notice.id}
              style={{ background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <div
                onClick={() => setOpenNotice(openNotice === notice.id ? null : notice.id)}
                style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              >
                {notice.isNew && (
                  <span style={{ background: 'var(--color-my)', color: 'var(--color-my-contrast)', borderRadius: '6px', padding: '2px 7px', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>NEW</span>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '3px' }}>{notice.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{notice.date}</div>
                </div>
                <span style={{ fontSize: '16px', color: 'var(--color-text-tertiary)' }}>{openNotice === notice.id ? '−' : '+'}</span>
              </div>
              {openNotice === notice.id && (
                <div style={{ padding: '0 16px 16px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--color-border)', whiteSpace: 'pre-line' }}>
                  {notice.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
