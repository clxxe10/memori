'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import {
  onboardingBackBtn,
  onboardingCtaRow,
  onboardingPageBg,
  onboardingPrimaryCta,
  onboardingProgressFill,
  onboardingProgressTrack,
  onboardingSecondaryText,
  onboardingSurface,
  onboardingText,
  onboardingTokens,
} from '@/lib/onboardingBtnStyles'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function Slide3({ onNext, onBack }: Props) {
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
      @keyframes s3FadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s3-title-anim { animation: s3FadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s3-card-anim { animation: s3FadeUp 700ms cubic-bezier(0.32,0.72,0,1) 120ms both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const titleColor = onboardingText(isDark)
  const subColor = onboardingSecondaryText(isDark)
  const dividerColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(60,60,67,0.12)'
  const featureBg = onboardingSurface(isDark)

  const features = [
    { emoji: '📸', title: t.onboarding.featurePhoto, desc: t.onboarding.featurePhotoDesc },
    { emoji: '🎓', title: t.onboarding.featureModes, desc: t.onboarding.featureModesDesc },
    { emoji: '🔥', title: t.onboarding.featureMemoryset, desc: t.onboarding.featureMemosetDesc },
    { emoji: '📄', title: t.onboarding.featurePdf, desc: t.onboarding.featurePdfDesc },
    { emoji: '🌐', title: t.onboarding.featureCommunity, desc: t.onboarding.featureCommunityDesc },
  ]

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
        justifyContent: 'center',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch' as const,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0' }}>
          <button onClick={onBack} style={onboardingBackBtn(isDark)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={onboardingProgressTrack(isDark)}>
            <div style={onboardingProgressFill(isDark, '100%')} />
          </div>
        </div>

        <div className="s3-title-anim" style={{ marginBottom: '28px', marginTop: 'auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: titleColor, letterSpacing: '-0.8px', margin: '0 0 10px', lineHeight: 1.15 }}>
            {t.onboarding.features}
          </h1>
          <p style={{ fontSize: '16px', color: subColor, margin: 0, lineHeight: 1.4 }}>
            {t.onboarding.featuresDesc}
          </p>
        </div>

        <div className="s3-card-anim" style={{
          background: featureBg,
          borderRadius: '20px',
          padding: '8px 16px',
          display: 'flex', flexDirection: 'column', gap: '0',
          marginBottom: 'auto',
        }}>
          {features.map((f, i) => (
            <div key={f.title}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 4px',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: isDark ? onboardingTokens.bgDark : '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>{f.emoji}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: titleColor, marginBottom: '2px' }}>{f.title}</div>
                  <div style={{ fontSize: '13px', color: subColor }}>{f.desc}</div>
                </div>
              </div>
              {i < features.length - 1 && (
                <div style={{ height: '0.5px', background: dividerColor, marginLeft: '58px' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ ...onboardingCtaRow, paddingTop: '20px' }}>
          <button onClick={onNext} style={onboardingPrimaryCta(isDark)}>
            {t.common.next}
          </button>
        </div>
      </div>
    </div>
  )
}
