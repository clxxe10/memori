'use client'

import { useRouter } from 'next/navigation'

export default function Slide1({ onNext: _onNext }: { onNext: () => void }) {
  const router = useRouter()

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '0',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 32px 32px',
      }}>
        <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1px' }}>Memori</span>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-primary)', marginBottom: '3px', display: 'inline-block' }} />
        </div>

        <h1 style={{
          fontSize: '32px', fontWeight: 900,
          color: 'var(--color-text-primary)',
          letterSpacing: '-1px', lineHeight: 1.15,
          textAlign: 'center', marginBottom: '12px',
        }}>
          단어 학습,<br/>더 스마트하게
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--color-text-secondary)',
          textAlign: 'center', lineHeight: 1.6, margin: 0,
        }}>
          사진 한 장으로 단어장을 만들고<br/>나만의 방식으로 외워요
        </p>
      </div>

      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      <div style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => router.push('/login?method=google')}
          style={{
            width: '100%', height: '52px',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg)',
            border: 'none', borderRadius: '14px',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>

        <button
          onClick={() => router.push('/signup')}
          style={{
            width: '100%', height: '48px',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            border: '1.5px solid var(--color-text-primary)',
            borderRadius: '14px',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          이메일로 시작하기
        </button>

        <button
          onClick={() => router.push('/login')}
          style={{
            background: 'none', border: 'none',
            fontSize: '13px', color: 'var(--color-text-secondary)',
            cursor: 'pointer', textDecoration: 'underline',
            textUnderlineOffset: '3px', padding: '4px 0',
          }}
        >
          이미 계정이 있어요 · 로그인
        </button>
      </div>
    </div>
  )
}
