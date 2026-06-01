'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Bookmark, Camera, Pencil, Plus, Volume2, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

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
  icon: string
  color?: string
  category?: string
  is_public?: boolean
}

const FILTERS = ['전체', '북마크', '어려워요', '미학습']

export default function VocabularyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const folderId = params.id as string
  const padding = usePagePadding()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('전체')
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    icon: '',
    color: '',
    category: '',
    is_public: false,
  })

  const fetchWords = async () => {
    const supabase = createClient()
    const { data: folderData } = await supabase.from('folders').select('*').eq('id', folderId).single()
    if (folderData) {
      setFolder(folderData)
      setEditForm({
        name: folderData.name || '',
        icon: folderData.icon || '📚',
        color: folderData.color || '#B8D4FF',
        category: folderData.category || '',
        is_public: folderData.is_public || false,
      })
    }
    const { data: wordData } = await supabase
      .from('words')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false })
    setWords(wordData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchWords()
    const handleFocus = () => fetchWords()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [folderId])

  const filtered = words.filter(w => {
    if (activeFilter === '북마크') return w.is_bookmarked
    if (activeFilter === '어려워요') return w.difficulty === 'hard'
    if (activeFilter === '미학습') return w.correct_count === 0
    return true
  })

  const handleEditSave = async () => {
    const supabase = createClient()
    await supabase.from('folders').update({
      name: editForm.name,
      icon: editForm.icon,
      color: editForm.color,
      category: editForm.category,
      is_public: editForm.is_public,
    }).eq('id', folderId)
    setFolder(prev => prev ? { ...prev, ...editForm } : prev)
    setShowEditSheet(false)
  }

  const handleFolderDelete = async () => {
    if (!confirm('단어장을 삭제할까요? 단어도 모두 삭제돼요.')) return
    const supabase = createClient()
    await supabase.from('words').delete().eq('folder_id', folderId)
    await supabase.from('folders').delete().eq('id', folderId)
    router.back()
  }

  const toggleBookmark = async (word: Word) => {
    const supabase = createClient()
    await supabase.from('words').update({ is_bookmarked: !word.is_bookmarked }).eq('id', word.id)
    setWords(prev => prev.map(w => w.id === word.id ? { ...w, is_bookmarked: !w.is_bookmarked } : w))
  }

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const speak = () => {
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.rate = 0.9
      utter.pitch = 1.0

      const voices = window.speechSynthesis.getVoices()
      const preferred = [
        'Samantha', 'Alex', 'Karen', 'Daniel',
        'Google US English', 'Microsoft Aria Online',
        'Microsoft Guy Online',
      ]
      for (const name of preferred) {
        const found = voices.find(v =>
          v.name.includes(name) && v.lang.startsWith('en')
        )
        if (found) { utter.voice = found; break }
      }

      if (!utter.voice) {
        const enVoice = voices.find(v => v.lang.startsWith('en-US'))
        if (enVoice) utter.voice = enVoice
      }

      window.speechSynthesis.speak(utter)
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      speak()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speak()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
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
    if (diff === 'hard') return { bg: 'rgba(226,75,74,0.10)', color: '#C0392B', label: '어려워요' }
    if (diff === 'easy') return { bg: 'rgba(52,199,89,0.10)', color: '#1A7F3C', label: '잘 알아요' }
    return { bg: 'rgba(142,142,147,0.10)', color: 'var(--color-text-secondary)', label: '보통' }
  }

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
              {folder?.icon} {folder?.name}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>{words.length}개 단어</p>
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
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '20px',
                border: activeFilter === f ? 'none' : '1px solid var(--color-border)',
                background: activeFilter === f ? 'var(--color-my)' : 'var(--color-surface)',
                color: activeFilter === f ? 'var(--color-my-contrast)' : '#8E8E93',
                fontSize: '13px', fontWeight: activeFilter === f ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 단어 카드 리스트 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>단어가 없어요</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>카메라로 사진을 찍어 단어를 추가해보세요</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '8px' }}>
            {filtered.map(word => {
              const posStyle = getPosStyle(word.part_of_speech)
              const diffStyle = getDiffStyle(word.difficulty)
              return (
                <div key={word.id} style={{
                  background: 'var(--color-surface)', borderRadius: '18px', padding: '14px 16px',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                }}>

                  {/* 단어 + 품사 + 발음 아이콘 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{word.word}</span>
                      <span style={{
                        background: posStyle.bg, color: posStyle.color,
                        borderRadius: '6px', padding: '2px 7px',
                        fontSize: '10px', fontWeight: 600,
                      }}>{word.part_of_speech || '기타'}</span>
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
                        <Bookmark size={14} color={word.is_bookmarked ? 'var(--color-my)' : '#AEAEB2'} fill={word.is_bookmarked ? 'var(--color-my)' : 'none'} />
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
                          background: i <= (word.correct_count || 0) ? 'var(--color-my)' : 'var(--color-track)',
                        }} />
                      ))}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddSheet(true)}
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

      {showEditSheet && (
        <>
          <div
            onClick={() => setShowEditSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 49 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-surface)', borderRadius: '24px 24px 0 0',
            padding: '12px 20px 120px', zIndex: 50,
            maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '20px' }}>단어장 편집</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>단어장 이름</p>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', height: '46px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 14px', fontSize: '14px', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>아이콘</p>
                <input
                  value={editForm.icon}
                  onChange={e => setEditForm(f => ({ ...f, icon: e.target.value.slice(0, 4) }))}
                  placeholder="이모지 또는 텍스트"
                  style={{ width: '100%', height: '46px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 14px', fontSize: '18px', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>배경 컬러</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {['#B8D4FF','#B5EAD7','#FFDAC1','#FFB7C5','#E2C9FF','#FFFACD','#C9F0FF','#D4EDDA'].map(c => (
                    <button key={c} onClick={() => setEditForm(f => ({ ...f, color: c }))}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', boxShadow: editForm.color === c ? '0 0 0 2px #fff, 0 0 0 3.5px #1C1C1E' : '0 0 0 1px rgba(0,0,0,0.08)', transform: editForm.color === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }} />
                  ))}
                  <input type="color" value={editForm.color} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid var(--color-border)', cursor: 'pointer', padding: 0, background: 'none' }} />
                </div>
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>카테고리</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['토익', '일상', '여행', '비즈니스', '기타'].map(cat => (
                    <button key={cat} onClick={() => setEditForm(f => ({ ...f, category: cat }))}
                      style={{ padding: '6px 14px', borderRadius: '20px', border: editForm.category === cat ? 'none' : '1px solid var(--color-border)', background: editForm.category === cat ? 'var(--color-my)' : 'var(--color-surface)', color: editForm.category === cat ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)', fontSize: '13px', fontWeight: editForm.category === cat ? 600 : 400, cursor: 'pointer' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>공개</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>다른 사용자에게 공개</p>
                </div>
                <div onClick={() => setEditForm(f => ({ ...f, is_public: !f.is_public }))}
                  style={{ width: '44px', height: '26px', borderRadius: '20px', background: editForm.is_public ? 'var(--color-my)' : 'var(--color-track)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: editForm.is_public ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                </div>
              </div>

              <button onClick={handleEditSave}
                style={{ width: '100%', height: '50px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                저장하기
              </button>

              <button onClick={handleFolderDelete}
                style={{ width: '100%', height: '50px', background: 'rgba(226,75,74,0.08)', color: '#E24B4A', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                단어장 삭제
              </button>

            </div>
          </div>
        </>
      )}

      {showAddSheet && (
        <>
          <div
            onClick={() => setShowAddSheet(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 100,
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
              padding: '12px 20px 48px',
              zIndex: 101,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '4px',
                background: 'var(--color-track)',
                borderRadius: '4px',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px', color: 'var(--color-text-primary)' }}>
              단어 추가
            </p>

            <button
              onClick={() => router.push(`/vocabulary/${folderId}/camera`)}
              style={{
                width: '100%',
                height: '64px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '0 16px',
                cursor: 'pointer',
                marginBottom: '8px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(28,28,30,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Camera size={18} color="var(--color-text-primary)" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>사진으로 추가</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>AI가 자동으로 단어를 추출해요</p>
              </div>
            </button>

            <button
              onClick={() => router.push(`/vocabulary/${folderId}/add`)}
              style={{
                width: '100%',
                height: '64px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '0 16px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(28,28,30,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Pencil size={18} color="var(--color-text-primary)" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>직접 입력</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>단어와 뜻을 입력하면 AI가 채워줘요</p>
              </div>
            </button>
          </div>
        </>
      )}
    </main>
  )
}
