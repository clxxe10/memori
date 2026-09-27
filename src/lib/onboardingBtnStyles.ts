import type { CSSProperties } from 'react'

/** Flat B/W onboarding tokens (no glass / blur / gradients) */
export const onboardingTokens = {
  bgLight: '#FFFFFF',
  bgDark: '#000000',
  surfaceLight: '#F2F2F7',
  surfaceDark: '#1C1C1E',
  textLight: '#1C1C1E',
  textDark: '#FFFFFF',
  secondaryLight: 'rgba(60,60,67,0.6)',
  secondaryDark: 'rgba(235,235,245,0.6)',
  borderLight: 'rgba(60,60,67,0.29)',
  borderDark: 'rgba(84,84,88,0.65)',
  trackLight: 'rgba(60,60,67,0.12)',
  trackDark: 'rgba(255,255,255,0.12)',
  disabledBgLight: 'rgba(60,60,67,0.12)',
  disabledBgDark: 'rgba(255,255,255,0.12)',
} as const

export function onboardingPageBg(isDark: boolean): string {
  return isDark ? onboardingTokens.bgDark : onboardingTokens.bgLight
}

export function onboardingSurface(isDark: boolean): string {
  return isDark ? onboardingTokens.surfaceDark : onboardingTokens.surfaceLight
}

export function onboardingText(isDark: boolean): string {
  return isDark ? onboardingTokens.textDark : onboardingTokens.textLight
}

export function onboardingSecondaryText(isDark: boolean): string {
  return isDark ? onboardingTokens.secondaryDark : onboardingTokens.secondaryLight
}

const ctaBase = {
  width: '100%',
  maxWidth: 300,
  borderRadius: '9999px',
  padding: '16px',
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: '-0.2px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  boxSizing: 'border-box',
  marginLeft: 'auto',
  marginRight: 'auto',
  border: 'none',
  boxShadow: 'none',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
} as const satisfies CSSProperties

/** Primary capsule CTA */
export function onboardingPrimaryCta(isDark: boolean, disabled?: boolean): CSSProperties {
  if (disabled) return onboardingDisabledCta(isDark)
  return {
    ...ctaBase,
    background: isDark ? '#FFFFFF' : '#1C1C1E',
    color: isDark ? '#1C1C1E' : '#FFFFFF',
  }
}

/** Alias used by older call sites */
export const onboardingInkCta = onboardingPrimaryCta
export const onboardingNeutralCta = onboardingPrimaryCta(false)

/** Secondary outline capsule */
export function onboardingSecondaryCta(isDark: boolean): CSSProperties {
  return {
    ...ctaBase,
    background: 'transparent',
    color: isDark ? '#FFFFFF' : '#1C1C1E',
    border: isDark
      ? `1px solid ${onboardingTokens.borderDark}`
      : `1px solid ${onboardingTokens.borderLight}`,
  }
}

/** Google — outline brand shape aligned to capsule CTAs */
export function onboardingGoogleCta(isDark: boolean): CSSProperties {
  return {
    ...ctaBase,
    background: isDark ? '#000000' : '#FFFFFF',
    color: isDark ? '#FFFFFF' : '#1C1C1E',
    border: isDark
      ? `1px solid ${onboardingTokens.borderDark}`
      : `1px solid ${onboardingTokens.borderLight}`,
  }
}

/** Kakao — keep brand yellow; capsule geometry only */
export const onboardingKakaoCta: CSSProperties = {
  ...ctaBase,
  background: '#FEE500',
  color: '#191919',
  border: 'none',
}

/** Disabled primary */
export function onboardingDisabledCta(isDark: boolean): CSSProperties {
  return {
    ...ctaBase,
    background: isDark
      ? onboardingTokens.disabledBgDark
      : onboardingTokens.disabledBgLight,
    color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(28,28,30,0.4)',
    cursor: 'default',
  }
}

/** Kept for Slide4.tsx (not in onboarding flow) */
export function onboardingColorCta(hex: string, disabled?: boolean): CSSProperties {
  if (disabled) return onboardingDisabledCta(false)
  const raw = hex.replace('#', '')
  const r = parseInt(raw.substring(0, 2), 16)
  const g = parseInt(raw.substring(2, 4), 16)
  const b = parseInt(raw.substring(4, 6), 16)
  const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65
  return {
    ...ctaBase,
    background: hex,
    color: light ? '#191919' : '#FFFFFF',
  }
}

export const onboardingCtaRow: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

export function onboardingBackBtn(isDark: boolean): CSSProperties {
  return {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: onboardingSurface(isDark),
    border: 'none',
    boxShadow: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: onboardingText(isDark),
    flexShrink: 0,
    padding: 0,
  }
}

export function onboardingProgressTrack(isDark: boolean): CSSProperties {
  return {
    flex: 1,
    height: '6px',
    borderRadius: '9999px',
    background: isDark ? onboardingTokens.trackDark : onboardingTokens.trackLight,
    overflow: 'hidden',
    boxShadow: 'none',
  }
}

export function onboardingProgressFill(isDark: boolean, widthPct: string): CSSProperties {
  return {
    width: widthPct,
    height: '100%',
    borderRadius: '9999px',
    background: isDark ? '#FFFFFF' : '#1C1C1E',
  }
}

export function onboardingInput(isDark: boolean): CSSProperties {
  return {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '16px',
    fontSize: '16px',
    border: isDark
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(0,0,0,0.06)',
    background: isDark ? 'rgba(255,255,255,0.06)' : '#F2F2F7',
    color: onboardingText(isDark),
    outline: 'none',
    boxShadow: 'none',
    boxSizing: 'border-box',
  }
}

export function onboardingCard(isDark: boolean): CSSProperties {
  return {
    background: onboardingSurface(isDark),
    borderRadius: '20px',
    border: 'none',
    boxShadow: 'none',
    padding: '20px',
  }
}
