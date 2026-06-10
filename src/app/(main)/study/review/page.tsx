'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
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
  example: string | null
  correct_count: number
  difficulty: string | null
  review_interval: number
  ease_factor: number
  next_review_date: string | null
}

type QuizMode = 'flashcard' | 'quiz' | 'typing'

const MODES: QuizMode[] = ['flashcard', 'quiz', 'typing']

function ReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')
  const padding = usePagePadding('100px')

  const [words, setWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [mode, setMode] = useState<QuizMode>('flashcard')
  const [flipped, setFlipped] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inputResult, setInputResult] = useState<'correct' | 'wrong' | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [stats, setStats] = useState({ know: 0, dontKnow: 0 })
  const [allWords, setAllWords] = useState<Word[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const typingAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const fetchWords = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase.from('words').select('*').eq('user_id', user.id)
      if (folderId) query = query.eq('folder_id', folderId)
      const { data } = await query
      if (!data) { setLoading(false); return }

      setAllWords(data)
      const reviewWords = data
        .filter(w => (w.difficulty === 'hard') || (w.correct_count || 0) < 1)
        .sort(() => Math.random() - 0.5)
      setWords(reviewWords.length > 0 ? reviewWords : data.sort(() => Math.random() - 0.5))
      setLoading(false)
    }
    fetchWords()
  }, [folderId])

  const generateOptions = (word: Word) => {
    const wrong = allWords
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.meaning)
    const opts = [...wrong, word.meaning].sort(() => Math.random() - 0.5)
    setOptions(opts)
  }

  useEffect(() => {
    if (words.length === 0) return
    const randomMode = MODES[Math.floor(Math.random() * MODES.length)]
    setMode(randomMode)
    setFlipped(false)
    setInputValue('')
    setInputResult(null)
    setIsAnswered(false)
    setSelectedOption(null)
    if (randomMode === 'quiz') generateOptions(words[current])
  }, [current, words])

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const speak = () => {
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'; utter.rate = 0.9
      const voices = window.speechSynthesis.getVoices()
      const found = voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en'))
      if (found) utter.voice = found
      window.speechSynthesis.speak(utter)
    }
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) speak()
    else { window.speechSynthesis.onvoiceschanged = () => { speak(); window.speechSynthesis.onvoiceschanged = null } }
  }

  const handleAnswer = async (know: boolean) => {
    const word = words[current]
    const supabase = createClient()

    const { nextInterval, nextEaseFactor, nextReviewDate } = calculateNextReview(
      word.correct_count || 0,
      word.review_interval || 0,
      word.ease_factor || 2.5,
      know
    )

    await supabase.from('words').update({
      correct_count: know
        ? (word.correct_count || 0) + 1
        : Math.max(0, (word.correct_count || 0) - 1),
      difficulty: know ? 'easy' : 'hard',
      last_difficulty: know ? 'easy' : 'hard',
      next_review_date: nextReviewDate,
      review_interval: nextInterval,
      ease_factor: nextEaseFactor,
    }).eq('id', word.id)

    setStats(prev => ({
      know: know ? prev.know + 1 : prev.know,
      dontKnow: !know ? prev.dontKnow + 1 : prev.dontKnow,
    }))

    if (current + 1 >= words.length) {
      await recordStudyProgress(words.length)
      setFinished(true)
    } else {
      setCurrent(prev => prev + 1)
    }
  }

  const handleTypingCheck = async () => {
    if (!inputValue.trim() || inputResult !== null) return
    const word = words[current]
    const isCorrect = inputValue.trim().toLowerCase() === word.word.toLowerCase()
    setInputResult(isCorrect ? 'correct' : 'wrong')
    setIsAnswered(true)

    const supabase = createClient()

    const { nextInterval, nextEaseFactor, nextReviewDate } = calculateNextReview(
      word.correct_count || 0,
      word.review_interval || 0,
      word.ease_factor || 2.5,
      isCorrect
    )

    await supabase.from('words').update({
      correct_count: isCorrect
        ? (word.correct_count || 0) + 1
        : Math.max(0, (word.correct_count || 0) - 1),
      difficulty: isCorrect ? 'easy' : 'hard',
      last_difficulty: isCorrect ? 'easy' : 'hard',
      next_review_date: nextReviewDate,
      review_interval: nextInterval,
      ease_factor: nextEaseFactor,
    }).eq('id', word.id)

    setStats(prev => ({
      know: isCorrect ? prev.know + 1 : prev.know,
      dontKnow: !isCorrect ? prev.dontKnow + 1 : prev.dontKnow,
    }))

    if (typingAdvanceRef.current) clearTimeout(typingAdvanceRef.current)
    typingAdvanceRef.current = setTimeout(async () => {
      typingAdvanceRef.current = null
      if (current + 1 >= words.length) {
        await recordStudyProgress(words.length)
        setFinished(true)
      } else {
        setCurrent(prev => prev + 1)
        setInputValue('')
        setInputResult(null)
        setIsAnswered(false)
      }
    }, 1200)
  }

  const handleOptionSelect = async (opt: string) => {
    const word = words[current]
    const idx = options.indexOf(opt)
    setSelectedOption(idx)
    const isCorrect = opt === word.meaning
    setTimeout(() => handleAnswer(isCorrect), 800)
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

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p>
    </main>
  )

  if (words.length === 0) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: '0 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>복습할 단어가 없어요!</p>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>모든 단어를 완벽하게 학습했어요</p>
      <button onClick={() => router.back()} style={{ height: '50px', padding: '0 32px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
    </main>
  )

  if (finished) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: '0 24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>복습 완료!</h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>총 {words.length}개 복습했어요</p>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', width: '100%', maxWidth: '320px' }}>
        <div style={{ flex: 1, background: '#D1FAE5', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#065F46' }}>{stats.know}</div>
          <div style={{ fontSize: '13px', color: '#065F46', marginTop: '4px' }}>알아요</div>
        </div>
        <div style={{ flex: 1, background: '#FFE5E5', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#D92D20' }}>{stats.dontKnow}</div>
          <div style={{ fontSize: '13px', color: '#D92D20', marginTop: '4px' }}>몰라요</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
        <button onClick={() => { setCurrent(0); setFinished(false); setStats({ know: 0, dontKnow: 0 }); setWords(prev => [...prev].sort(() => Math.random() - 0.5)) }}
          style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={18} /> 다시 복습하기
        </button>
        <button onClick={() => router.push('/home')} style={{ width: '100%', height: '52px', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
      </div>
    </main>
  )

  const word = words[current]
  const posStyle = getPosStyle(word.part_of_speech)
  const progress = (current / words.length) * 100
  const modeLabel = mode === 'flashcard' ? '플래시카드' : mode === 'quiz' ? '객관식' : '타이핑'

  return (
    <main style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding, maxWidth: 'min(560px, 100%)', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexShrink: 0 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>복습</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{modeLabel} 모드</div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{current + 1}/{words.length}</div>
        </div>

        <div style={{ height: '4px', background: 'var(--color-track)', borderRadius: '4px', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ height: '4px', background: 'var(--color-my)', borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>

        {mode === 'flashcard' && (
          <>
            <div onClick={() => setFlipped(f => !f)} style={{ flex: 1, minHeight: 0, background: 'var(--color-surface)', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.09)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', marginBottom: '14px', position: 'relative', cursor: 'pointer', textAlign: 'center', border: flipped ? '2px solid rgba(28,28,30,0.10)' : '2px solid transparent' }}>
              <button onClick={e => { e.stopPropagation(); handleSpeak(word.word) }} style={{ position: 'absolute', top: '14px', left: '14px', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-surface-2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Volume2 size={14} color="var(--color-text-secondary)" />
              </button>
              <div style={{ position: 'absolute', top: '16px', right: '14px', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{flipped ? '탭해서 단어 보기' : '탭해서 뜻 보기'}</div>
              {!flipped ? (
                <>
                  <span style={{ background: posStyle.bg, color: posStyle.color, borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, marginBottom: '14px', display: 'inline-block' }}>{word.part_of_speech || '기타'}</span>
                  <div style={{ fontSize: '34px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1px', marginBottom: '10px' }}>{word.word}</div>
                  {word.pronunciation && <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>{word.pronunciation}</div>}
                </>
              ) : (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>{word.word}</div>
                  <div style={{ width: '36px', height: '2px', background: 'var(--color-track)', borderRadius: '2px', marginBottom: '12px' }} />
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>{word.meaning}</div>
                  {word.example && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>&quot;{word.example}&quot;</div>}
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button onClick={() => handleAnswer(false)} style={{ flex: 1, height: '52px', background: '#FFE5E5', color: '#D92D20', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>몰라요</button>
              <button onClick={() => handleAnswer(true)} style={{ flex: 1, height: '52px', background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>알아요</button>
            </div>
          </>
        )}

        {mode === 'quiz' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.09)', padding: '24px 20px', textAlign: 'center', marginBottom: '16px', flexShrink: 0 }}>
              <button onClick={() => handleSpeak(word.word)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-surface-2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Volume2 size={15} color="var(--color-text-secondary)" />
              </button>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{word.word}</div>
              {word.pronunciation && <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>{word.pronunciation}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {options.map((opt, i) => {
                const isSelected = selectedOption === i
                const isCorrect = opt === word.meaning
                let bg = 'var(--color-surface)', border = '1.5px solid var(--color-border)', color = 'var(--color-text-primary)'
                if (isSelected && isCorrect) { bg = '#D1FAE5'; border = '1.5px solid #065F46'; color = '#065F46' }
                if (isSelected && !isCorrect) { bg = '#FFE5E5'; border = '1.5px solid #D92D20'; color = '#D92D20' }
                return (
                  <button key={i} onClick={() => !selectedOption && handleOptionSelect(opt)}
                    style={{ width: '100%', padding: '14px 16px', background: bg, border, borderRadius: '14px', fontSize: '14px', color, fontWeight: 500, textAlign: 'left', cursor: 'pointer' }}>
                    {['①','②','③','④'][i]} {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {mode === 'typing' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.09)', padding: '24px 20px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>뜻을 보고 단어를 입력하세요</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{word.meaning}</div>
              {word.part_of_speech && <span style={{ background: posStyle.bg, color: posStyle.color, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>{word.part_of_speech}</span>}
            </div>
            <input
              value={inputValue}
              onChange={e => { setInputValue(e.target.value); setInputResult(null) }}
              onKeyDown={e => e.key === 'Enter' && inputResult === null && handleTypingCheck()}
              placeholder="영어 단어 입력..."
              style={{
                width: '100%', height: '52px',
                background: inputResult === 'correct' ? '#D1FAE5' : inputResult === 'wrong' ? '#FFE5E5' : 'var(--color-surface)',
                border: `1.5px solid ${inputResult === 'correct' ? '#065F46' : inputResult === 'wrong' ? '#D92D20' : 'var(--color-border)'}`,
                borderRadius: '14px', padding: '0 16px',
                fontSize: '16px', color: 'var(--color-text-primary)', outline: 'none',
                marginBottom: '12px', boxSizing: 'border-box' as const,
              }}
            />
            {inputResult !== null && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '14px', fontWeight: 600,
                  color: inputResult === 'correct' ? '#065F46' : '#D92D20',
                  marginBottom: '8px',
                }}>
                  {inputResult === 'correct' ? '정답이에요! 🎉' : `정답: ${word.word}`}
                </div>
              </div>
            )}
            {inputResult === null ? (
              <button
                onClick={handleTypingCheck}
                disabled={!inputValue.trim()}
                style={{
                  width: '100%', height: '52px',
                  background: inputValue.trim() ? 'var(--color-my)' : 'var(--color-surface-2)',
                  color: inputValue.trim() ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)',
                  border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700,
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  marginTop: '10px',
                }}
              >
                확인
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (!isAnswered) return
                  if (typingAdvanceRef.current) {
                    clearTimeout(typingAdvanceRef.current)
                    typingAdvanceRef.current = null
                  }
                  if (current + 1 >= words.length) {
                    await recordStudyProgress(words.length)
                    setFinished(true)
                  } else {
                    setCurrent(prev => prev + 1)
                    setInputValue('')
                    setInputResult(null)
                    setIsAnswered(false)
                  }
                }}
                style={{
                  width: '100%', height: '52px',
                  background: 'var(--color-my)', color: 'var(--color-my-contrast)',
                  border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700,
                  opacity: isAnswered ? 1 : 0.4,
                  cursor: isAnswered ? 'pointer' : 'default',
                  marginTop: '10px',
                }}
              >
                다음 →
              </button>
            )}
          </div>
        )}

      </div>
    </main>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></div>}>
      <ReviewContent />
    </Suspense>
  )
}
