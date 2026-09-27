'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import {
  onboardingBackBtn,
  onboardingDisabledCta,
  onboardingInput,
  onboardingPageBg,
  onboardingPrimaryCta,
  onboardingProgressFill,
  onboardingProgressTrack,
  onboardingSecondaryText,
  onboardingText,
} from '@/lib/onboardingBtnStyles'

interface Props {
  onNext: () => void
  onBack: () => void
  name: string
  setName: (v: string) => void
}

export default function Slide2Name({ onNext, onBack, name, setName }: Props) {
  const { t, lang } = useTranslation()
  const [isDark, setIsDark] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      @keyframes s2nFadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .s2n-title-anim { animation: s2nFadeUp 700ms cubic-bezier(0.32,0.72,0,1) both; }
      .s2n-card-anim { animation: s2nFadeUp 700ms cubic-bezier(0.32,0.72,0,1) 120ms both; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

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
        height: '100%',
        paddingTop: 'max(66px, calc(env(safe-area-inset-top) + 20px))',
        paddingBottom: 'max(48px, calc(env(safe-area-inset-bottom) + 40px))',
        paddingLeft: '20px', paddingRight: '20px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0' }}>
          <button onClick={onBack} style={onboardingBackBtn(isDark)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={onboardingProgressTrack(isDark)}>
            <div style={onboardingProgressFill(isDark, '66%')} />
          </div>
        </div>

        <div className="s2n-title-anim" style={{ marginBottom: '28px', marginTop: '28px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: onboardingText(isDark), letterSpacing: '-0.8px', margin: '0 0 10px', lineHeight: 1.15 }}>
            {t.onboarding.nickname}
          </h1>
          <p style={{ fontSize: '16px', color: onboardingSecondaryText(isDark), margin: 0, lineHeight: 1.4 }}>
            {t.onboarding.nicknameDesc}
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <div className="s2n-card-anim" style={{
          display: 'flex', flexDirection: 'column',
          gap: '12px',
          width: '100%',
        }}>
          <input
            type="text"
            placeholder={t.onboarding.nicknamePlaceholder}
            value={name}
            onChange={e => setName(e.target.value)}
            style={onboardingInput(isDark)}
          />

          <button
            onClick={async () => {
              if (!name.trim()) return
              setIsSaving(true)
              try {
                const supabase = createClient()
                await supabase.auth.updateUser({
                  data: { full_name: name.trim(), nickname: name.trim() }
                })
              } catch (e) {
                console.error('닉네임 저장 실패:', e)
              } finally {
                setIsSaving(false)
                onNext()
              }
            }}
            disabled={!name.trim() || isSaving}
            style={name.trim() ? onboardingPrimaryCta(isDark) : onboardingDisabledCta(isDark)}
          >
            {isSaving ? (lang === 'en' ? 'Saving...' : '저장 중...') : t.common.next}
          </button>
        </div>
      </div>
    </div>
  )
}
