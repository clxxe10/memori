// Supabase SQL Editor에서 아래 실행 필요 (공개 단어장 RLS):
// create policy "공개 단어장 전체 조회" on folders
//   for select using (is_public = true);
//
// create policy "공개 단어장 단어 조회" on words
//   for select using (
//     EXISTS (
//       SELECT 1 FROM folders
//       WHERE folders.id = words.folder_id
//       AND folders.is_public = true
//     )
//     OR auth.uid() = user_id
//   );
//
// alter table folders add column if not exists author_nickname text;
//
// create or replace function set_author_nickname()
// returns trigger as $$
// begin
//   NEW.author_nickname := (
//     SELECT raw_user_meta_data->>'nickname'
//     FROM auth.users
//     WHERE id = NEW.user_id
//   );
//   if NEW.author_nickname is null then
//     NEW.author_nickname := 'user_' || left(NEW.user_id::text, 6);
//   end if;
//   return NEW;
// end;
// $$ language plpgsql security definer;
//
// create trigger folder_author_nickname
//   before insert on folders
//   for each row execute function set_author_nickname();
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

import { Suspense, useCallback, useEffect, useState, type MouseEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePagePadding } from '@/lib/responsive'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import SelectDropdown from '@/components/ui/SelectDropdown'
import EmptyState from '@/components/ui/EmptyState'
import { FolderSkeleton } from '@/components/ui/Skeleton'
import PullToRefresh from '@/components/ui/PullToRefresh'

type PublicFolder = {
  id: string
  name: string
  icon: string
  color?: string
  category?: string
  language?: string
  user_id: string
  word_count?: number
  like_count?: number
  author_nickname?: string
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const myOnly = searchParams.get('my') === 'true'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [languageFilter, setLanguageFilter] = useState('전체')
  const [folders, setFolders] = useState<PublicFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const pagePadding = usePagePadding()
  const bp = useBreakpoint()

  const fetchPublicFolders = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setMyUserId(user.id)
      const { data: myLikes } = await supabase
        .from('folder_likes')
        .select('folder_id')
        .eq('user_id', user.id)
      if (myLikes) setLikedIds(new Set(myLikes.map(l => l.folder_id)))
    }

    const { data: folderData } = await supabase
      .from('folders')
      .select('*')
      .eq('is_public', true)

    if (!folderData) {
      setLoading(false)
      return
    }

    const foldersWithCount = await Promise.all(
      folderData.map(async (folder) => {
        const { count: wordCount } = await supabase
          .from('words')
          .select('*', { count: 'exact', head: true })
          .eq('folder_id', folder.id)

        const { count: likeCount } = await supabase
          .from('folder_likes')
          .select('*', { count: 'exact', head: true })
          .eq('folder_id', folder.id)

        return {
          ...folder,
          word_count: wordCount || 0,
          like_count: likeCount || 0,
        }
      })
    )

    const sorted = foldersWithCount.sort((a, b) => {
      const scoreA = (a.like_count * 2) + (a.word_count * 0.1)
      const scoreB = (b.like_count * 2) + (b.word_count * 0.1)
      return scoreB - scoreA
    })

    setFolders(sorted)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPublicFolders()
  }, [fetchPublicFolders])

  const filtered = folders.filter(f => {
    if (myOnly && f.user_id !== myUserId) return false
    const matchQuery = query === '' ||
      f.name.toLowerCase().includes(query.toLowerCase())
    const matchCategory = category === '전체' ||
      f.category === category
    const matchLanguage = languageFilter === '전체' || f.language === languageFilter
    return matchQuery && matchCategory && matchLanguage
  })

  const isMyFolder = (folder: PublicFolder) => folder.user_id === myUserId

  const handleLike = async (e: MouseEvent, folder: PublicFolder) => {
    e.stopPropagation()
    if (!myUserId) return
    const supabase = createClient()
    const isLiked = likedIds.has(folder.id)
    if (isLiked) {
      await supabase.from('folder_likes').delete()
        .eq('folder_id', folder.id).eq('user_id', myUserId)
      setLikedIds(prev => { const next = new Set(prev); next.delete(folder.id); return next })
      setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, like_count: (f.like_count || 0) - 1 } : f))
    } else {
      await supabase.from('folder_likes').insert({ folder_id: folder.id, user_id: myUserId })
      setLikedIds(prev => new Set([...prev, folder.id]))
      setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, like_count: (f.like_count || 0) + 1 } : f))
    }
  }

  const handleImport = async (folder: PublicFolder) => {
    if (importing) return
    setImporting(folder.id)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: newFolder } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: folder.name,
          icon: folder.icon,
          color: folder.color,
          category: folder.category,
          language: folder.language,
          is_public: false,
        })
        .select()
        .single()

      if (!newFolder) return

      const { data: words } = await supabase
        .from('words')
        .select('*')
        .eq('folder_id', folder.id)

      if (words && words.length > 0) {
        await supabase.from('words').insert(
          words.map(w => ({
            user_id: user.id,
            folder_id: newFolder.id,
            word: w.word,
            meaning: w.meaning,
            part_of_speech: w.part_of_speech,
            pronunciation: w.pronunciation,
            example: w.example,
          }))
        )
      }

      setImportedIds(prev => new Set([...prev, folder.id]))
    } catch (e) {
      console.error(e)
    } finally {
      setImporting(null)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <PullToRefresh onRefresh={async () => { await fetchPublicFolders() }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: pagePadding }}>

        {/* 헤더 */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', margin: 0, marginBottom: '4px' }}>
            {myOnly ? '내 공개 단어장' : '검색'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            공개 단어장을 찾아 가져와요
          </p>
        </div>

        {/* 검색창 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
          borderRadius: '14px', padding: '11px 14px', marginBottom: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <Search size={16} color="var(--color-text-tertiary)" />
          <input
            type="text"
            placeholder="단어장 이름 검색..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '14px', color: 'var(--color-text-primary)', background: 'transparent',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
          <SelectDropdown
            value={category}
            onChange={setCategory}
            options={[
              { value: '전체', label: '전체 카테고리' },
              { value: '수능', label: '수능' },
              { value: '토익', label: '토익' },
              { value: '일상', label: '일상' },
              { value: '비즈니스', label: '비즈니스' },
              { value: '기타', label: '기타' },
            ]}
            placeholder="카테고리"
          />
          <SelectDropdown
            value={languageFilter}
            onChange={setLanguageFilter}
            options={[
              { value: '전체', label: '전체 언어' },
              { value: '영어', label: '영어', flag: '🇺🇸' },
              { value: '한국어', label: '한국어', flag: '🇰🇷' },
              { value: '일본어', label: '일본어', flag: '🇯🇵' },
              { value: '중국어', label: '중국어', flag: '🇨🇳' },
              { value: '프랑스어', label: '프랑스어', flag: '🇫🇷' },
              { value: '스페인어', label: '스페인어', flag: '🇪🇸' },
              { value: '독일어', label: '독일어', flag: '🇩🇪' },
              { value: '기타', label: '기타', flag: '🌐' },
            ]}
            placeholder="언어"
          />
        </div>

        {/* 결과 */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(i => <FolderSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="검색 결과가 없어요"
            desc={query ? `"${query}"에 해당하는 단어장이 없어요` : '아직 공개된 단어장이 없어요'}
          />
        ) : (
          <>
            {query && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                "{query}" 검색 결과 {filtered.length}개
              </p>
            )}
            {!query && (
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                인기 단어장
              </p>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '8px',
            }}>
              {filtered.map(folder => {
                const isImported = importedIds.has(folder.id)
                return (
                  <div
                    key={folder.id}
                    onClick={() => router.push(`/search/folder/${folder.id}`)}
                    style={{
                      background: 'var(--color-surface)', borderRadius: '18px', padding: '14px 16px',
                      border: '1px solid var(--color-border)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {folder.name}
                          </span>
                          {folder.category && (
                            <span style={{
                              fontSize: '10px', fontWeight: 600, color: 'var(--color-text-primary)',
                              background: 'rgba(28,28,30,0.07)', borderRadius: '6px', padding: '1px 6px',
                            }}>
                              {folder.category}
                            </span>
                          )}
                          {folder.language && (
                            <span style={{
                              fontSize: '10px', fontWeight: 600,
                              color: 'var(--color-text-secondary)',
                              background: 'var(--color-surface-2)',
                              borderRadius: '6px', padding: '1px 6px',
                              border: '1px solid var(--color-border)',
                              flexShrink: 0,
                            }}>
                              {folder.language}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>
                          @{folder.author_nickname || '익명'}
                        </p>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          ❤️ {folder.like_count || 0} · {folder.word_count}개
                        </span>
                      </div>
                      {isMyFolder(folder) ? (
                        <span style={{
                          padding: '7px 14px', borderRadius: '20px', flexShrink: 0,
                          background: 'var(--color-my-light)',
                          color: 'var(--color-my)',
                          fontSize: '12px', fontWeight: 700,
                        }}>
                          내 단어장
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={(e) => handleLike(e, folder)}
                            style={{
                              background: likedIds.has(folder.id) ? '#FFE5E5' : 'var(--color-surface-2)',
                              border: 'none', borderRadius: '10px',
                              padding: '6px 10px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '12px', fontWeight: 600,
                              color: likedIds.has(folder.id) ? '#D92D20' : 'var(--color-text-secondary)',
                            }}
                          >
                            ❤️ {folder.like_count || 0}
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (!isImported) handleImport(folder)
                            }}
                            disabled={isImported || importing === folder.id}
                            style={{
                              padding: '7px 14px', borderRadius: '20px', flexShrink: 0,
                              background: isImported ? 'var(--color-surface-2)' : 'var(--color-my)',
                              color: isImported ? 'var(--color-text-secondary)' : 'var(--color-my-contrast)',
                              border: 'none',
                              cursor: isImported ? 'default' : 'pointer',
                              fontSize: '12px', fontWeight: 600,
                              opacity: importing === folder.id ? 0.6 : 1,
                            }}
                          >
                            {importing === folder.id ? '...' : isImported ? '완료 ✓' : '가져오기'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
      </PullToRefresh>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
