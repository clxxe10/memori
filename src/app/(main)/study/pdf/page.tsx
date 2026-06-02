'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Check, Download, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const selectedWords = words.filter(w => w.selected)
      const folderName = selectedFolder?.name || '단어장'
      const half = Math.ceil(selectedWords.length / 2)
      const leftWords = selectedWords.slice(0, half)
      const rightWords = selectedWords.slice(half)

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const fontUrl = 'https://fonts.gstatic.com/s/nanumgothic/v21/PN_3Rfy57FB_HLkEo-0V2x8.woff2'
      const fontRes = await fetch(fontUrl)
      const fontBuffer = await fontRes.arrayBuffer()
      const fontBase64 = btoa(
        new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      doc.addFileToVFS('NanumGothic.ttf', fontBase64)
      doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal')
      doc.setFont('NanumGothic')

      doc.setFontSize(16)
      doc.setFont('NanumGothic', 'normal')
      doc.text(folderName, 105, 16, { align: 'center' })

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
      const tableBody = leftWords.map((w, i) => {
        const [lc1, lc2] = getCells(w, i)
        const rw = rightWords[i]
        const [rc1, rc2] = rw ? getCells(rw, i + half) : ['', '']
        return [
          i + 1, lc1, lc2,
          rw ? i + half + 1 : '', rc1, rc2,
        ]
      })

      autoTable(doc, {
        startY: 24,
        head: [[
          { content: 'No.', styles: { halign: 'center', cellWidth: 8 } },
          { content: headers[0], styles: { cellWidth: 47 } },
          { content: headers[1], styles: { cellWidth: 47 } },
          { content: 'No.', styles: { halign: 'center', cellWidth: 8 } },
          { content: headers[0], styles: { cellWidth: 47 } },
          { content: headers[1], styles: { cellWidth: 47 } },
        ]],
        body: tableBody,
        styles: {
          font: 'NanumGothic',
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
          textColor: [28, 28, 30],
          overflow: 'linebreak',
        },
        headStyles: {
          font: 'NanumGothic',
          fillColor: [255, 255, 255],
          textColor: [28, 28, 30],
          fontStyle: 'normal',
          fontSize: 9,
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 47 },
          2: { cellWidth: 47 },
          3: { cellWidth: 8, halign: 'center' },
          4: { cellWidth: 47 },
          5: { cellWidth: 47 },
        },
        tableWidth: 204,
        margin: { left: 4, right: 4 },
        alternateRowStyles: { fillColor: [255, 255, 255] },
      })

      const url = doc.output('bloburl') as unknown as string
      setPdfUrl(url)
      setStep('done')
    } catch (e) {
      console.error('PDF 생성 오류:', e)
      alert('PDF 생성에 실패했어요. 다시 시도해주세요.')
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
              onClick={generatePDF}
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
                  한글 폰트를 불러오는 중이에요...
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  잠시만 기다려주세요 (5~10초)
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
    </main>
  )
}
