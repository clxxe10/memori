'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Volume2, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview } from '@/lib/srs'
import { recordStudyProgress } from '@/lib/studyTracker'
import { usePagePadding } from '@/lib/responsive'

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

function QuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')
  const padding = usePagePadding('100px')

  const [words, setWords] = useState<Word[]>([])
  const [allWords, setAllWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })
  const [wrongWords, setWrongWords] = useState<typeof words>([])
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
      const { data: all } = await supabase.from('words').select('*').eq('user_id', user.id)
      setAllWords(all || [])
      let query = supabase.from('words').select('*').eq('user_id', user.id)
      if (folderId) query = query.eq('folder_id', folderId)
      const { data } = await query
      if (data) {
        const shuffled = data.sort(() => Math.random() - 0.5)
        setWords(shuffled)
        generateOptions(shuffled[0], all || [])
      }
      setLoading(false)
    }
    fetchWords()
  }, [folderId])

  const generateOptions = (word: Word, pool: Word[]) => {
    const wrong = pool.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.meaning)
    const opts = [...wrong, word.meaning].sort(() => Math.random() - 0.5)
    setOptions(opts)
  }

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'; utter.rate = 0.9
    window.speechSynthesis.speak(utter)
  }

  const handleSelect = async (opt: string, idx: number) => {
    if (selectedOption !== null) return
    setSelectedOption(idx)
    const word = words[current]
    const isCorrect = opt === word.meaning
    if (!isCorrect) setWrongWords(prev => [...prev, words[current]])
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
    setTimeout(async () => {
      if (current + 1 >= words.length) {
        await recordStudyProgress(words.length)
        setFinished(true)
      } else {
        const next = current + 1
        setCurrent(next)
        setSelectedOption(null)
        generateOptions(words[next], allWords)
      }
    }, 900)
  }

  const handleRetryWrong = () => {
    setWords(wrongWords)
    setWrongWords([])
    setCurrent(0)
    setSelectedOption(null)
    setFinished(false)
    setStats({ correct: 0, wrong: 0 })
  }

  if (loading) return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></main>

  if (finished) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif', padding: '0 24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>완료!</h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>총 {words.length}개 풀었어요</p>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', width: '100%', maxWidth: '320px' }}>
        <div style={{ flex: 1, background: 'var(--color-correct-bg)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-correct)' }}>{stats.correct}</div>
          <div style={{ fontSize: '13px', color: 'var(--color-correct)', marginTop: '4px' }}>정답</div>
        </div>
        <div style={{ flex: 1, background: 'var(--color-incorrect-bg)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-incorrect)' }}>{stats.wrong}</div>
          <div style={{ fontSize: '13px', color: 'var(--color-incorrect)', marginTop: '4px' }}>오답</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
        <button onClick={() => { setCurrent(0); setFinished(false); setSelectedOption(null); setStats({ correct: 0, wrong: 0 }); setWords(prev => { const s = [...prev].sort(() => Math.random() - 0.5); generateOptions(s[0], allWords); return s }) }}
          style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={18} /> 다시 풀기
        </button>
        {wrongWords.length > 0 && (
          <button onClick={handleRetryWrong} style={{
            width: '100%', height: '52px',
            background: 'var(--color-incorrect-bg)',
            color: 'var(--color-incorrect)',
            border: '1.5px solid var(--color-incorrect)',
            borderRadius: '14px', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}>
            <RotateCcw size={18} /> 틀린 단어 {wrongWords.length}개 다시 풀기
          </button>
        )}
        <button onClick={() => router.push('/home')} style={{ width: '100%', height: '52px', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding, maxWidth: 'min(560px, 100%)', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>객관식 퀴즈</div>
            {folderName && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{folderName}</div>}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{current + 1}/{words.length}</div>
        </div>

        <div style={{ height: '4px', background: 'var(--color-track)', borderRadius: '4px', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ height: '4px', background: 'var(--color-my)', borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.09)', padding: '24px 20px', textAlign: 'center', marginBottom: '0', flexShrink: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button onClick={() => handleSpeak(word.word)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-surface-2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Volume2 size={15} color="var(--color-text-secondary)" />
          </button>
          <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '-0.5px' }}>{word.word}</div>
          {word.pronunciation && <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>{word.pronunciation}</div>}
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        }}>
          {options.map((opt, i) => {
            const isSelected = selectedOption === i
            const isCorrect = opt === word.meaning
            let bg = 'var(--color-surface)', border = '1.5px solid var(--color-border)', color = 'var(--color-text-primary)'
            if (isSelected && isCorrect) { bg = 'var(--color-correct-bg)'; border = '1.5px solid var(--color-correct)'; color = 'var(--color-correct)' }
            if (isSelected && !isCorrect) { bg = 'var(--color-incorrect-bg)'; border = '1.5px solid var(--color-incorrect)'; color = 'var(--color-incorrect)' }
            if (selectedOption !== null && !isSelected && isCorrect) { bg = 'var(--color-correct-bg)'; border = '1.5px solid var(--color-correct)'; color = 'var(--color-correct)' }
            return (
              <button key={i} onClick={() => handleSelect(opt, i)}
                style={{ width: '100%', padding: '16px', background: bg, border, borderRadius: '14px', fontSize: '15px', color, fontWeight: 500, textAlign: 'left' as const, cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ fontWeight: 700, marginRight: '8px' }}>{['①','②','③','④'][i]}</span>{opt}
              </button>
            )
          })}
        </div>

      </div>
    </main>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></div>}>
      <QuizContent />
    </Suspense>
  )
}
