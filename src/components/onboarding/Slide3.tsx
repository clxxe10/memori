'use client'
import { ChevronLeft, Camera, Layers, Share2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import {
  onboardingBackBtn,
  onboardingFooter,
  onboardingPrimaryCta,
  onboardingShell,
  onboardingTitle,
  onboardingTopBar,
} from '@/lib/onboardingBtnStyles'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function Slide3({ onNext, onBack }: Props) {
  const { t } = useTranslation()

  const features = [
    { icon: Camera, title: t.onboarding.featurePhoto, desc: t.onboarding.featurePhotoDesc },
    { icon: Layers, title: t.onboarding.featureModes, desc: t.onboarding.featureModesDesc },
    { icon: Share2, title: t.onboarding.featureCommunity, desc: t.onboarding.featureCommunityDesc },
  ]

  return (
    <div style={onboardingShell}>
      <div style={onboardingTopBar}>
        <button type="button" onClick={onBack} style={onboardingBackBtn()}>
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <div style={{ width: 44 }} />
      </div>

      <div style={{
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        minHeight: 0,
        overflowY: 'auto',
      }}>
        <div style={{ position: 'relative', height: 170, marginTop: 12, marginBottom: 28 }}>
          <div style={{
            position: 'absolute', left: 'calc(50% - 117px)', top: 58,
            width: 76, height: 76, borderRadius: 20,
            background: 'var(--m-card)', boxShadow: '0 0 0 1px var(--m-stroke)',
            transform: 'rotate(-10deg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--m-fg2)',
          }}>
            <Layers size={32} strokeWidth={1.6} />
          </div>
          <div style={{
            position: 'absolute', left: 'calc(50% + 41px)', top: 58,
            width: 76, height: 76, borderRadius: 20,
            background: 'var(--m-card)', boxShadow: '0 0 0 1px var(--m-stroke)',
            transform: 'rotate(10deg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--m-fg2)',
          }}>
            <Share2 size={32} strokeWidth={1.6} />
          </div>
          <div style={{
            position: 'absolute', left: 'calc(50% - 48px)', top: 30,
            width: 96, height: 96, borderRadius: 24,
            background: 'var(--m-btn)', color: 'var(--m-btn-fg)',
            boxShadow: '0 12px 32px rgba(0,0,0,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <path d="M7 9h10M7 12h7M7 15h9" />
            </svg>
          </div>
        </div>

        <h1 style={{ ...onboardingTitle, marginBottom: 28 }}>{t.onboarding.features}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  flex: 'none', width: 44, height: 44, borderRadius: 12,
                  background: 'var(--m-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--m-fg)',
                }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, color: 'var(--m-fg)' }}>{f.title}</div>
                  <div style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.4, color: 'var(--m-fg2)' }}>{f.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={onboardingFooter()}>
        <button onClick={onNext} style={onboardingPrimaryCta()}>
          {t.common.next}
        </button>
      </div>
    </div>
  )
}
