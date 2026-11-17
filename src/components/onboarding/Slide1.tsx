'use client'
import { useTranslation } from '@/lib/i18n'
import {
  onboardingFooter,
  onboardingPrimaryCta,
  onboardingShell,
  onboardingSubtitle,
} from '@/lib/onboardingBtnStyles'

export default function Slide1({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()

  return (
    <div style={onboardingShell}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '0 20px',
      }}>
        <img
          src="/onboarding/memori-logo.png"
          alt="Memori"
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            display: 'block',
            boxShadow: '0 0 0 1px var(--m-stroke)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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
