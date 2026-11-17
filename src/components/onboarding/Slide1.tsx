'use client'
import { useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import {
  ONBOARDING_ILLUST_CSS,
  onboardingFooter,
  onboardingPrimaryCta,
  onboardingShell,
  onboardingSubtitle,
} from '@/lib/onboardingBtnStyles'

export default function Slide1({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = ONBOARDING_ILLUST_CSS
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div style={onboardingShell}>
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '0 20px',
      }}>
        <img
          className="onb-illust"
          src="/onboarding/memori-logo.png"
          alt="Memori"
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            display: 'block',
            boxShadow: '0 0 0 1px var(--m-stroke)',
            flexShrink: 1,
            minHeight: 0,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <h1 style={{
            fontSize: 34,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.8px',
            margin: 0,
            color: 'var(--m-fg)',
          }}>
            {t.onboarding.welcome}
          </h1>
          <p style={{ ...onboardingSubtitle, textAlign: 'center' }}>
            {t.onboarding.tagline}
          </p>
        </div>
      </div>

      <div style={onboardingFooter()}>
        <button onClick={onNext} style={onboardingPrimaryCta()}>
          {t.onboarding.getStarted}
        </button>
      </div>
    </div>
  )
}
