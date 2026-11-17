'use client'
import { useEffect, useState, type ReactNode } from 'react'
import { Browser } from '@capacitor/browser'
import { ChevronLeft, ChevronRight, Eye, EyeOff, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import { useKeyboard } from '@/hooks/useKeyboard'
import {
  ONBOARDING_ILLUST_CSS,
  onboardingAppleCta,
  onboardingBackBtn,
  onboardingFooter,
  onboardingGoogleCta,
  onboardingInput,
  onboardingKakaoCta,
  onboardingPrimaryCta,
  onboardingSecondaryCta,
  onboardingShell,
  onboardingSubtitle,
  onboardingTitle,
  onboardingTopBar,
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

type Stage = 'select' | 'method' | 'email' | 'password'

function TermsLine({ t }: { t: ReturnType<typeof useTranslation>['t'] }) {
  return (
    <p style={{
      paddingTop: 6,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.5,
      color: 'var(--m-fg3)',
      margin: 0,
      whiteSpace: 'pre-line',
    }}>
      {t.onboarding.termsNotice.split(/(\{terms\}|\{privacy\})/).map((part, i) => {
        if (part === '{terms}') {
          return (
            <span
              key={i}
              style={{ color: 'var(--m-fg2)', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => window.open('/terms', '_blank')}
            >
              {t.onboarding.terms}
            </span>
          )
        }
        if (part === '{privacy}') {
          return (
            <span
              key={i}
              style={{ color: 'var(--m-fg2)', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => window.open('/privacy', '_blank')}
            >
              {t.onboarding.privacy}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

function WordCardsIllust({ photoLabel }: { photoLabel: string }) {
  return (
    <div className="onb-illust onb-illust-fixed" style={{ position: 'relative', height: 220, marginBottom: 24, flexShrink: 1, minHeight: 0 }}>
      <div style={{
        position: 'absolute', left: 24, top: 34, width: 200, height: 150,
        borderRadius: 24, background: 'var(--m-card)',
        boxShadow: '0 0 0 1px var(--m-stroke)',
        transform: 'rotate(-9deg)', opacity: 0.55,
      }} />
      <div style={{
        position: 'absolute', right: 20, top: 6, width: 190, height: 150,
        borderRadius: 24, background: 'var(--m-card)',
        boxShadow: '0 0 0 1px var(--m-stroke)',
        transform: 'rotate(8deg)', opacity: 0.55,
      }} />
      <div style={{
        position: 'absolute', left: 45, top: 50, width: 'min(260px, calc(100% - 50px))',
        padding: 20, boxSizing: 'border-box', borderRadius: 24,
        background: 'var(--m-card-top)',
        boxShadow: '0 0 0 1px var(--m-stroke), 0 12px 32px rgba(0,0,0,.18)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--m-fg2)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          {photoLabel}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.5px' }}>ephemeral</div>
          <div style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.3, color: 'var(--m-fg2)' }}>덧없는, 순간적인</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['resilient', 'vivid'].map(w => (
            <span key={w} style={{
              padding: '6px 10px', borderRadius: 999, background: 'var(--m-surface)',
              fontSize: 12, fontWeight: 500,
            }}>{w}</span>
          ))}
          <span style={{
            padding: '6px 10px', borderRadius: 999, background: 'var(--m-surface)',
            fontSize: 12, fontWeight: 500, color: 'var(--m-fg2)',
          }}>+9</span>
        </div>
      </div>
    </div>
  )
}

export default function Slide2({ onNext, onBack, onLogin, email, setEmail, name }: Props) {
  const { t, lang } = useTranslation()
  const { keyboardHeight, isKeyboardOpen } = useKeyboard()
  const [mode, setMode] = useState<'select' | 'signup' | 'login'>('select')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailStep, setEmailStep] = useState<'method' | 'email' | 'password'>('method')
  const [stepDir, setStepDir] = useState<'forward' | 'back'>('forward')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = ONBOARDING_ILLUST_CSS
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const stage: Stage = mode === 'select'
    ? 'select'
    : emailStep === 'method'
      ? 'method'
      : emailStep === 'email'
        ? 'email'
        : 'password'

  const goForward = (fn: () => void) => { setStepDir('forward'); fn() }
  const goBack = (fn: () => void) => { setStepDir('back'); fn() }

  const handleEmailSignup = async () => {
    setError('')
    if (emailStep === 'email') {
      if (!email.trim() || !email.includes('@')) { setError(t.alert.emailInvalid); return }
      goForward(() => setEmailStep('password')); return
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
      goForward(() => setEmailStep('password')); return
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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://memori-seven.vercel.app/auth/callback',
        skipBrowserRedirect: true,
      }
    })
    if (error || !data?.url) return
    await Browser.open({ url: data.url, windowName: '_self' })
  }

  const handleKakao = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'https://memori-seven.vercel.app/auth/callback',
        scopes: 'profile_nickname profile_image',
        skipBrowserRedirect: true,
      }
    })
    if (error || !data?.url) return
    await Browser.open({ url: data.url, windowName: '_self' })
  }

  const handleApple = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'https://memori-seven.vercel.app/auth/callback',
          skipBrowserRedirect: true,
        }
      })
      if (error || !data?.url) return
      await Browser.open({ url: data.url, windowName: '_self' })
    } catch (e) {
      console.error('Apple 로그인 실패:', e)
    }
  }

  const handleBack = () => {
    if (emailStep === 'password') { goBack(() => { setEmailStep('email'); setError('') }) }
    else if (emailStep === 'email') { goBack(() => { setEmailStep('method'); setError('') }) }
    else if (mode !== 'select') { goBack(() => { setMode('select'); setError(''); setEmailStep('method') }) }
    else { onBack() }
  }

  const keyboardPad = isKeyboardOpen ? Math.max(0, keyboardHeight - 40) : 0
  const anim = `${stepDir === 'forward' ? 'onbSlideInRight' : 'onbSlideInLeft'} 0.32s cubic-bezier(0.32, 0.72, 0, 1) both`

  let middle: ReactNode = null
  if (stage === 'select') {
    middle = (
      <>
        <WordCardsIllust photoLabel={lang === 'en' ? '12 words from photo' : '사진에서 12개 추출'} />
        <h1 style={onboardingTitle}>{t.onboarding.selectType}</h1>
      </>
    )
  } else if (stage === 'method') {
    middle = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 24 }}>
        <h1 style={onboardingTitle}>{t.onboarding.continueHow}</h1>
        <p style={onboardingSubtitle}>{t.onboarding.continueHowDesc}</p>
      </div>
    )
  } else if (stage === 'email') {
    middle = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1 style={onboardingTitle}>{t.onboarding.enterEmail}</h1>
          <p style={onboardingSubtitle}>{t.onboarding.enterEmailDesc}</p>
        </div>
        <input
          type="email"
          placeholder={t.onboarding.emailPlaceholder}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          autoFocus
          style={onboardingInput(undefined, emailFocused)}
        />
        {error && <p style={{ fontSize: 14, color: '#FF453A', margin: 0 }}>{error}</p>}
      </div>
    )
  } else {
    const pwOk = password.length >= 6
    middle = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1 style={onboardingTitle}>{t.onboarding.enterPassword}</h1>
          <p style={onboardingSubtitle}>{email}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            ...onboardingInput(undefined, passwordFocused),
            display: 'flex',
            alignItems: 'center',
            paddingRight: 8,
            paddingLeft: 18,
          }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t.onboarding.passwordPlaceholder}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              autoFocus
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 17, color: 'var(--m-fg)', fontFamily: 'inherit',
                letterSpacing: showPassword ? undefined : 2,
              }}
            />
            <button
              type="button"
              className="no-press-anim"
              onClick={() => setShowPassword(v => !v)}
              style={{
                width: 44, height: 44, border: 'none', background: 'none',
                color: 'var(--m-fg2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={20} strokeWidth={1.8} /> : <Eye size={20} strokeWidth={1.8} />}
            </button>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4,
            fontSize: 13, fontWeight: 500,
            color: pwOk ? 'var(--m-fg)' : 'var(--m-fg3)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {t.onboarding.passwordMin}
          </div>
          {error && <p style={{ fontSize: 14, color: '#FF453A', margin: 0 }}>{error}</p>}
        </div>
      </div>
    )
  }

  let footer: ReactNode = null
  if (stage === 'select') {
    footer = (
      <>
        <button
          onClick={() => goForward(() => { setMode('signup'); setEmailStep('method'); setError('') })}
          style={onboardingPrimaryCta()}
        >
          {t.onboarding.newUser}
        </button>
        <button
          onClick={() => goForward(() => { setMode('login'); setEmailStep('method'); setError('') })}
          style={onboardingSecondaryCta()}
        >
          {t.onboarding.existingUser}
        </button>
        <TermsLine t={t} />
      </>
    )
  } else if (stage === 'method') {
    footer = (
      <>
        <button onClick={() => goForward(() => { setEmailStep('email'); setError('') })} style={onboardingPrimaryCta()}>
          <Mail size={20} strokeWidth={1.8} />
          {t.onboarding.continueEmail}
        </button>
        <button onClick={handleGoogle} style={onboardingGoogleCta()}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {t.onboarding.continueGoogle}
        </button>
        <button onClick={handleKakao} style={onboardingKakaoCta}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#000" d="M9 1.5C4.58 1.5 1 4.3 1 7.75c0 2.22 1.48 4.17 3.72 5.28l-.95 3.47c-.08.3.26.55.52.38l4.13-2.73c.19.02.38.03.58.03 4.42 0 8-2.8 8-6.25S13.42 1.5 9 1.5z" />
          </svg>
          {t.onboarding.continueKakao}
        </button>
        <button onClick={handleApple} style={onboardingAppleCta()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          {t.onboarding.continueApple}
        </button>
        <TermsLine t={t} />
      </>
    )
  } else if (stage === 'email') {
    footer = (
      <>
        <button
          onClick={mode === 'signup' ? handleEmailSignup : handleEmailLogin}
          disabled={loading}
          style={onboardingPrimaryCta(undefined, loading)}
        >
          {loading ? t.onboarding.processing : t.common.next}
        </button>
        <TermsLine t={t} />
      </>
    )
  } else {
    footer = (
      <>
        <button
          onClick={mode === 'signup' ? handleEmailSignup : handleEmailLogin}
          disabled={loading}
          style={onboardingPrimaryCta(undefined, loading)}
        >
          {loading ? t.onboarding.processing : t.onboarding.continueAction}
        </button>
        <TermsLine t={t} />
      </>
    )
  }

  return (
    <div style={onboardingShell}>
      <div style={onboardingTopBar}>
        <button type="button" onClick={handleBack} style={onboardingBackBtn()}>
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onLogin()}
          style={{
            height: 44, display: 'flex', alignItems: 'center', gap: 2,
            padding: '0 4px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 500, color: 'var(--m-fg2)',
          }}
        >
          {t.onboarding.browseWithout}
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      <div
        key={stage}
        style={{
          flex: 1,
          paddingLeft: 20,
          paddingRight: 20,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          animation: anim,
        }}
      >
        {middle}
      </div>

      <div style={onboardingFooter(keyboardPad)}>
        {footer}
      </div>
    </div>
  )
}
