import type { CSSProperties } from 'react'

/** Shared liquid-glass CTA geometry for onboarding slides */
export const onboardingCtaLayout = {
  width: '100%',
  maxWidth: 300,
  height: 46,
  borderRadius: '9999px',
  fontSize: '16px',
  fontWeight: 600,
  letterSpacing: '-0.2px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  boxSizing: 'border-box',
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: 0,
} as const satisfies CSSProperties

const glassBlur = {
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
} as const

const glassBorder = '1px solid rgba(255,255,255,0.3)'
const glassInset =
  'inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 20px rgba(0,0,0,0.12)'

/** Primary using CSS neutral tokens (Slide1) */
export const onboardingNeutralCta: CSSProperties = {
  ...onboardingCtaLayout,
  ...glassBlur,
  background: 'color-mix(in srgb, var(--color-neutral) 78%, transparent)',
  color: 'var(--color-neutral-contrast)',
  border: glassBorder,
  boxShadow: glassInset,
}

/** Dark/light ink primary used across most slides */
export function onboardingInkCta(isDark: boolean, disabled?: boolean): CSSProperties {
  return {
    ...onboardingCtaLayout,
    ...glassBlur,
    background: isDark
      ? 'color-mix(in srgb, #FFFFFF 82%, transparent)'
      : 'color-mix(in srgb, #1C1C1E 78%, transparent)',
    color: isDark ? '#1C1C1E' : '#FFFFFF',
    border: glassBorder,
    boxShadow: isDark
      ? 'inset 0 1px 0 rgba(255,255,255,0.65), 0 8px 20px rgba(0,0,0,0.35)'
      : glassInset,
    opacity: disabled ? 0.7 : 1,
  }
}

/** Soft secondary glass (e.g. existing user) */
export function onboardingSecondaryCta(isDark: boolean): CSSProperties {
  return {
    ...onboardingCtaLayout,
    ...glassBlur,
    background: isDark
      ? 'color-mix(in srgb, #FFFFFF 14%, transparent)'
      : 'color-mix(in srgb, #FFFFFF 72%, transparent)',
    color: isDark ? '#FFFFFF' : '#1C1C1E',
    border: glassBorder,
    boxShadow: isDark
      ? 'inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px rgba(0,0,0,0.25)'
      : 'inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 16px rgba(0,0,0,0.08)',
  }
}

/** Google — brand white / outline, shared geometry + glass */
export function onboardingGoogleCta(isDark: boolean): CSSProperties {
  return {
    ...onboardingCtaLayout,
    ...glassBlur,
    background: isDark
      ? 'color-mix(in srgb, #FFFFFF 16%, transparent)'
      : 'color-mix(in srgb, #FFFFFF 88%, transparent)',
    color: isDark ? '#FFFFFF' : '#1C1C1E',
    border: isDark ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(0,0,0,0.12)',
    boxShadow: isDark
      ? 'inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px rgba(0,0,0,0.25)'
      : 'inset 0 1px 0 rgba(255,255,255,0.85), 0 6px 16px rgba(0,0,0,0.08)',
  }
}

/** Kakao — keep #FEE500 brand fill; glass shape only */
export const onboardingKakaoCta: CSSProperties = {
  ...onboardingCtaLayout,
  ...glassBlur,
  background: '#FEE500',
  color: '#191919',
  border: '1px solid rgba(255,255,255,0.35)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.55), 0 8px 18px rgba(254,229,0,0.28)',
}

/** Disabled / empty primary */
export function onboardingDisabledCta(isDark: boolean): CSSProperties {
  return {
    ...onboardingCtaLayout,
    ...glassBlur,
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    border: glassBorder,
    boxShadow: 'none',
    cursor: 'default',
  }
}

/** Colored my-color CTA with luminance-aware text */
export function onboardingColorCta(hex: string, disabled?: boolean): CSSProperties {
  const raw = hex.replace('#', '')
  const r = parseInt(raw.substring(0, 2), 16)
  const g = parseInt(raw.substring(2, 4), 16)
  const b = parseInt(raw.substring(4, 6), 16)
  const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65
  return {
    ...onboardingCtaLayout,
    ...glassBlur,
    background: `color-mix(in srgb, ${hex} 78%, transparent)`,
    color: light ? '#191919' : '#FFFFFF',
    border: glassBorder,
    boxShadow: glassInset,
    opacity: disabled ? 0.7 : 1,
    transition: 'background 200ms ease',
  }
}

/** Wrapper to center a full-bleed CTA row */
export const onboardingCtaRow: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}
