'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const cardStyle = isDesktop ? {
    background: 'var(--color-surface)',
    borderRadius: '24px',
    padding: '48px 40px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  } : {}

  const handleSignup = async () => {
    if (!nickname || !email || !password) { setError('모든 항목을 입력해주세요'); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 해요'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nickname } }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일이에요. 로그인해주세요.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const inputStyle = {
    width: '100%', height: '52px',
    background: 'var(--color-surface-2)',
    border: '1.5px solid var(--color-border)',
    borderRadius: '14px', padding: '0 16px',
    fontSize: '15px', color: 'var(--color-text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  if (success) return (
    <main style={{
      minHeight: '100vh', backgroundColor: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center', ...cardStyle }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
          이메일을 확인해주세요
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
          {email}로 인증 메일을 보냈어요.<br />
          메일함을 확인하고 인증을 완료해주세요.
        </p>
        <button
          onClick={() => router.push('/login')}
          style={{ width: '100%', height: '52px', background: 'var(--color-my)', color: 'var(--color-my-contrast)', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
        >
          로그인 하러 가기
        </button>
      </div>
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', ...cardStyle }}>

        {/* 로고 */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
            Memori
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            지금 바로 시작해보세요
          </p>
        </div>

        {/* 입력 폼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>닉네임</p>
            <input
              type="text"
              placeholder="닉네임 입력..."
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>이메일</p>
            <input
              type="email"
              placeholder="이메일 입력..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>비밀번호</p>
            <input
              type="password"
              placeholder="비밀번호 (6자 이상)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#E24B4A', marginBottom: '12px', textAlign: 'center' }}>{error}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: '100%', height: '52px',
            background: 'var(--color-my)', color: 'var(--color-my-contrast)',
            border: 'none', borderRadius: '14px',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            opacity: loading ? 0.6 : 1, marginBottom: '14px',
          }}
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>또는</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          style={{
            width: '100%', height: '52px',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '14px', fontSize: '15px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px', marginBottom: '24px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>

        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          이미 계정이 있으신가요?{' '}
          <span
            onClick={() => router.push('/login')}
            style={{ color: 'var(--color-text-primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            로그인
          </span>
        </p>

      </div>
    </main>
  )
}
