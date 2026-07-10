'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Volume2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview } from '@/lib/srs'
import { recordStudyProgress } from '@/lib/studyTracker'
import { usePagePadding } from '@/lib/responsive'
import { useSwipe } from '@/hooks/useSwipe'
import { haptics } from '@/lib/haptics'

type Word = {
  id: string
  word: string
  meaning: string
  part_of_speech: string | null
  pronunciation: string | null
  example: string | null
  correct_count: number
  review_interval: number
  ease_factor: number
  next_review_date: string | null
}

function FlashcardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')
  const padding = usePagePadding('100px')

  const [words, setWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [stats, setStats] = useState({ know: 0, dontKnow: 0 })
  const [folderName, setFolderName] = useState('')
  const [cardAnim, setCardAnim] = useState('')
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [dragX, setDragX] = useState(0)
  const dragStartX = useRef(0)
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideInFromRight {
        from { transform: translateX(60px) scale(0.95); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes slideInFromLeft {
        from { transform: translateX(-60px) scale(0.95); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes slideOutToLeft {
        from { transform: translateX(0) scale(1); opacity: 1; }
        to { transform: translateX(-60px) scale(0.95); opacity: 0; }
      }
      @keyframes slideOutToRight {
        from { transform: translateX(0) scale(1); opacity: 1; }
        to { transform: translateX(60px) scale(0.95); opacity: 0; }
      }
      @keyframes flipOut {
        from { transform: perspective(600px) rotateY(0deg); opacity: 1; }
        to { transform: perspective(600px) rotateY(90deg); opacity: 0; }
      }
      @keyframes flipIn {
        from { transform: perspective(600px) rotateY(-90deg); opacity: 0; }
        to { transform: perspective(600px) rotateY(0deg); opacity: 1; }
      }
      .card-slide-out-left {
        animation: slideOutToLeft 0.18s ease-in forwards;
      }
      .card-slide-out-right {
        animation: slideOutToRight 0.18s ease-in forwards;
      }
      .card-slide-in-right {
        animation: slideInFromRight 0.22s ease-out forwards;
      }
      .card-slide-in-left {
        animation: slideInFromLeft 0.22s ease-out forwards;
      }
      .card-flip-out {
        animation: flipOut 0.15s ease-in forwards;
      }
      .card-flip-in {
        animation: flipIn 0.15s ease-out forwards;
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  useEffect(() => {
    const fetchWords = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (folderId) {
        const { data: folder } = await supabase
          .from('folders').select('name').eq('id', folderId).single()
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

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const speak = () => {
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.rate = 0.9
      const voices = window.speechSynthesis.getVoices()
      const preferred = ['Samantha', 'Alex', 'Karen', 'Google US English']
      for (const name of preferred) {
        const found = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'))
        if (found) { utter.voice = found; break }
      }
      window.speechSynthesis.speak(utter)
    }
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) speak()
    else { window.speechSynthesis.onvoiceschanged = () => { speak(); window.speechSynthesis.onvoiceschanged = null } }
  }

  const handleAnswer = async (know: boolean) => {
    if (know) haptics.success()
    else haptics.medium()

    const word = words[current]
    const supabase = createClient()

    const { nextInterval, nextEaseFactor, nextReviewDate } = calculateNextReview(
      word.correct_count || 0,
      word.review_interval || 0,
      word.ease_factor || 2.5,
      know
    )

    supabase.from('words').update({
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
      recordStudyProgress(words.length)
      setFinished(true)
    } else {
      setCurrent(prev => prev + 1)
      setFlipped(false)
    }
  }

  const handleRestart = () => {
    setWords(prev => [...prev].sort(() => Math.random() - 0.5))
    setCurrent(0); setFlipped(false); setFinished(false)
    setStats({ know: 0, dontKnow: 0 })
    setCardAnim('')
  }

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      haptics.medium()
      setExitDirection('left')
      setTimeout(() => {
        handleAnswer(false)
        setExitDirection(null)
      }, 450)
    },
    onSwipeRight: () => {
      haptics.success()
      setExitDirection('right')
      setTimeout(() => {
        handleAnswer(true)
        setExitDirection(null)
      }, 450)
    },
    threshold: 60,
  })

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
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
      <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>단어가 없어요</p>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>단어장에 단어를 먼저 추가해주세요</p>
      <button onClick={() => router.back()} style={{ height: '50px', padding: '0 32px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
    </main>
  )

  const finishStyle = `
  @keyframes emojiBounce {
    0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
    50%  { opacity: 1; transform: scale(1.3) rotate(10deg); }
    70%  { transform: scale(0.9) rotate(-5deg); }
    85%  { transform: scale(1.1) rotate(3deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  .emoji-bounce { animation: emojiBounce 800ms cubic-bezier(0.32,0.72,0,1) both; }
`

  if (finished) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: '0 24px' }}>
      <style>{finishStyle}</style>
      <div className="emoji-bounce" style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>완료!</h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>총 {words.length}개 학습했어요</p>
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
        <button onClick={handleRestart} style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={18} /> 다시 학습하기
        </button>
        <button onClick={() => router.push('/home')} style={{ width: '100%', height: '52px', background: 'var(--color-bg)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
      </div>
    </main>
  )

  const word = words[current]
  const posStyle = getPosStyle(word.part_of_speech)
  const progress = (current / words.length) * 100

  return (
    <main style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding,
        maxWidth: 'min(560px, 100%)',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px', flexShrink: 0,
        }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>플래시카드</div>
            {folderName && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{folderName}</div>}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{current + 1}/{words.length}</div>
        </div>

        {/* 프로그레스 바 */}
        <div style={{ height: '4px', background: 'var(--color-track)', borderRadius: '4px', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ height: '4px', background: 'var(--color-my)', borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>

        {/* 카드 + 좌우 버튼 */}
        <div style={{
          flex: 1, minHeight: 0,
          position: 'relative',
          display: 'flex', alignItems: 'center',
          marginBottom: '14px',
        }}>
          {/* 왼쪽 버튼 */}
          <button
            onClick={() => {
              if (current > 0) {
                setCardAnim('card-slide-out-right')
                setTimeout(() => {
                  setCurrent(p => p - 1)
                  setFlipped(false)
                  setCardAnim('card-slide-in-left')
                  setTimeout(() => setCardAnim(''), 220)
                }, 180)
              }
            }}
            disabled={current === 0}
            style={{
              position: 'absolute', top: '50%', left: '12px', zIndex: 10,
              transform: 'translateY(-50%)',
              width: '32px', height: '32px',
              background: 'transparent', border: 'none',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: current === 0 ? 0.3 : 0.6,
            }}
          >
            <ChevronLeft size={15} color={current === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)'} />
          </button>

          {/* 카드 */}
          <div
            key={current}
            {...swipeHandlers}
            onTouchStart={(e) => {
              dragStartX.current = e.touches[0].clientX
              swipeHandlers.onTouchStart(e)
            }}
            onTouchMove={(e) => {
              if (exitDirection) return
              const dx = e.touches[0].clientX - dragStartX.current
              setDragX(dx)
            }}
            onTouchEnd={(e) => {
              swipeHandlers.onTouchEnd(e)
              setDragX(0)
            }}
            className={cardAnim}
            onClick={() => {
              setCardAnim('card-flip-out')
              setTimeout(() => {
                setFlipped(f => !f)
                setCardAnim('card-flip-in')
                setTimeout(() => setCardAnim(''), 150)
              }, 150)
            }}
            style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: '28px', right: '28px',
              background: 'var(--color-surface)',
              borderRadius: '24px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.09)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '20px 16px',
              cursor: 'pointer',
              textAlign: 'center',
              border: flipped ? '2px solid rgba(28,28,30,0.10)' : '2px solid transparent',
              overflow: 'hidden',
              transform: exitDirection === 'left'
                ? 'translateX(-150%) rotate(-20deg)'
                : exitDirection === 'right'
                ? 'translateX(150%) rotate(20deg)'
                : `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
              opacity: exitDirection ? 0 : 1,
              transition: exitDirection
                ? 'all 0.45s ease-in'
                : dragX !== 0
                ? 'none'
                : 'transform 0.2s ease-out',
            }}
          >
            <button
              onClick={e => { e.stopPropagation(); handleSpeak(word.word) }}
              style={{ position: 'absolute', top: '14px', left: '14px', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Volume2 size={14} color="var(--color-text-secondary)" />
            </button>

            <div style={{ position: 'absolute', top: '16px', right: '14px', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
              {flipped ? '탭해서 단어 보기' : '탭해서 뜻 보기'}
            </div>

            {!flipped ? (
              <>
                <span style={{ background: posStyle.bg, color: posStyle.color, borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, marginBottom: '14px', display: 'inline-block' }}>
                  {word.part_of_speech || '기타'}
                </span>
                <div style={{ fontSize: '34px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1px', marginBottom: '10px', lineHeight: 1.1, wordBreak: 'break-word' }}>
                  {word.word}
                </div>
                {word.pronunciation && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>{word.pronunciation}</div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '10px', fontWeight: 500 }}>{word.word}</div>
                <div style={{ width: '36px', height: '2px', background: 'var(--color-track)', borderRadius: '2px', marginBottom: '12px' }} />
                <span style={{ background: posStyle.bg, color: posStyle.color, borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, marginBottom: '10px', display: 'inline-block' }}>
                  {word.part_of_speech || '기타'}
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', marginBottom: '8px', wordBreak: 'break-word' }}>
                  {word.meaning}
                </div>
                {word.pronunciation && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>{word.pronunciation}</div>
                )}
                {word.example && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    &quot;{word.example}&quot;
                  </div>
                )}
              </>
            )}
          </div>

          {/* 오른쪽 버튼 */}
          <button
            onClick={() => {
              if (current < words.length - 1) {
                setCardAnim('card-slide-out-left')
                setTimeout(() => {
                  setCurrent(p => p + 1)
                  setFlipped(false)
                  setCardAnim('card-slide-in-right')
                  setTimeout(() => setCardAnim(''), 220)
                }, 180)
              }
            }}
            disabled={current === words.length - 1}
            style={{
              position: 'absolute', top: '50%', right: '12px', zIndex: 10,
              transform: 'translateY(-50%)',
              width: '32px', height: '32px',
              background: 'transparent', border: 'none',
              cursor: current === words.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: current === words.length - 1 ? 0.3 : 0.6,
            }}
          >
            <ChevronRight size={15} color={current === words.length - 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)'} />
          </button>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0 24px', marginTop: '8px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>← 몰라요</span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>알아요 →</span>
        </div>

        {/* 알아요/몰라요 버튼 */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={() => {
              setExitDirection('left')
              setTimeout(() => {
                handleAnswer(false)
                setExitDirection(null)
              }, 450)
            }}
            style={{ flex: 1, height: '52px', background: 'transparent', border: '1.5px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
          >
            몰라요
          </button>
          <button
            onClick={() => {
              setExitDirection('right')
              setTimeout(() => {
                handleAnswer(true)
                setExitDirection(null)
              }, 450)
            }}
            style={{ flex: 1, height: '52px', background: 'transparent', border: '1.5px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
          >
            알아요
          </button>
        </div>

      </div>
    </main>
  )
}

export default function FlashcardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></div>}>
      <FlashcardContent />
    </Suspense>
  )
}
