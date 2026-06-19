'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
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
  const [mode, setMode] = useState<'select' | 'name' | 'email' | 'password'>('select')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleNext = async () => {
    setError('')
    if (mode === 'select') { setMode('name'); return }
    if (mode === 'name') {
      if (!name.trim()) { setError('이름을 입력해주세요'); return }
      setMode('email'); return
    }
    if (mode === 'email') {
      if (!email.trim() || !email.includes('@')) { setError('올바른 이메일을 입력해주세요'); return }
      setMode('password'); return
    }
    if (mode === 'password') {
      if (password.length < 6) { setError('비밀번호는 6자 이상이에요'); return }
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
        if (signUpError) { setError(signUpError.message); return }

        // 이미 가입된 이메일인 경우 identities가 빈 배열로 옴
        if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
          setError('이미 가입된 이메일이에요. 로그인해주세요.')
          return
        }

        onNext()
      } finally {
        setLoading(false)
      }
    }
  }

  const getTitle = () => {
    if (mode === 'select') return '시작하는 방법을\n선택해주세요'
    if (mode === 'name') return '이름이 뭐예요?'
    if (mode === 'email') return '이메일 주소를\n알려주세요'
    return '비밀번호를\n설정해주세요'
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100dvh',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: '100dvh',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 24px 40px',
      }}>
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '24px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '5px', borderRadius: '3px', background: i === 3 ? 'var(--color-text-primary)' : 'var(--color-border)', width: i === 3 ? '18px' : '5px' }} />
        ))}
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '32px', whiteSpace: 'pre-line' }}>
        {getTitle()}
      </h1>

      <div style={{ flex: 1 }}>
        {mode === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handleGoogle} style={{
              width: '100%', height: '52px',
              background: 'var(--color-text-primary)', color: 'var(--color-bg)',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속하기
            </button>
            <button onClick={handleKakao} style={{
              width: '100%', height: '52px',
              background: '#FEE500', color: '#191919',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.86 5.36 4.66 6.79-.2.75-.74 2.78-.85 3.21-.13.53.2.52.42.38.17-.11 2.7-1.83 3.8-2.58.63.09 1.28.14 1.97.14 5.52 0 10-3.58 10-8s-4.48-8-10-8z" fill="#191919"/>
              </svg>
              카카오로 계속하기
            </button>
            <button onClick={() => setMode('name')} style={{
              width: '100%', height: '52px',
              background: 'transparent', color: 'var(--color-text-primary)',
              border: '1.5px solid var(--color-border)', borderRadius: '14px',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}>
              이메일로 가입하기
            </button>
            <button onClick={() => router.push('/login')} style={{
              background: 'none', border: 'none', fontSize: '13px',
              color: 'var(--color-text-secondary)', cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: '3px', padding: '4px 0',
            }}>
              이미 계정이 있어요 · 로그인
            </button>
          </div>
        )}

        {mode !== 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'name' && (
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="홍길동"
                style={{
                  width: '100%', height: '52px',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: '14px', padding: '0 16px',
                  fontSize: '17px', color: 'var(--color-text-primary)',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
            )}
            {mode === 'email' && (
              <input
                autoFocus
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="hello@example.com"
                style={{
                  width: '100%', height: '52px',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: '14px', padding: '0 16px',
                  fontSize: '17px', color: 'var(--color-text-primary)',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
            )}
            {mode === 'password' && (
              <input
                autoFocus
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="6자 이상"
                style={{
                  width: '100%', height: '52px',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: '14px', padding: '0 16px',
                  fontSize: '17px', color: 'var(--color-text-primary)',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
            )}
            {error && (
              <p style={{ fontSize: '13px', color: '#E24B4A', margin: 0 }}>{error}</p>
            )}
          </div>
        )}
      </div>

      {mode !== 'select' && (
        <button onClick={handleNext} disabled={loading} style={{
          position: 'fixed',
          bottom: '40px',
          right: '28px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--color-text-primary)',
          color: 'var(--color-bg)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 100,
          opacity: loading ? 0.7 : 1,
        }}>
          →
        </button>
      )}
      </div>
    </div>
  )
}
