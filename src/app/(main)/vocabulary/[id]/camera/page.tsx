'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Camera, Image, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { canUsePhotoExtract, incrementExtractCount } from '@/lib/premium'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

export default function CameraPage() {
  const router = useRouter()
  const params = useParams()
  const folderId = params.id as string
  const padding = usePagePadding('100px')
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [words, setWords] = useState<
    Array<{
      word: string
      meaning: string
      part_of_speech: string
      pronunciation: string
      example: string
      selected: boolean
    }>
  >([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [showPhotoGate, setShowPhotoGate] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const LOADING_MESSAGES = [
    '사진을 분석하고 있어요...',
    '단어를 찾고 있어요...',
    '뜻을 정리하고 있어요...',
    '발음기호를 확인하고 있어요...',
    '예문을 만들고 있어요...',
    '거의 다 됐어요!',
  ]

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startTimer = () => {
    stopTimer()
    setElapsed(0)
    setLoadingMsg(LOADING_MESSAGES[0])
    let count = 0
    timerRef.current = setInterval(() => {
      count++
      setElapsed(count)
      const msgIdx = Math.min(Math.floor(count / 3), LOADING_MESSAGES.length - 1)
      setLoadingMsg(LOADING_MESSAGES[msgIdx])
    }, 1000)
  }

  useEffect(() => {
    return () => stopTimer()
  }, [])

  const compressImage = (file: File, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = document.createElement('img')
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        resolve(compressed.split(',')[1])
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setWords([])
    setError('')
  }

  const handleAnalyzeClick = async () => {
    const { canUse, needAd } = await canUsePhotoExtract()
    if (canUse) {
      incrementExtractCount()
      handleAnalyze()
    } else if (needAd) {
      setShowPhotoGate(true)
    }
  }

  const handleAnalyze = async () => {
    if (!imageFile) return
    setIsAnalyzing(true)
    startTimer()
    setError('')
    try {
      const base64 = await compressImage(imageFile)

      const response = await fetch('/api/extract-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        alert('단어 추출에 실패했어요: ' + (data.error || '다시 시도해주세요'))
        return
      }

      setWords(data.words.map((w: { word: string; meaning: string; part_of_speech?: string; pronunciation?: string; example?: string }) => ({ ...w, selected: true })))
    } catch {
      setError('단어 추출에 실패했어요. 다시 시도해주세요.')
    } finally {
      stopTimer()
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    const selected = words.filter((w) => w.selected)
    if (selected.length === 0) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('words').insert(
        selected.map((w) => ({
          user_id: user.id,
          folder_id: folderId,
          word: w.word,
          meaning: w.meaning,
          part_of_speech: w.part_of_speech || null,
          pronunciation: w.pronunciation || null,
          example: w.example || null,
        }))
      )
      router.back()
    } catch {
      setError('저장에 실패했어요.')
      setIsSaving(false)
    }
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
    if (pos.toLowerCase().includes('verb')) return { bg: 'rgba(52,199,89,0.12)', color: '#1A7F3C' }
    if (pos.toLowerCase().includes('noun')) return { bg: 'rgba(0,122,255,0.12)', color: '#0055B3' }
    if (pos.toLowerCase().includes('adj')) return { bg: 'rgba(255,149,0,0.12)', color: '#B86800' }
    if (pos.toLowerCase().includes('adv')) return { bg: 'rgba(175,82,222,0.12)', color: '#7B2FBE' }
    return { bg: 'rgba(142,142,147,0.12)', color: '#636366' }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding,
        paddingBottom: '100px',
      }}
    >
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>사진으로 추가</h1>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {!preview ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.capture = 'environment'
                  fileRef.current.click()
                }
              }}
              style={{
                width: '100%',
                height: '120px',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(28,28,30,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={22} color="var(--color-text-primary)" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>카메라로 촬영</span>
            </button>
            <button
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.removeAttribute('capture')
                  fileRef.current.click()
                }
              }}
              style={{
                width: '100%',
                height: '120px',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(28,28,30,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image size={22} color="var(--color-text-primary)" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>갤러리에서 선택</span>
            </button>
          </div>
        ) : (
          <div>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <img
                src={preview}
                alt="preview"
                style={{ width: '100%', borderRadius: '16px', maxHeight: '240px', objectFit: 'cover' }}
              />
              <button
                onClick={() => {
                  setPreview(null)
                  setImageFile(null)
                  setWords([])
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-my-contrast)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {words.length === 0 && (
              <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing}
                style={{
                  width: '100%',
                  height: '52px',
                  background: 'var(--color-my)',
                  color: 'var(--color-my-contrast)',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isAnalyzing ? 0.7 : 1,
                  marginBottom: '12px',
                }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> AI가 단어 추출 중...
                  </>
                ) : (
                  '🔍 AI로 단어 추출하기'
                )}
              </button>
            )}

            {error && <p style={{ fontSize: '13px', color: '#E24B4A', marginBottom: '12px' }}>{error}</p>}

            {words.length > 0 && (
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                  추출된 단어 {words.length}개 — 저장할 단어를 선택하세요
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {words.map((w, i) => {
                    const posStyle = getPosStyle(w.part_of_speech || null)
                    return (
                    <div
                      key={i}
                      onClick={() =>
                        setWords((prev) =>
                          prev.map((item, idx) => (idx === i ? { ...item, selected: !item.selected } : item))
                        )
                      }
                      style={{
                        background: 'var(--color-surface)',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        border: w.selected ? '1.5px solid var(--color-my)' : '1.5px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{w.word}</span>
                          {w.part_of_speech && (
                            <span
                              style={{
                                background: posStyle.bg,
                                color: posStyle.color,
                                borderRadius: '6px',
                                padding: '2px 7px',
                                fontSize: '10px',
                                fontWeight: 600,
                                flexShrink: 0,
                              }}
                            >
                              {w.part_of_speech}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: w.selected ? 'var(--color-my)' : 'var(--color-surface-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {w.selected && <span style={{ color: 'var(--color-my-contrast)', fontSize: '11px' }}>✓</span>}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>{w.meaning}</p>
                      {w.pronunciation && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>{w.pronunciation}</p>}
                    </div>
                    )
                  })}
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving || words.filter((w) => w.selected).length === 0}
                  style={{
                    width: '100%',
                    height: '52px',
                    background: 'var(--color-my)',
                    color: 'var(--color-my-contrast)',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  {isSaving ? '저장 중...' : `선택한 ${words.filter((w) => w.selected).length}개 저장하기`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {showPhotoGate && (
        <>
          <div
            onClick={() => setShowPhotoGate(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--color-surface)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px 80px',
              zIndex: 201,
              textAlign: 'center',
            }}
          >
            <div style={{ width: '36px', height: '4px', background: 'var(--color-track)', borderRadius: '4px', margin: '0 auto 20px' }} />
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>📸</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              오늘 무료 사용을 다 썼어요
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              광고를 시청하거나 프리미엄으로<br />무제한 사용해보세요
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  alert('광고 시청 완료! (AdMob 연동 후 실제 광고 표시)')
                  incrementExtractCount()
                  setShowPhotoGate(false)
                  handleAnalyze()
                }}
                style={{
                  width: '100%',
                  height: '52px',
                  background: 'var(--color-my)',
                  color: 'var(--color-my-contrast)',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                📺 광고 보고 사용하기
              </button>
              <button
                onClick={() => { setShowPhotoGate(false); router.push('/profile/premium') }}
                style={{
                  width: '100%',
                  height: '52px',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                👑 프리미엄 구독하기 (월 4,900원)
              </button>
              <button
                onClick={() => setShowPhotoGate(false)}
                style={{ background: 'none', border: 'none', fontSize: '14px', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px' }}
              >
                취소
              </button>
            </div>
          </div>
        </>
      )}
      {isAnalyzing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            gap: '20px',
            fontFamily: '-apple-system, sans-serif',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTop: '3px solid #FFFFFF',
              animation: 'spin 1s linear infinite',
            }}
          />

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {loadingMsg}
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{elapsed}초 경과</p>
          </div>

          <div
            style={{
              width: '200px',
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '4px',
                background: 'var(--color-my)',
                width: `${Math.min((elapsed / 20) * 100, 95)}%`,
                transition: 'width 1s ease',
              }}
            />
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: '240px' }}>
            AI가 사진에서 단어를 추출하고 있어요
          </p>
        </div>
      )}
    </main>
  )
}
