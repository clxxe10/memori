'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { modalCard, modalPrimaryBtn } from '@/lib/modalStyles'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    // 로그인 페이지에서는 마이컬러를 기본값으로 리셋
    const isDark = document.documentElement.classList.contains('dark')
    document.documentElement.style.setProperty('--color-my', isDark ? '#FFFFFF' : '#1C1C1E')
    document.documentElement.style.setProperty('--color-my-contrast', isDark ? '#000000' : '#FFFFFF')
  }, [])

  const handleLogin = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('이메일 또는 비밀번호가 올바르지 않아요'); setLoading(false); return }
    router.push('/home')
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

  const inputStyle = {
    width: '100%',
    height: '52px',
    background: 'var(--color-surface-2)',
    border: 'none',
    borderRadius: '14px',
    padding: '0 16px',
    fontSize: '15px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        ...(isDesktop ? {
          ...modalCard,
          padding: '48px 40px',
        } : {}),
      }}>

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '34px',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.8px',
            margin: '0 0 8px',
            lineHeight: 1.15,
          }}>
            Memori
          </h1>
          <p style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.45,
          }}>
            사진 한 장으로 시작하는 단어 학습
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              marginTop: 0,
            }}>
              이메일
            </p>
            <input
              type="email"
              placeholder="이메일 입력..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              marginTop: 0,
            }}>
              비밀번호
            </p>
            <input
              type="password"
              placeholder="비밀번호 입력..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p style={{
            fontSize: '13px',
            color: '#D9463A',
            marginBottom: '14px',
            textAlign: 'center',
            marginTop: 0,
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            height: '52px',
            ...modalPrimaryBtn,
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.55 : 1,
            marginBottom: '20px',
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>또는</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        <button
          onClick={handleGoogle}
          style={{
            width: '100%',
            height: '52px',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" opacity="0.85" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" opacity="0.7" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" opacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>

        <button
          onClick={handleKakao}
          style={{
            width: '100%',
            height: '52px',
            background: '#FEE500',
            color: '#191919',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.86 5.36 4.66 6.79-.2.75-.74 2.78-.85 3.21-.13.53.2.52.42.38.17-.11 2.7-1.83 3.8-2.58.63.09 1.28.14 1.97.14 5.52 0 10-3.58 10-8s-4.48-8-10-8z" fill="#191919"/>
          </svg>
          카카오로 계속하기
        </button>

        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.5,
        }}>
          계정이 없으신가요?{' '}
          <span
            onClick={() => router.push('/signup')}
            style={{
              color: 'var(--color-text-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            회원가입
          </span>
        </p>

      </div>
    </main>
  )
}
