'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { detectLanguage } from '@/lib/detectLanguage'
import { showToast } from '@/components/ui/Toast'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useTranslation } from '@/lib/i18n'

export default function AddWordPage() {
  const { t, lang } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const folderId = params.id as string

  useEffect(() => {
    const tabBar = document.getElementById('tab-bar')
    if (tabBar) tabBar.style.display = 'none'
    return () => {
      if (tabBar) tabBar.style.display = ''
    }
  }, [])
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generated, setGenerated] = useState<{
    part_of_speech: string
    pronunciation: string
    example: string
  } | null>(null)
  const [error, setError] = useState('')
  const padding = usePagePadding('100px')
  const { keyboardHeight, isKeyboardOpen } = useKeyboard()

  const handleGenerate = async () => {
    if (!word.trim()) return
    setIsGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/generate-word-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim(), meaning: meaning.trim() }),
      })
      if (!res.ok) throw new Error('API 오류')
      const data = await res.json()
      setGenerated(data)
    } catch {
      setError(t.alert.aiFailed)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!word.trim() || !meaning.trim()) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsSaving(false)
        return
      }

      const { data: existing } = await supabase
        .from('words')
        .select('id')
        .eq('folder_id', folderId)
        .ilike('word', word.trim())
        .maybeSingle()

      if (existing) {
        showToast(lang === 'en' ? 'Word already exists' : '이미 있는 단어예요', 'error')
        setIsSaving(false)
        return
      }

      const { error } = await supabase.from('words').insert({
        user_id: user.id,
        folder_id: folderId,
        word: word.trim(),
        meaning: meaning.trim(),
        part_of_speech: generated?.part_of_speech || null,
        pronunciation: generated?.pronunciation || null,
        example: generated?.example || null,
      })
      if (error) throw error
      const detectedLang = detectLanguage(word.trim())
      await supabase
        .from('folders')
        .update({ language: detectedLang })
        .eq('id', folderId)
      showToast(lang === 'en' ? 'Word added!' : '단어가 추가됐어요!')
      router.back()
    } catch {
      setError(t.alert.saveFailed)
      setIsSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    height: '52px',
    background: 'var(--color-surface)',
    border: '1.5px solid var(--color-border)',
    borderRadius: '14px',
    padding: '0 16px',
    fontSize: '15px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box' as const,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>{t.vocab.addWord}</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{t.vocab.word}</p>
            <input
              style={inputStyle}
              placeholder={lang === 'en' ? 'English word' : '영어 단어'}
              value={word}
              onChange={(e) => {
                setWord(e.target.value)
                setGenerated(null)
              }}
            />
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{t.vocab.meaning}</p>
            <input
              style={inputStyle}
              placeholder={lang === 'en' ? 'Korean meaning' : '한국어 뜻'}
              value={meaning}
              onChange={(e) => {
                setMeaning(e.target.value)
                setGenerated(null)
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!word.trim() || isGenerating}
            style={{
              width: '100%',
              height: '52px',
              background: word.trim() ? 'var(--color-neutral-soft)' : 'var(--color-surface-2)',
              border: '1.5px solid',
              borderColor: word.trim() ? 'var(--color-neutral)' : 'var(--color-border)',
              borderRadius: '14px',
              cursor: word.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: word.trim() ? 'var(--color-neutral)' : '#AEAEB2',
            }}
          >
            <Sparkles size={16} />
            {isGenerating ? t.vocab.aiGenerating : t.vocab.aiGenerate}
          </button>

          {generated && (
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                padding: '16px',
                border: '1.5px solid rgba(37,99,235,0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', margin: 0 }}>{lang === 'en' ? 'AI Analysis' : 'AI 분석 결과'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '60px' }}>{lang === 'en' ? 'Part of Speech' : '품사'}</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 600 }}>{generated.part_of_speech}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '60px' }}>{lang === 'en' ? 'Pronunciation' : '발음'}</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 600 }}>{generated.pronunciation}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '60px', paddingTop: '2px' }}>{lang === 'en' ? 'Example' : '예문'}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic', flex: 1 }}>{generated.example}</span>
                </div>
              </div>
            </div>
          )}

          {error && <p style={{ fontSize: '13px', color: '#E24B4A', margin: 0 }}>{error}</p>}
        </div>
      </div>

      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: isKeyboardOpen ? keyboardHeight + 8 : 80,
        padding: '12px 24px',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 10,
        transition: 'bottom 0.2s',
      }}>
        <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto' }}>
          <button
            onClick={handleSave}
            disabled={!word.trim() || !meaning.trim() || isSaving}
            style={{
              width: '100%',
              height: '52px',
              background: word.trim() && meaning.trim() ? 'var(--color-neutral)' : 'var(--color-surface-2)',
              color: word.trim() && meaning.trim() ? 'var(--color-neutral-contrast)' : 'var(--color-text-tertiary)',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: word.trim() && meaning.trim() ? 'pointer' : 'not-allowed',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? t.vocab.saving : t.common.save}
          </button>
        </div>
      </div>
    </main>
  )
}
