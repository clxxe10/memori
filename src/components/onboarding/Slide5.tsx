'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import {
  onboardingPageBg,
  onboardingPrimaryCta,
  onboardingSecondaryText,
  onboardingSurface,
  onboardingText,
} from '@/lib/onboardingBtnStyles'

export default function Slide5({ onFinish }: { onFinish: () => void }) {
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
      @keyframes s5FadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes s5CheckPop {
        0%   { opacity: 0; transform: scale(0.5); }
        70%  { opacity: 1; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
      }
      .s5-badge-anim { animation: s5CheckPop 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s5-title-anim { animation: s5FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 150ms both; }
      .s5-card-anim { animation: s5FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 250ms both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const titleColor = onboardingText(isDark)
  const subColor = onboardingSecondaryText(isDark)

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
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
      }}>
        <div className="s5-badge-anim" style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: isDark ? '#FFFFFF' : '#1C1C1E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#000000' : '#FFFFFF'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>

        <div className="s5-title-anim" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: titleColor, letterSpacing: '-0.8px', margin: '0 0 10px' }}>
            {t.onboarding.ready}
          </h1>
          <p style={{ fontSize: '16px', color: subColor, margin: 0, lineHeight: 1.4 }}>
            {t.onboarding.readyDesc}
          </p>
        </div>

        <div className="s5-card-anim" style={{
          background: onboardingSurface(isDark),
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex', flexWrap: 'wrap' as const,
          gap: '8px', justifyContent: 'center',
          width: '100%', maxWidth: '300px',
          marginBottom: '40px',
        }}>
          {[t.onboarding.accountCreated, t.onboarding.featuresChecked].map(step => (
            <div key={step} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isDark ? '#000000' : '#FFFFFF',
              borderRadius: '9999px', padding: '8px 14px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={titleColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              <span style={{ fontSize: '13px', fontWeight: 600, color: titleColor }}>{step}</span>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <button onClick={onFinish} style={onboardingPrimaryCta(isDark)}>
            {t.onboarding.start}
          </button>
          <button onClick={onFinish} style={{
            width: '100%', padding: '14px',
            background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '14px',
            color: subColor, fontWeight: 500,
          }}>{t.onboarding.goHome}</button>
        </div>
      </div>
    </div>
  )
}
