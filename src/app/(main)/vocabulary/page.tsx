// Supabase SQL Editor에서 아래 실행 필요:
// alter table folders add column if not exists color text default '#B8D4FF';
// alter table folders add column if not exists category text;
// alter table folders add column if not exists is_public boolean default false;
// alter table folders add column if not exists cover_url text;
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

const COLORS = [
  '#B8D4FF',
  '#B5EAD7',
  '#FFDAC1',
  '#FFB7C5',
  '#E2C9FF',
  '#FFFACD',
  '#C9F0FF',
  '#D4EDDA',
]

export default function VocabularyPage() {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const pagePadding = usePagePadding()
  const [customIcon, setCustomIcon] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('토익')
  const [customCategory, setCustomCategory] = useState('')
  const [creating, setCreating] = useState(false)
  const [coverPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    color: '#B8D4FF',
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
    if (!form.name.trim()) return
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

      const finalCategory = selectedCategory === '기타' ? customCategory.trim() : selectedCategory
      const finalIcon = customIcon.trim() || '📚'

      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          icon: finalIcon,
          color: form.color,
          category: finalCategory || null,
          is_public: form.is_public,
          author_nickname: authorNickname,
        })
        .select()
        .single()

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name: form.name.trim(),
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

      setForm({ name: '', color: '#B8D4FF', is_public: false })
      setCustomIcon('')
      setSelectedCategory('토익')
      setCustomCategory('')
      setShowModal(false)
    } catch (e) {
      console.error(e)
      alert('오류가 발생했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const filtered = folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))

  const inputStyle = (mb = '0px') => ({
    width: '100%',
    height: '46px',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '0 12px',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: mb,
  })

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

            <div
              style={{
                width: '100%',
                height: '80px',
                borderRadius: '16px',
                background: form.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px',
                overflow: 'hidden',
              }}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="cover-preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <span style={{ fontSize: '32px' }}>{customIcon || '📚'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{form.name || '새 단어장'}</span>
                </>
              )}
            </div>

            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>단어장 이름</p>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="단어장 이름 입력"
              style={inputStyle('16px')}
            />

            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>아이콘 (이모지 또는 텍스트)</p>
            <input
              type="text"
              value={customIcon}
              maxLength={4}
              onChange={(e) => setCustomIcon(e.target.value.slice(0, 4))}
              placeholder="📚 또는 EN"
              style={inputStyle('16px')}
            />

            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>배경 컬러</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: c,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: form.color === c ? '0 0 0 2px #fff, 0 0 0 3.5px #1C1C1E' : '0 0 0 1px rgba(0,0,0,0.09)',
                  }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', padding: 0, background: 'none' }}
              />
            </div>

            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>카테고리</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {['토익', '일상', '여행', '비즈니스', '기타'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    borderRadius: '999px',
                    padding: '7px 14px',
                    border: selectedCategory === category ? '1px solid var(--color-my)' : '1px solid var(--color-border)',
                    background: selectedCategory === category ? 'var(--color-my)' : 'var(--color-bg)',
                    color: selectedCategory === category ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            {selectedCategory === '기타' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="카테고리 입력"
                style={inputStyle('16px')}
              />
            )}

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
                onClick={() => setForm((f) => ({ ...f, is_public: !f.is_public }))}
                style={{
                  width: '44px',
                  height: '26px',
                  borderRadius: '20px',
                  background: form.is_public ? 'var(--color-my)' : 'var(--color-track)',
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
                    left: form.is_public ? '21px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !form.name.trim()}
              style={{
                width: '100%',
                height: '50px',
                background: 'var(--color-my)',
                color: 'var(--color-my-contrast)',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 700,
                opacity: creating || !form.name.trim() ? 0.6 : 1,
                cursor: form.name.trim() ? 'pointer' : 'not-allowed',
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
