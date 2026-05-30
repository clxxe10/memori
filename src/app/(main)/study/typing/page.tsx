'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview } from '@/lib/srs'
import { recordStudyProgress } from '@/lib/studyTracker'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

type Word = {
  id: string
  word: string
  meaning: string
  part_of_speech: string | null
  pronunciation: string | null
  correct_count: number
  review_interval: number
  ease_factor: number
  next_review_date: string | null
}

function TypingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')
  const padding = usePagePadding('100px')

  const [words, setWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })
  const [folderName, setFolderName] = useState('')
  useEffect(() => {
    const fetchWords = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (folderId) {
        const { data: folder } = await supabase.from('folders').select('name').eq('id', folderId).single()
        if (folder) setFolderName(folder.name)
      }
      let query = supabase.from('words').select('*').eq('user_id', user.id)
      if (folderId) query = query.eq('folder_id', folderId)
      const { data } = await query
      if (data) setWords(data.sort(() => Math.random() - 0.5))
      setLoading(false)
    }
    fetchWords()
  }, [folderId])

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

  const handleCheck = async () => {
    if (!inputValue.trim() || result) return
    const word = words[current]
    const isCorrect = inputValue.trim().toLowerCase() === word.word.toLowerCase()
    setResult(isCorrect ? 'correct' : 'wrong')
    const supabase = createClient()

    const { nextInterval, nextEaseFactor, nextReviewDate } = calculateNextReview(
      word.correct_count || 0,
      word.review_interval || 0,
      word.ease_factor || 2.5,
      isCorrect
    )

    await supabase.from('words').update({
      correct_count: isCorrect ? (word.correct_count || 0) + 1 : Math.max(0, (word.correct_count || 0) - 1),
      difficulty: isCorrect ? 'easy' : 'hard',
      last_difficulty: isCorrect ? 'easy' : 'hard',
      next_review_date: nextReviewDate,
      review_interval: nextInterval,
      ease_factor: nextEaseFactor,
    }).eq('id', word.id)
    setStats(prev => ({ correct: isCorrect ? prev.correct + 1 : prev.correct, wrong: !isCorrect ? prev.wrong + 1 : prev.wrong }))
  }

  const handleNext = async () => {
    if (current + 1 >= words.length) {
      await recordStudyProgress(words.length)
      setFinished(true)
    } else {
      setCurrent(p => p + 1)
      setInputValue('')
      setResult(null)
    }
  }

  if (loading) return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></main>

  if (finished) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif', padding: '0 24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>완료!</h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>총 {words.length}개 풀었어요</p>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', width: '100%', maxWidth: '320px' }}>
        <div style={{ flex: 1, background: '#D1FAE5', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#065F46' }}>{stats.correct}</div>
          <div style={{ fontSize: '13px', color: '#065F46', marginTop: '4px' }}>정답</div>
        </div>
        <div style={{ flex: 1, background: '#FFE5E5', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#D92D20' }}>{stats.wrong}</div>
          <div style={{ fontSize: '13px', color: '#D92D20', marginTop: '4px' }}>오답</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
        <button onClick={() => { setCurrent(0); setFinished(false); setInputValue(''); setResult(null); setStats({ correct: 0, wrong: 0 }); setWords(prev => [...prev].sort(() => Math.random() - 0.5)) }}
          style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={18} /> 다시 풀기
        </button>
        <button onClick={() => router.back()} style={{ width: '100%', height: '52px', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
      </div>
    </main>
  )

  if (words.length === 0) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif', padding: '0 24px' }}>
      <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>단어가 없어요</p>
      <button onClick={() => router.back()} style={{ height: '50px', padding: '0 32px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
    </main>
  )

  const word = words[current]
  const posStyle = getPosStyle(word.part_of_speech)
  const progress = (current / words.length) * 100

  return (
    <main style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding, maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>타이핑</div>
            {folderName && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{folderName}</div>}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{current + 1}/{words.length}</div>
        </div>

        <div style={{ height: '4px', background: 'var(--color-track)', borderRadius: '4px', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ height: '4px', background: 'var(--color-my)', borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.09)', padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>뜻을 보고 단어를 입력하세요</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>{word.meaning}</div>
            <span style={{ background: posStyle.bg, color: posStyle.color, borderRadius: '6px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>
              {word.part_of_speech || '기타'}
            </span>
          </div>

          <div>
            <input
              value={inputValue}
              onChange={e => { if (!result) setInputValue(e.target.value) }}
              onKeyDown={e => e.key === 'Enter' && !result && handleCheck()}
              placeholder="영어 단어 입력..."
              autoFocus
              style={{
                width: '100%', height: '54px',
                background: result === 'correct' ? '#D1FAE5' : result === 'wrong' ? '#FFE5E5' : 'var(--color-surface)',
                border: `1.5px solid ${result === 'correct' ? '#065F46' : result === 'wrong' ? '#D92D20' : 'var(--color-border)'}`,
                borderRadius: '14px', padding: '0 16px',
                fontSize: '17px', color: 'var(--color-text-primary)', outline: 'none',
                boxSizing: 'border-box' as const, marginBottom: '8px',
              }}
            />
            {result === 'wrong' && (
              <div style={{ fontSize: '14px', color: '#D92D20', textAlign: 'center', marginBottom: '8px' }}>
                정답: <strong>{word.word}</strong>
              </div>
            )}
            {result === 'correct' && (
              <div style={{ fontSize: '14px', color: '#065F46', textAlign: 'center', marginBottom: '8px' }}>
                정답이에요! 🎉
              </div>
            )}
          </div>

          {!result ? (
            <button onClick={handleCheck} disabled={!inputValue.trim()}
              style={{ width: '100%', height: '52px', background: inputValue.trim() ? 'var(--color-my)' : 'var(--color-surface-2)', color: inputValue.trim() ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: inputValue.trim() ? 'pointer' : 'not-allowed' }}>
              확인
            </button>
          ) : (
            <button onClick={handleNext}
              style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              다음 →
            </button>
          )}
        </div>

      </div>
    </main>
  )
}

export default function TypingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></div>}>
      <TypingContent />
    </Suspense>
  )
}
