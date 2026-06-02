'use client'

import { useEffect, useState, useRef, Suspense, type CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Word = {
  id: string
  word: string
  meaning: string
  part_of_speech: string | null
}

type FallingWord = {
  id: string
  wordId: string
  word: string
  meaning: string
  part_of_speech: string | null
  x: number
  y: number
  speed: number
  status: 'falling' | 'correct' | 'missed'
}

type GameMode = 'word-to-meaning' | 'meaning-to-word'

function SpeedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')

  const [words, setWords] = useState<Word[]>([])
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [lives, setLives] = useState(3)
  const [stage, setStage] = useState(1)
  const [correct, setCorrect] = useState(0)
  const [missed, setMissed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [mode, setMode] = useState<GameMode>('word-to-meaning')
  const [flashWord, setFlashWord] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number; color: string; dx: string; dy: string }>>([])
  const [missedWords, setMissedWords] = useState<Array<{ word: string; meaning: string }>>([])
  const [bestScore, setBestScore] = useState<number>(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number>(0)
  const wordQueueRef = useRef<Word[]>([])
  const fallingWordsRef = useRef<FallingWord[]>([])
  const nextSpawnRef = useRef<number>(0)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const livesRef = useRef(3)
  const stageRef = useRef(1)
  const correctRef = useRef(0)
  const missedRef = useRef(0)
  const missedWordsRef = useRef<Array<{ word: string; meaning: string }>>([])
  const bestScoreRef = useRef(0)

  useEffect(() => {
    const fetchWords = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let query = supabase.from('words').select('id, word, meaning, part_of_speech').eq('user_id', user.id)
      if (folderId) query = query.eq('folder_id', folderId)
      const { data } = await query
      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setWords(shuffled)
        wordQueueRef.current = shuffled
      }
      setLoading(false)
    }
    fetchWords()
  }, [folderId])

  useEffect(() => {
    const saved = localStorage.getItem('speed_best_score')
    if (saved) {
      const parsed = Number(saved)
      setBestScore(parsed)
      bestScoreRef.current = parsed
    }
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes wordCorrect {
        0% { transform: translateX(-50%) scale(1); opacity: 1; filter: brightness(1); }
        20% { transform: translateX(-50%) scale(1.4); opacity: 1; filter: brightness(1.5); }
        40% { transform: translateX(-50%) scale(1.2) rotate(-3deg); opacity: 0.9; }
        60% { transform: translateX(-50%) scale(1.3) rotate(3deg) translateY(-10px); opacity: 0.7; }
        100% { transform: translateX(-50%) scale(0) translateY(-40px); opacity: 0; }
      }
      @keyframes wordMissed {
        0% { transform: translateX(-50%) scale(1); opacity: 1; }
        20% { transform: translateX(calc(-50% - 8px)) scale(1.1); }
        40% { transform: translateX(calc(-50% + 8px)) scale(1.1); }
        60% { transform: translateX(calc(-50% - 6px)); }
        80% { transform: translateX(calc(-50% + 6px)); opacity: 0.5; }
        100% { transform: translateX(-50%) scale(0.8); opacity: 0; }
      }
      @keyframes wordSpawn {
        0% { transform: translateX(-50%) scale(0) rotate(-10deg); opacity: 0; }
        70% { transform: translateX(-50%) scale(1.1) rotate(2deg); opacity: 1; }
        100% { transform: translateX(-50%) scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes particleBurst {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1); opacity: 0; }
      }
      @keyframes countDown {
        0% { transform: scale(0.5); opacity: 0; }
        30% { transform: scale(1.3); opacity: 1; }
        70% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      .word-spawn { animation: wordSpawn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .word-correct { animation: wordCorrect 0.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
      .word-missed { animation: wordMissed 0.4s ease-out forwards; }
      .count-down { animation: countDown 0.8s ease-in-out forwards; }
      .input-shake { animation: shake 0.3s ease; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  const handleGameOver = () => {
    if (scoreRef.current > bestScoreRef.current) {
      setBestScore(scoreRef.current)
      bestScoreRef.current = scoreRef.current
      localStorage.setItem('speed_best_score', String(scoreRef.current))
    }
    setGameOver(true)
  }

  const spawnWord = () => {
    if (wordQueueRef.current.length === 0) return
    const word = wordQueueRef.current[0]
    wordQueueRef.current = wordQueueRef.current.slice(1)

    const x = 15 + Math.random() * 60
    const baseSpeed = 9 + (stageRef.current - 1) * 3
    const comboBonus = Math.floor(comboRef.current / 3) * 0.8
    const speed = baseSpeed + comboBonus + Math.random() * 2

    const newWord: FallingWord = {
      id: `${word.id}_${Date.now()}`,
      wordId: word.id,
      word: word.word,
      meaning: word.meaning,
      part_of_speech: word.part_of_speech,
      x,
      y: 0,
      speed,
      status: 'falling',
    }

    fallingWordsRef.current = [...fallingWordsRef.current, newWord]
    setFallingWords([...fallingWordsRef.current])
  }

  const getSpawnInterval = () => {
    return Math.max(2000, 4500 - (stageRef.current - 1) * 250)
  }

  const gameLoop = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    const delta = (timestamp - lastTimeRef.current) / 1000
    lastTimeRef.current = timestamp

    const gameArea = gameAreaRef.current
    if (!gameArea) {
      animFrameRef.current = requestAnimationFrame(gameLoop)
      return
    }

    let livesLost = 0
    const updated = fallingWordsRef.current.map(fw => {
      if (fw.status !== 'falling') return fw
      const newY = fw.y + fw.speed * delta
      if (newY > 95) {
        livesLost++
        return { ...fw, y: 95, status: 'missed' as const }
      }
      return { ...fw, y: newY }
    })

    if (livesLost > 0) {
      vibrate([80, 30, 80])
      const missedList = fallingWordsRef.current.filter(fw => fw.y > 95 && fw.status === 'falling')
      missedList.forEach(fw => {
        missedWordsRef.current = [...missedWordsRef.current, { word: fw.word, meaning: fw.meaning }]
      })
      setMissedWords([...missedWordsRef.current])
      const newLives = Math.max(0, livesRef.current - livesLost)
      livesRef.current = newLives
      setLives(newLives)
      comboRef.current = 0
      setCombo(0)
      missedRef.current += livesLost
      setMissed(missedRef.current)
      if (newLives <= 0) {
        handleGameOver()
        fallingWordsRef.current = []
        setFallingWords([])
        return
      }
    }

    fallingWordsRef.current = updated.filter(fw => fw.status === 'falling')
    setFallingWords(updated)
    setTimeout(() => {
      setFallingWords(prev => prev.filter(fw => fw.status === 'falling'))
    }, 500)

    if (timestamp > nextSpawnRef.current && wordQueueRef.current.length > 0) {
      const maxWords = Math.min(2 + Math.floor((stageRef.current - 1) / 2), 5)
      if (fallingWordsRef.current.length < maxWords) {
        spawnWord()
        nextSpawnRef.current = timestamp + getSpawnInterval()
      }
    }

    const newStage = Math.floor(correctRef.current / 8) + 1
    if (newStage !== stageRef.current) {
      stageRef.current = newStage
      setStage(newStage)
      vibrate([50, 30, 50, 30, 100])
    }

    if (wordQueueRef.current.length === 0 && fallingWordsRef.current.length === 0) {
      handleGameOver()
      return
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)
  }

  const startGame = () => {
    const initialLives = words.length >= 30 ? 5 : 3
    setLives(initialLives)
    livesRef.current = initialLives

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)

    setCountdown(3)
    let count = 3
    countdownTimerRef.current = setInterval(() => {
      count--
      if (count === 0) {
        setCountdown(null)
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
        setGameStarted(true)
        lastTimeRef.current = 0
        nextSpawnRef.current = 0
        spawnWord()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        setTimeout(() => inputRef.current?.focus(), 100)
      } else {
        setCountdown(count)
      }
    }, 800)
  }

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)

    const trimmed = val.trim().toLowerCase()
    if (!trimmed) return

    const normalize = (str: string) =>
      str.toLowerCase()
        .replace(/[~\-·]/g, '')
        .replace(/\s+/g, '')
        .trim()

    const normalizedInput = normalize(trimmed)

    const matched = fallingWordsRef.current.find(fw => {
      if (fw.status !== 'falling') return false

      if (mode === 'word-to-meaning') {
        const meanings = fw.meaning
          .split(/[,，、\/]/)
          .map(m => normalize(m))
          .filter(m => m.length > 0)

        return meanings.some(m => m === normalizedInput)
      } else {
        return normalize(fw.word) === normalizedInput
      }
    })

    if (matched) {
      vibrate(30)
      setFlashWord(matched.id)
      setTimeout(() => setFlashWord(null), 400)

      const colors = ['#FFB800', '#34C759', 'var(--color-my)', '#EC4899', '#0EA5E9']
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: `p_${Date.now()}_${i}`,
        x: matched.x,
        y: matched.y,
        color: colors[i % colors.length],
        dx: `${(Math.random() - 0.5) * 60}px`,
        dy: `${(Math.random() - 0.5) * 60}px`,
      }))
      setParticles(prev => [...prev, ...newParticles])
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
      }, 600)

      const newCombo = comboRef.current + 1
      comboRef.current = newCombo
      setCombo(newCombo)
      if (newCombo > maxCombo) setMaxCombo(newCombo)

      const points = 100 + (newCombo > 1 ? (newCombo - 1) * 20 : 0)
      scoreRef.current += points
      setScore(scoreRef.current)

      correctRef.current += 1
      setCorrect(correctRef.current)

      fallingWordsRef.current = fallingWordsRef.current.map(fw =>
        fw.id === matched.id ? { ...fw, status: 'correct' as const } : fw
      )
      setFallingWords([...fallingWordsRef.current])
      setInput('')
    }
  }

  const handleRestart = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    wordQueueRef.current = shuffled
    fallingWordsRef.current = []
    scoreRef.current = 0
    comboRef.current = 0
    const initialLives = words.length >= 30 ? 5 : 3
    livesRef.current = initialLives
    stageRef.current = 1
    correctRef.current = 0
    missedRef.current = 0
    lastTimeRef.current = 0
    nextSpawnRef.current = 0
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setLives(initialLives)
    setParticles([])
    setStage(1)
    setCorrect(0)
    setMissed(0)
    setFallingWords([])
    setInput('')
    setGameOver(false)
    missedWordsRef.current = []
    setMissedWords([])
    setTimeout(() => {
      spawnWord()
      animFrameRef.current = requestAnimationFrame(gameLoop)
      inputRef.current?.focus()
    }, 100)
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p>
    </main>
  )

  if (words.length === 0) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontFamily: '-apple-system, sans-serif', padding: '0 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
      <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>단어가 없어요</p>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>단어장에 단어를 먼저 추가해주세요</p>
      <button onClick={() => router.back()} style={{ height: '50px', padding: '0 32px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>돌아가기</button>
    </main>
  )

  if (countdown !== null) return (
    <main style={{
      position: 'fixed', inset: 0,
      background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
      fontFamily: '-apple-system, sans-serif',
    }}>
      <div key={countdown} className="count-down" style={{
        fontSize: '120px', fontWeight: 900,
        color: 'var(--color-my)',
        lineHeight: 1,
        textShadow: '0 0 40px var(--color-my-light)',
      }}>
        {countdown}
      </div>
    </main>
  )

  if (!gameStarted) return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px', width: '100%' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚡</div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>스피드 모드</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
          단어가 내려오기 전에<br/>뜻을 입력해서 맞혀요!
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { key: 'word-to-meaning' as const, label: '단어 → 뜻 입력', desc: '영어 단어 보고 한국어 뜻 입력' },
            { key: 'meaning-to-word' as const, label: '뜻 → 단어 입력', desc: '한국어 뜻 보고 영어 단어 입력' },
          ].map(m => (
            <div key={m.key} onClick={() => setMode(m.key)}
              style={{
                flex: 1, padding: '12px', borderRadius: '14px', cursor: 'pointer',
                border: `1.5px solid ${mode === m.key ? 'var(--color-my)' : 'var(--color-border)'}`,
                background: mode === m.key ? 'var(--color-my)' : 'var(--color-surface)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: mode === m.key ? 'var(--color-my-contrast)' : 'var(--color-text-primary)', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '10px', color: mode === m.key ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)', opacity: 0.8 }}>{m.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {[
            { icon: '❤️', text: '목숨 3개 — 놓치면 줄어요' },
            { icon: '🔥', text: '콤보 — 연속으로 맞히면 점수 UP' },
            { icon: '⚡', text: '스테이지 — 10개마다 속도 증가' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface)', borderRadius: '14px', padding: '12px 16px', border: '1px solid var(--color-border)', textAlign: 'left' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
        <button onClick={startGame}
          style={{ width: '100%', height: '54px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '16px', fontSize: '17px', fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.3px' }}>
          게임 시작 →
        </button>
        <button onClick={() => router.back()}
          style={{ width: '100%', height: '44px', background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
          돌아가기
        </button>
      </div>
    </main>
  )

  if (gameOver) return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px', width: '100%' }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>
          {lives > 0 ? '🏆' : '💀'}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: '20px' }}>
          {lives > 0 ? '완주!' : '게임 종료'}
        </h1>
        <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '20px', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
          <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--color-my)', letterSpacing: '-1px', marginBottom: '4px' }}>{score.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>TOTAL SCORE</div>
        </div>
        {score >= bestScore && score > 0 && (
          <div style={{ background: 'rgba(255,184,0,0.10)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '12px', padding: '8px 16px', marginBottom: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFB800' }}>🏆 새로운 최고기록!</span>
          </div>
        )}

        {score < bestScore && (
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
            최고기록: {bestScore.toLocaleString()}점
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          {[
            { val: correct, lbl: '맞힘', color: '#34C759' },
            { val: missed, lbl: '놓침', color: '#E24B4A' },
            { val: `x${maxCombo}`, lbl: '최고콤보', color: '#FFB800' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', borderRadius: '14px', padding: '12px 8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        {missedWords.length > 0 && (
          <div style={{ width: '100%', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', textAlign: 'left' }}>
              놓친 단어 ({missedWords.length}개)
            </p>
            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {missedWords.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', borderRadius: '10px', padding: '8px 12px', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{w.word}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{w.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={handleRestart}
            style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>
            🔄 다시 하기
          </button>
          <button onClick={() => router.back()}
            style={{ width: '100%', height: '44px', background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', border: 'none', borderRadius: '14px', fontSize: '14px', cursor: 'pointer' }}>
            돌아가기
          </button>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 8px', flexShrink: 0 }}>
        <button onClick={() => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); router.back() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <ArrowLeft size={20} color="var(--color-text-primary)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, letterSpacing: '0.5px' }}>SCORE</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{score.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, letterSpacing: '0.5px' }}>STAGE</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-my)', lineHeight: 1 }}>{stage}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[...Array(lives > 3 ? 5 : 3)].map((_, i) => (
            <span key={i} style={{
              fontSize: '16px',
              opacity: i < lives ? 1 : 0.2,
              filter: i < lives ? 'none' : 'grayscale(1)',
            }}>❤️</span>
          ))}
        </div>
      </div>

      <div ref={gameAreaRef} style={{
        flex: 1, position: 'relative', margin: '0 16px 8px',
        borderRadius: '20px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {combo > 1 && (
          <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '20px', padding: '4px 12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFB800' }}>🔥 {combo} 콤보!</span>
          </div>
        )}

        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: p.color,
              ['--dx' as string]: p.dx,
              ['--dy' as string]: p.dy,
              animation: 'particleBurst 0.6s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 20,
            } as CSSProperties}
          />
        ))}

        {fallingWords.map(fw => (
          <div
            key={fw.id}
            className={
              fw.status === 'correct' ? 'word-correct' :
              fw.status === 'missed' ? 'word-missed' :
              fw.id === flashWord ? 'word-spawn' : ''
            }
            style={{
              position: 'absolute',
              left: `${fw.x}%`,
              top: `${fw.y}%`,
              transform: 'translateX(-50%)',
              maxWidth: '120px',
              minWidth: '80px',
              background: fw.status === 'correct'
                ? 'rgba(52,199,89,0.12)'
                : fw.status === 'missed'
                ? 'rgba(226,75,74,0.12)'
                : 'var(--color-surface-2)',
              border: `1.5px solid ${
                fw.status === 'correct' ? 'rgba(52,199,89,0.4)' :
                fw.status === 'missed' ? 'rgba(226,75,74,0.4)' :
                fw.y > 75 ? 'rgba(226,75,74,0.3)' :
                'var(--color-border)'
              }`,
              borderRadius: '12px',
              padding: '10px 18px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              boxShadow: fw.y > 75
                ? '0 0 12px rgba(226,75,74,0.2)'
                : '0 2px 12px rgba(0,0,0,0.06)',
              transition: 'border-color 0.3s',
              zIndex: fw.status === 'falling' ? 5 : 4,
            }}
          >
            <div style={{ fontSize: '17px', fontWeight: 800, color: fw.status === 'correct' ? '#34C759' : fw.status === 'missed' ? '#E24B4A' : 'var(--color-text-primary)' }}>
              {mode === 'word-to-meaning' ? fw.word : fw.meaning}
            </div>
            {fw.part_of_speech && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '1px', fontWeight: 600 }}>
                {fw.part_of_speech}
              </div>
            )}
          </div>
        ))}

        <div style={{
          position: 'absolute', bottom: '8%', left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(226,75,74,0.4), transparent)',
        }} />
        <div style={{ position: 'absolute', bottom: 'calc(8% + 4px)', right: '12px', fontSize: '8px', color: 'rgba(226,75,74,0.4)', fontWeight: 700, letterSpacing: '1px' }}>
          DANGER
        </div>
      </div>

      <div style={{ padding: '0 16px 80px', flexShrink: 0, zIndex: 20, position: 'relative' }}>
        <div style={{ height: '3px', background: 'var(--color-surface-2)', borderRadius: '3px', marginBottom: '8px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            background: 'var(--color-my)',
            width: `${(correct / Math.max(words.length, 1)) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {combo > 1 ? `🔥 x${combo} 콤보` : mode === 'word-to-meaning' ? '뜻을 입력하세요' : '단어를 입력하세요'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {correct}/{words.length}
          </span>
        </div>
        <input
          ref={inputRef}
          value={input}
          onChange={handleInput}
          placeholder={mode === 'word-to-meaning' ? '한국어 뜻 입력...' : '영어 단어 입력...'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            width: '100%', height: '52px',
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '14px', padding: '0 16px',
            fontSize: '16px', fontWeight: 600,
            color: 'var(--color-text-primary)',
            outline: 'none', boxSizing: 'border-box' as const,
            zIndex: 20,
            position: 'relative',
          }}
        />
      </div>
    </main>
  )
}

export default function SpeedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}><p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p></div>}>
      <SpeedContent />
    </Suspense>
  )
}
