'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onNext: () => void
  onBack: () => void
  onLogin: () => void
  email: string
  setEmail: (v: string) => void
  name: string
  setName: (v: string) => void
}

export default function Slide2({ onNext, onBack, onLogin, email, setEmail, name, setName }: Props) {
  const [mode, setMode] = useState<'select' | 'signup' | 'login'>('select')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailStep, setEmailStep] = useState<'email' | 'password'>('email')

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slide2FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s2-card { animation: slide2FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const handleEmailSignup = async () => {
    setError('')
    if (emailStep === 'email') {
      if (!email.trim() || !email.includes('@')) { setError('올바른 이메일을 입력해주세요'); return }
      setEmailStep('password'); return
    }
    if (password.length < 6) { setError('비밀번호는 6자 이상이에요'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name || '사용자' } }
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
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async () => {
    setError('')
    if (emailStep === 'email') {
      if (!email.trim() || !email.includes('@')) { setError('올바른 이메일을 입력해주세요'); return }
      setEmailStep('password'); return
    }
    if (password.length < 6) { setError('비밀번호는 6자 이상이에요'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError('이메일 또는 비밀번호가 올바르지 않아요'); return }
      onLogin()
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) alert('구글 로그인 오류: ' + error.message)
      if (data?.url) window.location.href = data.url
    } catch (e: any) {
      alert('구글 로그인 예외: ' + e.message)
    }
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
          .s2-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .s2-card-inner { background: linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)) !important; border-color: rgba(255,255,255,0.12) !important; }
          .s2-title { color: #FFFFFF !important; }
          .s2-sub { color: rgba(235,235,245,0.6) !important; }
          .s2-input { background: rgba(120,120,128,0.24) !important; border-color: rgba(255,255,255,0.10) !important; color: #FFFFFF !important; }
          .s2-back { background: rgba(120,120,128,0.24) !important; color: rgba(255,255,255,0.7) !important; }
          .s2-dot { background: rgba(235,235,245,0.22) !important; }
          .s2-select-btn { background: rgba(120,120,128,0.16) !important; border-color: rgba(255,255,255,0.12) !important; }
          .s2-select-title { color: #FFFFFF !important; }
          .s2-select-sub { color: rgba(235,235,245,0.6) !important; }
        }
      `}</style>

      <div className="s2-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      }} />

      {/* 상단 바 */}
      <div style={{
        position: 'fixed', top: '66px', left: '20px', right: '20px',
        height: '32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 10,
      }}>
        <button className="s2-back" onClick={() => {
          if (mode !== 'select') { setMode('select'); setError(''); setEmailStep('email') }
          else { onBack() }
        }} style={{
          width: '32px', height: '32px', borderRadius: '9999px',
          background: 'rgba(120,120,128,0.10)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', color: 'rgba(60,60,67,0.65)',
        }}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className={i !== 2 ? 's2-dot' : ''} style={{
              width: i === 2 ? '18px' : '6px', height: '6px',
              borderRadius: '9999px',
              background: i === 2 ? 'var(--color-my)' : 'rgba(60,60,67,0.18)',
              transition: 'width 300ms cubic-bezier(0.32,0.72,0,1)',
            }} />
          ))}
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* 선택 화면 */}
      {mode === 'select' && (
        <div className="s2-card" style={{
          width: 'calc(100% - 48px)', maxWidth: '360px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '16px',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h2 className="s2-title" style={{
              fontSize: '24px', fontWeight: 700,
              letterSpacing: '-0.5px', margin: '0 0 8px',
              color: '#0B0B0C',
            }}>시작해볼까요?</h2>
            <p className="s2-sub" style={{
              fontSize: '14px', color: 'rgba(60,60,67,0.55)', margin: 0,
            }}>처음 오셨나요, 아니면 기존 회원이신가요?</p>
          </div>

          {/* 처음이에요 버튼 */}
          <button className="s2-select-btn" onClick={() => setMode('signup')} style={{
            width: '100%', padding: '20px',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            cursor: 'pointer', textAlign: 'left' as const,
          }}>
            <div className="s2-select-title" style={{ fontSize: '16px', fontWeight: 700, color: '#0B0B0C', marginBottom: '4px' }}>
              처음이에요 👋
            </div>
            <div className="s2-select-sub" style={{ fontSize: '13px', color: 'rgba(60,60,67,0.55)' }}>
              새 계정을 만들어요
            </div>
          </button>

          {/* 기존 회원이에요 버튼 */}
          <button className="s2-select-btn" onClick={() => setMode('login')} style={{
            width: '100%', padding: '20px',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            cursor: 'pointer', textAlign: 'left' as const,
          }}>
            <div className="s2-select-title" style={{ fontSize: '16px', fontWeight: 700, color: '#0B0B0C', marginBottom: '4px' }}>
              기존 회원이에요 →
            </div>
            <div className="s2-select-sub" style={{ fontSize: '13px', color: 'rgba(60,60,67,0.55)' }}>
              로그인할게요
            </div>
          </button>
        </div>
      )}

      {/* 회원가입 화면 */}
      {mode === 'signup' && (
        <div className="s2-card s2-card-inner" style={{
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
          <div style={{ textAlign: 'center' }}>
            <h2 className="s2-title" style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-0.4px', margin: '0 0 6px', color: '#0B0B0C' }}>
              계정을 만들어보세요
            </h2>
            <p className="s2-sub" style={{ fontSize: '14px', color: 'rgba(60,60,67,0.55)', margin: 0 }}>
              {emailStep === 'email' ? '이메일을 입력해주세요' : '비밀번호를 설정해주세요'}
            </p>
          </div>

          {emailStep === 'email' ? (
            <input className="s2-input" type="email" placeholder="이메일" value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', height: '44px', borderRadius: '14px', padding: '0 16px', fontSize: '14px', border: '1px solid rgba(60,60,67,0.08)', background: 'rgba(120,120,128,0.12)', color: '#0B0B0C', outline: 'none', boxSizing: 'border-box' as const }} />
          ) : (
            <input className="s2-input" type="password" placeholder="비밀번호 (6자 이상)" value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', height: '44px', borderRadius: '14px', padding: '0 16px', fontSize: '14px', border: '1px solid rgba(60,60,67,0.08)', background: 'rgba(120,120,128,0.12)', color: '#0B0B0C', outline: 'none', boxSizing: 'border-box' as const }} />
          )}

          {error && <p style={{ fontSize: '13px', color: 'var(--color-incorrect)', margin: 0, textAlign: 'center' }}>{error}</p>}

          <button onClick={handleEmailSignup} disabled={loading} style={{
            width: '100%', height: '44px', borderRadius: '9999px',
            background: 'var(--color-my)', color: 'var(--color-my-contrast)',
            border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '처리 중...' : (emailStep === 'email' ? '계속하기' : '가입하기')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(60,60,67,0.12)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(60,60,67,0.45)' }}>또는</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(60,60,67,0.12)' }} />
          </div>

          <button onClick={handleGoogle} style={{
            width: '100%', height: '44px', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(60,60,67,0.08)',
            cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#0B0B0C',
          }}>Google로 계속하기</button>

          <button onClick={handleKakao} style={{
            width: '100%', height: '44px', borderRadius: '9999px',
            background: '#FEE500', border: 'none',
            cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#3C1E1E',
          }}>카카오로 계속하기</button>
        </div>
      )}

      {/* 로그인 화면 */}
      {mode === 'login' && (
        <div className="s2-card s2-card-inner" style={{
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
          <div style={{ textAlign: 'center' }}>
            <h2 className="s2-title" style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-0.4px', margin: '0 0 6px', color: '#0B0B0C' }}>
              다시 오셨군요!
            </h2>
            <p className="s2-sub" style={{ fontSize: '14px', color: 'rgba(60,60,67,0.55)', margin: 0 }}>
              {emailStep === 'email' ? '이메일을 입력해주세요' : '비밀번호를 입력해주세요'}
            </p>
          </div>

          {emailStep === 'email' ? (
            <input className="s2-input" type="email" placeholder="이메일" value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', height: '44px', borderRadius: '14px', padding: '0 16px', fontSize: '14px', border: '1px solid rgba(60,60,67,0.08)', background: 'rgba(120,120,128,0.12)', color: '#0B0B0C', outline: 'none', boxSizing: 'border-box' as const }} />
          ) : (
            <input className="s2-input" type="password" placeholder="비밀번호" value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', height: '44px', borderRadius: '14px', padding: '0 16px', fontSize: '14px', border: '1px solid rgba(60,60,67,0.08)', background: 'rgba(120,120,128,0.12)', color: '#0B0B0C', outline: 'none', boxSizing: 'border-box' as const }} />
          )}

          {error && <p style={{ fontSize: '13px', color: 'var(--color-incorrect)', margin: 0, textAlign: 'center' }}>{error}</p>}

          <button onClick={handleEmailLogin} disabled={loading} style={{
            width: '100%', height: '44px', borderRadius: '9999px',
            background: 'var(--color-my)', color: 'var(--color-my-contrast)',
            border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '처리 중...' : (emailStep === 'email' ? '계속하기' : '로그인')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(60,60,67,0.12)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(60,60,67,0.45)' }}>또는</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(60,60,67,0.12)' }} />
          </div>

          <button onClick={handleGoogle} style={{
            width: '100%', height: '44px', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(60,60,67,0.08)',
            cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#0B0B0C',
          }}>Google로 계속하기</button>

          <button onClick={handleKakao} style={{
            width: '100%', height: '44px', borderRadius: '9999px',
            background: '#FEE500', border: 'none',
            cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#3C1E1E',
          }}>카카오로 계속하기</button>
        </div>
      )}
    </div>
  )
}
