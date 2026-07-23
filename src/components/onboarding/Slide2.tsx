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
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailStep, setEmailStep] = useState<'email' | 'password'>('email')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      const savedTheme = localStorage.getItem('app_theme') || '시스템'
      if (savedTheme === '다크') setIsDark(true)
      else if (savedTheme === '라이트') setIsDark(false)
      else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    checkDark()
    const style = document.createElement('style')
    style.textContent = `
      @keyframes s2FadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s2-hero { animation: s2FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s2-form { animation: s2FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 150ms both; }
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
        } else { setError(signUpError.message) }
        return
      }
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setError('이미 가입된 이메일이에요. 로그인해주세요.')
        return
      }
      onNext()
    } finally { setLoading(false) }
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
    } finally { setLoading(false) }
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

  const formBg = isDark ? '#000000' : '#FFFFFF'
  const formText = isDark ? '#FFFFFF' : '#0B0B0C'
  const formSub = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.55)'
  const formTertiary = isDark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.35)'
  const inputBg = isDark ? 'rgba(120,120,128,0.24)' : 'rgba(120,120,128,0.12)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(60,60,67,0.08)'
  const ctaBg = isDark ? '#FFFFFF' : '#0B0B0C'
  const ctaText = isDark ? '#000000' : '#FFFFFF'
  const dividerColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(60,60,67,0.12)'
  const googleBg = isDark ? 'transparent' : 'transparent'
  const googleBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(60,60,67,0.15)'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    }}>
      {/* 상단 히어로 */}
      <div className="s2-hero" style={{
        background: 'linear-gradient(165deg, #3A3A3C 0%, #1C1C1E 50%, #0A0A0B 100%)',
        flex: '0 0 38%',
        minHeight: '0',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 28px 32px',
        position: 'relative', overflow: 'hidden',
        paddingTop: 'max(60px, calc(env(safe-area-inset-top) + 16px))',
      }}>
        {/* 장식 원 */}
        <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '20px', left: '-50px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* 상단 바 */}
        <div style={{
          position: 'absolute',
          top: 'max(60px, calc(env(safe-area-inset-top) + 16px))',
          left: '20px', right: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={() => {
            if (emailStep === 'password') { setEmailStep('email'); setError('') }
            else { onBack() }
          }} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', color: 'rgba(255,255,255,0.8)',
          }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: i === 2 ? '16px' : '5px', height: '5px',
                borderRadius: '9999px',
                background: i === 2 ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                transition: 'width 300ms ease',
              }} />
            ))}
          </div>
          <div style={{ width: '32px' }} />
        </div>

        {/* 워드마크 + 캐치프레이즈 */}
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Memori
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, letterSpacing: '-0.8px' }}>
            사진 한 장으로<br/>끝내는 단어 공부
          </div>
        </div>
      </div>

      {/* 하단 폼 */}
      <div className="s2-form" style={{
        flex: 1, background: formBg,
        borderRadius: '0',
        marginTop: '0',
        padding: '28px 24px',
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 10,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: formText, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {mode === 'signup' ? '계정을 만들어보세요' : '다시 오셨군요!'}
          </h2>
          <p style={{ fontSize: '16px', color: formSub, margin: 0 }}>
            {emailStep === 'email' ? '이메일을 입력해주세요' : '비밀번호를 입력해주세요'}
          </p>
        </div>

        {emailStep === 'email' ? (
          <input type="email" placeholder="이메일" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', height: '50px', borderRadius: '14px',
              padding: '0 16px', fontSize: '16px',
              border: `1px solid ${inputBorder}`,
              background: inputBg, color: formText,
              outline: 'none', boxSizing: 'border-box' as const,
              marginBottom: '12px',
            }} />
        ) : (
          <input type="password" placeholder={mode === 'signup' ? '비밀번호 (6자 이상)' : '비밀번호'}
            value={password} onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', height: '50px', borderRadius: '14px',
              padding: '0 16px', fontSize: '16px',
              border: `1px solid ${inputBorder}`,
              background: inputBg, color: formText,
              outline: 'none', boxSizing: 'border-box' as const,
              marginBottom: '12px',
            }} />
        )}

        {error && <p style={{ fontSize: '14px', color: '#FF453A', margin: '0 0 12px', textAlign: 'center' }}>{error}</p>}

        <button
          onClick={mode === 'signup' ? handleEmailSignup : handleEmailLogin}
          disabled={loading}
          style={{
            width: '100%', height: '50px', borderRadius: '14px',
            background: ctaBg, color: ctaText,
            border: 'none', cursor: 'pointer',
            fontSize: '16px', fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            opacity: loading ? 0.7 : 1, marginBottom: '20px',
          }}>
          {loading ? '처리 중...' : (emailStep === 'email' ? '계속하기' : (mode === 'signup' ? '가입하기' : '로그인'))}
        </button>

        {emailStep === 'email' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '0.5px', background: dividerColor }} />
              <span style={{ fontSize: '13px', color: formTertiary }}>또는</span>
              <div style={{ flex: 1, height: '0.5px', background: dividerColor }} />
            </div>

            <button onClick={handleGoogle} style={{
              width: '100%', height: '50px', borderRadius: '14px',
              background: googleBg, border: `1px solid ${googleBorder}`,
              cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: formText,
              marginBottom: '10px',
            }}>Google로 계속하기</button>

            <button onClick={handleKakao} style={{
              width: '100%', height: '50px', borderRadius: '14px',
              background: '#FEE500', border: 'none',
              cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: '#3C1E1E',
              marginBottom: '20px',
            }}>카카오로 계속하기</button>

            <button onClick={() => { setMode(m => m === 'signup' ? 'login' : 'signup'); setError(''); setEmailStep('email') }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', color: formSub, width: '100%', textAlign: 'center',
            }}>
              {mode === 'signup' ? '이미 계정이 있어요 · 로그인' : '계정이 없으신가요? · 회원가입'}
            </button>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <p style={{ fontSize: '12px', color: formTertiary, textAlign: 'center', lineHeight: 1.5 }}>
            계속 진행하면 <span style={{ textDecoration: 'underline' }}>서비스 이용약관</span>과{' '}
            <span style={{ textDecoration: 'underline' }}>개인정보처리방침</span>에 동의하는 것으로 간주돼요.
          </p>
        </div>
      </div>
    </div>
  )
}
