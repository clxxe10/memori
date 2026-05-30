'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Volume2, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview } from '@/lib/srs'
import { recordStudyProgress } from '@/lib/studyTracker'

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

function ListeningContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')

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

  useEffect(() => {
    if (words.length > 0 && !loading) {
      setTimeout(() => handleSpeak(), 500)
    }
  }, [current, loading, words.length])

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || words.length === 0) return
    const word = words[current]
    window.speechSynthesis.cancel()
    const speak = () => {
      const utter = new SpeechSynthesisUtterance(word.word)
      utter.lang = 'en-US'; utter.rate = 0.85
      const voices = window.speechSynthesis.getVoices()
      const found = voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en'))
      if (found) utter.voice = found
      window.speechSynthesis.speak(utter)
    }
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) speak()
    else { window.speechSynthesis.onvoiceschanged = () => { speak(); window.speechSynthesis.onvoiceschanged = null } }
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
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>총 {words.length}개 들었어요</p>
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
          <RotateCcw size={18} /> 다시 듣기
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
  const progress = (current / words.length) * 100

  return (
    <main style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '52px 20px 100px', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>리스닝</div>
            {folderName && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{folderName}</div>}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{current + 1}/{words.length}</div>
        </div>

        <div style={{ height: '4px', background: 'var(--color-track)', borderRadius: '4px', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ height: '4px', background: 'var(--color-my)', borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.09)', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>음성을 듣고 단어를 입력하세요</div>
            <div onClick={handleSpeak} style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(28,28,30,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', cursor: 'pointer' }}>
              <Volume2 size={30} color="var(--color-text-primary)" />
            </div>
            <button onClick={handleSpeak} style={{ height: '32px', padding: '0 20px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              🔊 다시 듣기
            </button>
            {result && (
              <div style={{ marginTop: '16px', fontSize: '15px', fontWeight: 700, color: result === 'correct' ? '#065F46' : '#D92D20' }}>
                {result === 'correct' ? `정답! ✓ ${word.word}` : `정답: ${word.word}`}
              </div>
            )}
          </div>

          <div>
            <input
              value={inputValue}
              onChange={e => { if (!result) setInputValue(e.target.value) }}
              onKeyDown={e => e.key === 'Enter' && !result && handleCheck()}
              placeholder="들은 단어를 입력하세요..."
              autoFocus
              style={{
                width: '100%', height: '54px',
                background: result === 'correct' ? '#D1FAE5' : result === 'wrong' ? '#FFE5E5' : 'var(--color-surface)',
                border: `1.5px solid ${result === 'correct' ? '#065F46' : result === 'wrong' ? '#D92D20' : 'var(--color-border)'}`,
                borderRadius: '14px', padding: '0 16px',
                fontSize: '17px', color: 'var(--color-text-primary)', outline: 'none',
                boxSizing: 'border-box' as const, marginBottom: '10px',
              }}
            />
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

      </div>
    </main>
  )
}

export default function ListeningPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></div>}>
      <ListeningContent />
    </Suspense>
  )
}
