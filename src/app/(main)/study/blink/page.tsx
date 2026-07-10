'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pause, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function BlinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')

  const [words, setWords] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(2000)
  const [showMode, setShowMode] = useState<'word' | 'meaning'>('word')
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!folderId) return
    const fetchWords = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('words')
        .select('*')
        .eq('folder_id', folderId)
      if (data) setWords(data)
      setLoading(false)
    }
    fetchWords()
  }, [folderId])

  useEffect(() => {
    if (!isPlaying || words.length === 0) return
    
    // 앞면 보여주다가 -> 뒷면 보여주다가 -> 다음 단어
    timerRef.current = setTimeout(() => {
      if (!showBack) {
        setShowBack(true)
      } else {
        setShowBack(false)
        setIndex(prev => {
          if (prev >= words.length - 1) return 0
          return prev + 1
        })
      }
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, words, index, showBack, speed])

  const currentWord = words[index]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>불러오는 중...</div>
    </div>
  )

  if (words.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>단어가 없어요</div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--color-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 16px))',
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '16px', color: 'var(--color-text-secondary)',
          padding: '4px',
        }}>← 뒤로</button>
        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {index + 1} / {words.length}
        </span>
        <div style={{ width: '48px' }} />
      </div>

      {/* 컨트롤 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '12px', padding: '0 20px 16px',
      }}>
        {/* 단어/뜻 토글 */}
        <div style={{
          display: 'flex', background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px', padding: '3px', gap: '2px',
        }}>
          {(['word', 'meaning'] as const).map(mode => (
            <button key={mode} onClick={() => setShowMode(mode)} style={{
              padding: '5px 14px', borderRadius: '16px', border: 'none',
              background: showMode === mode ? 'var(--color-text-primary)' : 'transparent',
              color: showMode === mode ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              fontSize: '13px', fontWeight: showMode === mode ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {mode === 'word' ? '단어' : '뜻'}
            </button>
          ))}
        </div>

        {/* 속도 */}
        <select
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '12px', padding: '6px 10px',
            fontSize: '13px', color: 'var(--color-text-primary)', cursor: 'pointer',
          }}
        >
          <option value={3000}>느리게</option>
          <option value={2000}>보통</option>
          <option value={1200}>빠르게</option>
          <option value={700}>매우 빠르게</option>
        </select>
      </div>

      {/* 카드 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div
          onClick={() => setShowBack(prev => !prev)}
          style={{
            width: '100%', maxWidth: '680px',
            minHeight: '280px',
            background: 'var(--color-surface)',
            borderRadius: '24px',
            border: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 40px', gap: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            transition: 'opacity 0.15s ease',
          }}
        >
          {/* 앞면 */}
          <div style={{
            fontSize: '38px', fontWeight: 800,
            color: 'var(--color-text-primary)',
            textAlign: 'center', letterSpacing: '-0.5px',
          }}>
            {showMode === 'word' ? currentWord?.word : currentWord?.meaning}
          </div>

          {/* 뒷면 */}
          {showBack && (
            <div style={{
              fontSize: '24px',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border)',
              width: '100%',
            }}>
              {showMode === 'word' ? currentWord?.meaning : currentWord?.word}
            </div>
          )}
        </div>
      </div>

      {/* 하단 재생/정지 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '16px', padding: '20px',
        paddingBottom: 'max(100px, calc(env(safe-area-inset-bottom) + 80px))',
      }}>
        <button onClick={() => {
          setIndex(prev => prev === 0 ? words.length - 1 : prev - 1)
          setShowBack(false)
        }} style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          cursor: 'pointer', fontSize: '18px', color: 'var(--color-text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        <button onClick={() => setIsPlaying(prev => !prev)} style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--color-text-primary)', border: 'none',
          cursor: 'pointer', fontSize: '20px', color: 'var(--color-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>

        <button onClick={() => {
          setIndex(prev => prev >= words.length - 1 ? 0 : prev + 1)
          setShowBack(false)
        }} style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          cursor: 'pointer', fontSize: '18px', color: 'var(--color-text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>→</button>
      </div>
    </div>
  )
}

export default function BlinkPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>불러오는 중...</div>
      </div>
    }>
      <BlinkContent />
    </Suspense>
  )
}
