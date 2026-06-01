'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

export default function EditWordPage() {
  const router = useRouter()
  const params = useParams()
  const wordId = params.wordId as string
  const padding = usePagePadding()

  const [form, setForm] = useState({
    word: '', meaning: '', part_of_speech: '',
    example: '', pronunciation: '', difficulty: 'normal',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('words').select('*').eq('id', wordId).single()
      if (data) setForm({
        word: data.word || '',
        meaning: data.meaning || '',
        part_of_speech: data.part_of_speech || '',
        example: data.example || '',
        pronunciation: data.pronunciation || '',
        difficulty: data.difficulty || 'normal',
      })
      setLoading(false)
    }
    fetch()
  }, [wordId])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('words').update(form).eq('id', wordId)
    router.back()
  }

  const handleDelete = async () => {
    if (!confirm('이 단어를 삭제할까요?')) return
    const supabase = createClient()
    await supabase.from('words').delete().eq('id', wordId)
    router.back()
  }

  const inputStyle = {
    width: '100%', height: '50px',
    backgroundColor: 'var(--color-surface)',
    border: '1.5px solid var(--color-border)',
    borderRadius: '14px',
    padding: '0 16px',
    fontSize: '15px', color: 'var(--color-text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)',
    marginBottom: '8px', display: 'block',
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>단어 수정</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 0' }}>불러오는 중...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={labelStyle}>단어</label>
              <input style={inputStyle} value={form.word}
                onChange={e => setForm({...form, word: e.target.value})} placeholder="영어 단어" />
            </div>

            <div>
              <label style={labelStyle}>뜻</label>
              <input style={inputStyle} value={form.meaning}
                onChange={e => setForm({...form, meaning: e.target.value})} placeholder="한국어 뜻" />
            </div>

            <div>
              <label style={labelStyle}>품사</label>
              <input style={inputStyle} value={form.part_of_speech}
                onChange={e => setForm({...form, part_of_speech: e.target.value})} placeholder="명사 / 동사 / 형용사 등" />
            </div>

            <div>
              <label style={labelStyle}>발음기호</label>
              <input style={inputStyle} value={form.pronunciation}
                onChange={e => setForm({...form, pronunciation: e.target.value})} placeholder="/prəˌnʌnsiˈeɪʃən/" />
            </div>

            <div>
              <label style={labelStyle}>예문</label>
              <textarea
                value={form.example}
                onChange={e => setForm({...form, example: e.target.value})}
                placeholder="예문을 입력하세요"
                style={{
                  ...inputStyle, height: '80px',
                  padding: '12px 16px', resize: 'none' as const,
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', height: '52px', marginTop: '8px',
                backgroundColor: 'var(--color-my)', color: 'var(--color-my-contrast)',
                border: 'none', borderRadius: '14px',
                fontSize: '15px', fontWeight: 600,
                cursor: 'pointer', opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>

            <button
              onClick={handleDelete}
              style={{
                width: '100%', height: '52px',
                backgroundColor: 'rgba(226,75,74,0.08)',
                color: '#E24B4A', border: 'none',
                borderRadius: '14px', fontSize: '15px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              단어 삭제
            </button>

          </div>
        )}
      </div>
    </main>
  )
}
