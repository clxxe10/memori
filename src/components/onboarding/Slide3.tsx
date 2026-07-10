'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  onNext: () => void
  onBack: () => void
  onGoogleLogin: () => void
  email: string
  setEmail: (v: string) => void
  name: string
  setName: (v: string) => void
}

export default function Slide3({ onNext, onBack, onGoogleLogin, email, setEmail, name, setName }: Props) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'email' | 'password'>('email')
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slide3FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s3-card { animation: slide3FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const handleNext = async () => {
    setError('')
    if (mode === 'email') {
      if (!email.trim() || !email.includes('@')) { setError('올바른 이메일을 입력해주세요'); return }
      setMode('password'); return
    }
    if (mode === 'password') {
      if (password.length < 6) { setError('비밀번호는 6자 이상이에요'); return }
      setLoading(true)
      try {
        const supabase = createClient()
        if (isLogin) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
          if (signInError) { setError('이메일 또는 비밀번호가 올바르지 않아요'); return }
          onGoogleLogin()
        } else {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: name } }
          })
          if (signUpError) {
            if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
              setError('이미 가입된 이메일이에요. 로그인해주세요.')
            } else {
              setError(signUpError.message)
            }
            return
          }
          if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
            setError('이미 가입된 이메일이에요. 로그인해주세요.')
            return
          }
          onNext()
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleKakao = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'profile_nickname profile_image',
      }
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <style>{`
        @media (prefers-color-scheme: dark) {
          .s3-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .s3-card-inner { background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)) !important; border-color: rgba(255,255,255,0.12) !important; }
          .s3-title { color: #FFFFFF !important; }
          .s3-sub { color: rgba(235,235,245,0.6) !important; }
          .s3-input { background: rgba(120,120,128,0.24) !important; border-color: rgba(255,255,255,0.10) !important; color: #FFFFFF !important; }
          .s3-back { background: rgba(120,120,128,0.24) !important; color: rgba(255,255,255,0.7) !important; }
          .s3-divider { background: rgba(255,255,255,0.14) !important; }
          .s3-dot { background: rgba(235,235,245,0.22) !important; }
          .s3-google { background: rgba(255,255,255,0.12) !important; color: #FFFFFF !important; }
        }
      `}</style>

      <div className="s3-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      }} />

      {/* 상단 바 */}
      <div style={{
        position: 'fixed', top: '66px', left: '20px', right: '20px',
        height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 10,
      }}>
        <button className="s3-back" onClick={() => { if (mode === 'password') { setMode('email'); setError('') } else { onBack() } }} style={{
          width: '32px', height: '32px', borderRadius: '9999px',
          background: 'rgba(120,120,128,0.10)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', color: 'rgba(60,60,67,0.65)',
        }}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className={i !== 3 ? 's3-dot' : ''} style={{
              width: i === 3 ? '18px' : '6px', height: '6px',
              borderRadius: '9999px',
              background: i === 3 ? 'var(--color-my)' : 'rgba(60,60,67,0.18)',
              transition: 'width 300ms cubic-bezier(0.32,0.72,0,1)',
            }} />
          ))}
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* 글래스 카드 */}
      <div className="s3-card s3-card-inner" style={{
        width: 'calc(100% - 48px)', maxWidth: '360px',
        background: 'linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        padding: '28px 22px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '12px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.9), rgba(255,255,255,.5))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>🔐</div>

        <div style={{ textAlign: 'center' }}>
          <h2 className="s3-title" style={{
            fontSize: '21px', fontWeight: 700, letterSpacing: '-0.4px',
            margin: '0 0 6px', color: '#0B0B0C',
          }}>{isLogin ? '로그인' : '계정을 만들어보세요'}</h2>
          <p className="s3-sub" style={{
            fontSize: '14px', color: 'rgba(60,60,67,0.55)', margin: 0,
          }}>
            {mode === 'email' ? '이메일을 입력해주세요' : '비밀번호를 입력해주세요'}
          </p>
        </div>

        {mode === 'email' ? (
          <input className="s3-input" type="email" placeholder="이메일" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', height: '44px', borderRadius: '14px', padding: '0 16px', fontSize: '14px', border: '1px solid rgba(60,60,67,0.08)', background: 'rgba(120,120,128,0.12)', color: '#0B0B0C', outline: 'none', boxSizing: 'border-box' as const }} />
        ) : (
          <input className="s3-input" type="password" placeholder="비밀번호 (6자 이상)" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', height: '44px', borderRadius: '14px', padding: '0 16px', fontSize: '14px', border: '1px solid rgba(60,60,67,0.08)', background: 'rgba(120,120,128,0.12)', color: '#0B0B0C', outline: 'none', boxSizing: 'border-box' as const }} />
        )}

        {error && <p style={{ fontSize: '13px', color: 'var(--color-incorrect)', margin: 0, textAlign: 'center' }}>{error}</p>}

        <button onClick={handleNext} disabled={loading} style={{
          width: '100%', height: '44px', borderRadius: '9999px',
          background: 'var(--color-my)', color: 'var(--color-my-contrast)',
          border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? '처리 중...' : (mode === 'email' ? '계속하기' : (isLogin ? '로그인' : '가입하기'))}
        </button>

        {mode === 'email' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div className="s3-divider" style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.6)' }} />
              <span style={{ fontSize: '11px', color: 'rgba(60,60,67,0.45)' }}>또는</span>
              <div className="s3-divider" style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.6)' }} />
            </div>
            <button onClick={handleGoogle} className="s3-google" style={{
              width: '100%', height: '44px', borderRadius: '9999px',
              background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(60,60,67,0.08)',
              cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#0B0B0C',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>🌐 Google로 계속하기</button>
            <button onClick={handleKakao} style={{
              width: '100%', height: '44px', borderRadius: '9999px',
              background: '#FEE500', border: 'none',
              cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#3C1E1E',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>💬 카카오로 계속하기</button>
          </>
        )}
      </div>

      {/* 하단 로그인/회원가입 전환 */}
      <button onClick={() => { setIsLogin(p => !p); setMode('email'); setError('') }} style={{
        position: 'fixed',
        bottom: 'max(52px, calc(env(safe-area-inset-bottom) + 32px))',
        left: '28px', right: '28px',
        height: '32px', background: 'transparent', border: 'none',
        cursor: 'pointer', fontSize: '13px', color: 'rgba(60,60,67,0.6)', zIndex: 10,
      }}>
        {isLogin ? '계정이 없으신가요? · 회원가입' : '이미 계정이 있어요 · 로그인'}
      </button>
    </div>
  )
}
