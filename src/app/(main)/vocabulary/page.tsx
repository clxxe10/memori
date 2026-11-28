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

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus, Search, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { usePagePadding } from '@/lib/responsive'
import SelectDropdown from '@/components/ui/SelectDropdown'
import EmptyState from '@/components/ui/EmptyState'
import { showToast } from '@/components/ui/Toast'
import { showAlert } from '@/components/ui/AlertHost'
import { FolderSkeleton } from '@/components/ui/Skeleton'
import PullToRefresh from '@/components/ui/PullToRefresh'
import Coachmark from '@/components/ui/Coachmark'
import { useTranslation } from '@/lib/i18n'
import { findBlockedInList } from '@/lib/contentFilter'
import FloatingSheet from '@/components/ui/FloatingSheet'
import { useIsDark } from '@/hooks/useIsDark'
import {
  glassButtonPrimary,
  glassInputLabelStyle,
  glassInputStyle,
  glassSheetTitleStyle,
} from '@/lib/glassModalStyles'
import { attachDebouncedFocusRefresh } from '@/lib/focusRefresh'
import { getTabCache, invalidateTabCache, setTabCache, tabCacheKey } from '@/lib/tabCache'

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

type VocabTabCache = {
  user: any
  folders: Folder[]
}

export default function VocabularyPage() {
  const router = useRouter()
  const { t, lang } = useTranslation()
  const isDark = useIsDark()
  const [folders, setFolders] = useState<Folder[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const pagePadding = usePagePadding()
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const [creating, setCreating] = useState(false)
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    category: '',
    is_public: false,
  })

  const fetchFolders = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) { setLoading(false); return }

      const { data: folderData } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!folderData) {
        const payload: VocabTabCache = { user, folders: [] }
        setUser(user)
        setFolders([])
        setTabCache(tabCacheKey(user.id, 'vocabulary'), payload)
        setLoading(false)
        return
      }

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
      const payload: VocabTabCache = { user, folders: foldersWithCount }
      setUser(user)
      setFolders(foldersWithCount)
      setTabCache(tabCacheKey(user.id, 'vocabulary'), payload)
      setLoading(false)
    } catch (e) {
      console.error('폴더 로딩 오류:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      const uid = session?.user?.id
      if (!uid) {
        setLoading(false)
        return
      }
      const cached = getTabCache<VocabTabCache>(tabCacheKey(uid, 'vocabulary'))
      if (cached) {
        setUser(cached.user)
        setFolders(cached.folders)
        setLoading(false)
      }
      await fetchFolders()
    }
    void boot()
    return attachDebouncedFocusRefresh(() => { void fetchFolders() })
  }, [])

  const handleCreate = async () => {
    if (!newFolder.name.trim()) return
    if (newFolder.is_public) {
      const hit = findBlockedInList(
        [newFolder.name, newFolder.description],
        [
          lang === 'en' ? `Title: ${newFolder.name}` : `제목: ${newFolder.name}`,
          newFolder.description
            ? (lang === 'en' ? `Description: ${newFolder.description}` : `설명: ${newFolder.description}`)
            : null,
        ],
      )
      if (hit) {
        const hitLine = t.search.cannotPublishHit
          .replace('{term}', hit.term)
          .replace('{source}', hit.source)
        await showAlert({
          title: t.search.cannotPublish,
          description: `${t.search.cannotPublishDesc}\n\n${hitLine}`,
        })
        return
      }
    }
    setCreating(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
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
          language: '영어', // 단어 추가 시 자동으로 업데이트됨 (기본값 유지)
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
            language: '영어', // 단어 추가 시 자동으로 업데이트됨 (기본값 유지)
            description: newFolder.description.trim() || null,
            author_nickname: authorNickname,
          })
          .select()
          .single()

        if (fallbackError) {
          await showAlert((lang === 'en' ? 'Failed to create vocabulary: ' : '단어장 생성에 실패했습니다: ') + fallbackError.message)
          return
        }

        if (fallbackData) setFolders((prev) => [fallbackData, ...prev])
      } else if (data) {
        setFolders((prev) => [data, ...prev])
      }

      invalidateTabCache(['home', 'vocabulary', 'study'])
      setNewFolder({
        name: '',
        description: '',
        category: '',
        is_public: false,
      })
      setShowModal(false)
      showToast(lang === 'en' ? 'Vocabulary created!' : '단어장이 만들어졌어요!')
    } catch (e) {
      console.error(e)
      await showAlert(t.common.error)
    } finally {
      setCreating(false)
    }
  }

  const filtered = folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))

  if (!loading && !user) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '0 24px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>📖</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.4px' }}>
        {lang === 'en' ? 'Sign in to create vocabulary' : '로그인하고 단어장을 만들어요'}
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '32px', textAlign: 'center', lineHeight: 1.5 }}>
        {lang === 'en' ? 'Save and manage your vocabulary lists' : '나만의 단어장을 저장하고 관리해요'}
      </p>
      <button onClick={() => router.push('/onboarding')} style={{
        width: '100%', maxWidth: '320px', height: '52px',
        background: 'var(--color-my)', color: 'var(--color-my-contrast)',
        border: 'none', borderRadius: '9999px',
        fontSize: '16px', fontWeight: 700, cursor: 'pointer',
      }}>
        {lang === 'en' ? 'Sign In' : '로그인하기'}
      </button>
    </main>
  )

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
            {t.vocab.title}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>{lang === 'en' ? `${folders.length} vocabularies` : `${folders.length}개의 폴더`}</p>
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
            placeholder={t.vocab.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
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
            title={t.vocab.noFolders}
            desc={t.vocab.createFirst}
            actionLabel={t.vocab.createFolder}
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {folder.name?.trim() || (lang === 'en' ? 'Untitled' : '이름 없음')}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--color-neutral)',
                          background: 'var(--color-neutral-soft)',
                          borderRadius: '6px',
                          padding: '2px 7px',
                        }}
                      >
                        {percent}%
                      </span>
                    </div>
                    {folder.description && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.description}</p>}
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>{lang === 'en' ? `${total} words` : `${total}개 단어`}</div>
                    <div style={{ height: '3px', background: 'var(--color-surface-2)', borderRadius: '3px' }}>
                      <div style={{ height: '3px', background: 'var(--color-neutral)', borderRadius: '3px', width: `${percent}%` }} />
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
        ref={addButtonRef}
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
          zIndex: 'var(--z-tab)' as unknown as number,
        }}
      >
        <Plus size={22} color="var(--color-text-primary)" />
      </button>

      {showModal && (
        <FloatingSheet
          onClose={() => setShowModal(false)}
          footer={
            <button
              className="no-press-anim glass-press"
              onClick={handleCreate}
              disabled={creating || !newFolder.name.trim()}
              style={{
                ...glassButtonPrimary(isDark),
                width: '100%', flex: 'none',
                opacity: (creating || !newFolder.name.trim()) ? 0.5 : 1,
              }}
            >
              {creating ? t.vocab.creating : t.vocab.createFolder}
            </button>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ ...glassSheetTitleStyle(isDark), margin: 0 }}>{t.vocab.newFolder}</h2>
            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} color="var(--color-text-secondary)" />
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={glassInputLabelStyle()}>{t.vocab.folderName}</label>
            <input value={newFolder.name} onChange={e => setNewFolder(f => ({ ...f, name: e.target.value }))}
              placeholder={lang === 'en' ? 'e.g. TOEIC Essential Words' : '예: 토익 필수 단어'}
              style={glassInputStyle(isDark)} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={glassInputLabelStyle()}>
              {t.vocab.folderDesc} <span style={{ fontWeight: 400, color: 'var(--color-text-tertiary)' }}>{lang === 'en' ? '(optional)' : '(선택)'}</span>
            </label>
            <input value={newFolder.description} onChange={e => setNewFolder(f => ({ ...f, description: e.target.value }))}
              placeholder={lang === 'en' ? 'Brief description' : '이 단어장에 대한 간단한 설명'}
              style={glassInputStyle(isDark)} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={glassInputLabelStyle()}>{t.vocab.category}</label>
            <SelectDropdown
              variant="field"
              value={newFolder.category}
              onChange={val => setNewFolder(f => ({ ...f, category: val }))}
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
            background: isDark ? 'rgba(120,120,128,0.22)' : 'rgba(120,120,128,0.12)',
            borderRadius: '14px', height: '56px', padding: '0 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{t.vocab.isPublic}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{t.vocab.isPublicDesc}</p>
            </div>
            <div onClick={() => setNewFolder(f => ({ ...f, is_public: !f.is_public }))} style={{
              width: '44px', height: '26px', borderRadius: '20px',
              background: newFolder.is_public ? 'var(--color-neutral)' : 'var(--color-track)',
              position: 'relative', cursor: 'pointer', flexShrink: 0,
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '3px', left: newFolder.is_public ? '21px' : '3px', transition: 'left 0.2s',
              }} />
            </div>
          </div>
        </FloatingSheet>
      )}
      <Coachmark
        id="vocab"
        targetRef={addButtonRef}
        placement="top"
        text={lang === 'en'
          ? 'Tap here to create a vocabulary list. Just take a photo and AI organizes the words'
          : '여기를 눌러 단어장을 만들어요. 사진만 찍으면 AI가 단어를 정리해줘요'}
      />
    </main>
  )
}
