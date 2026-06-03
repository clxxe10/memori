'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Check, Download, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { canUsePdfExtract, incrementPdfCount } from '@/lib/premium'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

type Folder = {
  id: string
  name: string
  icon: string
  color?: string
}

type Word = {
  id: string
  word: string
  meaning: string
  pronunciation?: string | null
  selected: boolean
}

type Step = 'folder' | 'words' | 'preview' | 'done'
type ExamType = 'word-to-meaning' | 'meaning-to-word' | 'mixed'

export default function PDFPage() {
  const router = useRouter()
  const padding = usePagePadding()
  const [step, setStep] = useState<Step>('folder')
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [examType, setExamType] = useState<ExamType>('word-to-meaning')
  const [showPdfGate, setShowPdfGate] = useState(false)

  useEffect(() => {
    const fetchFolders = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('folders').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setFolders(data || [])
    }
    fetchFolders()
  }, [])

  const handleFolderSelect = async (folder: Folder) => {
    setSelectedFolder(folder)
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('words').select('id, word, meaning, pronunciation')
      .eq('folder_id', folder.id)
    setWords((data || []).map(w => ({ ...w, selected: true })))
    setLoading(false)
    setStep('words')
  }

  const toggleWord = (id: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, selected: !w.selected } : w))
  }

  const toggleAll = () => {
    const allSelected = words.every(w => w.selected)
    setWords(prev => prev.map(w => ({ ...w, selected: !allSelected })))
  }

  const getPrompt = (w: Word, index: number) => {
    if (examType === 'word-to-meaning') return w.word
    if (examType === 'meaning-to-word') return w.meaning
    return index % 2 === 0 ? w.word : w.meaning
  }

  const getColLabels = () => {
    if (examType === 'meaning-to-word') return { left: '뜻', right: '단어' }
    return { left: '단어', right: '뜻' }
  }

  const handleGenerateClick = async () => {
    const { canUse, needAd } = await canUsePdfExtract()
    if (canUse) {
      incrementPdfCount()
      generatePDF()
    } else if (needAd) {
      setShowPdfGate(true)
    }
  }

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const selectedWords = words.filter(w => w.selected)
      const folderName = selectedFolder?.name || '단어장'
      const half = Math.ceil(selectedWords.length / 2)
      const leftWords = selectedWords.slice(0, half)
      const rightWords = selectedWords.slice(half)

      const getHeader = () => {
        if (examType === 'word-to-meaning') return ['단어', '뜻']
        if (examType === 'meaning-to-word') return ['뜻', '단어']
        return ['문제', '답']
      }
      const getCells = (word: Word, idx: number): [string, string] => {
        if (examType === 'word-to-meaning') return [word.word, '']
        if (examType === 'meaning-to-word') return [word.meaning, '']
        return idx % 2 === 0 ? [word.word, ''] : [word.meaning, '']
      }
      const headers = getHeader()

      const canvas = document.createElement('canvas')
      const scale = 2
      const logicalWidth = 794
      const logicalHeight = Math.max(1123, 40 + 30 + leftWords.length * 26 + 100)
      canvas.width = logicalWidth * scale
      canvas.height = logicalHeight * scale
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, logicalWidth, logicalHeight)

      ctx.fillStyle = '#1C1C1E'
      ctx.font = 'bold 18px Apple SD Gothic Neo, Noto Sans KR, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(folderName, 397, 32)

      const tableX = 20
      const tableY = 50
      const colWidths = [24, 160, 160, 24, 160, 160]
      const rowHeight = 26
      const totalWidth = colWidths.reduce((a, b) => a + b, 0)

      ctx.fillStyle = '#F5F5F7'
      ctx.fillRect(tableX, tableY, totalWidth, rowHeight)

      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 0.5

      ctx.font = 'bold 11px Apple SD Gothic Neo, Noto Sans KR, sans-serif'
      ctx.fillStyle = '#1C1C1E'
      ctx.textAlign = 'left'

      let xPos = tableX
      const headerLabels = ['No.', headers[0], headers[1], 'No.', headers[0], headers[1]]
      headerLabels.forEach((label, i) => {
        ctx.strokeRect(xPos, tableY, colWidths[i], rowHeight)
        ctx.fillText(label, xPos + 4, tableY + 17)
        xPos += colWidths[i]
      })

      ctx.font = '10px Apple SD Gothic Neo, Noto Sans KR, sans-serif'
      leftWords.forEach((w, i) => {
        const y = tableY + (i + 1) * rowHeight
        const [lc1] = getCells(w, i)
        const rw = rightWords[i]
        const [rc1] = rw ? getCells(rw, i + half) : ['', '']

        const rowData = [
          String(i + 1), lc1, '',
          rw ? String(i + half + 1) : '', rc1, '',
        ]

        xPos = tableX
        rowData.forEach((cell, j) => {
          ctx.strokeStyle = '#CCCCCC'
          ctx.strokeRect(xPos, y, colWidths[j], rowHeight)
          ctx.fillStyle = '#1C1C1E'
          const maxWidth = colWidths[j] - 8
          let text = cell
          while (ctx.measureText(text).width > maxWidth && text.length > 0) {
            text = text.slice(0, -1)
          }
          if (text !== cell) text += '…'
          ctx.fillText(text, xPos + 4, y + 17)
          xPos += colWidths[j]
        })
      })

      const { default: jsPDF } = await import('jspdf')
      const imgData = canvas.toDataURL('image/png')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = 210
      const pageHeight = logicalHeight * (210 / logicalWidth)
      doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)

      const url = doc.output('bloburl') as unknown as string
      setPdfUrl(url)
      setStep('done')
    } catch (e) {
      console.error('PDF 생성 오류:', e)
      alert('PDF 생성에 실패했어요.')
    } finally {
      setGenerating(false)
    }
  }

  const selectedCount = words.filter(w => w.selected).length
  const selectedWordsList = words.filter(w => w.selected)
  const previewHalf = Math.ceil(selectedWordsList.length / 2)
  const previewLeft = selectedWordsList.slice(0, previewHalf)
  const previewRight = selectedWordsList.slice(previewHalf)
  const colLabels = getColLabels()

  return (
    <main style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      paddingBottom: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => step === 'folder' ? router.back() : setStep(step === 'words' ? 'folder' : step === 'preview' ? 'words' : 'preview')}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>PDF 시험지</h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {step === 'folder' ? '단어장 선택' : step === 'words' ? '단어 선택' : step === 'preview' ? '미리보기' : '완료'}
            </p>
          </div>
        </div>

        {/* 스텝 인디케이터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
          {['단어장', '단어', '미리보기', '완료'].map((s, i) => {
            const steps = ['folder', 'words', 'preview', 'done']
            const isActive = steps.indexOf(step) >= i
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: i < 3 ? 1 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: isActive ? 'var(--color-my)' : 'var(--color-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isActive ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)' }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontWeight: isActive ? 600 : 400 }}>{s}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: '1px', background: isActive ? 'var(--color-my)' : 'var(--color-track)' }} />}
              </div>
            )
          })}
        </div>

        {/* STEP 1: 단어장 선택 */}
        {step === 'folder' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {folders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => handleFolderSelect(folder)}
                  style={{
                    background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px',
                    border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: folder.color ? `${folder.color}60` : 'rgba(28,28,30,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {folder.icon || '📚'}
                  </div>
                  <span style={{ flex: 1, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{folder.name}</span>
                  <ChevronRight size={16} color="var(--color-text-tertiary)" />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>시험 형식</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { type: 'word-to-meaning', label: '단어 → 빈칸', desc: '단어를 보고 뜻을 쓰세요' },
                  { type: 'meaning-to-word', label: '뜻 → 빈칸', desc: '뜻을 보고 단어를 쓰세요' },
                  { type: 'mixed', label: '혼합', desc: '단어→뜻, 뜻→단어 섞어서' },
                ].map(opt => (
                  <div
                    key={opt.type}
                    onClick={() => setExamType(opt.type as ExamType)}
                    style={{
                      padding: '12px 16px', borderRadius: '14px', cursor: 'pointer',
                      border: `1.5px solid ${examType === opt.type ? 'var(--color-my)' : 'var(--color-border)'}`,
                      background: examType === opt.type ? 'var(--color-my)' : 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: examType === opt.type ? 'var(--color-my-contrast)' : 'var(--color-text-primary)' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: examType === opt.type ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                    {examType === opt.type && <Check size={16} color="var(--color-my-contrast)" />}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STEP 2: 단어 선택 */}
        {step === 'words' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{selectedCount}개 선택됨</span>
              <button onClick={toggleAll} style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                {words.every(w => w.selected) ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '6px',
              marginBottom: '80px',
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>불러오는 중...</div>
              ) : words.map(word => (
                <div
                  key={word.id}
                  onClick={() => toggleWord(word.id)}
                  style={{
                    background: 'var(--color-surface)', borderRadius: '12px', padding: '12px 14px',
                    border: `1.5px solid ${word.selected ? 'var(--color-my)' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: word.selected ? 'var(--color-my)' : 'var(--color-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {word.selected && <Check size={12} color="var(--color-my-contrast)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{word.word}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{word.meaning}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              position: 'fixed', bottom: '90px', left: 0, right: 0,
              padding: '0 20px', zIndex: 40,
              maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto',
            }}>
              <button
                onClick={() => setStep('preview')}
                disabled={selectedCount === 0}
                style={{
                  width: '100%', height: '52px',
                  background: selectedCount > 0 ? 'var(--color-my)' : 'var(--color-surface-2)',
                  color: selectedCount > 0 ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)',
                  border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700,
                  cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              >
                다음 ({selectedCount}개)
              </button>
            </div>
          </>
        )}

        {/* STEP 3: 미리보기 */}
        {step === 'preview' && (
          <>
            <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '16px', border: '1px solid var(--color-border)', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center', marginBottom: '12px' }}>
                {selectedFolder?.name}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr', borderRight: '1px solid var(--color-border)' }}>
                  <div style={{ padding: '4px 0', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>#</div>
                  <div style={{ padding: '4px 6px', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>{colLabels.left}</div>
                  <div style={{ padding: '4px 6px', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>{colLabels.right}</div>
                  {previewLeft.map((w, i) => (
                    <div key={w.id} style={{ display: 'contents' }}>
                      <div style={{ padding: '4px 0', textAlign: 'center', fontSize: '8px', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>{i + 1}</div>
                      <div style={{ padding: '4px 6px', fontSize: '8px', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPrompt(w, i)}</div>
                      <div style={{ padding: '4px 6px', fontSize: '8px', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)' }}></div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr' }}>
                  <div style={{ padding: '4px 0', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>#</div>
                  <div style={{ padding: '4px 6px', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>{colLabels.left}</div>
                  <div style={{ padding: '4px 6px', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>{colLabels.right}</div>
                  {previewRight.map((w, i) => (
                    <div key={w.id} style={{ display: 'contents' }}>
                      <div style={{ padding: '4px 0', textAlign: 'center', fontSize: '8px', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>{previewHalf + i + 1}</div>
                      <div style={{ padding: '4px 6px', fontSize: '8px', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPrompt(w, previewHalf + i)}</div>
                      <div style={{ padding: '4px 6px', fontSize: '8px', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)' }}></div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '8px' }}>
                총 {selectedCount}개 단어
              </p>
            </div>
            <button
              onClick={handleGenerateClick}
              disabled={generating}
              style={{
                width: '100%', height: '52px',
                background: 'var(--color-my)', color: 'var(--color-my-contrast)',
                border: 'none', borderRadius: '14px',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                opacity: generating ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {generating ? '생성 중...' : '📥 PDF 추출하기'}
            </button>
            {generating && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  시험지를 만들고 있어요...
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  잠시만 기다려주세요
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 4: 완료 */}
        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>시험지 준비 완료!</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px', textAlign: 'center' }}>
              {selectedFolder?.name} 시험지 ({selectedCount}개 단어)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = pdfUrl!
                  a.download = `${selectedFolder?.name || '단어장'}_시험지.pdf`
                  a.click()
                }}
                style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={18} /> 저장하기
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(pdfUrl!)
                    const blob = await res.blob()
                    const file = new File([blob], `${selectedFolder?.name || '단어장'}_시험지.pdf`, { type: 'application/pdf' })
                    if (navigator.share && navigator.canShare({ files: [file] })) {
                      await navigator.share({ files: [file], title: '단어 시험지' })
                    } else {
                      const a = document.createElement('a')
                      a.href = pdfUrl!
                      a.download = `${selectedFolder?.name || '단어장'}_시험지.pdf`
                      a.click()
                    }
                  } catch (e) {
                    console.error(e)
                  }
                }}
                style={{ width: '100%', height: '52px', background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1.5px solid var(--color-border)', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Share2 size={18} /> 공유하기
              </button>
              <button
                onClick={() => router.back()}
                style={{ width: '100%', height: '52px', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                돌아가기
              </button>
            </div>
          </div>
        )}

      </div>

      {showPdfGate && (
        <>
          <div
            onClick={() => setShowPdfGate(false)}
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
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>📄</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              PDF 추출은 첫 1회 무료예요
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              광고를 시청하거나 프리미엄으로<br />무제한 사용해보세요
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  alert('광고 시청 완료! (AdMob 연동 후 실제 광고 표시)')
                  incrementPdfCount()
                  setShowPdfGate(false)
                  generatePDF()
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
                onClick={() => {
                  setShowPdfGate(false)
                  alert('프리미엄 구독 (RevenueCat 연동 후 구현)')
                }}
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
                onClick={() => setShowPdfGate(false)}
                style={{ background: 'none', border: 'none', fontSize: '14px', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '8px' }}
              >
                취소
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
