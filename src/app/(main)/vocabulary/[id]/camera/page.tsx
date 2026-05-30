'use client'

import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Camera, Image, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export default function CameraPage() {
  const router = useRouter()
  const params = useParams()
  const folderId = params.id as string
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setWords([])
    setError('')
  }

  const handleAnalyze = async () => {
    if (!imageFile) return
    setIsAnalyzing(true)
    setError('')
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      const res = await fetch('/api/extract-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          mediaType: imageFile.type,
        }),
      })

      if (!res.ok) throw new Error('분석 실패')
      const data = await res.json()
      setWords(data.words.map((w: any) => ({ ...w, selected: true })))
    } catch {
      setError('단어 추출에 실패했어요. 다시 시도해주세요.')
    } finally {
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

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: '52px 20px 40px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
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
                onClick={handleAnalyze}
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
                  {words.map((w, i) => (
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
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{w.word}</span>
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
                  ))}
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
    </main>
  )
}
