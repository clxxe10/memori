// 아래 SQL을 Supabase SQL Editor에서 실행:
//
// -- 좋아요 테이블
// create table if not exists folder_likes (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references auth.users(id) on delete cascade,
//   folder_id uuid references folders(id) on delete cascade,
//   created_at timestamptz default now(),
//   unique(user_id, folder_id)
// );
// alter table folder_likes enable row level security;
// create policy "본인 좋아요" on folder_likes for all using (auth.uid() = user_id);
// create policy "좋아요 수 조회" on folder_likes for select using (true);
//
// -- 댓글 테이블
// create table if not exists folder_comments (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references auth.users(id) on delete cascade,
//   folder_id uuid references folders(id) on delete cascade,
//   content text not null,
//   nickname text,
//   created_at timestamptz default now()
// );
// alter table folder_comments enable row level security;
// create policy "댓글 조회" on folder_comments for select using (true);
// create policy "댓글 작성" on folder_comments for insert with check (auth.uid() = user_id);
// create policy "댓글 삭제" on folder_comments for delete using (auth.uid() = user_id);

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Heart, Download, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

type Folder = {
  id: string
  name: string
  icon: string
  color?: string
  category?: string
  user_id: string
}

type Word = {
  id: string
  word: string
  meaning: string
  part_of_speech: string | null
}

type Comment = {
  id: string
  content: string
  nickname: string | null
  created_at: string
  user_id: string
}

export default function PublicFolderPage() {
  const router = useRouter()
  const params = useParams()
  const folderId = params.id as string
  const padding = usePagePadding()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isImported, setIsImported] = useState(false)
  const [importing, setImporting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [myNickname, setMyNickname] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setMyUserId(user.id)
        setMyNickname(user.user_metadata?.nickname || user.user_metadata?.full_name || '익명')
      }

      const { data: folderData } = await supabase
        .from('folders').select('*').eq('id', folderId).single()
      setFolder(folderData)

      const { data: wordData } = await supabase
        .from('words').select('id, word, meaning, part_of_speech')
        .eq('folder_id', folderId)
        .limit(20)
      setWords(wordData || [])

      const { count: likeCountData } = await supabase
        .from('folder_likes')
        .select('*', { count: 'exact', head: true })
        .eq('folder_id', folderId)
      setLikeCount(likeCountData || 0)

      if (user) {
        const { data: myLike } = await supabase
          .from('folder_likes')
          .select('id')
          .eq('folder_id', folderId)
          .eq('user_id', user.id)
          .single()
        setIsLiked(!!myLike)
      }

      const { data: commentData } = await supabase
        .from('folder_comments')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: true })
      setComments(commentData || [])

      setLoading(false)
    }
    fetchAll()
  }, [folderId])

  const handleLike = async () => {
    if (!myUserId) return
    const supabase = createClient()
    if (isLiked) {
      await supabase.from('folder_likes')
        .delete().eq('folder_id', folderId).eq('user_id', myUserId)
      setIsLiked(false)
      setLikeCount(p => p - 1)
    } else {
      await supabase.from('folder_likes')
        .insert({ folder_id: folderId, user_id: myUserId })
      setIsLiked(true)
      setLikeCount(p => p + 1)
    }
  }

  const handleImport = async () => {
    if (importing || !myUserId) return
    setImporting(true)
    const supabase = createClient()
    const { data: newFolder } = await supabase
      .from('folders')
      .insert({
        user_id: myUserId,
        name: folder?.name,
        icon: folder?.icon,
        color: folder?.color,
        category: folder?.category,
        is_public: false,
      })
      .select().single()

    if (newFolder) {
      const { data: allWords } = await supabase
        .from('words').select('*').eq('folder_id', folderId)
      if (allWords && allWords.length > 0) {
        await supabase.from('words').insert(
          allWords.map(w => ({
            user_id: myUserId,
            folder_id: newFolder.id,
            word: w.word,
            meaning: w.meaning,
            part_of_speech: w.part_of_speech,
            pronunciation: w.pronunciation,
            example: w.example,
          }))
        )
      }
    }
    setIsImported(true)
    setImporting(false)
  }

  const handleComment = async () => {
    if (!commentText.trim() || !myUserId || submitting) return
    setSubmitting(true)
    const supabase = createClient()
    const { data } = await supabase.from('folder_comments').insert({
      folder_id: folderId,
      user_id: myUserId,
      content: commentText.trim(),
      nickname: myNickname,
    }).select().single()
    if (data) setComments(prev => [...prev, data])
    setCommentText('')
    setSubmitting(false)
  }

  const isMyFolder = folder?.user_id === myUserId

  const inputStyle = {
    width: '100%', height: '50px',
    background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
    borderRadius: '14px', padding: '0 16px',
    fontSize: '15px', color: 'var(--color-text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p>
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, flex: 1 }}>단어장 보기</h1>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{words.length}개+</span>
        </div>

        {/* 단어장 정보 카드 */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '16px', border: '1px solid var(--color-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: folder?.color ? `${folder.color}60` : 'rgba(28,28,30,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              {folder?.icon || '📚'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '3px' }}>{folder?.name}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {folder?.category && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', background: 'rgba(28,28,30,0.07)', borderRadius: '6px', padding: '2px 7px' }}>
                    {folder.category}
                  </span>
                )}
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{words.length}개 단어</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>❤️ {likeCount}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!isMyFolder && (
              <button
                onClick={handleImport}
                disabled={isImported || importing}
                style={{
                  flex: 2, height: '44px',
                  background: isImported ? 'var(--color-surface-2)' : 'var(--color-my)',
                  color: isImported ? 'var(--color-text-secondary)' : 'var(--color-my-contrast)',
                  border: 'none', borderRadius: '12px',
                  fontSize: '14px', fontWeight: 700, cursor: isImported ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: importing ? 0.6 : 1,
                }}
              >
                <Download size={16} />
                {importing ? '가져오는 중...' : isImported ? '가져오기 완료 ✓' : '내 단어장에 가져오기'}
              </button>
            )}
            <button
              onClick={handleLike}
              style={{
                flex: 1, height: '44px',
                background: isLiked ? '#FFE5E5' : 'var(--color-surface-2)',
                color: isLiked ? '#D92D20' : 'var(--color-text-secondary)',
                border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              <Heart size={16} fill={isLiked ? '#D92D20' : 'none'} />
              {likeCount}
            </button>
          </div>
        </div>

        {/* 단어 미리보기 */}
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
          단어 미리보기
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
          {words.map(word => (
            <div key={word.id} style={{ background: 'var(--color-surface)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{word.word}</span>
                {word.part_of_speech && (
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>{word.part_of_speech}</span>
                )}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{word.meaning}</span>
            </div>
          ))}
          {words.length === 20 && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: '4px' }}>
              상위 20개 단어만 표시돼요
            </p>
          )}
        </div>

        {/* 댓글 */}
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
          댓글 {comments.length}개
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {comments.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
              첫 댓글을 남겨보세요 😊
            </p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} style={{ display: 'flex', gap: '10px', background: 'var(--color-surface)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--color-border)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8EAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  {(comment.nickname || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{comment.nickname || '익명'}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {new Date(comment.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#3C3C43', margin: 0 }}>{comment.content}</p>
                </div>
                {comment.user_id === myUserId && (
                  <button
                    onClick={async () => {
                      const supabase = createClient()
                      await supabase.from('folder_comments').delete().eq('id', comment.id)
                      setComments(prev => prev.filter(c => c.id !== comment.id))
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: '11px', padding: '0 4px', flexShrink: 0 }}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 댓글 입력 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            placeholder="댓글을 남겨보세요..."
            style={{ ...inputStyle, flex: 1, height: '46px' }}
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || submitting}
            style={{
              width: '46px', height: '46px', borderRadius: '14px',
              background: commentText.trim() ? 'var(--color-my)' : 'var(--color-surface-2)',
              border: 'none', cursor: commentText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Send size={16} color={commentText.trim() ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)'} />
          </button>
        </div>

      </div>
    </main>
  )
}
