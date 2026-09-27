'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import {
  onboardingCtaRow,
  onboardingPageBg,
  onboardingPrimaryCta,
  onboardingSecondaryText,
  onboardingText,
} from '@/lib/onboardingBtnStyles'

export default function Slide1({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()
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
      @keyframes slide1IconIn {
        0%   { opacity: 0; transform: scale(0.72); }
        60%  { opacity: 1; transform: scale(1.04); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes slide1FadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s1-icon { animation: slide1IconIn 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s1-title { animation: slide1FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 150ms both; }
      .s1-sub { animation: slide1FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 250ms both; }
      .s1-btn { animation: slide1FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 350ms both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: onboardingPageBg(isDark),
      gap: '24px',
      padding: '40px 36px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <img
        src="/icons/icon-180.png"
        alt="Memori"
        className="s1-icon"
        style={{
          width: '84px', height: '84px',
          borderRadius: '22.37%',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <h1
          className="s1-title"
          style={{
            fontSize: '30px', fontWeight: 700,
            letterSpacing: '-0.5px', lineHeight: 1.2,
            textAlign: 'center', margin: 0,
            color: onboardingText(isDark),
          }}
        >
          {t.onboarding.welcome}
        </h1>
        <p
          className="s1-sub"
          style={{
            fontSize: '15px', fontWeight: 500,
            letterSpacing: '-0.2px', lineHeight: 1.5,
            textAlign: 'center', margin: 0,
            color: onboardingSecondaryText(isDark),
          }}
        >
          {t.onboarding.tagline}
        </p>
      </div>

      <div
        className="s1-btn"
        style={{
          ...onboardingCtaRow,
          position: 'absolute',
          bottom: 'max(52px, calc(env(safe-area-inset-bottom) + 32px))',
          left: '28px',
          right: '28px',
          width: 'auto',
        }}
      >
        <button onClick={onNext} style={onboardingPrimaryCta(isDark)}>
          {t.onboarding.getStarted}
        </button>
      </div>
    </div>
  )
}
