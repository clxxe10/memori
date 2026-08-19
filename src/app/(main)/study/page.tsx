'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, HelpCircle } from 'lucide-react'
import HelpSheet from '@/components/ui/HelpSheet'
import { createClient } from '@/lib/supabase/client'
import { usePagePadding } from '@/lib/responsive'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useTranslation } from '@/lib/i18n'

export default function StudyPage() {
  const router = useRouter()
  const { t, lang } = useTranslation()
  const [tab, setTab] = useState<'favorites' | 'all'>('favorites')
  const [favorites, setFavorites] = useState<string[]>(['flashcard', 'blink', 'typing'])
  const [showFolderSheet, setShowFolderSheet] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [folders, setFolders] = useState<Array<{ id: string; name: string; icon: string; word_count?: number; color?: string }>>([])
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [helpMode, setHelpMode] = useState<string | null>(null)
  const pagePadding = usePagePadding()
  const bp = useBreakpoint()

  const ALL_MODES = [
    {
      id: 'flashcard',
      name: t.study.flashcard,
      desc: t.study.flashcardDesc,
      emoji: '🃏',
      color: 'rgba(28,28,30,0.09)',
      badge: lang === 'en' ? 'Recommended' : '추천',
      badgeColor: '#1C1C1E',
      badgeBg: 'rgba(28,28,30,0.08)',
    },
    {
      id: 'blink',
      name: t.study.blink,
      desc: t.study.blinkDesc,
      emoji: '⚡',
      color: 'rgba(52,199,89,0.09)',
      badge: null,
    },
    {
      id: 'quiz',
      name: t.study.quiz,
      desc: t.study.quizDesc,
      emoji: '📝',
      color: 'rgba(255,149,0,0.09)',
      badge: '인기',
      badgeColor: '#B86800',
      badgeBg: 'rgba(255,149,0,0.10)',
    },
    {
      id: 'typing',
      name: t.study.typing,
      desc: t.study.typingDesc,
      emoji: '⌨️',
      color: 'rgba(175,82,222,0.09)',
      badge: null,
    },
    {
      id: 'speed',
      name: t.study.speed,
      desc: t.study.speedDesc,
      emoji: '🚀',
      color: 'rgba(251,191,36,0.10)',
      badge: 'NEW',
      badgeColor: '#B45309',
      badgeBg: 'rgba(251,191,36,0.12)',
    },
    {
      id: 'pdf',
      name: t.study.pdf,
      desc: t.study.pdfDesc,
      emoji: '📄',
      color: 'rgba(28,28,30,0.06)',
      badge: null,
    },
    {
      id: 'review',
      name: t.study.review,
      desc: t.study.reviewDesc,
      emoji: '🔁',
      color: 'rgba(226,75,74,0.09)',
      badge: null,
    },
    {
      id: 'listening',
      name: t.study.listening,
      desc: t.study.listeningDesc,
      emoji: '🎧',
      color: 'rgba(0,199,190,0.09)',
      badge: null,
    },
  ]

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
      alert(lang === 'en' ? 'No words in this vocabulary. Add words first.' : '단어장에 단어가 없어요! 단어를 먼저 추가해주세요.')
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
      <div style={{ maxWidth: bp === 'mobile' ? '100%' : '720px', margin: '0 auto', padding: pagePadding }}>

        {/* 헤더 */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', margin: 0, marginBottom: '4px' }}>
            {t.study.title}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {lang === 'en' ? 'Select a study mode' : '학습 모드를 선택하세요'}
          </p>
        </div>

        {/* 세그먼트 탭 */}
        <div className="segment-track" style={{ marginBottom: '20px' }}>
          {[
            { key: 'favorites', label: t.study.favorites },
            { key: 'all', label: t.study.allModes },
          ].map(seg => (
            <button
              key={seg.key}
              onClick={() => setTab(seg.key as any)}
              className={`segment-item${tab === seg.key ? ' selected' : ''}`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* 모드 리스트 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          maxWidth: '640px',
          margin: '0 auto',
          gap: '8px',
        }}>
          {tab === 'all' && (
          <div
            className="memoryset-card"
            onClick={() => router.push('/study/memoryset')}
            role="button"
            style={{
              width: '100%',
              background: 'var(--memoryset-card-bg)',
              borderRadius: '20px',
              padding: '18px',
              border: '1px solid var(--memoryset-card-border)',
              boxShadow: 'var(--memoryset-card-shadow)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {t.study.memorySet}
                </span>
                <span className="badge-new">NEW</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                {t.study.memorySetDesc}
              </p>
            </div>
            <ChevronRight size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0, opacity: 0.8 }} />
          </div>
          )}
          {modes.map(mode => (
            <div
              key={mode.id}
              onClick={() => handleMode(mode.id)}
              role="button"
              style={{
                width: '100%',
                background: 'var(--vocab-card-bg)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: '18px',
                padding: '18px 18px',
                border: '0.5px solid var(--vocab-card-border)',
                borderTop: '1px solid var(--vocab-card-border-top)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setHelpMode(mode.id)
                  }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px', color: 'var(--color-text-tertiary)',
                    flexShrink: 0,
                  }}
                >
                  <HelpCircle size={16} />
                </button>
                <button
                  onClick={e => toggleFavorite(mode.id, e)}
                  style={{
                    background: 'none', border: 'none',
                    width: '44px', height: '44px', minWidth: '44px', minHeight: '44px',
                    padding: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    fontSize: 22,
                    lineHeight: 1,
                    opacity: favorites.includes(mode.id) ? 1 : 0.35,
                  }}>⭐️</span>
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
              {lang === 'en' ? 'No favorites yet' : '즐겨찾기가 없어요'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {lang === 'en' ? 'Tap the star in All Modes to add favorites' : '모든 모드 탭에서 별을 눌러 추가하세요'}
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
          <div onClick={() => setShowFolderSheet(false)} style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: document.documentElement.classList.contains('dark') ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.16)',
          }} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 200,
            background: document.documentElement.classList.contains('dark')
              ? 'linear-gradient(165deg, rgba(70,68,80,0.5), rgba(20,18,26,0.55))'
              : '#FEFEFF',
            backdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            WebkitBackdropFilter: document.documentElement.classList.contains('dark') ? 'blur(28px)' : 'none',
            boxShadow: document.documentElement.classList.contains('dark')
              ? 'inset 0 1.5px 0 rgba(255,255,255,0.16), 0 24px 48px rgba(0,0,0,0.6)'
              : '0 24px 48px rgba(31,38,60,0.18), 0 2px 8px rgba(31,38,60,0.06)',
            border: document.documentElement.classList.contains('dark')
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(0,0,0,0.04)',
            borderRadius: '26px',
            padding: '24px 20px 20px',
            maxHeight: '70vh', overflowY: 'auto' as const,
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px', textAlign: 'center' }}>
              {selectedMode === 'review' ? t.home.reviewStart : t.study.selectFolder}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
              {selectedMode === 'review' ? (lang === 'en' ? 'Which words to review?' : '어떤 단어를 복습할까요?') : t.study.selectFolderDesc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => handleStart()}
                style={{ width: '100%', background: 'rgba(28,28,30,0.06)', borderRadius: '16px', padding: '14px 16px', border: '1.5px solid rgba(28,28,30,0.15)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left' as const }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {selectedMode === 'review' ? (lang === 'en' ? 'Full Review' : '전체 복습') : t.study.allWords}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {selectedMode === 'review' ? (lang === 'en' ? 'Review all incorrect words' : '틀린 단어 전체를 복습해요') : t.study.allWordsDesc}
                  </div>
                </div>
              </button>
              {loadingFolders ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>불러오는 중...</div>
              ) : folders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{t.study.noWords}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{t.study.noWordsDesc}</p>
                  <button onClick={() => { setShowFolderSheet(false); router.push('/vocabulary') }}
                    style={{ padding: '10px 24px', background: 'var(--color-neutral)', color: 'var(--color-neutral-contrast)', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    {t.vocab.createFolder}
                  </button>
                </div>
              ) : (
                folders.map(folder => (
                  <button key={folder.id}
                    onClick={() => (folder.word_count || 0) > 0 ? handleStart(folder.id) : undefined}
                    style={{ width: '100%', background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px', cursor: (folder.word_count || 0) === 0 ? 'not-allowed' : 'pointer', textAlign: 'left' as const, opacity: (folder.word_count || 0) === 0 ? 0.4 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{folder.name}</div>
                      <div style={{ fontSize: '12px', color: (folder.word_count || 0) === 0 ? '#E24B4A' : 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {(folder.word_count || 0) === 0 ? t.home.noWord : (lang === 'en' ? `${folder.word_count} words` : `${folder.word_count}개 단어`)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setShowFolderSheet(false)} style={{
              width: '100%', padding: '14px',
              borderRadius: '9999px', border: 'none',
              background: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(120,120,128,0.14)',
              color: 'var(--color-text-primary)',
              fontSize: '16px', fontWeight: 600, cursor: 'pointer',
            }}>{t.common.cancel}</button>
          </div>
        </>
      )}

      {helpMode && (
        <HelpSheet mode={helpMode} onClose={() => setHelpMode(null)} />
      )}
    </main>
  )
}
