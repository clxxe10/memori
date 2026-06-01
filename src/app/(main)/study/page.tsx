'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

const ALL_MODES = [
  {
    id: 'flashcard',
    name: '플래시카드',
    desc: '카드를 탭해서 앞뒤로 뒤집어요',
    emoji: '🃏',
    color: 'rgba(28,28,30,0.09)',
    badge: '추천',
    badgeColor: '#1C1C1E',
    badgeBg: 'rgba(28,28,30,0.08)',
  },
  {
    id: 'speed',
    name: '스피드 모드',
    desc: '단어가 내려오기 전에 뜻을 입력해요',
    emoji: '🚀',
    color: 'rgba(251,191,36,0.10)',
    badge: 'NEW',
    badgeColor: '#B45309',
    badgeBg: 'rgba(251,191,36,0.12)',
  },
  {
    id: 'blink',
    name: '깜빡이',
    desc: '단어를 빠르게 반복 노출해요',
    emoji: '⚡',
    color: 'rgba(52,199,89,0.09)',
    badge: null,
  },
  {
    id: 'quiz',
    name: '객관식 퀴즈',
    desc: '4개 보기 중 정답을 골라요',
    emoji: '📝',
    color: 'rgba(255,149,0,0.09)',
    badge: '인기',
    badgeColor: '#B86800',
    badgeBg: 'rgba(255,149,0,0.10)',
  },
  {
    id: 'typing',
    name: '타이핑',
    desc: '뜻을 보고 단어를 직접 입력해요',
    emoji: '⌨️',
    color: 'rgba(175,82,222,0.09)',
    badge: null,
  },
  {
    id: 'review',
    name: '복습',
    desc: '틀린 단어만 모아서 다시 학습해요',
    emoji: '🔁',
    color: 'rgba(226,75,74,0.09)',
    badge: null,
  },
  {
    id: 'listening',
    name: '리스닝',
    desc: '음성을 듣고 단어를 맞혀요',
    emoji: '🎧',
    color: 'rgba(0,199,190,0.09)',
    badge: null,
  },
  {
    id: 'pdf',
    name: 'PDF 시험지',
    desc: '단어 시험지를 PDF로 만들어요',
    emoji: '📄',
    color: 'rgba(28,28,30,0.06)',
    badge: null,
  },
]

export default function StudyPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'favorites' | 'all'>('favorites')
  const [favorites, setFavorites] = useState<string[]>(['flashcard', 'quiz', 'listening'])
  const [showFolderSheet, setShowFolderSheet] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [folders, setFolders] = useState<Array<{ id: string; name: string; icon: string; word_count?: number; color?: string }>>([])
  const [loadingFolders, setLoadingFolders] = useState(false)
  const pagePadding = usePagePadding()

  useEffect(() => {
    const saved = localStorage.getItem('study_favorites')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const fetchFolders = async () => {
      setLoadingFolders(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: folderData } = await supabase
        .from('folders').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!folderData) { setLoadingFolders(false); return }
      const foldersWithCount = await Promise.all(
        folderData.map(async (folder) => {
          const { count } = await supabase
            .from('words')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id)
          return { ...folder, word_count: count || 0 }
        })
      )
      setFolders(foldersWithCount)
      setLoadingFolders(false)
    }
    fetchFolders()
  }, [])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('study_favorites', JSON.stringify(next))
      return next
    })
  }

  const modes = tab === 'favorites'
    ? ALL_MODES.filter(m => favorites.includes(m.id))
    : ALL_MODES

  const handleMode = (id: string) => {
    if (id === 'pdf') {
      router.push('/study/pdf')
      return
    }
    setSelectedMode(id)
    setShowFolderSheet(true)
  }

  const handleStart = async (folderId?: string) => {
    if (!selectedMode) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('words')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (folderId) query = query.eq('folder_id', folderId)

    const { count } = await query

    if (!count || count === 0) {
      alert('단어장에 단어가 없어요! 단어를 먼저 추가해주세요.')
      return
    }

    setShowFolderSheet(false)
    const queryStr = folderId ? `?folderId=${folderId}` : ''
    router.push(`/study/${selectedMode}${queryStr}`)
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding: pagePadding }}>

        {/* 헤더 */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', margin: 0, marginBottom: '4px' }}>
            학습
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            학습 모드를 선택하세요
          </p>
        </div>

        {/* 세그먼트 탭 */}
        <div style={{
          display: 'flex', background: 'var(--color-surface-2)',
          borderRadius: '12px', padding: '3px', gap: '3px',
          marginBottom: '20px',
        }}>
          {[
            { key: 'favorites', label: '⭐ 즐겨찾기' },
            { key: 'all', label: '모든 모드' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              style={{
                flex: 1, height: '34px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: tab === t.key ? 700 : 500,
                background: tab === t.key ? 'var(--color-my)' : 'transparent',
                color: tab === t.key ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)',
                boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.09)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 모드 리스트 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
          {modes.map(mode => (
            <div
              key={mode.id}
              onClick={() => handleMode(mode.id)}
              role="button"
              style={{
                width: '100%',
                background: 'var(--color-surface)',
                borderRadius: '18px',
                padding: '14px 16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                minWidth: '46px',
                borderRadius: '14px',
                background: mode.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}>
                {mode.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{
                    fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {mode.name}
                  </span>
                  {mode.badge && (
                    <span style={{
                      fontSize: '10px', fontWeight: 600,
                      color: (mode as any).badgeColor || '#1C1C1E',
                      background: (mode as any).badgeBg || 'rgba(28,28,30,0.08)',
                      borderRadius: '6px', padding: '1px 6px',
                      flexShrink: 0,
                    }}>
                      {mode.badge}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {mode.desc}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={e => toggleFavorite(mode.id, e)}
                  style={{
                    background: 'none', border: 'none',
                    padding: '4px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Star
                    size={18}
                    fill={favorites.includes(mode.id) ? '#FFB800' : 'none'}
                    color={favorites.includes(mode.id) ? '#FFB800' : '#C7C7CC'}
                  />
                </button>
                <ChevronRight size={16} color="#C7C7CC" style={{ flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>

        {tab === 'favorites' && modes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⭐</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              즐겨찾기가 없어요
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              모든 모드 탭에서 별을 눌러 추가하세요
            </p>
          </div>
        )}

        {tab === 'favorites' && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: '16px' }}>
            모든 모드 탭에서 6가지 학습법을 볼 수 있어요
          </p>
        )}

      </div>

      {showFolderSheet && (
        <>
          <div
            onClick={() => setShowFolderSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 100px', zIndex: 200,
            maxHeight: '75vh', display: 'flex', flexDirection: 'column',
          }}>
            {selectedMode === 'review' ? (
              <>
                <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>복습 시작</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>어떤 단어를 복습할까요?</p>
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleStart()}
                    style={{
                      width: '100%', background: 'rgba(28,28,30,0.06)',
                      borderRadius: '16px', padding: '16px',
                      border: '1.5px solid rgba(28,28,30,0.12)',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(28,28,30,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🔁</div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>전체 복습</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>틀린 단어 전체를 복습해요</div>
                    </div>
                  </button>
                  {loadingFolders ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>불러오는 중...</div>
                  ) : (
                    folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => (folder.word_count || 0) > 0 ? handleStart(folder.id) : undefined}
                        style={{
                          width: '100%', background: 'var(--color-surface)',
                          borderRadius: '16px', padding: '14px 16px',
                          border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', gap: '12px',
                          cursor: (folder.word_count || 0) === 0 ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          opacity: (folder.word_count || 0) === 0 ? 0.4 : 1,
                        }}
                      >
                        <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: folder.color ? `${folder.color}60` : 'rgba(28,28,30,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                          {folder.icon || '📚'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{folder.name}</div>
                          <div style={{ fontSize: '12px', color: (folder.word_count || 0) === 0 ? '#E24B4A' : 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {(folder.word_count || 0) === 0 ? '단어 없음' : `${folder.word_count}개 단어`}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  단어장 선택
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  학습할 단어장을 선택하세요
                </p>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  <button
                    onClick={() => handleStart()}
                    style={{
                      width: '100%', background: 'rgba(28,28,30,0.06)',
                      borderRadius: '16px', padding: '14px 16px',
                      border: '1.5px solid rgba(28,28,30,0.15)',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(28,28,30,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      📚
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>전체 단어장</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>모든 단어를 학습해요</div>
                    </div>
                  </button>

                  {loadingFolders ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>불러오는 중...</div>
                  ) : folders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                        단어장이 없어요
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                        단어장을 먼저 만들어주세요
                      </p>
                      <button
                        onClick={() => { setShowFolderSheet(false); router.push('/vocabulary') }}
                        style={{
                          padding: '10px 24px', background: 'var(--color-my)',
                          color: 'var(--color-my-contrast)', border: 'none',
                          borderRadius: '20px', fontSize: '14px',
                          fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        단어장 만들러 가기
                      </button>
                    </div>
                  ) : (
                    folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => (folder.word_count || 0) > 0 ? handleStart(folder.id) : undefined}
                        style={{
                          width: '100%', background: 'var(--color-surface)',
                          borderRadius: '16px', padding: '14px 16px',
                          border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', gap: '12px',
                          cursor: (folder.word_count || 0) === 0 ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          opacity: (folder.word_count || 0) === 0 ? 0.4 : 1,
                        }}
                      >
                        <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: folder.color ? `${folder.color}60` : 'rgba(28,28,30,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                          {folder.icon || '📚'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{folder.name}</div>
                          <div style={{ fontSize: '12px', color: (folder.word_count || 0) === 0 ? '#E24B4A' : 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {(folder.word_count || 0) === 0 ? '단어 없음' : `${folder.word_count}개 단어`}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </main>
  )
}
