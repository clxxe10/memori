'use client'
import { useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import {
  ONBOARDING_ILLUST_CSS,
  onboardingFooter,
  onboardingPrimaryCta,
  onboardingShell,
  onboardingSubtitle,
  onboardingTitle,
} from '@/lib/onboardingBtnStyles'

export default function Slide5({ onFinish }: { onFinish: () => void }) {
  const { t } = useTranslation()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      ${ONBOARDING_ILLUST_CSS}
      @keyframes s5CheckPop {
        0%   { opacity: 0; transform: scale(0.5); }
        70%  { opacity: 1; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
      }
      .s5-check-pop {
        animation: s5CheckPop 0.4s cubic-bezier(0.32, 0.72, 0, 1) both;
      }
      @media (prefers-reduced-motion: reduce) {
        .s5-check-pop { animation: none; }
      }
    `
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
        gap: 36,
        padding: '0 20px',
      }}>
        <div
          className="onb-illust onb-illust-circle"
          style={{
            width: 184, height: 184, borderRadius: '50%',
            boxShadow: 'inset 0 0 0 1px var(--m-stroke)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 1,
            minHeight: 0,
          }}
        >
          <div
            className="onb-illust-circle-mid"
            style={{
              width: 136, height: 136, borderRadius: '50%',
              background: 'var(--m-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              className="s5-check-pop onb-illust-circle-inner"
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'var(--m-btn)', color: 'var(--m-btn-fg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <h1 style={{ ...onboardingTitle, textAlign: 'center' }}>{t.onboarding.ready}</h1>
          <p style={{ ...onboardingSubtitle, textAlign: 'center' }}>{t.onboarding.readyDesc}</p>
        </div>
      </div>

      <div style={onboardingFooter()}>
        <button onClick={onFinish} style={onboardingPrimaryCta()}>
          {t.onboarding.start}
        </button>
      </div>
    </div>
  )
}
