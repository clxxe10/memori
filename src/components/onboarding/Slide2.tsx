'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import {
  onboardingBackBtn,
  onboardingGoogleCta,
  onboardingInput,
  onboardingKakaoCta,
  onboardingPageBg,
  onboardingPrimaryCta,
  onboardingProgressFill,
  onboardingProgressTrack,
  onboardingSecondaryCta,
  onboardingSecondaryText,
  onboardingText,
} from '@/lib/onboardingBtnStyles'

interface Props {
  onNext: () => void
  onBack: () => void
  onLogin: () => void
  email: string
  setEmail: (v: string) => void
  name: string
  setName: (v: string) => void
}

export default function Slide2({ onNext, onBack, onLogin, email, setEmail, name }: Props) {
  const { t, lang } = useTranslation()
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
      if (!email.trim() || !email.includes('@')) { setError(t.alert.emailInvalid); return }
      setEmailStep('password'); return
    }
    if (password.length < 6) { setError(t.alert.passwordShort); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name || (lang === 'en' ? 'User' : '사용자') } }
      })
      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setError(t.alert.emailExists)
        } else { setError(signUpError.message) }
        return
      }
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setError(t.alert.emailExists)
        return
      }
      onNext()
    } finally { setLoading(false) }
  }

  const handleEmailLogin = async () => {
    setError('')
    if (emailStep === 'email') {
      if (!email.trim() || !email.includes('@')) { setError(t.alert.emailInvalid); return }
      setEmailStep('password'); return
    }
    if (password.length < 6) { setError(t.alert.passwordShort); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(t.alert.loginFailed); return }
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

  const titleColor = onboardingText(isDark)
  const subColor = onboardingSecondaryText(isDark)

  /** Email/password field + continue CTA: matched size, full width */
  const fieldControl = {
    width: '100%',
    maxWidth: 'none' as const,
    marginLeft: 0,
    marginRight: 0,
    height: 54,
    padding: '17px',
    borderRadius: '16px',
    boxSizing: 'border-box' as const,
    lineHeight: 1.2,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: onboardingPageBg(isDark),
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        height: '100%',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(48px, calc(env(safe-area-inset-bottom) + 40px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' as const,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0' }}>
          <button onClick={() => {
            if (emailStep === 'password') { setEmailStep('email'); setError('') }
            else if (mode !== 'select') { setMode('select'); setError(''); setEmailStep('email') }
            else { onBack() }
          }} style={onboardingBackBtn(isDark)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={onboardingProgressTrack(isDark)}>
            <div style={onboardingProgressFill(isDark, '33%')} />
          </div>
        </div>

        <div className="s2-title-anim" style={{ marginTop: '28px' }}>
          <h1 style={{
            fontSize: '32px', fontWeight: 800, color: titleColor,
            letterSpacing: '-0.8px', margin: '0 0 10px', lineHeight: 1.15,
          }}>
            {mode === 'select' ? t.onboarding.selectType : (mode === 'signup' ? t.onboarding.createAccount : t.onboarding.welcomeBack)}
          </h1>
          <p style={{ fontSize: '16px', fontWeight: 400, color: subColor, margin: 0, lineHeight: 1.4 }}>
            {mode === 'select'
              ? t.onboarding.selectTypeDesc
              : (emailStep === 'email' ? t.onboarding.enterEmail : t.onboarding.enterPassword)}
          </p>
        </div>

        {mode === 'select' ? (
          <>
            <div style={{ flex: 1 }} />
            <div className="s2-card-anim" style={{
              display: 'flex', flexDirection: 'column',
              gap: '12px', width: '100%',
            }}>
              <button onClick={() => setMode('signup')} style={onboardingPrimaryCta(isDark)}>
                {t.onboarding.newUser}
              </button>
              <button onClick={() => setMode('login')} style={onboardingSecondaryCta(isDark)}>
                {t.onboarding.existingUser}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="s2-card-anim" style={{
              display: 'flex', flexDirection: 'column',
              gap: '12px', width: '100%',
              marginTop: '36px',
            }}>
              {emailStep === 'email' ? (
                <input type="email" placeholder={t.onboarding.emailPlaceholder} value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ ...onboardingInput(isDark), ...fieldControl }} />
              ) : (
                <input type="password" placeholder={t.onboarding.passwordPlaceholder}
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...onboardingInput(isDark), ...fieldControl }} />
              )}

              {error && <p style={{ fontSize: '14px', color: '#FF453A', margin: '0', textAlign: 'center' }}>{error}</p>}

              <button
                onClick={mode === 'signup' ? handleEmailSignup : handleEmailLogin}
                disabled={loading}
                style={{
                  ...onboardingPrimaryCta(isDark, loading),
                  ...fieldControl,
                  border: '1px solid transparent',
                }}
              >
                {loading ? t.onboarding.processing : (emailStep === 'email' ? t.onboarding.continueEmail : (mode === 'signup' ? t.onboarding.signup : t.onboarding.login))}
              </button>
            </div>

            <div style={{ flex: 1 }} />

            {emailStep === 'email' && (
              <>
                {false && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '8px' }}>
                    <button onClick={handleGoogle} style={onboardingGoogleCta(isDark)}>
                      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      {t.onboarding.continueGoogle}
                    </button>
                    <button onClick={handleKakao} style={onboardingKakaoCta}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.53-.96 3.39-.99 3.6 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.44 4.28-2.86.55.08 1.13.12 1.72.12 5.52 0 10-3.58 10-7.78C22 6.58 17.52 3 12 3z"/></svg>
                      {t.onboarding.continueKakao}
                    </button>
                  </div>
                )}
                <button onClick={() => { setMode(m => m === 'signup' ? 'login' : 'signup'); setError(''); setEmailStep('email') }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '14px', color: subColor, width: '100%', textAlign: 'center',
                  padding: '8px 0',
                }}>
                  {mode === 'signup' ? t.onboarding.hasAccount : t.onboarding.noAccount}
                </button>
              </>
            )}
          </>
        )}

        <button onClick={() => onLogin()} style={{
          background: 'none', border: 'none',
          cursor: 'pointer', fontSize: '13px',
          color: subColor, width: '100%',
          textAlign: 'center' as const,
          padding: '8px 0', marginBottom: '8px',
        }}>
          {lang === 'en' ? 'Browse without account' : '로그인 없이 둘러보기'}
        </button>

        <div className="s2-footer-anim" style={{
          paddingTop: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
            background: isDark ? '#FFFFFF' : '#1C1C1E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={isDark ? '#000' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
          </div>
          <p style={{ fontSize: '13px', color: subColor, margin: 0, lineHeight: 1.4 }}>
            {t.onboarding.termsNotice.split(/(\{terms\}|\{privacy\})/).map((part, i) => {
              if (part === '{terms}') return <span key={i} style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => window.open('https://memori-seven.vercel.app/terms', '_blank')}>{t.onboarding.terms}</span>
              if (part === '{privacy}') return <span key={i} style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => window.open('https://memori-seven.vercel.app/privacy', '_blank')}>{t.onboarding.privacy}</span>
              return <span key={i}>{part}</span>
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
