'use client'

import { useEffect, useState, useRef, type ReactNode } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Bookmark, Camera, Pencil, Plus, Volume2, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useSwipe } from '@/hooks/useSwipe'
import { haptics } from '@/lib/haptics'
import SelectDropdown from '@/components/ui/SelectDropdown'
import EmptyState from '@/components/ui/EmptyState'
import { WordSkeleton } from '@/components/ui/Skeleton'
import { showToast } from '@/components/ui/Toast'
import { showAlert, showConfirm } from '@/components/ui/AlertHost'
import { useTranslation } from '@/lib/i18n'
import { findBlockedInList, type BlockHit } from '@/lib/contentFilter'
import { speak } from '@/lib/tts'
import AlertModal from '@/components/AlertModal'
import OverlayPortal from '@/components/ui/OverlayPortal'
import {
  GLASS_BTN_PRESS_CSS,
  glassBottomSheetStyle,
  glassButtonPrimary,
  glassButtonSecondary,
  glassDestructive,
  glassDimStyle,
  glassGrabberStyle,
  glassInputStyle,
  glassSheetFooterStyle,
  glassSheetScrollStyle,
} from '@/lib/glassModalStyles'

type Word = {
  id: string
  word: string
  meaning: string
  part_of_speech: string | null
  example: string | null
  pronunciation: string | null
  difficulty: string | null
  is_bookmarked: boolean
  correct_count: number
}

type Folder = {
  id: string
  name: string
  description?: string
  category?: string
  is_public?: boolean
}

const FILTERS_KO = ['전체', '북마크', '어려워요', '미학습']
const FILTERS_EN = ['All', 'Bookmarks', 'Hard', 'New']

function WordCard({ word, onDelete, children }: { word: Word; onDelete: () => void; children: ReactNode }) {
  const { t, lang } = useTranslation()
  const [swipeX, setSwipeX] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const startX = useRef(0)

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      haptics.medium()
      setConfirming(true)
    },
    threshold: 60,
  })

  if (confirming) {
    return (
      <div style={{
        background: '#E85454', borderRadius: '16px',
        padding: '16px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        gap: '12px',
      }}>
        <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>
          {lang === 'en' ? 'Delete this word?' : '이 단어를 삭제할까요?'}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setConfirming(false)} style={{
            padding: '8px 14px', borderRadius: '10px',
            border: 'none', background: 'rgba(255,255,255,0.2)',
            color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>{t.common.cancel}</button>
          <button onClick={() => { haptics.error(); onDelete() }} style={{
            padding: '8px 14px', borderRadius: '10px',
            border: 'none', background: 'white',
            color: '#E85454', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          }}>{t.common.delete}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '16px',
        background: 'rgba(255,59,48,0.12)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '20px',
        opacity: Math.min(1, Math.abs(swipeX) / 80),
      }}>
        <span style={{ fontSize: '20px' }}>🗑️</span>
      </div>
      <div
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX
          swipeHandlers.onTouchStart(e)
        }}
        onTouchMove={(e) => {
          setSwipeX(e.touches[0].clientX - startX.current)
        }}
        onTouchEnd={(e) => {
          swipeHandlers.onTouchEnd(e)
          setSwipeX(0)
        }}
        style={{ position: 'relative', zIndex: 1, transform: `translateX(${Math.min(0, swipeX)}px)`, transition: swipeX === 0 ? 'transform 0.2s ease' : 'none' }}
      >
        {children}
      </div>
    </div>
  )
}

export default function VocabularyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const folderId = params.id as string
  const padding = usePagePadding()
  const bp = useBreakpoint()
  const { t, lang } = useTranslation()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState(0) // 0=전체, 1=북마크, 2=어려워요, 3=미학습
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterAlert, setFilterAlert] = useState<{ title: string; description: string } | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    is_public: false,
  })

  const fetchWords = async () => {
    try {
      const supabase = createClient()
      const { data: folderData } = await supabase.from('folders').select('*').eq('id', folderId).single()
      if (folderData) {
        setFolder(folderData)
        setEditForm({
          name: folderData.name || '',
          description: folderData.description || '',
          category: folderData.category || '',
          is_public: folderData.is_public || false,
        })
      }
      const { data: wordData } = await supabase
        .from('words')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: true })
      setWords(wordData || [])
    } catch (e) {
      console.error('단어 로딩 오류:', e)
      await showAlert(t.common.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWords()
    const handleFocus = () => fetchWords()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [folderId])

  const FILTERS = lang === 'en' ? FILTERS_EN : FILTERS_KO

  const filtered = words.filter(w => {
    if (activeFilter === 1) return w.is_bookmarked
    if (activeFilter === 2) return w.difficulty === 'hard'
    if (activeFilter === 3) return w.correct_count === 0
    return true
  })

  const showBlockHitAlert = (hit: BlockHit) => {
    const hitLine = t.search.cannotPublishHit
      .replace('{term}', hit.term)
      .replace('{source}', hit.source)
    setFilterAlert({
      title: t.search.cannotPublish,
      description: `${t.search.cannotPublishDesc}\n\n${hitLine}`,
    })
  }

  const handleEditSave = async () => {
    const trimmedName = editForm.name.trim()
    if (!trimmedName) {
      setFilterAlert({
        title: lang === 'en' ? 'Name required' : '이름을 입력해주세요',
        description: lang === 'en' ? 'Please enter a vocabulary name.' : '단어장 이름을 입력해주세요.',
      })
      return
    }
    if (editForm.is_public) {
      const texts = [
        trimmedName,
        editForm.description,
        ...words.map(w => w.word),
        ...words.map(w => w.meaning),
      ]
      const labels = [
        lang === 'en' ? `Title: ${trimmedName}` : `제목: ${trimmedName}`,
        editForm.description
          ? (lang === 'en' ? `Description: ${editForm.description}` : `설명: ${editForm.description}`)
          : null,
        ...words.map(w => (lang === 'en' ? `Word: ${w.word}` : `단어: ${w.word}`)),
        ...words.map(w => (lang === 'en' ? `Meaning: ${w.meaning}` : `뜻: ${w.meaning}`)),
      ]
      const hit = findBlockedInList(texts, labels)
      if (hit) {
        showBlockHitAlert(hit)
        return
      }
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('folders')
        .update({
          name: trimmedName,
          description: editForm.description.trim() || null,
          category: editForm.category,
          is_public: editForm.is_public,
        })
        .eq('id', folderId)
        .select('id, name, is_public')
        .maybeSingle()

      if (error) {
        console.error('저장 오류:', error)
        setFilterAlert({
          title: t.alert.saveFailed,
          description: error.message || t.search.savePublicFailed,
        })
        return
      }
      if (!data) {
        console.error('저장 0건 — RLS 또는 id 불일치')
        setFilterAlert({
          title: t.alert.saveFailed,
          description: t.search.savePublicFailed,
        })
        return
      }

      setFolder(prev => prev ? { ...prev, ...editForm, name: trimmedName, is_public: data.is_public } : prev)
      setEditForm(f => ({ ...f, name: trimmedName, is_public: !!data.is_public }))
      setShowEditSheet(false)
      showToast(
        data.is_public
          ? (lang === 'en' ? 'Saved — now public in Explore' : '저장됐어요. 탐색 탭에 공개됩니다.')
          : (lang === 'en' ? 'Saved' : '저장됐어요.'),
        'success',
      )
    } catch (e) {
      console.error('저장 오류:', e)
      setFilterAlert({
        title: t.alert.saveFailed,
        description: t.search.savePublicFailed,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFolderDelete = async () => {
    const ok = await showConfirm({
      title: t.alert.deleteFolderConfirm,
      confirmText: t.common.delete,
      destructive: true,
    })
    if (!ok) return
    setIsDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('words').delete().eq('folder_id', folderId)
      await supabase.from('folders').delete().eq('id', folderId)
      router.back()
    } catch (e) {
      console.error('삭제 오류:', e)
      await showAlert(t.alert.deleteFailed)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleBookmark = async (word: Word) => {
    const supabase = createClient()
    const { error } = await supabase.from('words').update({ is_bookmarked: !word.is_bookmarked }).eq('id', word.id)
    if (error) { await showAlert(t.alert.saveFailed); return }
    setWords(prev => prev.map(w => w.id === word.id ? { ...w, is_bookmarked: !w.is_bookmarked } : w))
  }

  const handleDeleteWord = async (wordId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('words').delete().eq('id', wordId)
    if (error) { await showAlert(t.alert.deleteFailed); return }
    setWords(prev => prev.filter(w => w.id !== wordId))
    showToast(lang === 'en' ? 'Deleted' : '삭제되었습니다', 'success')
  }

  const handleSpeak = (text: string) => {
    void speak(text)
  }

  const posColors: Record<string, string> = {
    // 명사
    '명사': '#5E9EFF', 'noun': '#5E9EFF', 'n': '#5E9EFF', 'n.': '#5E9EFF',
    // 동사
    '동사': '#34C77A', 'verb': '#34C77A', 'v': '#34C77A', 'v.': '#34C77A',
    // 형용사
    '형용사': '#FFA94D', 'adjective': '#FFA94D', 'adj': '#FFA94D', 'adj.': '#FFA94D',
    // 부사
    '부사': '#B98CFF', 'adverb': '#B98CFF', 'adv': '#B98CFF', 'adv.': '#B98CFF',
    // 전치사
    '전치사': '#FF6B6B', 'preposition': '#FF6B6B', 'prep': '#FF6B6B', 'prep.': '#FF6B6B',
    // 접속사
    '접속사': '#4FD1C5', 'conjunction': '#4FD1C5', 'conj': '#4FD1C5', 'conj.': '#4FD1C5',
    // 대명사
    '대명사': '#F687B3', 'pronoun': '#F687B3', 'pron': '#F687B3', 'pron.': '#F687B3',
    // 감탄사
    '감탄사': '#FFD43B', 'interjection': '#FFD43B', 'interj': '#FFD43B', 'interj.': '#FFD43B',
    // 관사
    '관사': '#A0AEC0', 'article': '#A0AEC0', 'art': '#A0AEC0', 'art.': '#A0AEC0',
    // 숙어/구
    '숙어': '#63B3ED', 'idiom': '#63B3ED', 'phrase': '#63B3ED', '구': '#63B3ED',
  }

  const getPosStyle = (pos: string | null) => {
    if (!pos) return { bg: 'rgba(142,142,147,0.12)', color: '#636366' }
    if (pos.includes('동사')) return { bg: 'rgba(52,199,89,0.12)', color: '#1A7F3C' }
    if (pos.includes('명사')) return { bg: 'rgba(0,122,255,0.12)', color: '#0055B3' }
    if (pos.includes('형용사')) return { bg: 'rgba(255,149,0,0.12)', color: '#B86800' }
    if (pos.includes('부사')) return { bg: 'rgba(175,82,222,0.12)', color: '#7B2FBE' }
    if (pos.includes('접속사')) return { bg: 'rgba(255,59,48,0.12)', color: '#C0392B' }
    if (pos.includes('전치사')) return { bg: 'rgba(0,199,190,0.12)', color: '#007A76' }
    if (pos.includes('감탄사')) return { bg: 'rgba(255,204,0,0.12)', color: '#8B6800' }
    return { bg: 'rgba(142,142,147,0.12)', color: '#636366' }
  }

  const getDiffStyle = (diff: string | null) => {
    if (diff === 'hard') return { bg: 'rgba(226,75,74,0.10)', color: '#C0392B', label: lang === 'en' ? 'Hard' : '어려워요' }
    if (diff === 'easy') return { bg: 'rgba(52,199,89,0.10)', color: '#1A7F3C', label: lang === 'en' ? 'Easy' : '잘 알아요' }
    return { bg: 'rgba(142,142,147,0.10)', color: 'var(--color-text-secondary)', label: lang === 'en' ? 'Normal' : '보통' }
  }

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <main style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              {folder?.name?.trim() || (lang === 'en' ? 'Untitled' : '이름 없음')}
            </h1>
            {folder?.description && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{folder.description}</p>
            )}
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>{lang === 'en' ? `${words.length} words` : `${words.length}개 단어`}</p>
          </div>
          <button
            onClick={() => setShowEditSheet(true)}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Settings size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        {/* 필터 칩 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '2px' }}>
          {FILTERS.map((f, i) => (
            <button
              key={f}
              onClick={() => setActiveFilter(i)}
              className={`filter-tab${activeFilter === i ? ' selected' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 단어 카드 리스트 */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: bp === 'mobile' ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '8px',
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => <WordSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="✏️"
            title={t.vocab.noWordsInFolder}
            desc={lang === 'en' ? 'Add words manually or by photo' : '직접 입력하거나 사진으로 단어를 추가해봐요'}
            actionLabel={t.vocab.addWord}
            onAction={() => router.push(`/vocabulary/${folderId}/add`)}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: bp === 'mobile' ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '8px',
          }}>
            {filtered.map(word => {
              const diffStyle = getDiffStyle(word.difficulty)
              const normalizedPos = (word.part_of_speech || '').trim().toLowerCase()
              const posColor = posColors[word.part_of_speech || ''] || posColors[normalizedPos] || '#9CA3AF'
              return (
                <WordCard key={word.id} word={word} onDelete={() => handleDeleteWord(word.id)}>
                <div style={{
                  background: 'var(--color-surface)', borderRadius: '18px', padding: '14px 16px',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                }}>

                  {/* 단어 + 품사 + 발음 아이콘 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{word.word}</span>
                      <div style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <div style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: posColor,
                          flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          fontWeight: 500,
                        }}>
                          {word.part_of_speech}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSpeak(word.word)}
                        style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Volume2 size={14} color="var(--color-text-tertiary)" />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => router.push(`/vocabulary/${folderId}/edit/${word.id}`)}
                        style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Pencil size={14} color="var(--color-text-tertiary)" />
                      </button>
                      <button
                        onClick={() => toggleBookmark(word)}
                        style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Bookmark size={14} color={word.is_bookmarked ? 'var(--color-neutral)' : '#AEAEB2'} fill={word.is_bookmarked ? 'var(--color-neutral)' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* 발음기호 */}
                  {word.pronunciation && (
                    <p style={{ fontSize: '11px', color: '#AEAEB2', marginBottom: '4px' }}>{word.pronunciation}</p>
                  )}

                  {/* 뜻 */}
                  <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '4px', fontWeight: 500 }}>{word.meaning}</p>

                  {/* 예문 */}
                  {word.example && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
                      "{word.example}"
                    </p>
                  )}

                  {/* 하단: 난이도 + 마스터리 점 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                    <span style={{
                      background: diffStyle.bg, color: diffStyle.color,
                      borderRadius: '6px', padding: '2px 8px',
                      fontSize: '10px', fontWeight: 600,
                    }}>{diffStyle.label}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          width: '7px', height: '7px', borderRadius: '50%',
                          background: i <= (word.correct_count || 0) ? 'var(--color-neutral)' : 'var(--color-track)',
                        }} />
                      ))}
                    </div>
                  </div>

                </div>
                </WordCard>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddSheet(true)}
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
          zIndex: 'var(--z-tab)' as unknown as number,
        }}
      >
        <Plus size={22} color="var(--color-text-primary)" />
      </button>

      {showEditSheet && (
        <OverlayPortal>
          <style>{GLASS_BTN_PRESS_CSS}</style>
          <div onClick={() => setShowEditSheet(false)} style={glassDimStyle(isDark)} />
          <div className="glass-surface" style={glassBottomSheetStyle(isDark)}>
            <div style={glassGrabberStyle(isDark)} />
            <div style={glassSheetScrollStyle()}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>{lang === 'en' ? 'Edit Vocabulary' : '단어장 편집'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{lang === 'en' ? 'Name' : '단어장 이름'}</p>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    style={glassInputStyle(isDark)}
                  />
                </div>

                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{lang === 'en' ? 'Description' : '설명'} <span style={{ fontWeight: 400, color: 'var(--color-text-tertiary)' }}>{lang === 'en' ? '(optional)' : '(선택)'}</span></p>
                  <input
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={lang === 'en' ? 'Brief description' : '이 단어장에 대한 간단한 설명'}
                    style={glassInputStyle(isDark)}
                  />
                </div>

                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{lang === 'en' ? 'Category' : '카테고리'}</p>
                  <SelectDropdown
                    variant="field"
                    value={editForm.category}
                    onChange={val => setEditForm(f => ({ ...f, category: val }))}
                    options={[
                      { value: '수능', label: lang === 'en' ? 'CSAT' : '수능' },
                      { value: '토익', label: lang === 'en' ? 'TOEIC' : '토익' },
                      { value: '일상', label: lang === 'en' ? 'Daily' : '일상' },
                      { value: '비즈니스', label: lang === 'en' ? 'Business' : '비즈니스' },
                      { value: '기타', label: lang === 'en' ? 'Other' : '기타' },
                    ]}
                    placeholder={lang === 'en' ? 'Select category' : '카테고리 선택'}
                  />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  height: '56px', padding: '0 14px',
                  background: isDark ? 'rgba(120,120,128,0.22)' : 'rgba(120,120,128,0.12)',
                  borderRadius: '14px', boxSizing: 'border-box',
                }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>공개</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>다른 사용자에게 공개</p>
                  </div>
                  <div onClick={() => setEditForm(f => ({ ...f, is_public: !f.is_public }))}
                    style={{ width: '44px', height: '26px', borderRadius: '20px', background: editForm.is_public ? 'var(--color-neutral)' : 'var(--color-track)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: editForm.is_public ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ ...glassSheetFooterStyle(), display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="no-press-anim glass-press"
                onClick={handleEditSave}
                disabled={isSaving || !editForm.name.trim()}
                style={{
                  ...glassButtonPrimary(isDark),
                  width: '100%', flex: 'none',
                  opacity: (isSaving || !editForm.name.trim()) ? 0.5 : 1,
                }}
              >
                {isSaving ? (lang === 'en' ? 'Saving...' : '저장 중...') : t.common.save}
              </button>
              <button
                className="no-press-anim glass-press"
                onClick={handleFolderDelete}
                disabled={isDeleting}
                style={{ ...glassDestructive(), width: '100%', flex: 'none' }}
              >
                {lang === 'en' ? 'Delete Vocabulary' : '단어장 삭제'}
              </button>
            </div>
          </div>
        </OverlayPortal>
      )}

      {filterAlert && (
        <AlertModal
          title={filterAlert.title}
          description={filterAlert.description}
          confirmText={t.common.confirm}
          cancelText={t.common.close}
          onConfirm={() => setFilterAlert(null)}
          onCancel={() => setFilterAlert(null)}
        />
      )}

      {showAddSheet && (
        <OverlayPortal>
          <div onClick={() => setShowAddSheet(false)} style={glassDimStyle(isDark)} />
          <div className="glass-surface" style={glassBottomSheetStyle(isDark)}>
            <div style={glassGrabberStyle(isDark)} />
            <div style={glassSheetScrollStyle()}>
              <p style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text-primary)', textAlign: 'center' }}>
                {t.vocab.addWord}
              </p>

              <button onClick={() => router.push(`/vocabulary/${folderId}/camera`)} style={{
                width: '100%', height: '64px',
                background: isDark ? 'rgba(120,120,128,0.22)' : 'rgba(120,120,128,0.12)', border: 'none',
                borderRadius: '16px', display: 'flex', alignItems: 'center',
                gap: '14px', padding: '0 16px', cursor: 'pointer', marginBottom: '8px',
                textAlign: 'left' as const,
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--color-neutral-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Camera size={18} color="var(--color-neutral)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{t.vocab.addByPhoto}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.vocab.addByPhotoDesc}</p>
                </div>
              </button>

              <button onClick={() => router.push(`/vocabulary/${folderId}/add`)} style={{
                width: '100%', height: '64px',
                background: isDark ? 'rgba(120,120,128,0.22)' : 'rgba(120,120,128,0.12)', border: 'none',
                borderRadius: '16px', display: 'flex', alignItems: 'center',
                gap: '14px', padding: '0 16px', cursor: 'pointer', marginBottom: '4px',
                textAlign: 'left' as const,
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--color-neutral-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Plus size={18} color="var(--color-neutral)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{t.vocab.addManual}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.vocab.addManualDesc}</p>
                </div>
              </button>
            </div>
            <div style={glassSheetFooterStyle()}>
              <button
                className="no-press-anim glass-press"
                onClick={() => setShowAddSheet(false)}
                style={{ ...glassButtonSecondary(isDark), width: '100%', flex: 'none' }}
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </OverlayPortal>
      )}
    </main>
  )
}
