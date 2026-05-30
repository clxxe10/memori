'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Volume2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateNextReview } from '@/lib/srs'
import { recordStudyProgress } from '@/lib/studyTracker'

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

  const [words, setWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [stats, setStats] = useState({ know: 0, dontKnow: 0 })
  const [folderName, setFolderName] = useState('')
  const [cardAnim, setCardAnim] = useState('')
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(60px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-60px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes flipOut {
      0% { transform: rotateY(0deg); opacity: 1; }
      100% { transform: rotateY(90deg); opacity: 0; }
    }
    @keyframes flipIn {
      0% { transform: rotateY(-90deg); opacity: 0; }
      100% { transform: rotateY(0deg); opacity: 1; }
    }
    .card-slide-right { animation: slideInRight 0.25s ease; }
    .card-slide-left { animation: slideInLeft 0.25s ease; }
    .card-flip-out { animation: flipOut 0.15s ease forwards; }
    .card-flip-in { animation: flipIn 0.15s ease forwards; }
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

    setCardAnim(know ? 'card-slide-left' : 'card-slide-right')
    setTimeout(async () => {
      if (current + 1 >= words.length) {
        await recordStudyProgress(words.length)
        setFinished(true)
      } else {
        setCurrent(prev => prev + 1)
        setFlipped(false)
        setCardAnim(know ? 'card-slide-right' : 'card-slide-left')
      }
    }, 200)
  }

  const handleRestart = () => {
    setWords(prev => [...prev].sort(() => Math.random() - 0.5))
    setCurrent(0); setFlipped(false); setFinished(false)
    setStats({ know: 0, dontKnow: 0 })
    setCardAnim('')
  }

  const getPosStyle = (pos: string | null) => {
    if (!pos) return { bg: 'rgba(28,28,30,0.08)', color: 'var(--color-text-primary)' }
    if (pos.includes('동사')) return { bg: 'rgba(52,199,89,0.10)', color: '#1A7F3C' }
    if (pos.includes('형용사')) return { bg: 'rgba(255,149,0,0.10)', color: '#B86800' }
    if (pos.includes('부사')) return { bg: 'rgba(175,82,222,0.10)', color: '#7B2FBE' }
    return { bg: 'rgba(28,28,30,0.08)', color: 'var(--color-text-primary)' }
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

  if (finished) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: '0 24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
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
        <button onClick={() => router.back()} style={{ width: '100%', height: '52px', background: 'var(--color-bg)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
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
        padding: '52px 20px 100px',
        maxWidth: '480px',
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
                setCardAnim('card-slide-left')
                setTimeout(() => { setCurrent(p => p - 1); setFlipped(false); setCardAnim('card-slide-right') }, 50)
              }
            }}
            disabled={current === 0}
            style={{
              position: 'absolute', left: 0, zIndex: 10,
              width: '32px', height: '32px', borderRadius: '50%',
              background: current === 0 ? 'var(--color-surface-2)' : 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={15} color={current === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)'} />
          </button>

          {/* 카드 */}
          <div
            className={cardAnim}
            onClick={() => {
              setCardAnim('card-flip-out')
              setTimeout(() => {
                setFlipped(f => !f)
                setCardAnim('card-flip-in')
              }, 150)
            }}
            style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: '40px', right: '40px',
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
                setCardAnim('card-slide-right')
                setTimeout(() => { setCurrent(p => p + 1); setFlipped(false); setCardAnim('card-slide-left') }, 50)
              }
            }}
            disabled={current === words.length - 1}
            style={{
              position: 'absolute', right: 0, zIndex: 10,
              width: '32px', height: '32px', borderRadius: '50%',
              background: current === words.length - 1 ? 'var(--color-surface-2)' : 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              cursor: current === words.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
              flexShrink: 0,
            }}
          >
            <ChevronRight size={15} color={current === words.length - 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)'} />
          </button>
        </div>

        {/* 알아요/몰라요 버튼 */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={() => handleAnswer(false)}
            style={{ flex: 1, height: '52px', background: '#FFE5E5', color: '#D92D20', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
          >
            몰라요
          </button>
          <button
            onClick={() => handleAnswer(true)}
            style={{ flex: 1, height: '52px', background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
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
