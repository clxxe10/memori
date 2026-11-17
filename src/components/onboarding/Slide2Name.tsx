'use client'
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import { useKeyboard } from '@/hooks/useKeyboard'
import {
  onboardingBackBtn,
  onboardingDisabledCta,
  onboardingFooter,
  onboardingInput,
  onboardingPrimaryCta,
  onboardingShell,
  onboardingSubtitle,
  onboardingTitle,
  onboardingTopBar,
} from '@/lib/onboardingBtnStyles'

interface Props {
  onNext: () => void
  onBack: () => void
  name: string
  setName: (v: string) => void
}

export default function Slide2Name({ onNext, onBack, name, setName }: Props) {
  const { t, lang } = useTranslation()
  const { keyboardHeight, isKeyboardOpen } = useKeyboard()
  const [isSaving, setIsSaving] = useState(false)
  const [focused, setFocused] = useState(false)

  const keyboardPad = isKeyboardOpen ? Math.max(0, keyboardHeight - 40) : 0
  const trimmed = name.trim()
  const count = name.length

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
        paddingTop: 24,
        minHeight: 0,
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 style={onboardingTitle}>{t.onboarding.nickname}</h1>
            <p style={onboardingSubtitle}>{t.onboarding.nicknameDesc}</p>
          </div>
          <div style={{
            ...onboardingInput(undefined, focused),
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <input
              type="text"
              placeholder={t.onboarding.nicknamePlaceholder}
              value={name}
              maxLength={12}
              onChange={e => setName(e.target.value.slice(0, 12))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 17, color: 'var(--m-fg)', fontFamily: 'inherit',
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--m-fg3)', flexShrink: 0 }}>
              {count}/12
            </span>
          </div>
        </div>
      </div>

      <div style={onboardingFooter(keyboardPad)}>
        <button
          onClick={async () => {
            if (!trimmed) return
            setIsSaving(true)
            try {
              const supabase = createClient()
              await supabase.auth.updateUser({
                data: { full_name: trimmed, nickname: trimmed }
              })
            } catch (e) {
              console.error('닉네임 저장 실패:', e)
            } finally {
              setIsSaving(false)
              onNext()
            }
          }}
          disabled={!trimmed || isSaving}
          style={trimmed ? onboardingPrimaryCta() : onboardingDisabledCta()}
        >
          {isSaving ? (lang === 'en' ? 'Saving...' : '저장 중...') : t.common.next}
        </button>
      </div>
    </div>
  )
}
