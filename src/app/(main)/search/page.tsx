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

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

type PublicFolder = {
  id: string
  name: string
  icon: string
  color?: string
  category?: string
  user_id: string
  word_count?: number
  like_count?: number
  author_nickname?: string
}

const CATEGORIES = ['전체', '토익', '일상', '여행', '비즈니스', '기타']

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const myOnly = searchParams.get('my') === 'true'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [folders, setFolders] = useState<PublicFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const pagePadding = usePagePadding()

  useEffect(() => {
    const fetchPublicFolders = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setMyUserId(user.id)

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
    }
    fetchPublicFolders()
  }, [])

  const filtered = folders.filter(f => {
    if (myOnly && f.user_id !== myUserId) return false
    const matchQuery = query === '' ||
      f.name.toLowerCase().includes(query.toLowerCase())
    const matchCategory = category === '전체' ||
      f.category === category
    return matchQuery && matchCategory
  })

  const isMyFolder = (folder: PublicFolder) => folder.user_id === myUserId

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
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding: pagePadding }}>

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

        {/* 카테고리 칩 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '2px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                border: category === cat ? 'none' : '1px solid var(--color-border)',
                background: category === cat ? 'var(--color-my)' : 'var(--color-surface)',
                color: category === cat ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)',
                fontSize: '13px', fontWeight: category === cat ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 결과 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {query ? `"${query}" 검색 결과가 없어요` : '공개된 단어장이 없어요'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              단어장을 공개로 설정하면 여기에 표시돼요
            </p>
          </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
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
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '13px',
                        background: folder.color ? `${folder.color}60` : 'rgba(28,28,30,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', flexShrink: 0,
                      }}>
                        {folder.icon || '📚'}
                      </div>
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
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
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
