'use client'

// Supabase SQL Editor에서 실행:
// create table if not exists support_requests (
//   id uuid default gen_random_uuid() primary key,
//   user_id uuid references auth.users(id) on delete set null,
//   email text not null,
//   category text not null,
//   content text not null,
//   created_at timestamptz default now()
// );
// alter table support_requests enable row level security;
// create policy "본인 문의 작성" on support_requests
//   for insert with check (auth.uid() = user_id OR user_id is null);

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FAQ_LIST = [
  { q: '단어를 어떻게 추가하나요?', a: '단어장 내부에서 + 버튼을 눌러 사진으로 추가하거나 직접 입력할 수 있어요.' },
  { q: '학습 데이터는 어떻게 저장되나요?', a: '모든 데이터는 Supabase 서버에 안전하게 저장돼요. 기기를 바꿔도 로그인하면 그대로 유지돼요.' },
  { q: '공개 단어장은 어떻게 만드나요?', a: '단어장 편집에서 공개 설정을 켜면 검색 탭에서 다른 사용자도 볼 수 있어요.' },
  { q: '복습 시스템은 어떻게 작동하나요?', a: 'Anki의 간격반복(SM-2) 알고리즘을 기반으로 알아요/몰라요에 따라 다음 복습 날짜가 자동 계산돼요.' },
  { q: 'PDF 시험지는 어떻게 만드나요?', a: '학습 탭 → PDF 시험지 메뉴에서 단어장을 선택하고 PDF로보낼 수 있어요.' },
  { q: '마이컬러는 무엇인가요?', a: '앱의 포인트 컬러를 내 취향에 맞게 바꿀 수 있는 기능이에요. 프로필 → 테마 및 색상에서 설정해요.' },
]

export default function SupportPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [category, setCategory] = useState('버그 신고')
  const [content, setContent] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [sent, setSent] = useState(false)

  const CATEGORIES = ['버그 신고', '기능 제안', '계정 문의', '기타']

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setContactEmail(user.email)
    }
    fetchUser()
  }, [])

  const handleSend = async () => {
    if (!content.trim()) return
    if (!contactEmail.trim()) { alert('답변받을 이메일을 입력해주세요'); return }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: user?.id || null,
          email: contactEmail.trim(),
          category,
          content: content.trim(),
        })

      if (error) {
        console.error('문의 저장 오류:', error)
        alert('문의 전송에 실패했어요. 다시 시도해주세요.')
        return
      }

      setSent(true)
      setContent('')
    } catch (e) {
      console.error(e)
      alert('오류가 발생했어요.')
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', paddingBottom: '100px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '52px 20px 0' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>문의 및 도움말</h1>
        </div>

        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>자주 묻는 질문</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
          {FAQ_LIST.map((item, i) => (
            <div key={i}
              style={{ background: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', flex: 1 }}>{item.q}</span>
                <span style={{ fontSize: '16px', color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 16px 14px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--color-border)' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>문의하기</p>

        {sent ? (
          <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '32px 20px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>문의가 접수됐어요!</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {contactEmail}으로 답변 드릴게요
            </p>
            <button onClick={() => setSent(false)}
              style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '20px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              다시 문의하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                답변받을 이메일
              </p>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="이메일 입력..."
                style={{
                  width: '100%', height: '50px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px', padding: '0 16px',
                  fontSize: '14px', color: 'var(--color-text-primary)',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{ padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: category === cat ? 'var(--color-my)' : 'var(--color-surface-2)', color: category === cat ? 'var(--color-my-contrast)' : 'var(--color-text-secondary)', fontSize: '13px', fontWeight: category === cat ? 600 : 400 }}>
                  {cat}
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="문의 내용을 입력해주세요..."
              style={{ width: '100%', height: '140px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '14px 16px', fontSize: '14px', color: 'var(--color-text-primary)', outline: 'none', resize: 'none' as const, boxSizing: 'border-box' as const, lineHeight: 1.6 }}
            />
            <button
              onClick={handleSend}
              disabled={!content.trim()}
              style={{ width: '100%', height: '52px', background: content.trim() ? 'var(--color-my)' : 'var(--color-surface-2)', color: content.trim() ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: content.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Send size={16} />
              문의 보내기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
