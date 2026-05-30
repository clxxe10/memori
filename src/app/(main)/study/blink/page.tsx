'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Volume2, Play, Pause, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { recordStudyProgress } from '@/lib/studyTracker'

type Word = {
  id: string
  word: string
  meaning: string
  part_of_speech: string | null
  pronunciation: string | null
}

function BlinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')

  const [words, setWords] = useState<Word[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1.5)
  const [showMeaning, setShowMeaning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [folderName, setFolderName] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
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
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setShowMeaning(prev => {
          if (prev) {
            setCurrent(c => {
              if (c + 1 >= words.length) {
                setIsPlaying(false)
                void recordStudyProgress(words.length)
                setFinished(true)
                return c
              }
              return c + 1
            })
            return false
          }
          return true
        })
      }, speed * 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, speed, words.length])

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'; utter.rate = 0.9
    const voices = window.speechSynthesis.getVoices()
    const found = voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en'))
    if (found) utter.voice = found
    window.speechSynthesis.speak(utter)
  }

  const SPEEDS = [{ label: '0.5x', val: 3 }, { label: '1x', val: 1.5 }, { label: '2x', val: 0.8 }, { label: '3x', val: 0.4 }]

  const getPosStyle = (pos: string | null) => {
    if (pos?.includes('동사')) return { bg: 'rgba(52,199,89,0.10)', color: '#1A7F3C' }
    if (pos?.includes('형용사')) return { bg: 'rgba(255,149,0,0.10)', color: '#B86800' }
    return { bg: 'rgba(28,28,30,0.07)', color: 'var(--color-text-primary)' }
  }

  if (loading) return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></main>

  if (finished) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif', padding: '0 24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>완료!</h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>총 {words.length}개 학습했어요</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
        <button onClick={() => { setCurrent(0); setFinished(false); setShowMeaning(false) }} style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={18} /> 다시 학습하기
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '52px 20px 100px', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
          <button onClick={() => { setIsPlaying(false); router.back() }} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>깜빡이</div>
            {folderName && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{folderName}</div>}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{current + 1}/{words.length}</div>
        </div>

        <div style={{ height: '4px', background: 'var(--color-track)', borderRadius: '4px', marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ height: '4px', background: 'var(--color-my)', borderRadius: '4px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ flex: 1, minHeight: 0, background: 'var(--color-surface)', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.09)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', marginBottom: '16px', textAlign: 'center', position: 'relative' }}>
          <button onClick={() => handleSpeak(word.word)} style={{ position: 'absolute', top: '14px', left: '14px', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-surface-2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Volume2 size={14} color="var(--color-text-secondary)" />
          </button>
          <span style={{ background: posStyle.bg, color: posStyle.color, borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, marginBottom: '14px', display: 'inline-block' }}>
            {word.part_of_speech || '기타'}
          </span>
          <div style={{ fontSize: '34px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1px', marginBottom: '10px', lineHeight: 1.1 }}>
            {word.word}
          </div>
          {word.pronunciation && <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>{word.pronunciation}</div>}
          {showMeaning && (
            <>
              <div style={{ width: '36px', height: '2px', background: 'var(--color-track)', borderRadius: '2px', marginBottom: '12px' }} />
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#3C3C43' }}>{word.meaning}</div>
            </>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>재생 속도</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {SPEEDS.map(s => (
                <button key={s.label} onClick={() => setSpeed(s.val)}
                  style={{ width: '40px', height: '28px', borderRadius: '8px', border: 'none', background: speed === s.val ? 'var(--color-my)' : 'var(--color-surface-2)', color: speed === s.val ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { if (current > 0) { setCurrent(p => p - 1); setShowMeaning(false) } }}
              disabled={current === 0}
              style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--color-surface-2)', border: 'none', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '18px', opacity: current === 0 ? 0.4 : 1 }}>←</button>
            <button onClick={() => setIsPlaying(p => !p)}
              style={{ flex: 1, height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isPlaying ? <><Pause size={18} /> 일시정지</> : <><Play size={18} /> 재생</>}
            </button>
            <button onClick={() => { if (current < words.length - 1) { setCurrent(p => p + 1); setShowMeaning(false) } }}
              disabled={current === words.length - 1}
              style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--color-surface-2)', border: 'none', cursor: current === words.length - 1 ? 'not-allowed' : 'pointer', fontSize: '18px', opacity: current === words.length - 1 ? 0.4 : 1 }}>→</button>
          </div>
        </div>

      </div>
    </main>
  )
}

export default function BlinkPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></div>}>
      <BlinkContent />
    </Suspense>
  )
}
