'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight } from 'lucide-react'

interface Folder {
  id: string
  name: string
  description?: string
}

const MODES = ['flashcard', 'blink', 'quiz', 'typing']
const MODE_NAMES: Record<string, string> = {
  flashcard: '플래시카드',
  blink: '깜빡이',
  quiz: '퀴즈',
  typing: '타이핑',
}

export default function MemorySetPage() {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFolders = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('folders').select('id, name, description').eq('user_id', user.id)
      setFolders(data || [])
      setLoading(false)
    }
    fetchFolders()
  }, [])

  const handleSelect = (folderId: string) => {
    router.push(`/study/flashcard?folder=${folderId}&memoryset=true`)
  }

  return (
    <main style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '40px',
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px' }}>
        {/* 헤더 */}
        <div style={{
          paddingTop: 'max(60px, calc(env(safe-area-inset-top) + 16px))',
          marginBottom: '24px',
        }}>
          <button onClick={() => router.back()} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '16px', color: 'var(--color-text-secondary)',
            padding: '4px', marginBottom: '12px', display: 'block',
          }}>← 뒤로</button>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
            암기세트
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            단어장을 선택하면 4가지 모드로 순서대로 학습해요
          </p>
        </div>

        {/* 학습 순서 안내 */}
        <div style={{
          background: 'var(--vocab-card-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '16px',
          border: '0.5px solid var(--vocab-card-border)',
          borderTop: '1px solid var(--vocab-card-border-top)',
          padding: '16px 18px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', flexWrap: 'wrap' as const,
        }}>
          {MODES.map((mode, i) => (
            <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: 'var(--color-text-secondary)',
                background: 'var(--color-surface-2)',
                borderRadius: '8px', padding: '4px 10px',
              }}>
                {MODE_NAMES[mode]}
              </span>
              {i < MODES.length - 1 && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>→</span>
              )}
            </div>
          ))}
        </div>

        {/* 단어장 목록 */}
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          단어장 선택
        </h2>

        {loading ? (
          <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '40px 0' }}>불러오는 중...</p>
        ) : folders.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '40px 0' }}>단어장이 없어요</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {folders.map(folder => (
              <div key={folder.id} onClick={() => handleSelect(folder.id)}
                style={{
                  background: 'var(--vocab-card-bg)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: '16px',
                  border: '0.5px solid var(--vocab-card-border)',
                  borderTop: '1px solid var(--vocab-card-border-top)',
                  padding: '16px 18px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: folder.description ? '3px' : 0 }}>
                    {folder.name}
                  </div>
                  {folder.description && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {folder.description}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
