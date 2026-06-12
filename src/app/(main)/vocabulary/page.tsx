// Supabase SQL Editor에서 아래 실행 필요:
// alter table folders add column if not exists color text default '#B8D4FF';
// alter table folders add column if not exists category text;
// alter table folders add column if not exists is_public boolean default false;
// alter table folders add column if not exists language text default '영어';
// alter table folders add column if not exists author_nickname text;
//
// UPDATE folders f
// SET author_nickname = (
//   SELECT raw_user_meta_data->>'nickname'
//   FROM auth.users
//   WHERE id = f.user_id
// )
// WHERE author_nickname IS NULL
//   OR author_nickname LIKE 'user_%';

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus, Search, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { usePagePadding } from '@/lib/responsive'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import SelectDropdown from '@/components/ui/SelectDropdown'
import EmptyState from '@/components/ui/EmptyState'
import { showToast } from '@/components/ui/Toast'
import { FolderSkeleton } from '@/components/ui/Skeleton'
import PullToRefresh from '@/components/ui/PullToRefresh'

type Folder = {
  id: string
  name: string
  icon: string
  color?: string
  category?: string
  description?: string
  is_public?: boolean
  word_count?: number
  mastered_count?: number
}

export default function VocabularyPage() {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const pagePadding = usePagePadding()
  const bp = useBreakpoint()
  const [creating, setCreating] = useState(false)
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    category: '',
    is_public: false,
  })

  const fetchFolders = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: folderData } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!folderData) { setLoading(false); return }

    const foldersWithCount = await Promise.all(
      folderData.map(async (folder) => {
        const { data: wordData } = await supabase
          .from('words')
          .select('correct_count')
          .eq('folder_id', folder.id)
        const total = wordData?.length || 0
        const mastered = wordData?.filter(w => (w.correct_count || 0) >= 1).length || 0
        return { ...folder, word_count: total, mastered_count: mastered }
      })
    )
    setFolders(foldersWithCount)
    setLoading(false)
  }

  useEffect(() => {
    fetchFolders()
    const handleFocus = () => fetchFolders()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  useEffect(() => {
    const tabBar = document.getElementById('tab-bar')
    if (tabBar) {
      tabBar.style.display = showModal ? 'none' : ''
    }
    return () => {
      if (tabBar) tabBar.style.display = ''
    }
  }, [showModal])

  const handleCreate = async () => {
    if (!newFolder.name.trim()) return
    setCreating(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const authorNickname = user.user_metadata?.nickname ||
        user.user_metadata?.full_name ||
        `user_${user.id?.slice(0, 6)}`

      const finalCategory = newFolder.category

      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: newFolder.name.trim(),
          icon: '📚',
          color: '#1C1C1E',
          category: finalCategory || null,
          language: '영어',
          description: newFolder.description.trim() || null,
          is_public: newFolder.is_public,
          author_nickname: authorNickname,
        })
        .select()
        .single()

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name: newFolder.name.trim(),
            icon: '📚',
            color: '#1C1C1E',
            language: '영어',
            description: newFolder.description.trim() || null,
            author_nickname: authorNickname,
          })
          .select()
          .single()

        if (fallbackError) {
          alert('단어장 생성에 실패했습니다: ' + fallbackError.message)
          return
        }

        if (fallbackData) setFolders((prev) => [fallbackData, ...prev])
      } else if (data) {
        setFolders((prev) => [data, ...prev])
      }

      setNewFolder({
        name: '',
        description: '',
        category: '',
        is_public: false,
      })
      setShowModal(false)
      showToast('단어장이 만들어졌어요!')
    } catch (e) {
      console.error(e)
      alert('오류가 발생했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const filtered = folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        paddingBottom: '100px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <PullToRefresh onRefresh={async () => { await fetchFolders() }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: pagePadding }}>
        <div style={{ marginBottom: '20px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.5px',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            단어장
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>{folders.length}개의 폴더</p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            padding: '11px 14px',
            marginBottom: '16px',
          }}
        >
          <Search size={16} color="var(--color-text-tertiary)" />
          <input
            type="text"
            placeholder="단어장 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              background: 'transparent',
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4].map(i => <FolderSkeleton key={i} />)}
          </div>
        ) : folders.length === 0 ? (
          <EmptyState
            icon="📚"
            title="단어장이 없어요"
            desc="첫 단어장을 만들고 단어를 추가해봐요"
            actionLabel="단어장 만들기"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '8px',
          }}>
            {filtered.map((folder) => {
              const total = folder.word_count || 0
              const mastered = folder.mastered_count || 0
              const percent = total > 0 ? Math.round((mastered / total) * 100) : 0

              return (
                <div
                  key={folder.id}
                  className="vocab-folder-glass"
                  onClick={() => router.push(`/vocabulary/${folder.id}`)}
                  style={{
                    background: 'var(--vocab-card-bg)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderRadius: '18px',
                    padding: '14px 16px',
                    border: '0.5px solid var(--vocab-card-border)',
                    borderTop: '1px solid var(--vocab-card-border-top)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{folder.name}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--color-my)',
                          background: 'var(--color-my-light)',
                          borderRadius: '6px',
                          padding: '2px 7px',
                        }}
                      >
                        {percent}%
                      </span>
                    </div>
                    {folder.description && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.description}</p>}
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>{total}개 단어</div>
                    <div style={{ height: '3px', background: 'var(--color-surface-2)', borderRadius: '3px' }}>
                      <div style={{ height: '3px', background: 'var(--color-my)', borderRadius: '3px', width: `${percent}%` }} />
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
                </div>
              )
            })}
          </div>
        )}
      </div>
      </PullToRefresh>

      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '105px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--vocab-card-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '0.5px solid var(--vocab-card-border)',
          borderTop: '1px solid var(--vocab-card-border-top)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          zIndex: 40,
        }}
      >
        <Plus size={22} color="var(--color-text-primary)" />
      </button>

      {showModal && (
        <>
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 200,
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--color-surface)',
              borderRadius: '24px 24px 0 0',
              padding: '12px 20px 100px',
              zIndex: 201,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>

              <div style={{ width: '36px', height: '4px', background: 'var(--color-border)', borderRadius: '4px', margin: '8px auto 16px' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>새 단어장</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} color="var(--color-text-secondary)" />
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                  이름
                </label>
                <input
                  value={newFolder.name}
                  onChange={e => setNewFolder(f => ({ ...f, name: e.target.value }))}
                  placeholder="예: 토익 필수 단어"
                  style={{
                    width: '100%', height: '52px', padding: '0 16px',
                    fontSize: '16px', borderRadius: '14px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text-primary)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                  설명 <span style={{ fontWeight: 400, color: 'var(--color-text-tertiary)' }}>(선택)</span>
                </label>
                <input
                  value={newFolder.description}
                  onChange={e => setNewFolder(f => ({ ...f, description: e.target.value }))}
                  placeholder="이 단어장에 대한 간단한 설명"
                  style={{
                    width: '100%', height: '52px', padding: '0 16px',
                    fontSize: '14px', borderRadius: '14px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text-primary)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block' }}>
                  카테고리
                </label>
                <SelectDropdown
                  value={newFolder.category}
                  onChange={val => setNewFolder(f => ({ ...f, category: val }))}
                  options={[
                    { value: '수능', label: '수능' },
                    { value: '토익', label: '토익' },
                    { value: '일상', label: '일상' },
                    { value: '비즈니스', label: '비즈니스' },
                    { value: '기타', label: '기타' },
                  ]}
                  placeholder="카테고리 선택"
                />
              </div>

              <div style={{
                background: 'var(--color-surface-2)', borderRadius: '14px',
                padding: '14px 16px', marginBottom: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>전체 공개</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>다른 사용자들이 볼 수 있어요</p>
                </div>
                <div
                  onClick={() => setNewFolder((f) => ({ ...f, is_public: !f.is_public }))}
                  style={{
                    width: '44px',
                    height: '26px',
                    borderRadius: '20px',
                    background: newFolder.is_public ? 'var(--color-my)' : 'var(--color-track)',
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '3px',
                      left: newFolder.is_public ? '21px' : '3px',
                      transition: 'left 0.2s',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating || !newFolder.name.trim()}
                style={{
                  width: '100%', height: '54px',
                  background: 'var(--color-text-primary)', color: 'var(--color-bg)',
                  border: 'none', borderRadius: '16px',
                  fontSize: '16px', fontWeight: 800, cursor: 'pointer',
                  opacity: (creating || !newFolder.name.trim()) ? 0.5 : 1,
                }}
              >
                {creating ? '만드는 중...' : '단어장 만들기'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
