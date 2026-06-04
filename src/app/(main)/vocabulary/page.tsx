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
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'
import SelectDropdown from '@/components/ui/SelectDropdown'

type Folder = {
  id: string
  name: string
  icon: string
  color?: string
  category?: string
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
  const [creating, setCreating] = useState(false)
  const [newFolder, setNewFolder] = useState({
    name: '',
    icon: '📚',
    color: '#B8D4FF',
    category: '',
    language: '영어',
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
      const finalIcon = newFolder.icon.trim() || '📚'

      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: newFolder.name.trim(),
          icon: finalIcon,
          color: newFolder.color,
          category: finalCategory || null,
          language: newFolder.language,
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
            icon: finalIcon,
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
        icon: '📚',
        color: '#B8D4FF',
        category: '',
        language: '영어',
        is_public: false,
      })
      setShowModal(false)
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
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding: pagePadding }}>
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
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>단어장이 없어요</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>아래 + 버튼으로 첫 단어장을 만들어보세요</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {filtered.map((folder) => {
              const total = folder.word_count || 0
              const mastered = folder.mastered_count || 0
              const percent = total > 0 ? Math.round((mastered / total) * 100) : 0

              return (
                <div
                  key={folder.id}
                  onClick={() => router.push(`/vocabulary/${folder.id}`)}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: '18px',
                    padding: '14px 16px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '13px',
                      background: folder.color ? `${folder.color}80` : 'rgba(28,28,30,0.09)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '22px',
                    }}
                  >
                    {folder.icon || '📚'}
                  </div>
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
                    {folder.category && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>{folder.category}</p>}
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

      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--color-my)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(28,28,30,0.35)',
          zIndex: 40,
        }}
      >
        <Plus size={22} color="var(--color-my-contrast)" />
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
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>새 단어장</span>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--color-surface-2)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} color="var(--color-text-secondary)" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', marginBottom: '16px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '18px',
                background: newFolder.color + '80',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '4px', flexShrink: 0,
                border: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: '26px' }}>{newFolder.icon || '📚'}</span>
                <span style={{
                  fontSize: '8px', fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  maxWidth: '70px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}>
                  {newFolder.name || '단어장'}
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>단어장 이름</p>
                  <input
                    value={newFolder.name}
                    onChange={e => setNewFolder(f => ({ ...f, name: e.target.value }))}
                    placeholder="이름 입력..."
                    style={{
                      width: '100%', height: '34px',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px', padding: '0 12px',
                      fontSize: '14px', color: 'var(--color-text-primary)',
                      outline: 'none', boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>아이콘</p>
                  <input
                    value={newFolder.icon}
                    onChange={e => setNewFolder(f => ({ ...f, icon: e.target.value.slice(0, 4) }))}
                    placeholder="이모지 입력..."
                    style={{
                      width: '100%', height: '34px',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px', padding: '0 12px',
                      fontSize: '18px', color: 'var(--color-text-primary)',
                      outline: 'none', boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>배경 컬러</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="color"
                    value={newFolder.color}
                    onChange={e => setNewFolder(f => ({ ...f, color: e.target.value }))}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, opacity: 0, position: 'absolute', inset: 0, zIndex: 1 }}
                  />
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'conic-gradient(#ffb3c6,#ffd6a5,#fdffb6,#caffbf,#a0c4ff,#bdb2ff,#ffb3c6)',
                    border: '2px solid var(--color-border)', cursor: 'pointer',
                  }} />
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: newFolder.color + '80', border: '1px solid var(--color-border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{newFolder.color}</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>카테고리</p>
            <div style={{ marginBottom: '16px' }}>
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

            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>학습 언어</p>
            <div style={{ marginBottom: '16px' }}>
              <SelectDropdown
                value={newFolder.language}
                onChange={val => setNewFolder(f => ({ ...f, language: val }))}
                options={[
                  { value: '영어', label: '영어', flag: '🇺🇸' },
                  { value: '한국어', label: '한국어', flag: '🇰🇷' },
                  { value: '일본어', label: '일본어', flag: '🇯🇵' },
                  { value: '중국어', label: '중국어', flag: '🇨🇳' },
                  { value: '프랑스어', label: '프랑스어', flag: '🇫🇷' },
                  { value: '스페인어', label: '스페인어', flag: '🇪🇸' },
                  { value: '독일어', label: '독일어', flag: '🇩🇪' },
                  { value: '기타', label: '기타', flag: '🌐' },
                ]}
                placeholder="학습 언어 선택"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-bg)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>공개</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>다른 사용자에게 공개</p>
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
                width: '100%',
                height: '50px',
                background: 'var(--color-my)',
                color: 'var(--color-my-contrast)',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 700,
                opacity: creating || !newFolder.name.trim() ? 0.6 : 1,
                cursor: newFolder.name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {creating ? '만드는 중...' : '만들기'}
            </button>
          </div>
        </>
      )}
    </main>
  )
}
