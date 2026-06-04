'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeInLogo {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes fadeInDot {
        0% { opacity: 0; transform: scale(0); }
        60% { transform: scale(1.4); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes loadBar {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .logo-anim { animation: fadeInLogo 0.9s ease-out 0.3s both; }
      .dot-anim { animation: fadeInDot 0.5s cubic-bezier(0.34,1.56,0.64,1) 1s both; }
      .load-anim { animation: fadeIn 0.3s ease-out 0.5s both; }
      .bar-anim { animation: loadBar 1.8s ease-in-out 0.6s both; }
    `
    document.head.appendChild(style)

    const timer = setTimeout(() => {
      const onboardingDone = localStorage.getItem('onboarding_done')
      if (onboardingDone) {
        router.replace('/home')
      } else {
        router.replace('/onboarding')
      }
    }, 2200)

    return () => {
      clearTimeout(timer)
      document.head.removeChild(style)
    }
  }, [router])

  return (
    <main style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div className="logo-anim" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1.5px' }}>
          Memori
        </span>
        <span className="dot-anim" style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--color-text-primary)',
          marginBottom: '4px', display: 'inline-block',
        }} />
      </div>

      <div className="load-anim" style={{
        position: 'absolute', bottom: '48px',
        left: '40px', right: '40px',
        height: '2px',
        background: 'var(--color-border)',
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div className="bar-anim" style={{
          height: '100%',
          background: 'var(--color-text-primary)',
          borderRadius: '2px',
          width: '0%',
        }} />
      </div>
    </main>
  )
}
