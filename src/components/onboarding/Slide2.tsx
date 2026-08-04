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
      .s2-title-anim { animation: s2FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s2-card-anim { animation: s2FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 120ms both; }
      .s2-footer-anim { animation: s2FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 240ms both; }
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

  // 색상 토큰
  const bg = isDark
    ? 'linear-gradient(160deg, #27242F 0%, #161420 30%, #0B0B11 65%, #000000 100%)'
    : 'linear-gradient(160deg, #FFFFFF 0%, #ECEDF4 35%, #E1E5EF 65%, #D3D9EB 100%)'
  const titleColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const subColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)'
  const tertiaryColor = isDark ? 'rgba(235,235,245,0.5)' : 'rgba(60,60,67,0.6)'

  // 글라스 패널
  const panelBg = isDark
    ? 'linear-gradient(165deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))'
    : 'linear-gradient(165deg, rgba(255,255,255,0.75), rgba(255,255,255,0.35))'
  const panelShadow = isDark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.14), inset 0 -1px 2px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.5)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.04), 0 20px 40px rgba(31,38,60,0.1)'
  const panelBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)'

  // 인풋
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'
  const inputShadow = isDark ? 'inset 0 1px 2px rgba(0,0,0,0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.04)'
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.7)'
  const inputPlaceholder = isDark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.4)'

  // CTA 버튼
  const ctaBg = isDark
    ? 'linear-gradient(180deg, #FFFFFF 0%, #EDEDF0 100%)'
    : 'linear-gradient(180deg, #333335 0%, #1C1C1E 55%, #0E0E0F 100%)'
  const ctaColor = isDark ? '#1C1C1E' : '#FFFFFF'
  const ctaShadow = isDark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -3px 6px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.45)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.25), inset 0 -6px 10px rgba(0,0,0,0.3), 0 12px 24px rgba(0,0,0,0.25)'
  const ctaBorder = isDark ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(0,0,0,0.15)'

  // Google 버튼
  const googleBg = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55))'
  const googleShadow = isDark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.2), 0 6px 14px rgba(0,0,0,0.3)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -2px 4px rgba(0,0,0,0.03), 0 6px 14px rgba(0,0,0,0.06)'
  const googleBorder = isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.7)'

  // 카카오 (라이트/다크 동일)
  const kakaoShadow = 'inset 0 1.5px 0 rgba(255,255,255,0.6), inset 0 -3px 6px rgba(0,0,0,0.08), 0 8px 18px rgba(254,229,0,0.25)'
  const kakaoBorder = '1px solid rgba(0,0,0,0.05)'

  // 뒤로가기
  const backBg = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))'
  const backShadow = isDark
    ? 'inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -2px 3px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.3)'
    : 'inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.08)'
  const backBorder = isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.6)'

  // 진행바
  const trackBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
  const trackFill = isDark
    ? 'linear-gradient(90deg, #fff, #C7C7CC)'
    : 'linear-gradient(90deg, #1C1C1E, #48484A)'

  // blob
  const blob1 = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.35)'
  const blob2 = isDark ? 'rgba(100,140,255,0.03)' : 'rgba(120,150,255,0.08)'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 장식 blob */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: `radial-gradient(circle, ${blob1}, transparent)`, filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '120px', left: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: `radial-gradient(circle, ${blob2}, transparent)`, filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* 스크롤 가능 컨테이너 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' as const,
      }}>

        {/* 네비게이션: 뒤로가기 + 진행바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0' }}>
          <button onClick={() => {
            if (emailStep === 'password') { setEmailStep('email'); setError('') }
            else if (mode !== 'select') { setMode('select'); setError(''); setEmailStep('email') }
            else { onBack() }
          }} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: backBg, border: backBorder,
            boxShadow: backShadow,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.8)' : '#1C1C1E',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* 진행바 */}
          <div style={{
            flex: 1, height: '6px', borderRadius: '9999px',
            background: trackBg,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '40%', height: '100%', borderRadius: '9999px',
              background: trackFill,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }} />
          </div>
        </div>

        {/* 타이틀 */}
        <div className="s2-title-anim" style={{ marginBottom: '28px', marginTop: 'auto' }}>
          <h1 style={{
            fontSize: '36px', fontWeight: 800, color: titleColor,
            letterSpacing: '-0.8px', margin: '0 0 10px', lineHeight: 1.15,
          }}>
            {mode === 'select' ? '시작해볼까요?' : (mode === 'signup' ? '계정을 만들어보세요' : '다시 오셨군요!')}
          </h1>
          <p style={{ fontSize: '17px', fontWeight: 400, color: subColor, margin: 0, lineHeight: 1.4 }}>
            {mode === 'select'
              ? '처음 오셨나요, 아니면 기존 회원이신가요?'
              : (emailStep === 'email' ? '이메일로 계속하거나 다른 방법을 선택하세요' : '비밀번호를 입력해주세요')}
          </p>
        </div>

        {/* 글라스 폼 카드 */}
        <div className="s2-card-anim" style={{
          background: panelBg,
          borderRadius: '32px',
          border: panelBorder,
          boxShadow: panelShadow,
          padding: '20px 28px',
          display: 'flex', flexDirection: 'column',
          gap: '12px',
          marginBottom: 'auto',
        }}>
          {mode === 'select' ? (
            <>
              <button onClick={() => setMode('signup')} style={{
                width: '100%', padding: '17px',
                background: ctaBg, color: ctaColor,
                borderRadius: '9999px', border: ctaBorder,
                boxShadow: ctaShadow,
                cursor: 'pointer', fontSize: '17px', fontWeight: 700,
                textAlign: 'center' as const,
              }}>처음이에요 👋</button>

              <button onClick={() => setMode('login')} style={{
                width: '100%', padding: '17px',
                background: googleBg, color: titleColor,
                borderRadius: '9999px', border: googleBorder,
                boxShadow: googleShadow,
                cursor: 'pointer', fontSize: '17px', fontWeight: 600,
                textAlign: 'center' as const,
              }}>기존 회원이에요 →</button>
            </>
          ) : (
            <>
              {mode === 'signup' && emailStep === 'email' && (
                <input type="text" placeholder="이름" value={name}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%', padding: '17px 20px',
                    borderRadius: '9999px', fontSize: '16px',
                    border: inputBorder, background: inputBg,
                    color: titleColor, outline: 'none',
                    boxShadow: inputShadow,
                    boxSizing: 'border-box' as const,
                  }} />
              )}

              {emailStep === 'email' ? (
                <input type="email" placeholder="이메일 주소" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '17px 20px',
                    borderRadius: '9999px', fontSize: '16px',
                    border: inputBorder, background: inputBg,
                    color: titleColor, outline: 'none',
                    boxShadow: inputShadow,
                    boxSizing: 'border-box' as const,
                  }} />
              ) : (
                <input type="password" placeholder={mode === 'signup' ? '비밀번호 (6자 이상)' : '비밀번호'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '17px 20px',
                    borderRadius: '9999px', fontSize: '16px',
                    border: inputBorder, background: inputBg,
                    color: titleColor, outline: 'none',
                    boxShadow: inputShadow,
                    boxSizing: 'border-box' as const,
                  }} />
              )}

              {error && <p style={{ fontSize: '14px', color: '#FF453A', margin: '0', textAlign: 'center' }}>{error}</p>}

              <button
                onClick={mode === 'signup' ? handleEmailSignup : handleEmailLogin}
                disabled={loading}
                style={{
                  width: '100%', padding: '17px',
                  background: ctaBg, color: ctaColor,
                  borderRadius: '9999px', border: ctaBorder,
                  boxShadow: ctaShadow,
                  cursor: 'pointer', fontSize: '17px', fontWeight: 700,
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading ? '처리 중...' : (emailStep === 'email' ? '이메일로 계속하기' : (mode === 'signup' ? '가입하기' : '로그인'))}
              </button>

              {emailStep === 'email' && (
                <>
                  <button onClick={handleGoogle} style={{
                    width: '100%', padding: '17px',
                    background: googleBg, color: titleColor,
                    borderRadius: '9999px', border: googleBorder,
                    boxShadow: googleShadow,
                    cursor: 'pointer', fontSize: '16px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google로 계속하기
                  </button>

                  <button onClick={handleKakao} style={{
                    width: '100%', padding: '17px',
                    background: 'linear-gradient(180deg, #FFE94D 0%, #FEE500 55%, #F5D800 100%)',
                    color: '#1C1C1E',
                    borderRadius: '9999px', border: kakaoBorder,
                    boxShadow: kakaoShadow,
                    cursor: 'pointer', fontSize: '16px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1C1C1E"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.53-.96 3.39-.99 3.6 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.44 4.28-2.86.55.08 1.13.12 1.72.12 5.52 0 10-3.58 10-7.78C22 6.58 17.52 3 12 3z"/></svg>
                    카카오로 계속하기
                  </button>

                  <button onClick={() => { setMode(m => m === 'signup' ? 'login' : 'signup'); setError(''); setEmailStep('email') }} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '14px', color: subColor, width: '100%', textAlign: 'center',
                    padding: '8px 0',
                  }}>
                    {mode === 'signup' ? '이미 계정이 있어요 · 로그인' : '계정이 없으신가요? · 회원가입'}
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* 약관 동의 */}
        <div className="s2-footer-anim" style={{
          marginTop: 'auto', paddingTop: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(180deg, #4CD964, #2CB84A)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
          </div>
          <p style={{ fontSize: '13px', color: tertiaryColor, margin: 0, lineHeight: 1.4 }}>
            가입 시 <span style={{ textDecoration: 'underline' }}>이용약관</span> 및{' '}
            <span style={{ textDecoration: 'underline' }}>개인정보처리방침</span>에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
